/** @jsx h */

import {DEFAULT_STYLE, PIXEL_RATIO} from "../style/style";
import {ICanvasTable} from "../typings/CanvasTable";
import {BodySection} from "../table/Body";
import Scroller, {SCROLLBAR_WIDTH} from "./Scroller";
import {debounce, isFunction, isNotEmptyArray, percentCalc} from "../utils/utils";
import h from "../utils/h";
import {HeaderTree} from "../table/HeaderTree";
import {CanvasTableEvent} from "./TableEvent";
import {obj} from "../typings/common";
import Button from "../component/Button";
import Layer from "../component/Layer";
import Text from "../component/Text";
import Svg from "../component/Svg";
import Tooltip from './Tooltip';
import {SelectionManager} from './SelectionManager';
import {StyleManager} from './StyleManager';
import {RenderManager, OffscreenCanvasManager} from './RenderManager';

type ITableStyle = ICanvasTable.ITableStyle;
type ICanvasTableProps = ICanvasTable.ICanvasTableProps;

const WRAPPER_PADDING = 0;

class CanvasTable {
  static Button = Button
  static Layer = Layer
  static Text = Text
  static Svg = Svg

  style: ITableStyle = null;
  styleManager: StyleManager = null;
  renderManager: RenderManager = null;
  offscreenManager: OffscreenCanvasManager = null;

  constructor(public props: ICanvasTableProps) {
    this.init()
  }
  outerHeight: number = 0;
  outerWidth: number = 0;
  ctx: CanvasRenderingContext2D = null;
  event: CanvasTableEvent = null;
  tooltip: Tooltip = null;
  selectionManager: SelectionManager = null;

  init (isFirstTime = true) {
    const {container, style} = this.props;

    // 初始化管理器
    if (isFirstTime) {
      // 样式管理器
      this.styleManager = new StyleManager(style);
      this.styleManager.onChange((changedKeys) => {
        console.log('Style changed:', changedKeys);
        this.onStyleChange(changedKeys);
      });

      // 渲染管理器
      this.renderManager = new RenderManager(() => {
        this.performRender();
      });

      // 离屏Canvas管理器
      this.offscreenManager = new OffscreenCanvasManager();
    }

    this.styleCalc();
    this.domInit();
    if (isFirstTime) {
      this.event = new CanvasTableEvent({table: this});
      this.selectionManager = new SelectionManager(this);
      if (container) {
        container.appendChild(this.wrapper);
      }
    }
    this.ctxInit();
    this.componentsInit();

    // 初始化数据源
    if (isFirstTime && this.props.dataSource) {
      this.source = this.props.dataSource;
    }

    if (isFirstTime) {
      if (typeof style.height === 'string' || typeof style.width === 'string') {
        window.addEventListener('resize', this.onWindowResizeHandler)
      }
    }
  }
  onWindowResizeHandler = debounce(() => {
    this.resize();
  }, 300);

  styleCalc () {
    this.props.style = {...DEFAULT_STYLE, ...(this.props.style || {})};
    const {height, width, ...style} = this.props.style;

    // 如果有 styleManager，从 styleManager 获取最新样式（排除 width 和 height）
    if (this.styleManager) {
      const managerStyle = this.styleManager.getAll();
      const {width: _w, height: _h, ...styleWithoutSize} = managerStyle;
      this.style = {...style, ...styleWithoutSize};
    } else {
      this.style = style;
    }

    this.outerWidth = percentCalc(width, () => this.props.container.clientWidth);
    this.outerHeight = percentCalc(height, () => this.props.container.clientHeight);

    this.style.width = this.outerWidth - SCROLLBAR_WIDTH - WRAPPER_PADDING * 2;
    this.style.height = this.outerHeight - SCROLLBAR_WIDTH - WRAPPER_PADDING * 2;
  }

  ctxInit () {
    this.ctx = this.canvas.getContext('2d');
    this.ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);

    // 从 styleManager 获取最新样式（如果存在）
    const currentStyle = this.styleManager ? this.styleManager.getAll() : this.style;

