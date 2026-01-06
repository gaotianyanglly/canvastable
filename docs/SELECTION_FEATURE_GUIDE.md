# Canvas Table 单元格选择、复制与编辑状态管理功能指南

## 📋 功能概述

本文档介绍 Canvas Table 的单元格选择、复制和编辑状态管理功能，该功能类似于 Excel 的操作体验。

## ✨ 主要功能

### 1. 单元格选择
- **单击选择**：点击单个单元格进行选中
- **拖拽多选**：按住鼠标左键拖拽，选择矩形区域内的多个单元格
- **点击空白清除**：点击表格空白区域清除所有选择
- **程序化选择**：通过 `selectSingleCell()` 方法程序化选择单元格

### 2. 视觉反馈
- **选中状态**：选中的单元格显示浅蓝色背景（`#e6f7ff`）
- **选中边框**：选中区域显示蓝色边框（`#1890ff`，2px 宽度）
- **悬停状态**：鼠标悬停时整行高亮，但**不会覆盖选中状态**
- **编辑标识**：已编辑的单元格左上角显示红色小三角形（`#ff4d4f`，8x8 像素）

### 3. 复制功能
- **快捷键**：`Ctrl+C`（Windows/Linux）或 `Cmd+C`（Mac）
- **格式兼容**：复制的数据使用 Excel 兼容格式
  - 列之间使用制表符（`\t`）分隔
  - 行之间使用换行符（`\n`）分隔
- **粘贴支持**：可以直接粘贴到 Excel、Google Sheets 等表格软件

### 4. 编辑状态管理
- **标记编辑**：通过 `markCellAsEdited()` 标记单元格为已编辑状态
- **取消标记**：通过 `unmarkCellAsEdited()` 取消单元格的编辑状态
- **批量清除**：通过 `clearAllEditedStates()` 清除所有编辑状态
- **状态查询**：通过 `isCellEdited()` 检查单元格是否处于编辑状态
- **独立性**：编辑状态独立于选中状态，两者可以同时存在

## 🏗️ 架构设计

### 核心组件

#### 1. SelectionManager（选择管理器）
位置：`src/core/SelectionManager.ts`

**职责：**
- 管理选中的单元格集合
- 处理选择范围的计算
- 提供复制到剪贴板的功能
- 管理单元格背景色状态（优先级：选中 > 悬停 > 默认）

**关键方法：**

```typescript
// ========== 选择相关 ==========
// 开始选择
startSelection(cell: BodyCell): void

// 更新选择（拖拽时）
updateSelection(cell: BodyCell): void

// 结束选择
endSelection(): void

// 清除选择
clearSelection(): void

// 选中单个单元格（公共方法，可被外部调用）
selectSingleCell(cell: BodyCell): void

// 复制选中数据
copySelection(): Promise<void>

// 检查单元格是否被选中
isCellSelected(cell: BodyCell): boolean

// 更新单元格背景色（考虑状态优先级）
updateCellBackgroundColor(cell: BodyCell, isHovering: boolean): void

// ========== 编辑状态相关 ==========
// 标记单元格为已编辑状态
markCellAsEdited(cell: BodyCell): void

// 取消单元格的编辑状态
unmarkCellAsEdited(cell: BodyCell): void

// 检查单元格是否处于编辑状态
isCellEdited(cell: BodyCell): boolean

// 清除所有编辑状态
clearAllEditedStates(): void

// 获取所有已编辑的单元格
getEditedCells(): BodyCell[]
```

#### 2. TableEvent（事件管理器）
位置：`src/core/TableEvent.ts`

**新增事件处理：**
- `mousedown`：开始选择或清除选择
- `mouseup`：结束选择
- `mousemove`：拖拽时更新选择区域

**关键方法：**
```typescript
// 鼠标按下处理
onMouseDown(event: MouseEvent): void

// 鼠标释放处理
onMouseUp(event: MouseEvent): void

// 根据坐标获取单元格
getCellAtPosition(x: number, y: number): BodyCell | null
```

#### 3. CanvasTable（主表格类）
位置：`src/core/CanvasTable.tsx`

**新增属性：**
```typescript
selectionManager: SelectionManager
```

**新增渲染方法：**

```typescript
// 渲染选中区域的边框和编辑标识
renderSelection(): void

// 绘制单元格选中边框（可复用方法）
renderCellSelectionBorder(firstCell: any, lastCell: any, firstRow: any, lastRow: any): void

// 渲染所有已编辑单元格的标识
renderAllEditedIndicators(): void

// 在单元格左上角绘制红色小三角形（编辑标识）
renderCellEditedIndicator(cell: any): void
```

### 状态管理

#### 背景色优先级
```
选中状态 (#e6f7ff) > 悬停状态 (#e6f7ff) > 默认状态 (#ffffff)
```

**实现原理：**
1. `SelectionManager.updateCellBackgroundColor()` 统一管理背景色
2. `BodyRow.highlight()` 调用 `SelectionManager` 来更新背景色
3. 确保选中的单元格在悬停时保持选中状态

