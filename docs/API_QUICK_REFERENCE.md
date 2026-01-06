# Canvas Table API 快速参考

## 🎯 SelectionManager API

### 选择相关方法

```typescript
// 程序化选择单个单元格（公共方法）
table.selectionManager.selectSingleCell(cell: BodyCell): void

// 清除所有选择
table.selectionManager.clearSelection(): void

// 检查单元格是否被选中
table.selectionManager.isCellSelected(cell: BodyCell): boolean

// 获取选中的单元格
table.selectionManager.getSelectedCells(): BodyCell[]

// 获取选择范围
table.selectionManager.getSelectionRange(): ISelectionRange | null

// 复制选中数据到剪贴板
table.selectionManager.copySelection(): Promise<void>
```

### 编辑状态相关方法

```typescript
// 标记单元格为已编辑状态
table.selectionManager.markCellAsEdited(cell: BodyCell): void

// 取消单元格的编辑状态
table.selectionManager.unmarkCellAsEdited(cell: BodyCell): void

// 检查单元格是否处于编辑状态
table.selectionManager.isCellEdited(cell: BodyCell): boolean

// 获取所有已编辑的单元格
table.selectionManager.getEditedCells(): BodyCell[]

// 清除所有编辑状态
table.selectionManager.clearAllEditedStates(): void
```

## 🎨 CanvasTable 渲染方法

```typescript
// 渲染选中区域和编辑标识
table.renderSelection(): void

// 绘制单元格选中边框（可复用）
table.renderCellSelectionBorder(
  firstCell: any, 
  lastCell: any, 
  firstRow: any, 
  lastRow: any
): void

// 渲染所有已编辑单元格的标识
table.renderAllEditedIndicators(): void

// 在单元格左上角绘制红色小三角形
table.renderCellEditedIndicator(cell: any): void
```

## 📦 数据结构

### ISelectionRange
```typescript
interface ISelectionRange {
  startRow: number;    // 起始行索引
  startCol: number;    // 起始列索引
  endRow: number;      // 结束行索引
  endCol: number;      // 结束列索引
}
```

### ICellPosition
```typescript
interface ICellPosition {
  row: number;    // 行索引
  col: number;    // 列索引
}
```

## 💡 常用代码片段

### 选择单元格
```typescript
// 选择第2行第3列
const row = table.body.rows[1];
const cell = row.cells[2];
table.selectionManager.selectSingleCell(cell);
```

### 标记编辑状态
```typescript
// 标记选中的单元格为已编辑
const selectedCells = table.selectionManager.getSelectedCells();
selectedCells.forEach(cell => {
  table.selectionManager.markCellAsEdited(cell);
});
```

### 批量操作
```typescript
// 清除所有状态
table.selectionManager.clearSelection();
table.selectionManager.clearAllEditedStates();
```

### 状态查询
```typescript
// 检查单元格状态
const isSelected = table.selectionManager.isCellSelected(cell);
const isEdited = table.selectionManager.isCellEdited(cell);

if (isSelected && isEdited) {
  console.log('单元格既选中又已编辑');
}
```

### 获取数据
```typescript
// 获取选择范围信息
const range = table.selectionManager.getSelectionRange();
if (range) {
  const rowCount = range.endRow - range.startRow + 1;
  const colCount = range.endCol - range.startCol + 1;
  console.log(`选中了 ${rowCount} 行 × ${colCount} 列`);
}

// 获取已编辑的单元格
const editedCells = table.selectionManager.getEditedCells();
console.log(`共有 ${editedCells.length} 个单元格被编辑`);
```

## 🎨 视觉样式常量

```typescript
// 选中状态
const SELECTION_BG_COLOR = '#e6f7ff';      // 浅蓝色背景
const SELECTION_BORDER_COLOR = '#1890ff';  // 蓝色边框
const SELECTION_BORDER_WIDTH = 2;          // 边框宽度

// 编辑状态
const EDITED_INDICATOR_COLOR = '#ff4d4f';  // 红色标识
const EDITED_INDICATOR_SIZE = 8;           // 三角形大小（像素）

// 默认状态
const DEFAULT_BG_COLOR = '#ffffff';        // 白色背景
```

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+C` / `Cmd+C` | 复制选中的单元格数据 |
| 鼠标单击 | 选中单个单元格 |
| 鼠标拖拽 | 选中多个单元格 |
| 点击空白 | 清除选择 |

## 🔍 调试技巧

```typescript
// 打印当前状态
console.log('选中的单元格:', table.selectionManager.getSelectedCells());
console.log('已编辑的单元格:', table.selectionManager.getEditedCells());
console.log('选择范围:', table.selectionManager.getSelectionRange());

// 监听状态变化
const originalMarkAsEdited = table.selectionManager.markCellAsEdited;
table.selectionManager.markCellAsEdited = function(cell) {
  console.log('标记单元格为已编辑:', cell);
  originalMarkAsEdited.call(this, cell);
};
```

