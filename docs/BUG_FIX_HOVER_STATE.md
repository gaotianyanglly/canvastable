# 悬停状态和编辑状态保留问题修复报告

## 🐛 问题描述

### 症状
在清除选择状态时，`updateCellBackgroundColor(cell)` 方法没有正确处理单元格的其他状态，导致：

1. **悬停状态丢失**：处于悬停(hover)状态的单元格背景色被错误地重置为白色，而不是保持悬停的浅蓝色背景
2. **编辑标识可能消失**：虽然编辑状态是独立管理的，但在某些情况下可能不会正确重绘
3. **状态优先级混乱**：所有单元格都被强制设置为白色背景，忽略了它们的实际状态

### 复现步骤
1. 鼠标悬停在某一行上（整行变为浅蓝色）
2. 点击该行中的某个单元格（单元格被选中）
3. 点击另一个单元格（清除之前的选择）
4. **问题**：如果鼠标仍然悬停在第一行上，该行的背景色会变为白色，而不是保持浅蓝色

### 预期行为
- 清除选择状态后，悬停中的单元格应该保持浅蓝色背景
- 已编辑的单元格应该保持红色小三角形标识
- 只有既不悬停也不是已编辑状态的单元格才应该变为白色背景

---

## 🔍 根本原因分析

### 问题代码（修复前）

```typescript
// ❌ 问题 1：没有追踪悬停状态
export class SelectionManager {
  private selectedCells: BodyCell[] = [];
  private editedCells: Set<BodyCell> = new Set();
  // ❌ 缺少悬停状态追踪
}

// ❌ 问题 2：updateCellBackgroundColor 无法自动检测悬停状态
updateCellBackgroundColor(cell: BodyCell, isHovering: boolean = false) {
  if (this.isCellSelected(cell)) {
    cell.style.backgroundColor = '#e6f7ff';
  } else if (isHovering) {
    cell.style.backgroundColor = '#e6f7ff';
  } else {
    cell.style.backgroundColor = 'white'; // ❌ 总是重置为白色
  }
}

// ❌ 问题 3：clearSelectionWithoutRender 没有传递悬停状态
private clearSelectionWithoutRender() {
  const cellsToReset = [...this.selectedCells];
  this.selectedCells = [];
  this.selectionRange = null;
  
  cellsToReset.forEach(cell => {
    this.updateCellBackgroundColor(cell); // ❌ isHovering 默认为 false
  });
}
```

### 问题分析

1. **缺少悬停状态追踪**：`SelectionManager` 没有记录哪些单元格正在悬停
2. **参数默认值问题**：`updateCellBackgroundColor(cell, isHovering = false)` 的默认值导致悬停状态丢失
3. **状态检测缺失**：清除选择时，无法知道单元格是否正在悬停

### 执行流程图（修复前）

```
用户操作：鼠标悬停在第1行 → 点击第1行第2列 → 点击第2行第3列

1. 鼠标悬停第1行
   ├─> BodyRow.highlight(true)
   ├─> updateCellBackgroundColor(cell, true)
   └─> cell.backgroundColor = '#e6f7ff' ✅

2. 点击第1行第2列
   ├─> startSelection(cell)
   ├─> clearSelectionWithoutRender()
   ├─> updateCellBackgroundColor(cell) // ❌ isHovering = false
   └─> cell.backgroundColor = 'white' // ❌ 错误！应该保持浅蓝色

3. 点击第2行第3列
   ├─> startSelection(cell)
   ├─> clearSelectionWithoutRender()
   ├─> updateCellBackgroundColor(第1行第2列) // ❌ isHovering = false
   └─> 第1行第2列.backgroundColor = 'white' // ❌ 错误！
```

---

## ✅ 修复方案

### 修复 1：添加悬停状态追踪

```typescript
// ✅ 添加悬停状态管理
export class SelectionManager {
  private selectedCells: BodyCell[] = [];
  private editedCells: Set<BodyCell> = new Set();
  
  // ✅ 新增：悬停状态管理
  private hoveredCells: Set<BodyCell> = new Set();
}
```

### 修复 2：改进 updateCellBackgroundColor 方法

```typescript
/**
 * 更新单元格背景色
 * 优先级：选中状态 > 悬停状态 > 默认状态
 * 
 * @param cell 要更新的单元格
 * @param isHovering 是否处于悬停状态（可选，如果不传则自动检测）
 */
updateCellBackgroundColor(cell: BodyCell, isHovering?: boolean) {
  // ✅ 如果没有传递 isHovering 参数，则从 hoveredCells 中检测
  const actualIsHovering = isHovering !== undefined 
    ? isHovering 
    : this.hoveredCells.has(cell);
  
  if (this.isCellSelected(cell)) {
    cell.style.backgroundColor = '#e6f7ff';
  } else if (actualIsHovering) {
    cell.style.backgroundColor = '#e6f7ff';
  } else {
    cell.style.backgroundColor = 'white';
  }
  
  // ✅ 更新悬停状态追踪
  if (isHovering !== undefined) {
    if (isHovering) {
      this.hoveredCells.add(cell);
    } else {
      this.hoveredCells.delete(cell);
    }
  }
}
```