    this.ctx.fillStyle = currentStyle.textColor;
    this.ctx.font = currentStyle.fontSize + ' ' + currentStyle.fontFamily;
    this.ctx.textBaseline = 'middle';
    this.ctx.strokeStyle = currentStyle.borderColor;
    this.ctx.lineWidth = 1;  // 显式设置线宽为 1px
  }

  header: HeaderTree;
  body: BodySection;
  componentsInit() {
    this.header = new HeaderTree({
      colProps: this.props.columns,
      table: this
    });
    this.body = new BodySection({
      table: this
    });
  }

  private _source: obj[] = [];
  set source(data: obj[]) {
    const newSource = isNotEmptyArray(data) ? [...data] : [];
    this.body.rows = this.body.diff(newSource);
    // const newLength = newSource.length;
    // const oldLength = this.source.length;
    // for (let i = 0; i < newLength; i ++) {
    //   const newData = newSource[i];
    //   const oldData = this.source[i];
    //   // diff
    //   if (newData && !oldData) { // 新增
    //     this.body.rows.push(
    //       new BodyRow({
    //         ctx: this.ctx,
    //         table: this,
    //         index: i,
    //         onRow: this.props.onRow
    //       })
    //     )
    //   } else if (oldData && newData) { // 更新
    //     this.body.rows[i].update()
    //   }
    // }
    // // 删除
    // if (oldLength > newLength) {
    //   this.body.rows.splice(newLength, oldLength - newLength);
    // }

    this._source = [...newSource];
    this.sizeCalc();
    this.scroller.update(this.width, this.height, this.dataWidth, this.dataHeight);
    this.render()
    // this.body.rows
  }
  get source () {
    return this._source
  }

  height: number = 0; // 表格数据高度
  width: number = 0;  // 表格数据宽度
  dataHeight: number = 0; // 表格数据真实高度
  dataWidth: number = 0; // 表格数据真实宽度

  sizeCalc () {
    // 获取当前有效的 rowHeight（优先从 styleManager）
    const rowHeight = this.styleManager ? this.styleManager.get('rowHeight') : this.style.rowHeight;

    this.dataHeight = this.header.height + this.source.length * rowHeight;
    this.dataWidth = this.header.columns.reduce(((pre, col) => pre + col.width), 0);
    this.height = Math.max(this.style.height, this.dataHeight);
    this.width = Math.max(this.style.width, this.dataWidth);
  }

  isFirstRender = true;

  /**
   * 请求渲染（使用RAF优化）
   */
  render () {
    if (this.renderManager) {
      this.renderManager.requestRender();
    } else {
      // 降级处理：直接渲染
      this.performRender();
    }
  }

  /**
   * 立即渲染
   */
  renderImmediate() {
    if (this.renderManager) {
      this.renderManager.requestRender(true);
    } else {
      this.performRender();
    }
  }

  /**
   * 执行实际的渲染操作
   */
  private performRender() {
    // 先清空画布
    this.ctx.clearRect(0, 0, this.style.width, this.style.height);
    // 填充白色背景
    this.ctx.save();
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.style.width, this.style.height);
    this.ctx.restore();

    // 渲染内容
    this.body.render();

    // 渲染选中状态和编辑标识（在表头之前，避免覆盖表头）
    this.renderSelection();
    this.renderAllEditedIndicators();

    // 最后渲染表头，确保表头在最上层
    this.header.render();

    if (this.isFirstRender) {
      this.isFirstRender = false;
      setTimeout(() => {
        this.render();
      }, 30)
    }
  }

  /**
   * 渲染选中区域的边框
   * 注意：此方法会设置裁剪区域，避免选中边框覆盖表头
   */
  renderSelection() {
    if (!this.selectionManager) return;

    const range = this.selectionManager.getSelectionRange();
    if (!range) return;

    const { startRow, startCol, endRow, endCol } = range;

    // 计算选中区域的边界
    const firstRow = this.body.rows[startRow];
    const lastRow = this.body.rows[endRow];
    if (!firstRow || !lastRow) return;

    const firstCell = firstRow.cells[startCol];
    const lastCell = lastRow.cells[endCol];
    if (!firstCell || !lastCell) return;

    // 绘制选中区域的边框（带裁剪区域）
    this.renderCellSelectionBorder(firstCell, lastCell, firstRow, lastRow);
  }

  /**
   * 绘制单元格选中边框（可复用方法）
   * @param firstCell 选中区域的第一个单元格
   * @param lastCell 选中区域的最后一个单元格
   * @param firstRow 选中区域的第一行
   * @param lastRow 选中区域的最后一行
   */
  renderCellSelectionBorder(firstCell: any, lastCell: any, firstRow: any, lastRow: any) {
    const left = firstCell.left;
    const top = firstRow.top;
    const width = lastCell.left + lastCell.width - left;
    const height = lastRow.top + lastRow.height - top;

    // 表头高度
    const headerHeight = this.header.height;

    this.ctx.save();

    // 设置裁剪区域，避免边框覆盖表头
    // 裁剪区域从表头下方开始
    this.ctx.beginPath();
    this.ctx.rect(0, headerHeight, this.style.width, this.style.height - headerHeight);
    this.ctx.clip();

    // 绘制选中边框
    this.ctx.strokeStyle = '#1890ff'; // 蓝色边框
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(left, top, width, height);

    this.ctx.restore();
  }

  /**
   * 渲染所有已编辑单元格的标识
   * 注意：此方法会设置裁剪区域，避免编辑标识覆盖表头
   */
  renderAllEditedIndicators() {
    if (!this.selectionManager) return;

    const editedCells = this.selectionManager.getEditedCells();
    if (editedCells.length === 0) return;

    // 表头高度
    const headerHeight = this.header.height;

    this.ctx.save();

    // 设置裁剪区域，避免编辑标识覆盖表头
    this.ctx.beginPath();
    this.ctx.rect(0, headerHeight, this.style.width, this.style.height - headerHeight);
    this.ctx.clip();

    // 渲染所有编辑标识
    editedCells.forEach(cell => {
      this.renderCellEditedIndicator(cell);
    });

    this.ctx.restore();
  }

  /**
   * 在单元格左上角绘制红色小三角形（编辑标识）
   * @param cell 要绘制编辑标识的单元格
   * 注意：此方法不设置裁剪区域，应该在 renderAllEditedIndicators 中调用
   */
  renderCellEditedIndicator(cell: any) {
    const triangleSize = 8; // 三角形大小（像素）
    const left = cell.left;
    const top = cell.row.top;

    this.ctx.fillStyle = '#ff4d4f'; // 红色
    this.ctx.beginPath();
    this.ctx.moveTo(left, top); // 左上角顶点
    this.ctx.lineTo(left + triangleSize, top); // 右边顶点
    this.ctx.lineTo(left, top + triangleSize); // 下边顶点
    this.ctx.closePath();
    this.ctx.fill();
  }

  // scrollPosition = {scrollLeft: 0, scrollTop: 0};
  // onScrollHandler = (left: number, top: number, direction: string) => {
  //   this.render();
  //   if (direction === 'up' && top === 0) {
  //     isFunction(this.props.onScrollTop) && this.props.onScrollTop()
  //   }
  //
  //   let {scrollHeight, scrollTop, scrollLeft, clientHeight} = this.scroller.scrollRef.current;
  //   if (direction === 'down' && scrollHeight - scrollTop === clientHeight) {
  //     isFunction(this.props.onScrollBottom) && this.props.onScrollBottom()
  //   }
  //
  //   this.scrollPosition = {scrollLeft, scrollTop};
  //   this.selectionCell.classList.remove('show')
  // };

  isScrollLoading = false;
  scrollMask: HTMLElement = <div className={'x-canvas-table-mask'} />;
  scrollPosition = {scrollLeft: 0, scrollTop: 0};
  onScrollHandler = (left: number, top: number, direction: string) => {
    this.render();
    if (direction === 'up' && top === 0) {
      isFunction(this.props.onScrollTop) && this.props.onScrollTop()
    }

    const {scrollHeight, scrollTop, scrollLeft, clientHeight} = this.scroller.scrollRef.current;
    const triggerHeight = this.props.scrollLoadHeight || 150;
    if (direction === 'down' && scrollHeight - scrollTop - triggerHeight <= clientHeight) {
      if (!this.isScrollLoading && isFunction(this.props.onScrollLoad)) {
        const start = () => {
          const scrollEl = this.wrapper;
          scrollEl.appendChild(this.scrollMask);
          this.isScrollLoading = true;
        };
        const end = () => {
          const scrollEl = this.wrapper;
          if (scrollEl.isSameNode(this.scrollMask.parentElement)) {
            scrollEl.removeChild(this.scrollMask);
          }
          this.isScrollLoading = false
        };

        start();
        const promise = this.props.onScrollLoad();
        if (promise && promise.then) {
          promise.then(() => {end()}).catch(() => {end()});
        } else {
          end()
        }
      }
    }

    // if (direction === 'down' && scrollHeight - scrollTop === clientHeight) {
    //   isFunction(this.props.onScrollBottom) && this.props.onScrollBottom()
    // }

    this.scrollPosition = {scrollLeft, scrollTop};
    this.selectionCell && this.selectionCell.classList.remove('show')
    this.tooltip && this.tooltip.hide()
  };

  resize () {
    // this.iconFont && this.iconFont.destroy();
    this.init(false);
    this.sizeCalc();
    this.scroller && this.scroller.update(this.width, this.height, this.dataWidth, this.dataHeight);
    this.render();
    this.scroller && this.scroller.scrollTo(this.scrollPosition.scrollLeft, this.scrollPosition.scrollTop)
  }

  canvas: HTMLCanvasElement;
  scroller: Scroller;
  selectionCell: HTMLInputElement;

  _wrapper: HTMLElement = null;
  get wrapper () {
    if (this._wrapper === null) {
      this._wrapper = (
        <div
          className={'x-canvas-table'}
          style={{padding: `${WRAPPER_PADDING}px`}}
        />
      )
    }
    return this._wrapper;
  }
  domInit() {
    this.wrapper.innerHTML = '';
    const {height, width, rowHeight, padding, fontFamily, fontSize, textColor} = this.style;
    const {outerHeight, outerWidth} = this;
    this.wrapper.style.width = `${outerWidth}px`;
    this.wrapper.style.height = `${outerHeight}px`;
    this.wrapper.appendChild(
      <canvas
        width={width * PIXEL_RATIO}
        height={height * PIXEL_RATIO}
        style={{height: `${height}px`, width: `${width}px`}}
        ref={ref => {this.canvas = ref}}
      />
    );

    const scroll = (
      <Scroller
        ref={ref => {this.scroller = ref}}
        fixedLeftWidth={() => this.header.leftColumns.reduce((pre, val) => pre + val.width, 0)}
        fixedRightWidth={() => this.header.rightColumns.reduce((pre, val) => pre + val.width, 0)}
        height={outerHeight}
        width={outerWidth}
        onScroll={this.onScrollHandler}
      >
        <input
          readOnly
          ref={ref => {this.selectionCell = ref}}
          className={'x-canvas-table-selection-cell'}
          style={{
            height: `${rowHeight - 1}px`,
            lineHeight: `${rowHeight - 1}px`,
            padding: `0 ${padding}px`,
            fontSize: fontSize,
            fontFamily: fontFamily,
            color: textColor
          }}
          onclick={(e) => {e.preventDefault(); e.stopPropagation()}}
          onblur={() => this.selectionCell.classList.remove('show')}
        />
      </Scroller>
    );
    this.wrapper.appendChild(scroll.wrapper);

    this.tooltip = <Tooltip />
    this.wrapper.appendChild(this.tooltip.wrapper);
  }

  /**
   * 处理样式变更
   */
  private onStyleChange(changedKeys: string[]): void {
    // 同步 styleManager 的样式到 this.style
    if (this.styleManager) {
      const managerStyle = this.styleManager.getAll();
      const {width: _w, height: _h, ...styleWithoutSize} = managerStyle;
      Object.assign(this.style, styleWithoutSize);
    }

    // 如果尺寸相关的样式变更，需要重新计算布局
    const sizeKeys = ['rowHeight', 'columnWidth', 'headerRowHeight', 'padding'];
    const needsResize = changedKeys.some(key => sizeKeys.includes(key));

    if (needsResize) {
      // 重新计算尺寸
      this.sizeCalc();
      // 更新滚动条
      if (this.scroller) {
        this.scroller.update(this.width, this.height, this.dataWidth, this.dataHeight);
      }
      // 重新初始化上下文和渲染
      this.ctxInit();
      this.render();
    } else {
      // 只需要重新渲染
      this.ctxInit();  // 重新初始化上下文（字体、颜色等）
      this.render();
    }
  }

  /**
   * 更新样式配置（单个）
   */
  updateStyle<K extends keyof ICanvasTable.ITableStyleProps>(
    key: K,
    value: ICanvasTable.ITableStyleProps[K]
  ): void {
    if (this.styleManager) {
      this.styleManager.set(key, value);
    }
  }

  /**
   * 批量更新样式配置
   */
  updateStyles(styles: Partial<ICanvasTable.ITableStyleProps>): void {
    if (this.styleManager) {
      this.styleManager.setMultiple(styles);
    }
  }

  /**
   * 获取当前样式配置
   */
  getStyle(): Readonly<ICanvasTable.ITableStyleProps> {
    return this.styleManager ? this.styleManager.getAll() : {...this.style};
  }

  /**
   * 重置样式为默认值
   */
  resetStyle(): void {
    if (this.styleManager) {
      this.styleManager.reset();
    }
  }

  destroy () {
    window.removeEventListener('resize', this.onWindowResizeHandler);

    // 销毁事件监听器
    if (this.event) {
      this.event.destroy();
    }

    // 销毁渲染管理器
    if (this.renderManager) {
      this.renderManager.destroy();
    }

    // 清理离屏Canvas缓存
    if (this.offscreenManager) {
      this.offscreenManager.clearAll();
    }
  }
}

export default CanvasTable
