# 如何查看 DOM 覆盖层演示

## 🚀 快速开始

### 方法 1：使用开发服务器（推荐）

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **在浏览器中打开**
   ```
   http://localhost:8080
   ```

3. **查看演示**
   - 页面会显示一个 Canvas 表格
   - 点击页面上的按钮来添加不同类型的 DOM 元素：
     - ✏️ 添加输入框
     - 📝 添加下拉框
     - 📋 添加表单
     - 🗑️ 清除所有覆盖层
     - ⚡ 运行性能测试

4. **打开浏览器控制台**
   - 按 `F12` 或右键 → 检查
   - 查看 Console 标签页
   - 当你与 DOM 元素交互时，会看到日志输出

---

## 📁 相关文件说明

### 核心组件
- **`src/component/DomOverlay.ts`** - DOM 覆盖层组件实现
- **`src/examples/DomOverlayExample.tsx`** - 使用示例
- **`src/examples/PerformanceComparison.ts`** - 性能对比测试

### 文档
- **`docs/DOM_TO_CANVAS_GUIDE.md`** - 完整技术文档

### 演示页面
- **`src/test/dom-demo.tsx`** - 简化的演示页面
- **`demo.html`** - HTML 入口文件（如果需要）

---

## 🎯 演示功能

### 1. 添加输入框
点击"添加输入框"按钮，会在表格的第 2 行第 2 列添加一个可编辑的输入框。

**特点：**
- 完全的原生 DOM 输入框
- 支持所有键盘事件
- 可以复制粘贴
- 实时输出到控制台

### 2. 添加下拉框
点击"添加下拉框"按钮，会在表格的第 3 行第 3 列添加一个下拉选择框。

**特点：**
- 原生下拉交互
- 支持键盘导航
- 选择时输出到控制台

### 3. 添加表单
点击"添加表单"按钮，会在表格中添加一个包含多个字段的复杂表单。

**特点：**
- 多个输入字段
- 提交按钮
- 表单验证
- 弹窗提示

### 4. 清除所有覆盖层
点击"清除所有覆盖层"按钮，会移除所有添加的 DOM 元素。

### 5. 运行性能测试
点击"运行性能测试"按钮，会在控制台输出不同渲染方案的性能对比数据。

---

## 🔧 技术要点

### DOM 覆盖层的工作原理

```
┌─────────────────────────────────┐
│   Canvas 层（底层）              │
│   - 表格框架、边框               │
│   - 普通文本                     │
└─────────────────────────────────┘
         ↑
         │ 位置同步
         ↓
┌─────────────────────────────────┐
│   DOM 覆盖层（顶层）             │
│   - 输入框、下拉框               │
│   - 复杂表单                     │
└─────────────────────────────────┘
```

### 使用示例代码

```typescript
import DomOverlay from './component/DomOverlay';

// 创建输入框
const input = document.createElement('input');
input.type = 'text';
input.placeholder = '请输入...';

// 创建覆盖层
const overlay = new DomOverlay({
  table: canvasTable,        // Canvas Table 实例
  domContent: input,         // DOM 元素
  left: 150,                 // X 坐标
  top: 55,                   // Y 坐标
  width: 150,                // 宽度
  height: 55                 // 高度
});

// 监听事件
input.addEventListener('input', (e) => {
  console.log('输入值：', e.target.value);
});

// 销毁覆盖层
overlay.destroy();
```

---

## 📊 性能对比

运行性能测试后，你会在控制台看到类似这样的输出：

```
=== Canvas Table 性能对比测试 ===

📊 小数据量 (100 单元格)
──────────────────────────────────────────────────
✓ 纯 Canvas: 2.50ms (400.0 FPS)
✓ 纯 DOM: 8.30ms (120.5 FPS)
✓ 混合渲染: 3.20ms (312.5 FPS) [10 DOM 元素]

📊 大数据量 (1000 单元格)
──────────────────────────────────────────────────
✓ 纯 Canvas: 18.50ms (54.1 FPS)
✓ 纯 DOM: 156.20ms (6.4 FPS)
✓ 混合渲染: 25.30ms (39.5 FPS) [100 DOM 元素]

🏆 最快方案: 纯 Canvas
```

---

## 💡 常见问题

### Q: 为什么看不到 DOM 元素？
A: 确保：
1. 开发服务器正在运行
2. 点击了相应的按钮
3. 检查浏览器控制台是否有错误

### Q: 如何调整 DOM 元素的位置？
A: 使用 `overlay.updatePosition(left, top, width, height)` 方法

### Q: 如何自定义 DOM 元素的样式？
A: 直接修改 DOM 元素的 style 属性即可

### Q: 性能测试在哪里查看？
A: 打开浏览器控制台（F12），点击"运行性能测试"按钮

---

## 📚 更多资源

- **完整技术文档**: `docs/DOM_TO_CANVAS_GUIDE.md`
- **API 文档**: 查看 `src/component/DomOverlay.ts` 中的注释
- **示例代码**: `src/examples/DomOverlayExample.tsx`

---

## 🎉 开始体验

现在运行 `npm run dev`，然后在浏览器中打开 `http://localhost:8080`，开始体验 DOM 覆盖层的强大功能吧！

