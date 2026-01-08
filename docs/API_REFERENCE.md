# Canvas Table API 参考文档

## 📋 目录

- [样式管理 API](#样式管理-api)
- [渲染控制 API](#渲染控制-api)
- [性能优化 API](#性能优化-api)

---

## 样式管理 API

### updateStyle()

更新单个样式配置。

**语法：**
```typescript
table.updateStyle<K extends keyof ITableStyleProps>(
  key: K,
  value: ITableStyleProps[K]
): void
```

**参数：**
- `key` - 样式属性名
- `value` - 样式属性值

**示例：**
```javascript
// 修改行高
table.updateStyle('rowHeight', 50);

// 修改字体大小
table.updateStyle('fontSize', '16px');

// 修改文字颜色
table.updateStyle('textColor', '#333333');
```

---

### updateStyles()

批量更新样式配置。

**语法：**
```typescript
table.updateStyles(styles: Partial<ITableStyleProps>): void
```

**参数：**
- `styles` - 样式对象，包含要更新的样式属性

**示例：**
```javascript
table.updateStyles({
  rowHeight: 50,
  headerRowHeight: 60,
  fontSize: '16px',
  textColor: '#333',
  borderColor: '#e0e0e0'
});
```

**注意：**
- 批量更新只会触发一次重新渲染，性能更好
- 建议优先使用此方法而不是多次调用 `updateStyle()`

---

### getStyle()

获取当前的样式配置。

**语法：**
```typescript
table.getStyle(): Readonly<ITableStyleProps>
```

**返回值：**
- 返回当前样式配置的只读副本

**示例：**
```javascript
const currentStyle = table.getStyle();
console.log('当前行高:', currentStyle.rowHeight);
console.log('当前字体:', currentStyle.fontSize);
```

---

### resetStyle()

重置样式为默认值。

**语法：**
```typescript
table.resetStyle(): void
```

**示例：**
```javascript
// 重置所有样式为默认值
table.resetStyle();
```

---

## 渲染控制 API

### render()

请求渲染（使用 RAF 优化）。

**语法：**
```typescript
table.render(): void
```

**说明：**
- 使用 `requestAnimationFrame` 优化渲染时机
- 同一帧内多次调用只会执行一次渲染
- 这是推荐的渲染方法

**示例：**
```javascript
// 修改数据后请求渲染
table.source = newData;
table.render();

// 多次调用只会渲染一次
table.render();
table.render();
table.render(); // 这些调用会被合并
```

---

### renderImmediate()

立即渲染（不使用 RAF）。

**语法：**
```typescript
table.renderImmediate(): void
```

**说明：**
- 立即执行渲染，不等待下一帧
- 适用于需要立即看到结果的场景（如截图、导出等）
- 不建议频繁使用

**示例：**
```javascript
// 截图前立即渲染
table.renderImmediate();
const imageData = table.canvas.toDataURL();
```

---

## 性能优化 API

### RenderManager

渲染管理器，负责优化渲染调度。

#### setMinRenderInterval()

设置最小渲染间隔。

**语法：**
```typescript
table.renderManager.setMinRenderInterval(interval: number): void
```

**参数：**
- `interval` - 最小渲染间隔（毫秒）

**示例：**
```javascript
// 设置最小渲染间隔为 16ms（约 60fps）
table.renderManager.setMinRenderInterval(16);

// 设置最小渲染间隔为 33ms（约 30fps）
table.renderManager.setMinRenderInterval(33);
```

---

### OffscreenCanvasManager

离屏 Canvas 管理器，用于缓存复杂内容。

#### setMaxCacheSize()

设置最大缓存数量。

**语法：**
```typescript
table.offscreenManager.setMaxCacheSize(size: number): void
```

**参数：**
- `size` - 最大缓存数量

**示例：**
```javascript
// 设置最大缓存 100 个离屏 Canvas
table.offscreenManager.setMaxCacheSize(100);
```

---

#### setMaxCacheAge()

设置最大缓存时间。

**语法：**
```typescript
table.offscreenManager.setMaxCacheAge(age: number): void
```

**参数：**
- `age` - 最大缓存时间（毫秒）

**示例：**
```javascript
// 设置缓存最多保留 2 分钟
table.offscreenManager.setMaxCacheAge(120000);
```

---

#### clearAll()

清除所有缓存。

**语法：**
```typescript
table.offscreenManager.clearAll(): void
```

**示例：**
```javascript
// 清除所有离屏 Canvas 缓存
table.offscreenManager.clearAll();
```

---

## 完整示例

### 示例 1：动态主题切换

```javascript
// 创建表格
const table = new CanvasTable({
  container: document.getElementById('container'),
  columns: [...],
  dataSource: [...]
});

// 切换到深色主题
function switchToDarkTheme() {
  table.updateStyles({
    backgroundColor: '#1e1e1e',
    textColor: '#ffffff',
    borderColor: '#404040',
    headerBackColor: '#2d2d2d'
  });
}

// 切换到浅色主题
function switchToLightTheme() {
  table.resetStyle();
}
```

---

### 示例 2：性能优化配置

```javascript
// 创建表格
const table = new CanvasTable({
  container: document.getElementById('container'),
  columns: [...],
  dataSource: largeDataSet // 大数据集
});

// 优化渲染性能
table.renderManager.setMinRenderInterval(16); // 60fps
table.offscreenManager.setMaxCacheSize(50);
table.offscreenManager.setMaxCacheAge(60000);

// 批量更新数据时使用 RAF 优化
function updateMultipleRows(updates) {
  updates.forEach(update => {
    // 更新数据
    table.source[update.index] = update.data;
  });
  
  // 只触发一次渲染
  table.render();
}
```

---

### 示例 3：实时样式预览

```javascript
// 创建表格
const table = new CanvasTable({...});

// 监听滑块变化，实时预览行高
const rowHeightSlider = document.getElementById('row-height');
rowHeightSlider.addEventListener('input', (e) => {
  table.updateStyle('rowHeight', parseInt(e.target.value));
});

// 监听颜色选择器，实时预览颜色
const colorPicker = document.getElementById('text-color');
colorPicker.addEventListener('input', (e) => {
  table.updateStyle('textColor', e.target.value);
});
```

---

## 最佳实践

1. **批量更新样式**
   ```javascript
   // ❌ 不推荐：多次单独更新
   table.updateStyle('rowHeight', 50);
   table.updateStyle('fontSize', '16px');
   table.updateStyle('textColor', '#333');
   
   // ✅ 推荐：批量更新
   table.updateStyles({
     rowHeight: 50,
     fontSize: '16px',
     textColor: '#333'
   });
   ```

2. **使用 RAF 优化渲染**
   ```javascript
   // ❌ 不推荐：立即渲染
   for (let i = 0; i < 100; i++) {
     table.source[i].value = newValue;
     table.renderImmediate();
   }
   
   // ✅ 推荐：使用 RAF
   for (let i = 0; i < 100; i++) {
     table.source[i].value = newValue;
   }
   table.render(); // 只渲染一次
   ```

3. **合理配置缓存**
   ```javascript
   // 根据实际数据量调整缓存大小
   if (table.source.length > 10000) {
     table.offscreenManager.setMaxCacheSize(100);
   } else {
     table.offscreenManager.setMaxCacheSize(50);
   }
   ```

