/**
 * DOM 覆盖层使用示例
 * 演示如何在 Canvas Table 中渲染复杂的 DOM 元素
 */

import DomOverlay from '../component/DomOverlay';
import CanvasTable from '../core/CanvasTable';

// 示例 1：在单元格中渲染输入框
export function createInputCell(table: CanvasTable, row: number, col: number) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'cell-input';
  input.style.width = '100%';
  input.style.height = '100%';
  input.style.border = 'none';
  input.style.padding = '8px';
  input.style.fontSize = '14px';
  input.style.boxSizing = 'border-box';
  input.placeholder = '请输入...';

  // 创建 DOM 覆盖层
  const overlay = new DomOverlay({
    table: table,
    domContent: input,
    left: col * 150,
    top: row * 55 + table.header.height,
    width: 150,
    height: 55
  });

  // 监听输入事件
  input.addEventListener('input', (e) => {
    console.log('输入值：', (e.target as HTMLInputElement).value);
  });

  return overlay;
}

// 示例 2：在单元格中渲染下拉选择框
export function createSelectCell(table: CanvasTable, row: number, col: number, options: string[]) {
  const select = document.createElement('select');
  select.className = 'cell-select';
  select.style.width = '100%';
  select.style.height = '100%';
  select.style.border = 'none';
  select.style.padding = '8px';
  select.style.fontSize = '14px';
  select.style.boxSizing = 'border-box';

  // 添加选项
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });

  const overlay = new DomOverlay({
    table: table,
    domContent: select,
    left: col * 150,
    top: row * 55 + table.header.height,
    width: 150,
    height: 55
  });

  return overlay;
}

// 示例 3：在单元格中渲染富文本编辑器
export function createRichTextCell(table: CanvasTable, row: number, col: number) {
  const editor = document.createElement('div');
  editor.contentEditable = 'true';
  editor.className = 'cell-rich-text';
  editor.style.width = '100%';
  editor.style.height = '100%';
  editor.style.padding = '8px';
  editor.style.fontSize = '14px';
  editor.style.overflow = 'auto';
  editor.style.boxSizing = 'border-box';
  editor.innerHTML = '<p>可编辑的富文本内容...</p>';

  const overlay = new DomOverlay({
    table: table,
    domContent: editor,
    left: col * 150,
    top: row * 55 + table.header.height,
    width: 300,
    height: 100
  });

  return overlay;
}

// 示例 4：在单元格中渲染复杂的表单
export function createFormCell(table: CanvasTable, row: number, col: number) {
  const form = document.createElement('div');
  form.className = 'cell-form';
  form.style.padding = '10px';
  form.style.backgroundColor = 'white';
  form.style.boxSizing = 'border-box';
  form.innerHTML = `
    <div style="margin-bottom: 8px;">
      <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">姓名：</label>
      <input type="text" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div style="margin-bottom: 8px;">
      <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">年龄：</label>
      <input type="number" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div>
      <button style="padding: 4px 12px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        提交
      </button>
    </div>
  `;

  const overlay = new DomOverlay({
    table: table,
    domContent: form,
    left: col * 150,
    top: row * 55 + table.header.height,
    width: 200,
    height: 150
  });

  // 监听提交按钮
  const button = form.querySelector('button');
  button?.addEventListener('click', () => {
    const inputs = form.querySelectorAll('input');
    console.log('表单数据：', {
      name: (inputs[0] as HTMLInputElement).value,
      age: (inputs[1] as HTMLInputElement).value
    });
  });

  return overlay;
}

