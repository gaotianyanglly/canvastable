# Canvas 动画实现方案

## 📋 概述

本文档详细说明如何在 Canvas 中实现流畅的动画效果，特别是树状列表展开/收起动画。

---

## 🎯 设计目标

1. **流畅的动画效果**
   - 60 FPS 的动画帧率
   - 使用 requestAnimationFrame
   - 支持缓动函数（easing）

2. **性能优化**
   - 大数据量场景下仍保持流畅
   - 避免不必要的重绘
   - 使用离屏 Canvas 优化

3. **可配置性**
   - 支持自定义动画时长
   - 支持自定义缓动函数
   - 支持动画回调

---

## 🏗️ 动画系统架构

### 核心类设计

```typescript
/**
 * 缓动函数类型
 */
type EasingFunction = (t: number) => number;

/**
 * 动画配置
 */
interface IAnimationConfig {
  duration: number;           // 动画时长（毫秒）
  easing?: EasingFunction;    // 缓动函数
  onUpdate?: (progress: number) => void;  // 更新回调
  onComplete?: () => void;    // 完成回调
}

/**
 * 动画管理器
 */
class AnimationManager {
  private animations: Map<string, Animation> = new Map();
  private rafId: number | null = null;
  
  /**
   * 创建动画
   */
  createAnimation(
    id: string,
    from: number,
    to: number,
    config: IAnimationConfig
  ): Animation {
    const animation = new Animation(from, to, config);
    this.animations.set(id, animation);
    
    if (!this.rafId) {
      this.startLoop();
    }
    
    return animation;
  }
  
  /**
   * 停止动画
   */
  stopAnimation(id: string): void {
    this.animations.delete(id);
    
    if (this.animations.size === 0 && this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * 动画循环
   */
  private startLoop(): void {
    const loop = () => {
      const now = performance.now();
      
      this.animations.forEach((animation, id) => {
        animation.update(now);
        
        if (animation.isComplete) {
          this.stopAnimation(id);
        }
      });
      
      if (this.animations.size > 0) {
        this.rafId = requestAnimationFrame(loop);
      }
    };
    
    this.rafId = requestAnimationFrame(loop);
  }
}

/**
 * 动画实例
 */
class Animation {
  private startTime: number = 0;
  private startValue: number;
  private endValue: number;
  private config: IAnimationConfig;
  public isComplete: boolean = false;
  public currentValue: number;
  
  constructor(from: number, to: number, config: IAnimationConfig) {
    this.startValue = from;
    this.endValue = to;
    this.currentValue = from;
    this.config = {
      easing: config.easing || Easing.easeInOutCubic,
      ...config
    };
  }
  
  /**
   * 更新动画
   */
  update(now: number): void {
    if (this.startTime === 0) {
      this.startTime = now;
    }
    
    const elapsed = now - this.startTime;
    const progress = Math.min(elapsed / this.config.duration, 1);
    
    // 应用缓动函数
    const easedProgress = this.config.easing!(progress);
    
    // 计算当前值
    this.currentValue = this.startValue + 
      (this.endValue - this.startValue) * easedProgress;
    
    // 调用更新回调
    this.config.onUpdate?.(easedProgress);
    
    // 检查是否完成
    if (progress >= 1) {
      this.isComplete = true;
      this.config.onComplete?.();
    }
  }
}

/**
 * 缓动函数集合
 */
class Easing {
  static linear(t: number): number {
    return t;
  }
  
  static easeInQuad(t: number): number {
    return t * t;
  }
  
  static easeOutQuad(t: number): number {
    return t * (2 - t);
  }
  
  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  static easeInCubic(t: number): number {
    return t * t * t;
  }
  
  static easeOutCubic(t: number): number {
    return (--t) * t * t + 1;
  }
  
  static easeInOutCubic(t: number): number {
    return t < 0.5 
      ? 4 * t * t * t 
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }
  
  static easeInOutElastic(t: number): number {
    const c5 = (2 * Math.PI) / 4.5;
    
    return t === 0 ? 0 : t === 1 ? 1 :
      t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  }
}
```

---

## 🌲 树状列表展开/收起动画

### 设计思路

树状列表展开/收起动画包含两个部分：
1. **三角图标旋转动画**：从 0° 旋转到 90°
2. **子节点展开动画**：子节点逐渐显示

### 实现代码

```typescript
/**
 * 树节点展开/收起图标
 */
class TreeExpandIcon extends InteractiveElement {
  private rotationAngle: number = 0;  // 当前旋转角度
  private targetAngle: number = 0;    // 目标旋转角度
  private isExpanded: boolean = false;
  
  constructor(protected props: ILayerProps & {
    onToggle?: (expanded: boolean) => void;
  }) {
    super(props);
    this.onClick = this.handleToggle;
  }
  
  /**
   * 处理展开/收起切换
   */
  private handleToggle = (event: LayerEvent) => {
    this.isExpanded = !this.isExpanded;
    this.targetAngle = this.isExpanded ? 90 : 0;
    
    // 创建旋转动画
    this.table.animationManager.createAnimation(
      `tree-expand-${this.id}`,
      this.rotationAngle,
      this.targetAngle,
      {
        duration: 200,  // 200ms
        easing: Easing.easeOutCubic,
        onUpdate: (progress) => {
          this.rotationAngle = this.rotationAngle + 
            (this.targetAngle - this.rotationAngle) * progress;
          this.table.render();
        },
        onComplete: () => {
          this.rotationAngle = this.targetAngle;
          this.props.onToggle?.(this.isExpanded);
        }
      }
    );
  };
  
  /**
   * 渲染三角图标
   */
  render() {
    const { left, top, width, height } = this;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const size = 6;  // 三角形大小
    
    this.ctx.save();
    
    // 移动到中心点
    this.ctx.translate(centerX, centerY);
    
    // 旋转
    this.ctx.rotate((this.rotationAngle * Math.PI) / 180);
    
    // 绘制三角形
    this.ctx.fillStyle = this.isHovered ? '#40a9ff' : '#666';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size);           // 顶点
    this.ctx.lineTo(size, size);         // 右下
    this.ctx.lineTo(-size, size);        // 左下
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }
}
```

---

## 🎬 使用示例

### 示例 1：简单的淡入淡出动画

```typescript
// 创建淡入动画
table.animationManager.createAnimation(
  'fade-in',
  0,
  1,
  {
    duration: 300,
    easing: Easing.easeInOutQuad,
    onUpdate: (progress) => {
      element.opacity = progress;
      table.render();
    }
  }
);
```

### 示例 2：树节点展开动画

```typescript
// 展开树节点
function expandTreeNode(node: TreeNode) {
  const children = node.children;
  const childrenHeight = children.length * rowHeight;
  
  table.animationManager.createAnimation(
    `expand-${node.id}`,
    0,
    childrenHeight,
    {
      duration: 250,
      easing: Easing.easeOutCubic,
      onUpdate: (progress) => {
        node.expandedHeight = progress * childrenHeight;
        table.render();
      },
      onComplete: () => {
        node.isExpanded = true;
      }
    }
  );
}
```

---

**待续：** 下一部分将详细说明性能优化策略

