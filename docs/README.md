# Canvas Table 文档中心

欢迎来到 Canvas Table 文档中心！这里包含了所有相关的技术文档、API 参考和使用指南。

---

## 📚 文档导航

### 🚀 快速开始

- **[快速开始指南](./QUICK_START.md)**
  - 安装和基础使用
  - 新功能介绍
  - 完整示例
  - 最佳实践

### 📖 API 文档

- **[API 参考文档](./API_REFERENCE.md)**
  - 样式管理 API
  - 渲染控制 API
  - 性能优化 API
  - 使用示例

### 🔧 优化文档

- **[优化总结](./OPTIMIZATION_SUMMARY.md)**
  - 已完成的优化
  - 优化效果对比
  - 性能测试
  - 未来优化方向

### 💡 实现方案

- **[Canvas 交互元素实现方案](./CANVAS_INTERACTIVE_ELEMENTS.md)**
  - 交互元素设计
  - 按钮组件
  - 链接组件
  - 图标组件

- **[Canvas 动画实现方案](./CANVAS_ANIMATION_IMPLEMENTATION.md)**
  - 动画系统架构
  - 缓动函数
  - 树状列表动画
  - 使用示例

### 📝 项目文档

- **[工作总结](./WORK_SUMMARY.md)**
  - 完成的工作
  - 技术亮点
  - 文件清单
  - 未来计划

- **[更新日志](../CHANGELOG.md)**
  - 版本历史
  - 新增功能
  - 迁移指南

---

## 🎯 按需查找

### 我想了解...

#### 如何开始使用？
👉 查看 [快速开始指南](./QUICK_START.md)

#### 如何动态修改样式？
👉 查看 [API 参考文档 - 样式管理 API](./API_REFERENCE.md#样式管理-api)

#### 如何优化渲染性能？
👉 查看 [API 参考文档 - 性能优化 API](./API_REFERENCE.md#性能优化-api)

#### 做了哪些优化？
👉 查看 [优化总结](./OPTIMIZATION_SUMMARY.md)

#### 如何实现交互元素？
👉 查看 [Canvas 交互元素实现方案](./CANVAS_INTERACTIVE_ELEMENTS.md)

#### 如何实现动画效果？
👉 查看 [Canvas 动画实现方案](./CANVAS_ANIMATION_IMPLEMENTATION.md)

#### 有哪些示例可以参考？
👉 查看 `examples/` 目录：
- `dynamic-style-example.html` - 动态样式配置
- `performance-test.html` - 性能测试

---

## 🗂️ 文档结构

```
docs/
├── README.md                           # 文档中心（本文件）
├── QUICK_START.md                      # 快速开始指南
├── API_REFERENCE.md                    # API 参考文档
├── OPTIMIZATION_SUMMARY.md             # 优化总结
├── CANVAS_INTERACTIVE_ELEMENTS.md      # Canvas 交互元素方案
├── CANVAS_ANIMATION_IMPLEMENTATION.md  # Canvas 动画方案
└── WORK_SUMMARY.md                     # 工作总结

examples/
├── dynamic-style-example.html          # 动态样式示例
└── performance-test.html               # 性能测试页面

CHANGELOG.md                            # 更新日志
```

---

## 🎨 示例文件

### 1. 动态样式配置示例

**文件：** `examples/dynamic-style-example.html`

**功能：**
- 实时修改行高、字体大小
- 实时修改颜色配置
- 应用和重置样式

**适合场景：**
- 学习样式管理 API
- 实现主题切换功能
- 自定义表格外观

### 2. 性能测试页面

**文件：** `examples/performance-test.html`

**功能：**
- 大数据量测试
- FPS 实时监控
- 渲染性能统计
- 压力测试

**适合场景：**
- 性能测试和优化
- 了解渲染性能
- 验证优化效果

---

## 🔑 核心概念

### StyleManager（样式管理器）

负责管理所有样式配置，支持动态修改和变更监听。

**主要功能：**
- 单个样式修改
- 批量样式修改
- 样式验证
- 重置为默认值

**使用场景：**
- 主题切换
- 实时样式预览
- 自定义外观

### RenderManager（渲染管理器）

负责优化渲染调度，避免不必要的重绘。

**主要功能：**
- RAF 优化
- 渲染节流
- 脏区域标记

**使用场景：**
- 性能优化
- 大数据量渲染
- 频繁更新场景

### OffscreenCanvasManager（离屏Canvas管理器）

负责管理离屏 Canvas 缓存，优化复杂内容渲染。

**主要功能：**
- 缓存管理
- 自动清理
- 配置缓存策略

**使用场景：**
- 复杂内容缓存
- 减少重复渲染
- 提升性能

---

## 📊 性能指标

### 渲染性能

- **目标 FPS：** 60
- **最小渲染间隔：** 16ms（可配置）
- **支持数据量：** 100,000+ 行

### 样式更新

- **单个样式更新：** < 1ms
- **批量样式更新：** < 5ms
- **样式验证：** < 0.1ms

---

## 🛠️ 开发工具

### 性能监控

使用 `performance-test.html` 进行性能监控：

```javascript
// FPS 监控
document.getElementById('fps-monitor').textContent

// 渲染次数
document.getElementById('render-count').textContent

// 平均渲染时间
document.getElementById('avg-render-time').textContent
```

### 调试技巧

1. **查看样式配置**
   ```javascript
   console.log(table.getStyle());
   ```

2. **监控渲染性能**
   ```javascript
   const start = performance.now();
   table.render();
   console.log('渲染耗时:', performance.now() - start);
   ```

3. **检查缓存状态**
   ```javascript
   console.log('缓存数量:', table.offscreenManager.cache.size);
   ```

---

## 🤝 贡献指南

欢迎贡献代码和文档！

### 文档贡献

1. 发现文档错误或不清晰的地方
2. 提交 Issue 或 Pull Request
3. 遵循现有文档风格

### 代码贡献

1. Fork 项目
2. 创建特性分支
3. 提交 Pull Request

---

## 📞 获取帮助

### 常见问题

**Q: 如何动态修改样式？**
A: 使用 `table.updateStyle()` 或 `table.updateStyles()` 方法。

**Q: 如何优化大数据量性能？**
A: 配置 `renderManager` 和 `offscreenManager`。

**Q: 如何实现主题切换？**
A: 使用 `updateStyles()` 批量修改颜色配置。

### 更多帮助

- 查看示例文件
- 阅读 API 文档
- 提交 Issue

---

## 📅 更新记录

- **2026-01-06** - 创建文档中心
- **2026-01-06** - 添加优化相关文档
- **2026-01-06** - 添加 API 参考文档

---

## 📄 许可证

本项目采用 MIT 许可证。

---

**祝你使用愉快！** 🎉

