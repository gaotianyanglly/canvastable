import CanvasTable from "./CanvasTable";
import Layer from "../component/Layer";
import {isEmpty, isNotEmptyArray} from "../utils/utils";
import {IComponent} from "../typings/Component";
import {LayerEvent} from "./LayerEvent";

type IEventCollection = IComponent.IEventCollection;

export class CanvasTableEvent {
  // 保存事件处理器引用，用于销毁时移除监听
  private documentClickHandler: (e: MouseEvent) => void;

  constructor (protected props: {table: CanvasTable}) {
    this.init();
  }

  init () {
    const wrapper = this.table.wrapper;
    wrapper.addEventListener('click', e => this.eventHandler('onClick', e))
    wrapper.addEventListener('dblclick', e => this.eventHandler('onDoubleClick', e))
    wrapper.addEventListener('contextmenu', e => this.eventHandler('onContextMenu', e))
    wrapper.addEventListener('mousemove', e => this.moveEventHandler(e))
    wrapper.addEventListener('mouseleave', e => this.onMouseLeave(e))

    // 添加选择相关的事件监听
    wrapper.addEventListener('mousedown', e => this.onMouseDown(e))
    wrapper.addEventListener('mouseup', e => this.onMouseUp(e))

    // 添加全局点击监听，用于清除选中状态
    this.documentClickHandler = (e: MouseEvent) => this.onDocumentClick(e);
    document.addEventListener('click', this.documentClickHandler);
  }

