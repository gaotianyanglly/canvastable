# Canvas 交互元素实现方案

## 📋 概述

本文档详细说明如何在 Canvas 中实现类似 DOM 的交互元素，包括按钮、链接、图标等。

---

## 🎯 设计目标

1. **鼠标悬停效果**
   - 悬停时显示 `pointer` 光标
   - 悬停时改变元素样式（如背景色、边框等）

2. **点击事件支持**
   - 支持点击事件监听
   - 支持自定义点击回调函数
   - 支持事件冒泡和阻止

3. **性能要求**
   - 大数据量场景下仍保持良好性能
   - 不影响整体渲染性能

---

## 🏗️ 架构设计

### 核心类设计

```typescript
/**
 * 交互元素基类
 */
abstract class InteractiveElement extends Layer {
  // 是否可交互
  protected interactive: boolean = true;
  
  // 是否处于悬停状态
  protected isHovered: boolean = false;
  
  // 是否处于按下状态
  protected isPressed: boolean = false;
  
  // 光标样式
  protected cursor: string = 'pointer';
  
  // 点击回调
  protected onClick?: (event: LayerEvent) => void;
  
  // 悬停回调
  protected onHover?: (event: LayerEvent) => void;
  
  // 离开回调
  protected onLeave?: (event: LayerEvent) => void;
  
  /**
   * 检查点是否在元素内
   */
  containsPoint(x: number, y: number): boolean {
    return x >= this.left && 
           x <= this.left + this.width &&
           y >= this.top && 
           y <= this.top + this.height;
  }
  
  /**
   * 处理鼠标进入
   */
  handleMouseEnter(event: LayerEvent): void {
    if (!this.interactive) return;
    
    this.isHovered = true;
    this.setCursor(this.cursor);
    this.onHover?.(event);
    this.table.render();
  }
  
  /**
   * 处理鼠标离开
   */
  handleMouseLeave(event: LayerEvent): void {
    if (!this.interactive) return;
    
    this.isHovered = false;
    this.isPressed = false;
    this.setCursor('default');
    this.onLeave?.(event);
    this.table.render();
  }
  
  /**
   * 处理鼠标按下
   */
  handleMouseDown(event: LayerEvent): void {
    if (!this.interactive) return;
    
    this.isPressed = true;
    this.table.render();
  }
  
  /**
   * 处理鼠标释放
   */
  handleMouseUp(event: LayerEvent): void {
    if (!this.interactive) return;
    
    if (this.isPressed && this.isHovered) {
      this.onClick?.(event);
    }
    this.isPressed = false;
    this.table.render();
  }
  
  /**
   * 设置光标样式
   */
  protected setCursor(cursor: string): void {
    if (this.table && this.table.canvas) {
      this.table.canvas.style.cursor = cursor;
    }
  }
  
  /**
   * 渲染悬停效果
   */
  protected renderHoverEffect(): void {
    if (this.isHovered) {
      // 子类实现具体的悬停效果
    }
  }
  
  /**
   * 渲染按下效果
   */
  protected renderPressEffect(): void {
    if (this.isPressed) {
      // 子类实现具体的按下效果
    }
  }
}
```

---

## 🔘 按钮组件实现

### 设计思路

Canvas 按钮需要模拟 HTML 按钮的交互效果：
- 默认状态
- 悬停状态（hover）
- 按下状态（active）
- 禁用状态（disabled）

### 实现代码

```typescript
interface ICanvasButtonProps extends ILayerProps {
  text: string;
  type?: 'primary' | 'default' | 'danger';
  disabled?: boolean;
  onClick?: (event: LayerEvent) => void;
}

class CanvasButton extends InteractiveElement {
  constructor(protected props: ICanvasButtonProps) {
    super(props);
    this.interactive = !props.disabled;
    this.onClick = props.onClick;
    
    // 设置默认样式
    this.style = {
      ...this.style,
      padding: [8, 16, 8, 16],
      borderRadius: 4
    };
  }
  
  /**
   * 获取按钮颜色
   */
  private getColors() {
    const { type = 'default', disabled } = this.props;
    
    if (disabled) {
      return {
        bg: '#f5f5f5',
        border: '#d9d9d9',
        text: 'rgba(0,0,0,0.25)'
      };
    }
    
    if (this.isPressed) {
      // 按下状态
      switch (type) {
        case 'primary':
          return { bg: '#096dd9', border: '#096dd9', text: '#fff' };
        case 'danger':
          return { bg: '#cf1322', border: '#cf1322', text: '#fff' };
        default:
          return { bg: '#f5f5f5', border: '#d9d9d9', text: '#000' };
      }
    }
    
    if (this.isHovered) {
      // 悬停状态
      switch (type) {
        case 'primary':
          return { bg: '#40a9ff', border: '#40a9ff', text: '#fff' };
        case 'danger':
          return { bg: '#ff4d4f', border: '#ff4d4f', text: '#fff' };
        default:
          return { bg: '#fff', border: '#40a9ff', text: '#40a9ff' };
      }
    }
    
    // 默认状态
    switch (type) {
      case 'primary':
        return { bg: '#1890ff', border: '#1890ff', text: '#fff' };
      case 'danger':
        return { bg: '#ff4d4f', border: '#ff4d4f', text: '#fff' };
      default:
        return { bg: '#fff', border: '#d9d9d9', text: '#000' };
    }
  }
  
  render() {
    const { text } = this.props;
    const colors = this.getColors();
    const { left, top, width, height } = this;
    
    this.ctx.save();
    
    // 绘制背景
    this.ctx.fillStyle = colors.bg;
    this.ctx.fillRect(left, top, width, height);
    
    // 绘制边框
    this.ctx.strokeStyle = colors.border;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(left, top, width, height);
    
    // 绘制文字
    this.ctx.fillStyle = colors.text;
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, left + width / 2, top + height / 2);
    
    this.ctx.restore();
  }
}
```

---

## 🔗 链接组件实现

### 设计思路

Canvas 链接需要模拟 `<a>` 标签的效果：
- 默认蓝色文字
- 悬停时显示下划线
- 点击时触发回调

### 实现代码

```typescript
interface ICanvasLinkProps extends ILayerProps {
  text: string;
  href?: string;
  onClick?: (event: LayerEvent) => void;
}

class CanvasLink extends InteractiveElement {
  constructor(protected props: ICanvasLinkProps) {
    super(props);
    this.onClick = props.onClick || this.defaultClickHandler;
  }
  
  private defaultClickHandler = (event: LayerEvent) => {
    const { href } = this.props;
    if (href) {
      window.open(href, '_blank');
    }
  };
  
  render() {
    const { text } = this.props;
    const { left, top, width, height } = this;
    
    this.ctx.save();
    
    // 文字颜色
    this.ctx.fillStyle = this.isHovered ? '#40a9ff' : '#1890ff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, left, top + height / 2);
    
    // 悬停时绘制下划线
    if (this.isHovered) {
      const textWidth = this.ctx.measureText(text).width;
      this.ctx.strokeStyle = '#40a9ff';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(left, top + height);
      this.ctx.lineTo(left + textWidth, top + height);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
}
```

---

**待续：** 下一部分将详细说明图标组件和树状列表展开/收起图标的实现

