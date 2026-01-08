import {Component} from "./Component";
import {cssParser, isEmpty, isNotEmpty, isNotEmptyArray, percentCalc} from "../utils/utils";
import {treeBackFind, treeInherit} from "../utils/tree";
import {drawLine, drawRect} from "../utils/draw";
import {IComponent} from "../typings/Component";
import {LayerEvent} from "../core/LayerEvent";
import CanvasTable from "../core/CanvasTable";
import {BodyCell} from "../table/BodyCell";
import {obj} from "../typings/common";

type ILayerStyle = IComponent.ILayerStyle;
type ILayerStyleProps = IComponent.ILayerStyleProps;
type ILayerProps = IComponent.ILayerProps;
type IEventCollection = IComponent.IEventCollection;

export default class Layer extends Component {
  private static defaultStyle: ILayerStyleProps = {
    top: 0,
    left: 0,
    width:'100%',
    height: '100%',
    padding: 0,
    // color:
    // font: string
    // fontSize: number
    zIndex: 0,
    align: 'left',
    overflow: 'ellipsis',
    verticalAlign: 'middle'
  };
  constructor(protected props: ILayerProps) {
    super();
    this._ctx = props.ctx;
    this.styleInit();
    this.children = [...(props.children || [])];
    this.children.forEach(child => {
      child.parent = this
    });
    if (isNotEmpty(props.event)) {
      for (const key in props.event) {
        this.on(key, props.event[key])
      }
    }
    if (props.popTitle) {
      this.on('onMouseEnter', () => {
        this.table.tooltip.show(props.popTitle, this)
      });
      this.on('onMouseLeave', () => {
        this.table.tooltip.hide()
      })
    }

    if (!props.disabled && props.event) {
      this.on('onMouseEnter', () => {
        this.ctx.canvas.parentElement.style.cursor = 'pointer';
      });
      this.on('onMouseLeave', () => {
        this.ctx.canvas.parentElement.style.cursor = 'auto';
      })
    }
  }
  _ctx: CanvasRenderingContext2D = null;
  get ctx (): CanvasRenderingContext2D {
    return treeInherit(this, '_ctx')
  }

  get table(): CanvasTable {
    const cell:BodyCell = <any>treeBackFind(this, layer => !layer.parent);
    return cell.table
  }
  parent: Layer = null;
  children: Layer[] = [];

  style: ILayerStyle = {};
  styleInit () {
    let {
      padding,
      border,
      ...style
    } = <ILayerStyleProps>{...Layer.defaultStyle, ...(this.props.style || {})};

    if (isNotEmpty(padding)) {
      this.style.padding = cssParser.multiValue(padding);
    } else {
      this.style.padding = [0, 0, 0, 0];
    }
    if (isNotEmpty(border)) {
      this.style.border = cssParser.multiValue(border).map(b => cssParser.border(b));
    }
    this.style = {...this.style, ...style}
    // this.style.top =
    // this.style.
  }
  get isRender () {
    const vertical = !(this.left + this.width < 0 || this.left > this.ctx.canvas.width);
    const horizontal = !(this.top + this.height < 0 || this.top > this.ctx.canvas.height);
    return vertical && horizontal
  }

  get sibings () {
    return this.parent ? this.parent.children || [] : []
  }

  get left ():number {
    const parent = this.parent
    const parentLeft = parent ? parent.left + parent.padding.left : 0;
    let preSiblingsLeft = 0
    for (let pre of this.sibings) {
      if (pre === this) {
        break
      }
      preSiblingsLeft += pre.width + (parent.props.gutter || 0)
    }
    return parentLeft + preSiblingsLeft + this.style.left
  }

  get top ():number {
    const parent = this.parent
    let verticalTop = 0
    if (parent) {
      switch (this.style.verticalAlign) {
        case 'bottom':
          verticalTop = parent.height - this.height
          break;
        case 'middle':
          verticalTop = (parent.height - this.height) / 2
      }
    }

    const parentTop = parent ? parent.top + parent.padding.top: 0;
    // console.log(parentTop, verticalTop, this.style.top )
    return parentTop + verticalTop + this.style.top
  }

  get innerWidth () {
    return this.width - this.padding.right - this.padding.left
  }

  get width ():number {
    const parentInnerWidth = this.parent ? this.parent.innerWidth : 0;
    return percentCalc(this.style.width, () => this.parent ? parentInnerWidth : 0);
  }