#### 选择范围管理
```typescript
interface ISelectionRange {
  startRow: number;    // 起始行索引
  startCol: number;    // 起始列索引
  endRow: number;      // 结束行索引
  endCol: number;      // 结束列索引
}
```

## 🎯 使用示例

### 基本使用

```typescript
import CanvasTable from 'x-canvas-table';

const table = new CanvasTable({
  container: document.getElementById('container'),
  columns: [
    { dataIndex: 'name', title: '姓名' },
    { dataIndex: 'age', title: '年龄' },
    { dataIndex: 'address', title: '地址' }
  ],
  style: {
    width: 800,
    height: 600
  }
});

table.source = [
  { name: '张三', age: 25, address: '北京' },
  { name: '李四', age: 30, address: '上海' },
  { name: '王五', age: 28, address: '广州' }
];

// 选择管理器会自动初始化，无需额外配置
```

### 编程式访问

```typescript
// ========== 选择相关 ==========
// 获取选中的单元格
const selectedCells = table.selectionManager.getSelectedCells();

// 获取选择范围
const range = table.selectionManager.getSelectionRange();
if (range) {
  console.log(`选中了 ${range.endRow - range.startRow + 1} 行`);
  console.log(`选中了 ${range.endCol - range.startCol + 1} 列`);
}

// 程序化选择单个单元格
const row = table.body.rows[1]; // 第2行
const cell = row.cells[2]; // 第3列
table.selectionManager.selectSingleCell(cell);

// 清除选择
table.selectionManager.clearSelection();

// 手动触发复制
await table.selectionManager.copySelection();

// ========== 编辑状态相关 ==========
// 标记单元格为已编辑
table.selectionManager.markCellAsEdited(cell);

// 取消编辑状态
table.selectionManager.unmarkCellAsEdited(cell);

// 检查是否已编辑
const isEdited = table.selectionManager.isCellEdited(cell);

// 获取所有已编辑的单元格
const editedCells = table.selectionManager.getEditedCells();

// 清除所有编辑状态
table.selectionManager.clearAllEditedStates();
```

## 🔧 技术要点

### 1. 事件冲突处理
- DOM 覆盖层的事件通过 `stopPropagation()` 阻止冒泡
- `TableEvent` 检查事件来源，避免处理 DOM 覆盖层的事件

### 2. 性能优化
- 拖拽选择时检查范围是否改变，避免不必要的重绘
- 使用 `clearSelectionWithoutRender()` 内部方法减少渲染次数

### 3. 剪贴板兼容性
- 优先使用现代 `navigator.clipboard.writeText()` API
- 降级方案：使用 `document.execCommand('copy')` 兼容旧浏览器

### 4. 状态独立性

- **选中状态**和**编辑状态**是完全独立的
- 一个单元格可以同时处于选中和已编辑状态
- 清除选择不会影响编辑状态，反之亦然

## 📝 注意事项

1. **tooltip 事件保留在 BodyCell 中**
   - tooltip 是单元格特有功能，与单元格内部状态紧密相关
   - 不会干扰全局的选择功能

2. **选中状态持久性**
   - 选中状态在鼠标悬停后仍然保持
   - 只有点击其他单元格或空白区域才会清除

3. **编辑状态持久性**
   - 编辑状态会一直保持，直到手动清除
   - 使用 `Set` 数据结构管理，查询效率高

4. **浏览器兼容性**
   - 现代浏览器（Chrome 66+, Firefox 63+, Safari 13.1+）支持 Clipboard API
   - 旧浏览器会自动降级到 `execCommand` 方案

5. **选择状态清除问题已修复**
   - 点击新单元格时，之前选中的单元格背景色会正确清除
   - 使用 `clearSelectionWithoutRender()` 确保状态正确更新

## 🚀 运行测试

```bash
# 启动开发服务器
npm run dev

# 浏览器会自动打开测试页面
# 或手动访问 http://localhost:8080
```

测试页面包含：
- 完整的选择和复制功能演示
- 实时操作日志
- 详细的功能说明

## 📚 相关文件

- `src/core/SelectionManager.ts` - 选择管理器（选择和编辑状态管理）
- `src/core/TableEvent.ts` - 事件管理器
- `src/core/CanvasTable.tsx` - 主表格类（渲染逻辑）
- `src/table/BodyRow.ts` - 行组件（悬停逻辑）
- `src/table/BodyCell.ts` - 单元格组件
- `src/test/selection-test.tsx` - 测试页面
- `docs/SELECTION_FEATURE_GUIDE.md` - 本文档

## 🆕 更新日志

### v2.0 - 编辑状态管理功能
- ✅ 新增编辑状态管理功能
- ✅ 新增 `markCellAsEdited()` 方法
- ✅ 新增 `renderCellEditedIndicator()` 渲染方法
- ✅ 新增 `selectSingleCell()` 公共方法
- ✅ 抽取 `renderCellSelectionBorder()` 为独立方法
- ✅ 修复选择状态清除问题

### v1.0 - 基础选择和复制功能
- ✅ 单元格选择功能
- ✅ 拖拽多选功能
- ✅ 复制到剪贴板功能
- ✅ 选中状态视觉反馈

