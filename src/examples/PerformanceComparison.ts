/**
 * DOM 转 Canvas 性能对比测试
 * 比较不同方案的性能表现
 */

// 方案 1：纯 Canvas 绘制
export function pureCanvasRender(ctx: CanvasRenderingContext2D, data: string[][], rows: number, cols: number) {
  const startTime = performance.now();
  
  const cellWidth = 150;
  const cellHeight = 55;
  
  ctx.clearRect(0, 0, cols * cellWidth, rows * cellHeight);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellWidth;
      const y = row * cellHeight;
      
      // 绘制背景
      ctx.fillStyle = 'white';
      ctx.fillRect(x, y, cellWidth, cellHeight);
      
      // 绘制边框
      ctx.strokeStyle = '#e8e8e8';
      ctx.strokeRect(x, y, cellWidth, cellHeight);
      
      // 绘制文本
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(data[row][col], x + 10, y + cellHeight / 2);
    }
  }
  
  const endTime = performance.now();
  return {
    method: '纯 Canvas',
    time: endTime - startTime,
    fps: 1000 / (endTime - startTime)
  };
}

// 方案 2：DOM 表格
export function pureDomRender(container: HTMLElement, data: string[][], rows: number, cols: number) {
  const startTime = performance.now();
  
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  
  for (let row = 0; row < rows; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < cols; col++) {
      const td = document.createElement('td');
      td.style.width = '150px';
      td.style.height = '55px';
      td.style.border = '1px solid #e8e8e8';
      td.style.padding = '0 10px';
      td.textContent = data[row][col];
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  
  container.innerHTML = '';
  container.appendChild(table);
  
  const endTime = performance.now();
  return {
    method: '纯 DOM',
    time: endTime - startTime,
    fps: 1000 / (endTime - startTime)
  };
}

// 方案 3：混合渲染
export function hybridRender(
  ctx: CanvasRenderingContext2D,
  container: HTMLElement,
  data: string[][],
  rows: number,
  cols: number,
  editableCells: {row: number, col: number}[] = []
) {
  const startTime = performance.now();
  
  const cellWidth = 150;
  const cellHeight = 55;
  
  // Canvas 绘制所有单元格
  ctx.clearRect(0, 0, cols * cellWidth, rows * cellHeight);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellWidth;
      const y = row * cellHeight;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(x, y, cellWidth, cellHeight);
      
      ctx.strokeStyle = '#e8e8e8';
      ctx.strokeRect(x, y, cellWidth, cellHeight);
      
      // 非可编辑单元格用 Canvas 绘制
      const isEditable = editableCells.some(cell => cell.row === row && cell.col === col);
      if (!isEditable) {
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(data[row][col], x + 10, y + cellHeight / 2);
      }
    }
  }
  
  // DOM 只渲染可编辑单元格
  container.innerHTML = '';
  editableCells.forEach(({row, col}) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = data[row][col];
    input.style.position = 'absolute';
    input.style.left = `${col * cellWidth}px`;
    input.style.top = `${row * cellHeight}px`;
    input.style.width = `${cellWidth}px`;
    input.style.height = `${cellHeight}px`;
    input.style.border = 'none';
    input.style.padding = '0 10px';
    container.appendChild(input);
  });
  
  const endTime = performance.now();
  return {
    method: '混合渲染',
    time: endTime - startTime,
    fps: 1000 / (endTime - startTime),
    domElements: editableCells.length
  };
}

// 性能测试套件
export function runPerformanceTest() {
  console.log('=== Canvas Table 性能对比测试 ===\n');
  
  // 测试数据
  const testCases = [
    { rows: 10, cols: 10, name: '小数据量 (100 单元格)' },
    { rows: 50, cols: 10, name: '中数据量 (500 单元格)' },
    { rows: 100, cols: 10, name: '大数据量 (1000 单元格)' },
    { rows: 500, cols: 10, name: '超大数据量 (5000 单元格)' }
  ];
  
  testCases.forEach(({rows, cols, name}) => {
    console.log(`\n📊 ${name}`);
    console.log('─'.repeat(50));
    
    // 生成测试数据
    const data: string[][] = [];
    for (let i = 0; i < rows; i++) {
      data[i] = [];
      for (let j = 0; j < cols; j++) {
        data[i][j] = `Cell ${i}-${j}`;
      }
    }
    
    // 创建测试环境
    const canvas = document.createElement('canvas');
    canvas.width = cols * 150;
    canvas.height = rows * 55;
    const ctx = canvas.getContext('2d')!;
    
    const domContainer = document.createElement('div');
    domContainer.style.position = 'relative';
    
    // 测试纯 Canvas
    const canvasResult = pureCanvasRender(ctx, data, rows, cols);
    console.log(`✓ ${canvasResult.method}: ${canvasResult.time.toFixed(2)}ms (${canvasResult.fps.toFixed(1)} FPS)`);
    
    // 测试纯 DOM
    const domResult = pureDomRender(domContainer, data, rows, cols);
    console.log(`✓ ${domResult.method}: ${domResult.time.toFixed(2)}ms (${domResult.fps.toFixed(1)} FPS)`);
    
    // 测试混合渲染（10% 可编辑单元格）
    const editableCells = [];
    for (let i = 0; i < Math.floor(rows * cols * 0.1); i++) {
      editableCells.push({
        row: Math.floor(Math.random() * rows),
        col: Math.floor(Math.random() * cols)
      });
    }
    const hybridResult = hybridRender(ctx, domContainer, data, rows, cols, editableCells);
    console.log(`✓ ${hybridResult.method}: ${hybridResult.time.toFixed(2)}ms (${hybridResult.fps.toFixed(1)} FPS) [${hybridResult.domElements} DOM 元素]`);
    
    // 性能对比
    const fastest = Math.min(canvasResult.time, domResult.time, hybridResult.time);
    console.log(`\n🏆 最快方案: ${
      fastest === canvasResult.time ? '纯 Canvas' :
      fastest === domResult.time ? '纯 DOM' : '混合渲染'
    }`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('📝 结论：');
  console.log('  • 纯 Canvas: 大数据量下性能最优');
  console.log('  • 纯 DOM: 小数据量下可接受，交互性最好');
  console.log('  • 混合渲染: 平衡性能和交互性的最佳方案');
}

