# 快速开始指南

本指南将帮助你快速上手 Canvas Table，并了解最新的功能特性。

---

## 📦 安装

```bash
# 克隆项目
git clone <repository-url>

# 安装依赖
npm install

# 构建项目
npm run build
```

---

## 🚀 基础使用

### 1. 创建基础表格

```html
<!DOCTYPE html>
<html>
<head>
  <title>Canvas Table 示例</title>
</head>
<body>
  <div id="table-container"></div>
  
  <script src="dist/canvastable.js"></script>
  <script>
    const table = new CanvasTable({
      container: document.getElementById('table-container'),
      columns: [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '姓名', dataIndex: 'name', width: 120 },
        { title: '年龄', dataIndex: 'age', width: 80 }
      ],
      dataSource: [
        { id: 1, name: '张三', age: 25 },
        { id: 2, name: '李四', age: 30 },
        { id: 3, name: '王五', age: 28 }
      ],
      style: {
        width: '100%',
        height: 400
      }
    });
  </script>
</body>
</html>
```

---

## ✨ 新功能使用

### 1. 动态修改样式

```javascript
// 创建表格
const table = new CanvasTable({...});

// 修改单个样式
table.updateStyle('rowHeight', 50);

// 批量修改样式
table.updateStyles({
  rowHeight: 50,
  fontSize: '16px',
  textColor: '#333',
  borderColor: '#e0e0e0'
});

// 获取当前样式
const currentStyle = table.getStyle();
console.log('当前行高:', currentStyle.rowHeight);

// 重置为默认样式
table.resetStyle();
```

### 2. 主题切换示例

```javascript
// 深色主题
function applyDarkTheme() {
  table.updateStyles({
    backgroundColor: '#1e1e1e',
    textColor: '#ffffff',
    borderColor: '#404040',
    headerBackColor: '#2d2d2d'
  });
}

// 浅色主题
function applyLightTheme() {
  table.updateStyles({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#e8e8e8',
    headerBackColor: '#fafafa'
  });
}

// 蓝色主题
function applyBlueTheme() {
  table.updateStyles({
    backgroundColor: '#f0f5ff',
    textColor: '#1890ff',
    borderColor: '#91d5ff',
    headerBackColor: '#e6f7ff'
  });
}
```

### 3. 性能优化配置

```javascript
// 创建表格
const table = new CanvasTable({
  container: document.getElementById('container'),
  columns: [...],
  dataSource: largeDataSet // 大数据集
});

// 配置渲染性能
table.renderManager.setMinRenderInterval(16); // 约 60fps

// 配置离屏 Canvas 缓存
table.offscreenManager.setMaxCacheSize(50);
table.offscreenManager.setMaxCacheAge(60000); // 60秒

// 批量更新数据
function updateMultipleRows(updates) {
  updates.forEach(update => {
    table.source[update.index] = update.data;
  });
  
  // 只触发一次渲染
  table.render();
}
```

---

## 🎨 完整示例

### 示例 1：带样式控制的表格

```html
<!DOCTYPE html>
<html>
<head>
  <title>样式控制示例</title>
  <style>
    .controls {
      margin-bottom: 20px;
    }
    .controls button {
      margin-right: 10px;
      padding: 8px 16px;
    }
  </style>
</head>
<body>
  <div class="controls">
    <button onclick="increaseRowHeight()">增加行高</button>
    <button onclick="decreaseRowHeight()">减少行高</button>
    <button onclick="increaseFontSize()">增大字体</button>
    <button onclick="decreaseFontSize()">减小字体</button>
    <button onclick="table.resetStyle()">重置样式</button>
  </div>
  
  <div id="table-container"></div>
  
  <script src="dist/canvastable.js"></script>
  <script>
    const table = new CanvasTable({
      container: document.getElementById('table-container'),
      columns: [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '姓名', dataIndex: 'name', width: 120 },
        { title: '年龄', dataIndex: 'age', width: 80 },
        { title: '城市', dataIndex: 'city', width: 120 }
      ],
      dataSource: generateData(100),
      style: {
        width: '100%',
        height: 500
      }
    });
    
    function generateData(count) {
      const cities = ['北京', '上海', '广州', '深圳'];
      const data = [];
      for (let i = 0; i < count; i++) {
        data.push({
          id: i + 1,
          name: `用户${i + 1}`,
          age: 20 + Math.floor(Math.random() * 40),
          city: cities[Math.floor(Math.random() * cities.length)]
        });
      }
      return data;
    }
    
    function increaseRowHeight() {
      const current = table.getStyle().rowHeight;
      table.updateStyle('rowHeight', current + 5);
    }
    
    function decreaseRowHeight() {
      const current = table.getStyle().rowHeight;
      table.updateStyle('rowHeight', Math.max(20, current - 5));
    }
    
    function increaseFontSize() {
      const current = parseInt(table.getStyle().fontSize);
      table.updateStyle('fontSize', `${current + 2}px`);
    }
    
    function decreaseFontSize() {
      const current = parseInt(table.getStyle().fontSize);
      table.updateStyle('fontSize', `${Math.max(10, current - 2)}px`);
    }
  </script>
</body>
</html>
```

---

## 📚 更多示例

项目提供了多个示例文件，位于 `examples/` 目录：

1. **dynamic-style-example.html** - 动态样式配置示例
   - 实时修改样式
   - 颜色选择器
   - 样式重置

2. **performance-test.html** - 性能测试页面
   - 大数据量测试
   - FPS 监控
   - 渲染性能统计
   - 压力测试

---

## 🔧 配置选项

### 样式配置

所有可配置的样式选项：

```typescript
{
  width: string | number,           // 表格宽度
  height: string | number,          // 表格高度
  rowHeight: number,                // 行高
  headerRowHeight: number,          // 表头行高
  columnWidth: number,              // 默认列宽
  fontSize: string,                 // 字体大小
  fontFamily: string,               // 字体
  textColor: string,                // 文字颜色
  borderColor: string,              // 边框颜色
  headerBackColor: string,          // 表头背景色
  backgroundColor: string,          // 背景颜色
  padding: number                   // 内边距
}
```

---

## 💡 最佳实践

1. **批量更新样式**
   ```javascript
   // ✅ 推荐
   table.updateStyles({ rowHeight: 50, fontSize: '16px' });
   
   // ❌ 不推荐
   table.updateStyle('rowHeight', 50);
   table.updateStyle('fontSize', '16px');
   ```

2. **使用 RAF 优化渲染**
   ```javascript
   // ✅ 推荐
   table.render(); // 使用 RAF
   
   // ❌ 不推荐（除非必要）
   table.renderImmediate();
   ```

3. **大数据量场景**
   ```javascript
   // 配置合适的渲染间隔
   table.renderManager.setMinRenderInterval(16);
   
   // 配置缓存大小
   table.offscreenManager.setMaxCacheSize(100);
   ```

---

## 📖 进一步学习

- [API 参考文档](./API_REFERENCE.md)
- [优化总结](./OPTIMIZATION_SUMMARY.md)
- [更新日志](../CHANGELOG.md)

---

## 🆘 获取帮助

如果遇到问题，可以：

1. 查看示例文件
2. 阅读 API 文档
3. 提交 Issue

---

## 🎉 开始使用

现在你已经了解了基础用法，可以开始创建自己的表格了！

建议从简单的示例开始，逐步探索更高级的功能。