  get innerHeight () {
    return this.height - this.padding.top - this.padding.bottom
  }

  get height (): number {
    const parentInnerHeight = this.parent ? this.parent.innerHeight : 0;
    return percentCalc(this.style.height, () => this.parent ? parentInnerHeight : 0);
  }

  // set padding () {
  //   this.style.padding = cssParser.multiValue(this.style.padding);
  // }
  get padding() {
    const [top, right, bottom, left] = <number[]>this.style.padding;
    return {top, right, bottom, left}
  }

  get border () {
    const [top, right, bottom, left] = <number[]>this.style.padding;
    return {top, right, bottom, left}
  }

  get align () {
    return this.style.align
  }
  get zIndex () {
    return this.style.zIndex
  }

  clear () {
    const {left, top, height, width} = this;
    this.ctx.clearRect(left, top, width, height);
  }

  childrenRender () {
    const children = [...(this.children || [])];
    if (isEmpty(children)) {
      return
    }

    children.sort((a, b) => a.zIndex - b.zIndex)
      .forEach((child) => {
        child.innerRender()
      })
  }

  baseRender() {
    const {backgroundColor, border} = this.style;
    const {left, top, width, height} = this;

    // 先绘制背景色（完整区域）
    if (backgroundColor) {
      drawRect(this.ctx, left, top, width, height-2, backgroundColor);
    }

    // 再绘制边框（覆盖在背景色上，确保边框清晰可见）
    if (isNotEmptyArray(border)) {
      const [topB, rightB, bottomB, leftB] = border;

      // Canvas 线条绘制是居中对齐的，1px 线条在整数坐标上会模糊
      // 使用 0.5 像素偏移，确保 1px 线条完全落在一个像素上
      const offset = 1;

      if (topB) {
        // 顶部边框：y 坐标 + 0.5
        drawLine(this.ctx, left, top + offset, left + width, top + offset, topB.color);
      }
      if (rightB) {
        // 右侧边框：x 坐标 - 0.5
        drawLine(this.ctx, left + width - offset, top, left + width - offset, top + height, rightB.color);
      }
      if (bottomB) {
        // 底部边框：y 坐标 - 0.5
        drawLine(this.ctx, left, top + height - offset, left + width, top + height - offset, bottomB.color);
      }
      if (leftB) {
        // 左侧边框：x 坐标 + 0.5
        drawLine(this.ctx, left + offset, top, left + offset, top + height, leftB.color);
      }
    }
  }

  render () {
  }

  innerRender () {
    if(this.isRender) {
      // this.clear();
      this.baseRender();
      this.render();
      this.childrenRender();
    }
  }

  drawText (str: string) {
    let ctx = this.ctx;
    let {left, top, height, width} = this;
    let x = 0;
    let y = top + height / 2;
    ctx.save();
    switch (this.align) {
      case "center":
        x = left + width / 2;
        ctx.textAlign = 'center';
        break;
      case "right":
        x = left + width - this.padding.right;
        ctx.textAlign = 'right';
        break;
      case "left":
      default:
        x = left + this.padding.left;
        ctx.textAlign = 'left';
    }

    if (this.style.color) {
      ctx.fillStyle = this.style.color;
    }

    const fontSize = this.style.fontSize || this.table.style.fontSize;
    const fontFamily = this.style.fontFamily || this.table.style.fontFamily;
    const fontWeight = this.style.fontWeight || 'normal';

    ctx.font = [fontWeight, fontSize, fontFamily].join(' ');
    // console.log(left, this.column.width, top , this.row.height)
    ctx.fillText(str, x, y + this.padding.top);
    ctx.restore();
  }

  protected eventHandlers: obj<Function[]> = {};

  on (name: string, handler: Function) {
    if(!this.eventHandlers[name]){
      this.eventHandlers[name] = []
    }
    this.eventHandlers[name].push(handler);
  }

  off (name: string, handler?: Function){
    const handlers = this.eventHandlers[name];
    if (handlers) {
      if (typeof handler === 'function') {
        const delIndex = handlers.indexOf(handler);
        if (~delIndex) {
          handlers.splice(delIndex, 1);
        }
      } else {
        delete this.eventHandlers[name];
      }
    }
  }

  trigger (type: keyof IEventCollection, event: LayerEvent) {
    if (this.props.disabled) {
      return
    }
    const handlers = this.eventHandlers[type];
    handlers && handlers.forEach((handler) => {
      typeof handler === 'function' && handler(event);
    });
  }
}
