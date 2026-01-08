# 单元格边框修复指南

## 问题描述

在之前的实现中，单元格的边框在某些情况下会被背景色覆盖，导致边框不清晰或消失。主要问题包括：

1. **背景色覆盖边框**：在 `Layer.ts` 的 `baseRender()` 方法中，背景色绘制时使用了 `top + 1` 和 `height - 1`，试图避免覆盖顶部边框，但这种方式不够精确
2. **像素对齐问题**：Canvas 的线条绘制是居中对齐的，1px 线条在整数坐标上绘制时会模糊（跨越两个像素）
3. **边框绘制顺序**：背景色和边框的绘制顺序不当，导致边框被覆盖

## Canvas 线条绘制原理

### 像素对齐问题

在 Canvas 中，线条是**居中对齐**的：

```
坐标 0    1    2    3    4
     |    |    |    |    |
     ├────┼────┼────┼────┤
     
在坐标 1 绘制 1px 线条：
     |    |    |    |    |
     ├──┬─┴─┬──┼────┼────┤
        ↑   ↑
      0.5  0.5
```

- 1px 线条在整数坐标上绘制时，会占据 0.5px 在左侧，0.5px 在右侧
- 这会导致线条模糊（因为跨越了两个像素）
- **解决方案**：在坐标上加 0.5，使线条完全落在一个像素上

```
在坐标 1.5 绘制 1px 线条：
     |    |    |    |    |
     ├────┼────┼────┼────┤
          ↑
         1px
```

## 修复方案

### 1. Layer.ts - baseRender() 方法

**修复前：**
```typescript
baseRender() {
  const {backgroundColor, border} = this.style;
  const {left, top, width, height} = this;
  if (backgroundColor) {
    drawRect(this.ctx, left, top + 1 , width, height - 1, backgroundColor)
  }
  if (isNotEmptyArray(border)) {
    const [topB, rightB, bottomB, leftB] = border;
    if (topB) {
      drawLine(this.ctx, left, top, left + width, top, topB.color)
    }
    // ... 其他边框
  }
}
```

**修复后：**
```typescript
baseRender() {
  const {backgroundColor, border} = this.style;
  const {left, top, width, height} = this;
  
  // 先绘制背景色（完整区域）
  if (backgroundColor) {
    drawRect(this.ctx, left, top, width, height, backgroundColor);
  }
  
  // 再绘制边框（覆盖在背景色上，确保边框清晰可见）
  if (isNotEmptyArray(border)) {
    const [topB, rightB, bottomB, leftB] = border;
    
    // 使用 0.5 像素偏移，确保 1px 线条完全落在一个像素上
    const offset = 0.5;
    
    if (topB) {
      drawLine(this.ctx, left, top + offset, left + width, top + offset, topB.color);
    }
    if (rightB) {
      drawLine(this.ctx, left + width - offset, top, left + width - offset, top + height, rightB.color);
    }
    if (bottomB) {
      drawLine(this.ctx, left, top + height - offset, left + width, top + height - offset, bottomB.color);
    }
    if (leftB) {
      drawLine(this.ctx, left + offset, top, left + offset, top + height, leftB.color);
    }
  }
}
```

**关键改进：**
- ✅ 背景色绘制完整区域，不再缩小
- ✅ 边框在背景色之后绘制，确保在最上层
- ✅ 使用 0.5 像素偏移，确保 1px 线条清晰显示

### 2. HeaderTreeNode.ts - borderRect() 方法

**修复前：**
```typescript
borderRect() {
  const {left, top, width, height} = this;
  const borderTop = top + height;
  drawLine(this.ctx, left, borderTop, left + width, borderTop);
  if(this.header.deep > 1) {
    drawLine(this.ctx,left + width - 1, top - 1, left + width - 1, top + height - 1);
  }
}
```

**修复后：**
```typescript
borderRect() {
  const {left, top, width, height} = this;
  
  const offset = 0.5;
  
  // 底部边框
  const borderBottom = top + height - offset;
  drawLine(this.ctx, left, borderBottom, left + width, borderBottom);
  
  // 右侧边框（仅在多层表头时绘制）
  if(this.header.deep > 1) {
    const borderRight = left + width - offset;
    drawLine(this.ctx, borderRight, top, borderRight, top + height);
  }
}
```

### 3. HeaderTree.ts - render() 方法

**修复前：**
```typescript
drawLine(ctx, 0, this.height - 1, this.table.style.width, this.height - 1);
```

**修复后：**
```typescript
const borderBottom = this.height - 0.5;
drawLine(ctx, 0, borderBottom, this.table.style.width, borderBottom);
```

## 测试验证

创建了测试页面 `examples/test-border-fix.html`，用于验证边框修复效果：

1. **默认状态**：白色背景，边框清晰
2. **悬停状态**：浅蓝色背景，边框依然清晰
3. **选中状态**：浅蓝色背景 + 蓝色边框
4. **编辑状态**：红色三角标识 + 边框清晰

## 总结

通过以下三个关键改进，彻底解决了单元格边框被背景色覆盖的问题：

1. **正确的绘制顺序**：先背景色，后边框
2. **完整的背景区域**：不再缩小背景色区域
3. **精确的像素对齐**：使用 0.5 像素偏移，确保 1px 线条清晰

这些改进确保了在所有状态下（默认、悬停、选中、编辑），单元格边框都能清晰一致地显示。