  /**
   * 销毁事件监听器
   */
  destroy() {
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    }
  }

  eventX = 0;
  eventY = 0;
  eventHandler = (type: keyof IEventCollection, event) => {
    // 检查事件目标是否是 DOM 覆盖层
    if (this.isEventFromDomOverlay(event)) {
      return; // 如果是 DOM 覆盖层的事件，跳过 Canvas 事件处理
    }

    const {left, top} = this.table.wrapper.getBoundingClientRect();
    this.eventX = event.clientX - left;
    this.eventY = event.clientY - top;  //y position within the element.
    // debugger
    const layEvt = this.eventGenerate(type);
    for (let layer of layEvt.path) {
      if (!layEvt.isPropagationStopped) {
        layer.trigger(type, layEvt);
      }
    }
  };

  private lastMoveEvent: LayerEvent = null;
  moveEventHandler = (event) => {
    // 检查事件目标是否是 DOM 覆盖层
    if (this.isEventFromDomOverlay(event)) {
      return; // 如果是 DOM 覆盖层的事件，跳过 Canvas 事件处理
    }

    const {left, top} = this.table.wrapper.getBoundingClientRect();
    this.eventX = event.clientX - left;
    this.eventY = event.clientY - top;  //y position within the element.

    // 如果正在选择，更新选择区域
    if (this.table.selectionManager.isCurrentlySelecting()) {
      const cell = this.getCellAtPosition(this.eventX, this.eventY);
      if (cell) {
        this.table.selectionManager.updateSelection(cell);
      }
    }

    // debugger
    const currEvt = this.eventGenerate('onMouseEnter');
    const lastEvt = this.lastMoveEvent ? this.lastMoveEvent.copy({type: 'onMouseLeave'}) : null;
    const currRevPath = currEvt && currEvt.path ? [...currEvt.path].reverse() : [];
    const lastRevPath = lastEvt && lastEvt.path ? [...lastEvt.path].reverse() : [];

    const length = Math.max(currRevPath.length, lastRevPath.length);

    for (let i = 0; i < length; i ++) {
      const last = lastRevPath[i];
      const curr = currRevPath[i];
      if (last !== curr) {
        if (lastEvt && !lastEvt.isPropagationStopped) {
          last && last.trigger(lastEvt.type, lastEvt);
        }

        if (!currEvt.isPropagationStopped) {
          curr && curr.trigger(currEvt.type, currEvt);

        }
      }
    }

    this.lastMoveEvent = currEvt
  };

  onMouseLeave = (event: MouseEvent) => {
    const lastEvt = this.lastMoveEvent ? this.lastMoveEvent.copy({type: 'onMouseLeave'}) : null;
    if (isEmpty(lastEvt)) {
      return;
    }

    for (let layer of lastEvt.path) {
      if (!lastEvt.isPropagationStopped) {
        layer.trigger(lastEvt.type, lastEvt);
      }
    }
    this.lastMoveEvent = null;
  };

  eventGenerate (type?: keyof IEventCollection): LayerEvent {
    return new LayerEvent({
      type,
      path: this.pathGet(),
      clientX: this.eventX,
      clientY: this.eventY,
    })
  }

  pathGet () {
    let entryLayer: Layer = null;
    if (this.eventY <= this.table.header.height) {
      // 点击事在header部分生效
      let cells = [...this.table.header.cells];
      cells.sort(((a, b) => b.zIndex - a.zIndex));
      for (let headerCell of cells) {
        const {left, top, width, height} = headerCell;
        if (headerCell.isRender
          && left < this.eventX && left + width > this.eventX
          && top < this.eventY && top + height > this.eventY
        ) {
          entryLayer = headerCell;
          break;
        }
      }
    } else {
      // 点击事在body部分生效
      for (let row of this.table.body.rows) {
        if (this.eventY > row.top && this.eventY < (row.top + row.height)) {
          entryLayer = row;
          break;
        }
      }
    }

    const clientCoordination = (layer: Layer, left = layer.left, top = layer.top) => {
      if (layer.parent) {
        return clientCoordination(layer.parent, left + layer.parent.left, top + layer.parent.top)
      } else {
        return {left, top}
      }
    };

    const pathDig = (layer: Layer, path: Layer[] = []): Layer[] => {
      path.push(layer);
      if (isNotEmptyArray(layer.children)) {
        const sortedChildren = [...layer.children].sort(((a, b) => b.zIndex - a.zIndex));

        for (let child of sortedChildren) {
          const {left, top, width, height} = child;
          // const {left, top} = clientCoordination(child);
          if (child.isRender
            && left < this.eventX && left + width > this.eventX
            && top < this.eventY && top + height > this.eventY
          ) {
            return pathDig(child, path);
          }
        }
        return path;
      } else {
        return path;
      }
    };

    return entryLayer ? pathDig(entryLayer).reverse() : [];
  }
  /**
   * 鼠标按下事件处理（开始选择）
   */
  onMouseDown = (event: MouseEvent) => {
    if (this.isEventFromDomOverlay(event)) {
      return;
    }

    const {left, top} = this.table.wrapper.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;

    const cell = this.getCellAtPosition(x, y);
    if (cell) {
      this.table.selectionManager.startSelection(cell);
    } else {
      // 点击空白区域，清除选择
      this.table.selectionManager.clearSelection();
    }
  };

  /**
   * 鼠标释放事件处理（结束选择）
   */
  onMouseUp = (event: MouseEvent) => {
    if (this.isEventFromDomOverlay(event)) {
      return;
    }

    this.table.selectionManager.endSelection();
  };

  /**
   * 全局点击事件处理（点击表格外部清除选中状态）
   */
  onDocumentClick = (event: MouseEvent) => {
    // 检查点击目标是否在表格容器内
    const wrapper = this.table.wrapper;
    let target = event.target as HTMLElement;

    // 向上遍历 DOM 树，检查是否点击在表格内
    while (target) {
      if (target === wrapper) {
        // 点击在表格内，不清除选中状态
        return;
      }
      target = target.parentElement;
    }

    // 点击在表格外部，清除选中状态
    if (this.table.selectionManager) {
      this.table.selectionManager.clearSelection();
    }
  };

  /**
   * 根据坐标获取单元格
   */
  private getCellAtPosition(x: number, y: number) {
    // 跳过 header 区域
    if (y <= this.table.header.height) {
      return null;
    }

    // 查找对应的行
    for (let row of this.table.body.rows) {
      if (y > row.top && y < (row.top + row.height)) {
        // 查找对应的列
        for (let cell of row.cells) {
          if (x > cell.left && x < (cell.left + cell.width)) {
            return cell;
          }
        }
      }
    }

    return null;
  }

  /**
   * 检查事件是否来自 DOM 覆盖层
   * 用于避免 DOM 覆盖层的事件与 Canvas 事件冲突
   */
  private isEventFromDomOverlay(event: MouseEvent): boolean {
    let target = event.target as HTMLElement;

    // 向上遍历 DOM 树，检查是否在 DOM 覆盖层内
    while (target && target !== this.table.wrapper) {
      // 检查是否是 DOM 覆盖层容器
      if (target.classList && target.classList.contains('canvas-table-dom-overlay')) {
        return true;
      }
      target = target.parentElement;
    }

    return false;
  }

  get table () {
    return this.props.table
  }
}
