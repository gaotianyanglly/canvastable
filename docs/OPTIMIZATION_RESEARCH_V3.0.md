# Canvas Table v3.0 - 全面优化技术调研报告

## 📋 项目概览

**版本：** v3.0  
**调研日期：** 2026-01-04  
**调研目标：** 全面优化 Canvas Table 项目，提升性能、可配置性和交互体验

---

## 🎯 优化目标

### 1. 配置项动态化改造
- 将所有硬编码的样式配置提取为可动态配置的参数
- 支持运行时动态修改，修改后自动重新渲染
- 提供完整的类型定义和默认值

### 2. 核心工具方法优化审查
- 全面审查并优化渲染和工具方法
- 识别性能瓶颈点
- 清理代码重复和冗余逻辑
- 优化 Canvas 上下文操作

### 3. Canvas 内交互元素实现
- 实现类似 DOM 的交互元素（按钮、链接、图标）
- 支持鼠标悬停和点击事件
- 提供自定义回调函数

### 4. 动画效果实现
- 实现纯 Canvas 的动画效果
- 树状列表展开/收起动画
- 确保大数据量场景下的性能

### 5. 性能优化
- 确保 10 万行数据场景下的良好性能
- 优化渲染流程
- 减少不必要的重绘

---

## 📊 现状分析

### 当前配置系统

#### 默认样式配置 (`src/style/style.ts`)

```typescript
export const DEFAULT_STYLE: ITableStyleProps = {
  width: '100%',
  height: '100%',
  rowHeight: 55,              // ❌ 硬编码
  columnWidth: 150,           // ❌ 硬编码
  borderColor: '#e8e8e8',     // ❌ 硬编码
  textColor: 'rgba(0,0,0,0.65)', // ❌ 硬编码
  fontSize: '14px',           // ❌ 硬编码
  fontFamily: '...',          // ❌ 硬编码
  headerBackColor: '#fafafa', // ❌ 硬编码
  headerRowHeight: 55,        // ❌ 硬编码
  padding: 16                 // ❌ 硬编码
};
```

**问题：**
- ✅ 已有默认配置，但缺少运行时修改机制
- ❌ 修改配置后不会自动重新渲染
- ❌ 缺少配置验证和类型检查

### 当前渲染流程

#### 主渲染方法 (`src/core/CanvasTable.tsx`)

```typescript
render() {
  // 1. 清空画布
  this.ctx.clearRect(0, 0, this.style.width, this.style.height);
  
  // 2. 填充背景
  this.ctx.save();
  this.ctx.fillStyle = 'white';  // ❌ 硬编码
  this.ctx.fillRect(0, 0, this.style.width, this.style.height);
  this.ctx.restore();
  
  // 3. 渲染内容
  this.body.render();
  this.renderSelection();
  this.renderAllEditedIndicators();
  this.header.render();
}
```

**问题：**
- ❌ 背景颜色硬编码为 'white'
- ❌ 每次都完全重绘，性能不佳
- ✅ 渲染顺序已优化（v2.3）

### Canvas 上下文操作分析

#### 发现的问题

1. **save/restore 使用不一致**
   - 有些地方使用了 save/restore
   - 有些地方直接修改上下文状态
   - 可能导致状态污染

2. **lineWidth 问题**
   - 已在 v2.3 修复
   - 需要检查其他类似问题

3. **重复的上下文设置**
   - 每次渲染都重新设置字体、颜色等
   - 可以优化为只在必要时设置

---

## 🔍 详细优化方案

### 方案 1：配置项动态化改造

#### 1.1 设计思路

**核心思想：** 使用 Proxy 或 Setter 监听配置变化，自动触发重新渲染

**实现步骤：**
1. 创建 `StyleManager` 类管理所有样式配置
2. 使用 Proxy 监听配置变化
3. 配置变化时自动调用 `render()`
4. 提供 `updateStyle()` 方法批量更新

#### 1.2 API 设计

```typescript
// 单个配置修改
table.updateStyle('rowHeight', 60);

// 批量配置修改
table.updateStyle({
  rowHeight: 60,
  columnWidth: 200,
  borderColor: '#ddd'
});

// 获取当前配置
const currentStyle = table.getStyle();

// 重置为默认配置
table.resetStyle();
```

#### 1.3 配置项清单

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `rowHeight` | number | 55 | 行高 |
| `columnWidth` | number | 150 | 默认列宽 |
| `headerRowHeight` | number | 55 | 表头行高 |
| `padding` | number | 16 | 单元格内边距 |
| `borderColor` | string | '#e8e8e8' | 边框颜色 |
| `textColor` | string | 'rgba(0,0,0,0.65)' | 文字颜色 |
| `fontSize` | string | '14px' | 字体大小 |
| `fontFamily` | string | '...' | 字体族 |
| `headerBackColor` | string | '#fafafa' | 表头背景色 |
| `backgroundColor` | string | '#ffffff' | 表体背景色 |
| `hoverBackColor` | string | '#e6f7ff' | 悬停背景色 |
| `selectionBorderColor` | string | '#1890ff' | 选中边框颜色 |
| `selectionBorderWidth` | number | 2 | 选中边框宽度 |
| `editedIndicatorColor` | string | '#ff4d4f' | 编辑标识颜色 |
| `editedIndicatorSize` | number | 8 | 编辑标识大小 |

---

### 方案 2：核心工具方法优化

#### 2.1 渲染性能优化

**问题识别：**
1. 每次渲染都完全重绘整个画布
2. 没有脏区域检测
3. 没有使用离屏 Canvas

**优化方案：**
1. 实现脏区域标记和局部重绘
2. 使用离屏 Canvas 缓存静态内容
3. 优化滚动时的渲染

#### 2.2 Canvas 上下文操作优化

**优化清单：**
- [ ] 统一 save/restore 使用规范
- [ ] 减少不必要的上下文状态设置
- [ ] 优化 clip 区域的使用
- [ ] 检查所有 lineWidth 设置

#### 2.3 代码重复清理

**发现的重复代码：**
1. 多处使用 `table.style.padding` 获取内边距
2. 多处使用 `table.style.rowHeight` 获取行高
3. 多处使用 `table.header.height` 获取表头高度

**优化方案：**
- 提取公共方法
- 使用 getter 缓存计算结果

---

## 📈 性能基准测试计划

### 测试场景

| 场景 | 数据量 | 列数 | 操作 | 目标性能 |
|------|--------|------|------|----------|
| 小数据 | 100 行 | 10 列 | 初始渲染 | < 50ms |
| 中数据 | 1000 行 | 10 列 | 初始渲染 | < 100ms |
| 大数据 | 10000 行 | 10 列 | 初始渲染 | < 200ms |
| 超大数据 | 100000 行 | 10 列 | 初始渲染 | < 500ms |
| 滚动 | 10000 行 | 10 列 | 滚动 100 次 | 60 FPS |
| 选中 | 10000 行 | 10 列 | 选中 100 次 | < 10ms/次 |

### 性能指标

- **FPS (帧率)：** 滚动时保持 60 FPS
- **渲染时间：** 单次渲染 < 16ms (60 FPS)
- **内存占用：** 10 万行数据 < 100MB
- **CPU 占用：** 空闲时 < 5%

---

## 🎨 Canvas 交互元素实现方案

### 方案概述

**核心思想：** 在 Canvas 中模拟 DOM 元素的交互行为

### 实现步骤

1. **创建交互元素基类**
2. **实现鼠标事件检测**
3. **实现光标样式切换**
4. **实现点击事件回调**

### 详细设计见下一部分...

---

**待续：** 本文档将在后续部分详细说明交互元素和动画实现方案

