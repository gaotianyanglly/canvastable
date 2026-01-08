# Bug 修复文档

## 修复日期：2026-01-06

---

## 问题 1：滚动条消失问题

### 问题描述
在 `examples/performance-test.html` 性能测试页面中，表格的滚动条不显示或消失了，导致无法滚动查看大量数据。

### 根本原因
1. **样式同步问题**：`StyleManager` 管理的样式与 `CanvasTable.style` 没有正确同步
2. **尺寸计算问题**：`sizeCalc()` 方法使用的 `this.style.rowHeight` 没有从 `styleManager` 获取最新值
3. **滚动条更新缺失**：样式变更时，滚动条的 `update()` 方法没有被调用

### 修复方案

#### 1. 修复 `sizeCalc()` 方法
**文件：** `src/core/CanvasTable.tsx`

```typescript
sizeCalc () {
  // 获取当前有效的 rowHeight（优先从 styleManager）
  const rowHeight = this.styleManager ? this.styleManager.get('rowHeight') : this.style.rowHeight;
  
  this.dataHeight = this.header.height + this.source.length * rowHeight;
  this.dataWidth = this.header.columns.reduce(((pre, col) => pre + col.width), 0);
  this.height = Math.max(this.style.height, this.dataHeight);
  this.width = Math.max(this.style.width, this.dataWidth);
}
```

**改进点：**
- 优先从 `styleManager` 获取 `rowHeight`，确保使用最新值
- 避免使用过期的 `this.style.rowHeight`

#### 2. 修复 `onStyleChange()` 方法
**文件：** `src/core/CanvasTable.tsx`

```typescript
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
    // 更新滚动条 ✅ 新增
    if (this.scroller) {
      this.scroller.update(this.width, this.height, this.dataWidth, this.dataHeight);
    }
    // 重新初始化上下文和渲染
    this.ctxInit();
    this.render();
  } else {
    // 只需要重新渲染
    this.ctxInit();
    this.render();
  }
}
```

**改进点：**
- 同步 `styleManager` 的样式到 `this.style`
- 在尺寸变更时调用 `scroller.update()` 更新滚动条

---

## 问题 2：样式更新无效问题

### 问题描述
在 `examples/dynamic-style-example.html` 动态样式配置示例中，修改样式参数后点击"应用样式"按钮时：
- 控制台正确打印了 "Style changed: [样式键名]" 日志
- 但表格的视觉样式没有实际发生变化

### 根本原因
1. **样式隔离**：`StyleManager` 管理的样式对象与 `CanvasTable.style` 是独立的
2. **上下文未更新**：`ctxInit()` 使用的是 `this.style`，而不是 `styleManager` 中的最新样式
3. **样式未同步**：样式变更时，`styleManager` 的值改变了，但 `this.style` 没有同步更新

### 修复方案

#### 1. 修复 `styleCalc()` 方法
**文件：** `src/core/CanvasTable.tsx`

```typescript
styleCalc () {
  this.props.style = {...DEFAULT_STYLE, ...(this.props.style || {})};
  const {height, width, ...style} = this.props.style;
  
  // 如果有 styleManager，从 styleManager 获取最新样式（排除 width 和 height）✅ 新增
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
```

**改进点：**
- 从 `styleManager` 获取最新样式并合并到 `this.style`
- 排除 `width` 和 `height`，因为它们由容器尺寸计算得出

#### 2. 修复 `ctxInit()` 方法
**文件：** `src/core/CanvasTable.tsx`

```typescript
ctxInit () {
  this.ctx = this.canvas.getContext('2d');
  this.ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
  
  // 从 styleManager 获取最新样式（如果存在）✅ 新增
  const currentStyle = this.styleManager ? this.styleManager.getAll() : this.style;
  
  this.ctx.fillStyle = currentStyle.textColor;
  this.ctx.font = currentStyle.fontSize + ' ' + currentStyle.fontFamily;
  this.ctx.textBaseline = 'middle';
  this.ctx.strokeStyle = currentStyle.borderColor;
  this.ctx.lineWidth = 1;
}
```

**改进点：**
- 优先从 `styleManager` 获取最新样式
- 确保 Canvas 上下文使用最新的颜色、字体等样式

---

## 测试验证

### 测试步骤

#### 测试问题 1（滚动条）
1. 打开 `examples/performance-test.html`
2. 点击"加载 1000 行"或"加载 10000 行"
3. 验证滚动条正常显示
4. 验证可以正常滚动查看数据

#### 测试问题 2（样式更新）
1. 打开 `examples/dynamic-style-example.html`
2. 修改"行高"为 60
3. 点击"应用样式"
4. 验证表格行高实际变为 60px
5. 修改"字体大小"为 18px
6. 点击"应用样式"
7. 验证表格字体实际变大
8. 修改"文字颜色"为红色
9. 点击"应用样式"
10. 验证表格文字颜色变为红色

### 预期结果
- ✅ 滚动条正常显示和工作
- ✅ 样式修改后立即生效
- ✅ 控制台无错误信息

---

## 影响范围

### 修改的文件
1. `src/core/CanvasTable.tsx` - 核心表格类
2. `src/typings/CanvasTable.d.ts` - 类型定义（之前已修复 dataSource）

### 影响的功能
1. ✅ 动态样式更新
2. ✅ 滚动条显示和更新
3. ✅ 大数据量场景
4. ✅ 样式管理器功能

### 向后兼容性
- ✅ 完全向后兼容
- ✅ 不影响现有 API
- ✅ 不需要修改使用代码

---

## 总结

这两个问题的根本原因都是 **样式管理的同步问题**：

1. **StyleManager** 作为样式的"真实来源"，但其他部分没有正确读取它
2. **this.style** 作为缓存，但在样式变更时没有正确更新
3. **Canvas 上下文** 和 **尺寸计算** 使用了过期的样式值

修复方案的核心思想是：
- **单一数据源**：优先从 `styleManager` 读取样式
- **及时同步**：样式变更时立即同步到 `this.style`
- **完整更新**：样式变更时更新所有相关组件（上下文、滚动条等）

这些修复确保了样式管理系统的一致性和可靠性。