### 修复 3：改进 clearSelectionWithoutRender 方法

```typescript
/**
 * 清除选择但不触发重绘（内部使用）
 * 
 * 注意：此方法会保留悬停状态和编辑状态
 * - 悬停中的单元格会保持浅蓝色背景
 * - 已编辑的单元格会保持红色三角形标识
 */
private clearSelectionWithoutRender() {
  const cellsToReset = [...this.selectedCells];
  this.selectedCells = [];
  this.selectionRange = null;
  
  // ✅ updateCellBackgroundColor 会自动检测悬停状态
  cellsToReset.forEach(cell => {
    this.updateCellBackgroundColor(cell);
  });
}
```

### 修复 4：添加辅助方法

```typescript
/**
 * 检查单元格是否处于悬停状态
 */
isCellHovered(cell: BodyCell): boolean {
  return this.hoveredCells.has(cell);
}

/**
 * 获取所有悬停的单元格
 */
getHoveredCells(): BodyCell[] {
  return Array.from(this.hoveredCells);
}
```

---

## 🎯 修复效果

### 执行流程图（修复后）

```
用户操作：鼠标悬停在第1行 → 点击第1行第2列 → 点击第2行第3列

1. 鼠标悬停第1行
   ├─> BodyRow.highlight(true)
   ├─> updateCellBackgroundColor(cell, true)
   ├─> hoveredCells.add(cell) ✅
   └─> cell.backgroundColor = '#e6f7ff' ✅

2. 点击第1行第2列
   ├─> startSelection(cell)
   ├─> clearSelectionWithoutRender()
   ├─> updateCellBackgroundColor(cell) // 自动检测悬停状态
   ├─> actualIsHovering = hoveredCells.has(cell) = true ✅
   └─> cell.backgroundColor = '#e6f7ff' ✅ 保持浅蓝色！

3. 点击第2行第3列
   ├─> startSelection(cell)
   ├─> clearSelectionWithoutRender()
   ├─> updateCellBackgroundColor(第1行第2列)
   ├─> actualIsHovering = hoveredCells.has(第1行第2列) = true ✅
   └─> 第1行第2列.backgroundColor = '#e6f7ff' ✅ 保持浅蓝色！
```

---

## 📊 状态优先级

修复后的状态优先级（从高到低）：

1. **选中状态** - 浅蓝色背景 (#e6f7ff) + 蓝色边框
2. **悬停状态** - 浅蓝色背景 (#e6f7ff)
3. **默认状态** - 白色背景 (#ffffff)

**编辑状态**（独立）：
- 红色小三角形标识 - 独立于背景色状态，始终显示

---

## 🧪 测试验证

### 测试用例 1：悬停状态保留
```
1. 鼠标悬停在第1行
2. 点击第1行第2列
3. 点击第2行第3列
4. 验证：第1行仍然保持浅蓝色背景 ✅
```

### 测试用例 2：编辑状态保留
```
1. 标记第1行第2列为已编辑（红色三角形）
2. 选中第1行第2列
3. 点击其他单元格
4. 验证：第1行第2列的红色三角形仍然存在 ✅
```

### 测试用例 3：组合状态
```
1. 鼠标悬停在第1行
2. 标记第1行第2列为已编辑
3. 选中第1行第2列
4. 点击其他单元格
5. 验证：
   - 第1行保持浅蓝色背景 ✅
   - 第1行第2列的红色三角形存在 ✅
```

---

## 📁 修改的文件

- `src/core/SelectionManager.ts`
  - 添加 `hoveredCells: Set<BodyCell>` 属性
  - 修改 `updateCellBackgroundColor()` 方法
  - 改进 `clearSelectionWithoutRender()` 方法
  - 添加 `isCellHovered()` 方法
  - 添加 `getHoveredCells()` 方法

---

## ✅ 修复确认

- [x] 悬停状态正确追踪
- [x] 清除选择时保留悬停状态
- [x] 编辑状态独立管理
- [x] 状态优先级正确
- [x] 代码通过 TypeScript 类型检查
- [x] 添加辅助方法

---

**修复日期：** 2026-01-04  
**修复版本：** v2.2  
**修复人员：** AI Assistant

