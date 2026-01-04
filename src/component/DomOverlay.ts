import CanvasTable from "../core/CanvasTable";

type IDomOverlayProps = {
  table: CanvasTable;
  domContent: HTMLElement | (() => HTMLElement);
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * DOM 覆盖层组件
 * 用于在 Canvas 表格中渲染复杂的 DOM 元素（如表单、富文本等）
 *
 * 注意：这个组件不继承 Layer，而是独立管理 DOM 元素
 */
export default class DomOverlay {
  private domElement: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private table: CanvasTable;
  private position: { left: number; top: number; width: number; height: number };

  constructor(protected props: IDomOverlayProps) {
    this.table = props.table;
    this.position = {
      left: props.left,
      top: props.top,
      width: props.width,
      height: props.height
    };
    this.initDomElement();
  }

  /**
   * 初始化 DOM 元素
   */
  private initDomElement() {
    // 获取或创建 DOM 元素
    if (typeof this.props.domContent === 'function') {
      this.domElement = this.props.domContent();
    } else {
      this.domElement = this.props.domContent;
    }

    // 创建容器
    this.container = document.createElement('div');
    this.container.className = 'canvas-table-dom-overlay';
    this.container.style.position = 'absolute';
    this.container.style.pointerEvents = 'auto';
    this.container.style.zIndex = '10';
    this.container.appendChild(this.domElement);

    // 阻止事件冒泡到 Canvas，避免事件冲突
    this.preventEventBubbling();

    // 添加到表格容器
    this.table.wrapper.appendChild(this.container);

    // 初始化位置
    this.updateDomPosition();
  }

  /**
   * 阻止事件冒泡到 Canvas
   * 确保 DOM 覆盖层的事件不会触发 Canvas 的事件处理器
   */
  private preventEventBubbling() {
    if (!this.container) return;

    // 阻止这些事件冒泡，避免触发 Canvas Table 的事件处理
    const eventsToStop = ['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup'];

    eventsToStop.forEach(eventName => {
      this.container!.addEventListener(eventName, (e) => {
        // 阻止事件冒泡到父元素（Canvas wrapper）
        e.stopPropagation();
      }, true); // 使用捕获阶段，确保在子元素之前处理
    });
  }

  /**
   * 更新 DOM 元素位置和尺寸
   */
  private updateDomPosition() {
    if (!this.container) return;

    const {left, top, width, height} = this.position;

    this.container.style.left = `${left}px`;
    this.container.style.top = `${top}px`;
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
  }

  /**
   * 更新位置
   */
  updatePosition(left: number, top: number, width?: number, height?: number) {
    this.position.left = left;
    this.position.top = top;
    if (width !== undefined) this.position.width = width;
    if (height !== undefined) this.position.height = height;
    this.updateDomPosition();
  }

  /**
   * 显示 DOM 元素
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  /**
   * 隐藏 DOM 元素
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * 获取 DOM 元素
   */
  getElement(): HTMLElement | null {
    return this.domElement;
  }

  /**
   * 获取容器
   */
  getContainer(): HTMLElement | null {
    return this.container;
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.domElement = null;
  }
}

