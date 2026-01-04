/**
 * DOM 覆盖层演示页面
 * 在浏览器中查看 DOM 转 Canvas 的各种方案
 */

import CanvasTable from '../core/CanvasTable';
import DomOverlay from '../component/DomOverlay';
import { runPerformanceTest } from '../examples/PerformanceComparison';

// 生成测试数据
function generateData(rows: number, cols: number) {
  const data: any[] = [];
  for (let i = 0; i < rows; i++) {
    const row: any = {};
    for (let j = 0; j < cols; j++) {
      row[`col${j}`] = `Cell ${i}-${j}`;
    }
    data.push(row);
  }
  return data;
}

// 生成列配置
function generateColumns(cols: number) {
  const columns: any[] = [];
  for (let i = 0; i < cols; i++) {
    columns.push({
      title: `列 ${i}`,
      key: `col${i}`,
      width: 150
    });
  }
  return columns;
}

// 创建演示页面
function createDemoPage() {
  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  
  container.innerHTML = `
    <h1>Canvas Table - DOM 覆盖层演示</h1>
    
    <div style="margin-bottom: 30px;">
      <h2>📊 示例 1: 基础表格（纯 Canvas）</h2>
      <div id="demo1" style="margin-bottom: 20px;"></div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2>✏️ 示例 2: 可编辑单元格（混合渲染）</h2>
      <p style="color: #666;">点击下方按钮在表格中添加输入框</p>
      <button id="addInputBtn" style="padding: 8px 16px; margin-bottom: 10px; cursor: pointer; background: #1890ff; color: white; border: none; border-radius: 4px;">
        添加输入框到第 2 行第 2 列
      </button>
      <div id="demo2" style="margin-bottom: 20px;"></div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2>📝 示例 3: 下拉选择框</h2>
      <button id="addSelectBtn" style="padding: 8px 16px; margin-bottom: 10px; cursor: pointer; background: #52c41a; color: white; border: none; border-radius: 4px;">
        添加下拉框到第 3 行第 3 列
      </button>
      <div id="demo3" style="margin-bottom: 20px;"></div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2>📋 示例 4: 复杂表单</h2>
      <button id="addFormBtn" style="padding: 8px 16px; margin-bottom: 10px; cursor: pointer; background: #fa8c16; color: white; border: none; border-radius: 4px;">
        添加表单到第 4 行第 1 列
      </button>
      <div id="demo4" style="margin-bottom: 20px;"></div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2>⚡ 示例 5: 性能测试</h2>
      <button id="runPerfBtn" style="padding: 8px 16px; margin-bottom: 10px; cursor: pointer; background: #722ed1; color: white; border: none; border-radius: 4px;">
        运行性能测试（查看控制台）
      </button>
      <pre id="perfResult" style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; max-height: 400px;"></pre>
    </div>
  `;
  
  return container;
}

// 初始化演示
function initDemo() {
  const demoPage = createDemoPage();
  document.body.appendChild(demoPage);
  
  // 示例 1: 基础表格
  const table1 = new CanvasTable({
    container: document.getElementById('demo1')!,
    columns: generateColumns(5),
    style: {
      height: 300,
      width: 800
    }
  });
  table1.source = generateData(5, 5);
  
  // 示例 2: 可编辑单元格
  const table2 = new CanvasTable({
    container: document.getElementById('demo2')!,
    columns: generateColumns(5),
    style: {
      height: 300,
      width: 800
    }
  });
  table2.source = generateData(5, 5);
  
  document.getElementById('addInputBtn')!.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '请输入...';
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.border = '2px solid #1890ff';
    input.style.padding = '8px';
    input.style.fontSize = '14px';
    input.style.boxSizing = 'border-box';
    
    const overlay = new DomOverlay({
      domContent: input,
      style: {
        left: 150 * 1,
        top: 55 * 2,
        width: 150,
        height: 55
      }
    });
    
    // 手动设置 table 引用（因为 DomOverlay 需要访问 table）
    (overlay as any).table = table2;
    overlay.render();
    
    input.addEventListener('input', (e) => {
      console.log('输入值：', (e.target as HTMLInputElement).value);
    });
  });
  
  // 示例 3: 下拉选择框
  const table3 = new CanvasTable({
    container: document.getElementById('demo3')!,
    columns: generateColumns(5),
    style: {
      height: 300,
      width: 800
    }
  });
  table3.source = generateData(5, 5);
  
  document.getElementById('addSelectBtn')!.addEventListener('click', () => {
    const select = document.createElement('select');
    select.style.width = '100%';
    select.style.height = '100%';
    select.style.border = '2px solid #52c41a';
    select.style.padding = '8px';
    select.style.fontSize = '14px';
    select.style.boxSizing = 'border-box';
    
    ['选项 1', '选项 2', '选项 3', '选项 4'].forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      select.appendChild(opt);
    });
    
    const overlay = new DomOverlay({
      domContent: select,
      style: {
        left: 150 * 2,
        top: 55 * 3,
        width: 150,
        height: 55
      }
    });
    
    (overlay as any).table = table3;
    overlay.render();
  });
  
  // 示例 4: 复杂表单
  // ... 继续实现
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDemo);
} else {
  initDemo();
}

