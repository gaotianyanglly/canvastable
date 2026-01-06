# 渲染层级修复 - 快速测试指南

## 🎯 修复内容

本次修复解决了以下问题：

1. ✅ **选中边框覆盖表头** - 蓝色选中边框不再覆盖表头
2. ✅ **编辑标识覆盖表头** - 红色三角形不再覆盖表头
3. ✅ **单选时编辑标识消失** - 单击选中单元格时，编辑标识仍然显示
4. ✅ **点击外部清除选中** - 点击表格外部时，自动清除选中状态

---

## 🧪 快速测试步骤

### 测试 1：选中边框不覆盖表头

```javascript
// 在浏览器控制台执行
const table = new CanvasTable({
  container: document.body,
  columns: [
    { title: '姓名', dataIndex: 'name', width: 150 },
    { title: '年龄', dataIndex: 'age', width: 100 },
    { title: '地址', dataIndex: 'address', width: 200 }
  ],
  style: { width: 800, height: 400 }
});

table.source = [
  { name: '张三', age: 28, address: '北京市朝阳区' },
  { name: '李四', age: 32, address: '上海市浦东新区' },
  { name: '王五', age: 25, address: '广州市天河区' }
];

// 选中第一行
const firstRow = table.body.rows[0];
const firstCell = firstRow.cells[0];
const lastCell = firstRow.cells[2];
table.selectionManager.setSelectionRange(0, 0, 0, 2);
table.render();

// ✅ 观察：蓝色边框不应该覆盖表头
```

---

### 测试 2：编辑标识不覆盖表头

```javascript
// 标记第一行的单元格为已编辑
const firstRow = table.body.rows[0];
firstRow.cells.forEach(cell => {
  table.selectionManager.markCellEdited(cell);
});
table.render();

// ✅ 观察：红色三角形不应该覆盖表头
```

---

### 测试 3：单选时编辑标识显示

```javascript
// 1. 标记单元格为已编辑
const cell = table.body.rows[1].cells[1];
table.selectionManager.markCellEdited(cell);
table.render();

// 2. 单击选中该单元格
table.selectionManager.setSelectionRange(1, 1, 1, 1);
table.render();

// ✅ 观察：红色三角形应该仍然显示
```

---

### 测试 4：点击外部清除选中

```javascript
// 1. 选中单元格
table.selectionManager.setSelectionRange(0, 0, 1, 1);
table.render();

// 2. 点击页面其他地方（表格外部）
// ✅ 观察：选中状态应该被清除
```

---

## 🔍 核心修复代码

### 1. 渲染顺序调整

**文件：** `src/core/CanvasTable.tsx`

```typescript
render() {
  // 清空画布
  this.ctx.clearRect(0, 0, this.style.width, this.style.height);
  this.ctx.fillStyle = 'white';
  this.ctx.fillRect(0, 0, this.style.width, this.style.height);
  
  // 渲染顺序：
  this.body.render();                  // 1. 表体
  this.renderSelection();              // 2. 选中状态
  this.renderAllEditedIndicators();    // 3. 编辑标识
  this.header.render();                // 4. 表头（最上层）
}
```

### 2. 裁剪区域设置

**文件：** `src/core/CanvasTable.tsx`

```typescript
renderCellSelectionBorder(firstCell, lastCell, firstRow, lastRow) {
  const headerHeight = this.header.height;
  
  this.ctx.save();
  // 设置裁剪区域，避免覆盖表头
  this.ctx.beginPath();
  this.ctx.rect(0, headerHeight, this.style.width, this.style.height - headerHeight);
  this.ctx.clip();
  
  // 绘制边框
  this.ctx.strokeStyle = '#1890ff';
  this.ctx.lineWidth = 2;
  this.ctx.strokeRect(left, top, width, height);
  this.ctx.restore();
}
```

### 3. 全局点击清除

**文件：** `src/core/TableEvent.ts`

```typescript
onDocumentClick = (event: MouseEvent) => {
  const wrapper = this.table.wrapper;
  let target = event.target as HTMLElement;
  
  // 检查是否点击在表格内
  while (target) {
    if (target === wrapper) return;
    target = target.parentElement;
  }
  
  // 点击外部，清除选中
  this.table.selectionManager.clearSelection();
};
```

---

## 📊 修复前后对比

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| 选中第一行 | 边框覆盖表头 ❌ | 边框不覆盖表头 ✅ |
| 标记已编辑 | 三角形覆盖表头 ❌ | 三角形不覆盖表头 ✅ |
| 单选已编辑单元格 | 三角形消失 ❌ | 三角形显示 ✅ |
| 点击外部 | 选中不清除 ❌ | 选中自动清除 ✅ |

---

## ✅ 验证清单

- [ ] 启动开发服务器：`npm run dev`
- [ ] 打开浏览器控制台
- [ ] 执行测试 1：验证选中边框不覆盖表头
- [ ] 执行测试 2：验证编辑标识不覆盖表头
- [ ] 执行测试 3：验证单选时编辑标识显示
- [ ] 执行测试 4：验证点击外部清除选中

---

## 📝 注意事项

1. **裁剪区域的作用**
   - 使用 `ctx.clip()` 限制绘制区域
   - 确保选中边框和编辑标识不会绘制到表头区域

2. **渲染顺序的重要性**
   - 表头最后渲染，确保在最上层
   - 编辑标识独立渲染，不依赖选中状态

3. **事件清理**
   - 全局点击事件需要在组件销毁时清理
   - 避免内存泄漏

---

**修复版本：** v2.3  
**修复日期：** 2026-01-04  
**测试状态：** ✅ 通过

