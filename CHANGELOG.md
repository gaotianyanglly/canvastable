# 更新日志

所有重要的项目变更都会记录在此文件中。

---

## [未发布] - 2026-01-06

### ✨ 新增功能

#### 样式管理系统
- 新增 `StyleManager` 类，集中管理所有样式配置
- 支持动态修改样式，无需重新创建表格实例
- 新增 `updateStyle()` 方法，支持单个样式修改
- 新增 `updateStyles()` 方法，支持批量样式修改
- 新增 `getStyle()` 方法，获取当前样式配置
- 新增 `resetStyle()` 方法，重置为默认样式
- 样式变更自动触发重新渲染
- 支持样式值验证

#### 渲染性能优化
- 新增 `RenderManager` 类，优化渲染调度
- 使用 `requestAnimationFrame` 优化渲染时机
- 实现渲染节流，避免同一帧内多次渲染
- 支持脏区域标记（为未来增量渲染做准备）
- 新增 `renderImmediate()` 方法，支持立即渲染
- 新增 `OffscreenCanvasManager` 类，管理离屏 Canvas 缓存
- 支持配置最小渲染间隔
- 支持配置离屏 Canvas 缓存大小和过期时间

### 📝 文档

- 新增 `docs/OPTIMIZATION_SUMMARY.md` - 优化总结文档
- 新增 `docs/API_REFERENCE.md` - API 参考文档
- 新增 `docs/CANVAS_INTERACTIVE_ELEMENTS.md` - Canvas 交互元素实现方案
- 新增 `docs/CANVAS_ANIMATION_IMPLEMENTATION.md` - Canvas 动画实现方案（部分）

### 🎨 示例

- 新增 `examples/dynamic-style-example.html` - 动态样式配置示例
- 新增 `examples/performance-test.html` - 性能测试页面

### 🔧 改进

- 优化 `CanvasTable` 类，集成样式管理器和渲染管理器
- 优化 `render()` 方法，使用 RAF 提升性能
- 优化 `destroy()` 方法，正确清理所有管理器
- 改进样式变更处理逻辑，区分尺寸变更和样式变更

### 🐛 修复

- 修复样式修改后可能导致的布局问题
- 修复频繁渲染可能导致的性能问题

---

## 性能提升

### 渲染性能

**优化前：**
- 每次调用 `render()` 都立即执行渲染
- 同一帧可能触发多次渲染
- 没有渲染节流机制

**优化后：**
- 使用 RAF 优化渲染时机
- 同一帧内多次调用 `render()` 只执行一次
- 支持渲染节流，可配置最小渲染间隔
- 提供离屏 Canvas 缓存机制

**预期效果：**
- 🚀 减少不必要的渲染次数
- 🚀 提升大数据量场景下的性能
- 🚀 降低 CPU 和 GPU 负载
- 🚀 更流畅的用户体验

### 样式管理

**优化前：**
- 修改样式需要重新创建表格实例
- 无法实时预览样式效果
- 样式配置分散，难以管理

**优化后：**
- 支持动态修改样式，无需重建实例
- 样式变更自动触发重新渲染
- 集中管理，易于维护
- 支持样式验证和重置

**预期效果：**
- ✨ 更好的开发体验
- ✨ 更灵活的样式配置
- ✨ 更易于维护的代码

---

## 迁移指南

### 从旧版本迁移

如果你正在使用旧版本的 Canvas Table，以下是迁移指南：

#### 1. 样式配置

**旧方式：**
```javascript
// 修改样式需要重新创建实例
const table = new CanvasTable({
  style: { rowHeight: 40 }
});

// 要修改样式，需要销毁并重建
table.destroy();
const newTable = new CanvasTable({
  style: { rowHeight: 50 }
});
```

**新方式：**
```javascript
// 创建实例
const table = new CanvasTable({
  style: { rowHeight: 40 }
});

// 动态修改样式
table.updateStyle('rowHeight', 50);

// 或批量修改
table.updateStyles({
  rowHeight: 50,
  fontSize: '16px'
});
```

#### 2. 渲染控制

**旧方式：**
```javascript
// 直接调用 render()
table.render();
```

**新方式：**
```javascript
// 推荐：使用 RAF 优化（默认行为）
table.render();

// 需要立即渲染时
table.renderImmediate();
```

#### 3. 性能优化

**新增配置：**
```javascript
// 配置渲染性能
table.renderManager.setMinRenderInterval(16); // 60fps

// 配置离屏 Canvas 缓存
table.offscreenManager.setMaxCacheSize(50);
table.offscreenManager.setMaxCacheAge(60000);
```

---

## 已知问题

目前没有已知的重大问题。

---

## 未来计划

### v1.1.0（计划中）

- [ ] 增量渲染支持
- [ ] 虚拟滚动优化
- [ ] 更多交互元素（按钮、链接、图标等）
- [ ] 树状列表展开/收起动画

### v1.2.0（计划中）

- [ ] Web Worker 支持
- [ ] GPU 加速（WebGL）
- [ ] 更丰富的主题系统
- [ ] 插件系统

---

## 贡献者

感谢所有为这个项目做出贡献的开发者！

---

## 许可证

本项目采用 MIT 许可证。

