/** @jsx h */
import h from "../utils/h";
import CanvasTable from "../core/CanvasTable";
import DomOverlay from "../component/DomOverlay";
import { runPerformanceTest } from "../examples/PerformanceComparison";
import '../style/style.scss';

// 创建页面布局
const pageContainer = document.createElement('div');
pageContainer.style.padding = '20px';
pageContainer.style.fontFamily = 'Arial, sans-serif';
pageContainer.style.maxWidth = '1400px';
pageContainer.style.margin = '0 auto';
document.body.appendChild(pageContainer);

// 创建标题
const title = document.createElement('h1');
title.textContent = '🎨 Canvas Table - DOM 覆盖层演示';
title.style.color = '#1890ff';
title.style.marginBottom = '10px';
pageContainer.appendChild(title);

// 创建说明
const description = document.createElement('p');
description.textContent = '演示如何在 Canvas 表格中渲染复杂的 DOM 元素（输入框、下拉框、表单等）';
description.style.color = '#666';
description.style.marginBottom = '20px';
pageContainer.appendChild(description);

// 创建按钮容器
const buttonContainer = document.createElement('div');
buttonContainer.style.marginBottom = '20px';
pageContainer.appendChild(buttonContainer);

// 创建表格容器
const wrapper = document.createElement('div');
wrapper.style.marginBottom = '30px';
pageContainer.appendChild(wrapper);

// 模拟列数据
function colMock() {
  let columns = [];
  for (let i = 0; i < 10; i++) {
    columns.push({
      dataIndex: `col${i + 1}`,
      title: `列 ${i + 1}`,
    });
  }
  return columns;
}

// 模拟行数据
function dataMock(len: number) {
  let data = [];
  for (let j = 0; j < len; j++) {
    let row: any = {};
    Array.from({ length: 10 }).forEach((_, i) => {
      row[`col${i + 1}`] = `Cell ${j}-${i}`;
    });
    data.push(row);
  }
  return data;
}

const columns = colMock();

const ct = new CanvasTable({
  container: wrapper,
  columns: columns,
  style: { height: 600, width: 1200 }
});

ct.source = dataMock(20);

// 创建按钮辅助函数
const createButton = (text: string, color: string, onClick: () => void) => {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.padding = '10px 20px';
  btn.style.marginRight = '10px';
  btn.style.marginBottom = '10px';
  btn.style.cursor = 'pointer';
  btn.style.background = color;
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.style.fontSize = '14px';
  btn.style.transition = 'all 0.3s';
  btn.addEventListener('mouseenter', () => {
    btn.style.opacity = '0.8';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.opacity = '1';
  });
  btn.addEventListener('click', onClick);
  buttonContainer.appendChild(btn);
  return btn;
};

// 存储创建的覆盖层
const overlays: DomOverlay[] = [];

// 按钮 1: 添加输入框
createButton('✏️ 添加输入框 (第2行第2列)', '#1890ff', () => {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '请输入内容...';
  input.style.width = '100%';
  input.style.height = '100%';
  input.style.border = '2px solid #1890ff';
  input.style.padding = '8px';
  input.style.fontSize = '14px';
  input.style.boxSizing = 'border-box';
  
  const overlay = new DomOverlay({
    table: ct,
    domContent: input,
    left: 150 * 1,
    top: 55 * 2 + ct.header.height,
    width: 150,
    height: 55
  });
  
  overlays.push(overlay);
  
  input.addEventListener('input', (e) => {
    console.log('✏️ 输入值：', (e.target as HTMLInputElement).value);
  });
  
  console.log('✅ 已添加输入框');
});

// 按钮 2: 添加下拉框
createButton('📝 添加下拉框 (第3行第3列)', '#52c41a', () => {
  const select = document.createElement('select');
  select.style.width = '100%';
  select.style.height = '100%';
  select.style.border = '2px solid #52c41a';
  select.style.padding = '8px';
  select.style.fontSize = '14px';
  select.style.boxSizing = 'border-box';
  
  ['选项 1', '选项 2', '选项 3', '选项 4', '选项 5'].forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
  
  const overlay = new DomOverlay({
    table: ct,
    domContent: select,
    left: 150 * 2,
    top: 55 * 3 + ct.header.height,
    width: 150,
    height: 55
  });
  
  overlays.push(overlay);
  
  select.addEventListener('change', (e) => {
    console.log('📝 选择值：', (e.target as HTMLSelectElement).value);
  });
  
  console.log('✅ 已添加下拉框');
});

(window as any).ct = ct;
(window as any).overlays = overlays;

