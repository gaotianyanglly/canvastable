/** @jsx h */
import h from "../utils/h";
import CanvasTable from "../core/CanvasTable";
import '../style/style.scss';

// 创建页面布局
const pageContainer = document.createElement('div');
pageContainer.style.padding = '20px';
pageContainer.style.fontFamily = 'Arial, sans-serif';
document.body.appendChild(pageContainer);

// 创建标题
const title = document.createElement('h1');
title.textContent = '📊 Canvas Table - 单元格选择与复制演示';
title.style.color = '#1890ff';
title.style.marginBottom = '10px';
pageContainer.appendChild(title);

// 创建说明
const description = document.createElement('div');
description.innerHTML = `
  <div style="color: #666; margin-bottom: 20px;">
    <h3 style="margin-bottom: 10px;">📋 功能说明：</h3>
    <div style="margin-left: 20px;">
      <h4 style="margin: 10px 0;">选择功能：</h4>
      <ul style="margin: 5px 0;">
        <li>✅ <strong>单击</strong>：选中单个单元格</li>
        <li>✅ <strong>拖拽</strong>：选中多个单元格（矩形区域）</li>
        <li>✅ <strong>Ctrl+C</strong>：复制选中的单元格数据到剪贴板（Excel 兼容格式）</li>
        <li>✅ <strong>点击空白</strong>：清除选择</li>
        <li>✅ 选中的单元格会显示<span style="color: #1890ff;">蓝色边框</span>和<span style="background: #e6f7ff; padding: 2px 4px;">浅蓝色背景</span></li>
        <li>✅ <strong>鼠标悬停</strong>：整行高亮，但<strong>不会覆盖选中状态</strong></li>
      </ul>

      <h4 style="margin: 10px 0;">编辑状态标识：</h4>
      <ul style="margin: 5px 0;">
        <li>🔺 已编辑的单元格左上角显示<span style="color: #ff4d4f;">红色小三角形</span></li>
        <li>🔺 点击下方按钮可以标记/取消单元格的编辑状态</li>
      </ul>

      <h4 style="margin: 10px 0;">程序化操作：</h4>
      <ul style="margin: 5px 0;">
        <li>🎯 <strong>选中(2,3)</strong>：程序化选中第2行第3列的单元格</li>
        <li>✏️ <strong>编辑(2,3)</strong>：将第2行第3列的单元格标记为已编辑状态</li>
      </ul>
    </div>
  </div>
`;
pageContainer.appendChild(description);

// 创建表格容器
const wrapper = document.createElement('div');
wrapper.style.marginBottom = '30px';
pageContainer.appendChild(wrapper);

// 创建日志容器
const logContainer = document.createElement('div');
logContainer.style.marginTop = '20px';
logContainer.style.padding = '15px';
logContainer.style.backgroundColor = '#f5f5f5';
logContainer.style.borderRadius = '4px';
logContainer.style.maxHeight = '200px';
logContainer.style.overflow = 'auto';
logContainer.innerHTML = '<h3 style="margin-top: 0;">📋 操作日志</h3>';
pageContainer.appendChild(logContainer);

// 日志输出函数
function log(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const logEntry = document.createElement('div');
  logEntry.style.padding = '5px 0';
  logEntry.style.borderBottom = '1px solid #ddd';
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  const color = type === 'success' ? '#52c41a' : type === 'error' ? '#f5222d' : '#1890ff';
  
  logEntry.innerHTML = `<span style="color: ${color};">${icon} ${message}</span>`;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// 模拟列数据
function colMock() {
  let columns = [];
  for (let i = 0; i < 8; i++) {
    columns.push({
      dataIndex: `col${i + 1}`,
      title: `列 ${i + 1}`,
      width: 120
    });
  }
  return columns;
}

// 模拟行数据
function dataMock(len: number) {
  let data = [];
  for (let j = 0; j < len; j++) {
    let row: any = {};
    Array.from({ length: 8 }).forEach((col, i) => {
      // 生成更有意义的数据
      if (i === 0) {
        row[`col${i + 1}`] = `产品-${j + 1}`;
      } else if (i === 1) {
        row[`col${i + 1}`] = `分类-${(j % 5) + 1}`;
      } else {
        row[`col${i + 1}`] = Math.floor(Math.random() * 10000);
      }
    });
    data.push(row);
  }
  return data;
}

// 创建表格
const ct = new CanvasTable({
  container: wrapper,
  columns: colMock(),
  style: {
    width: 1000,
    height: 600,
    rowHeight: 50,
    headerRowHeight: 50
  }
});

// 设置数据源
ct.source = dataMock(15000);

// 创建控制按钮区域
const controlPanel = document.createElement('div');
controlPanel.style.cssText = 'margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 4px;';
controlPanel.innerHTML = `
  <h4 style="margin: 0 0 10px 0;">🎮 控制面板：</h4>
`;

// 标记为已编辑按钮
const markEditedBtn = document.createElement('button');
markEditedBtn.textContent = '🔺 标记选中单元格为已编辑';
markEditedBtn.style.cssText = 'margin-right: 10px; padding: 8px 16px; background: #ff4d4f; color: white; border: none; border-radius: 4px; cursor: pointer;';
markEditedBtn.onclick = () => {
  const selectedCells = ct.selectionManager.getSelectedCells();
  if (selectedCells.length === 0) {
    alert('请先选中单元格！');
    return;
  }
  selectedCells.forEach(cell => {
    ct.selectionManager.markCellAsEdited(cell);
  });
  console.log(`✅ 已标记 ${selectedCells.length} 个单元格为已编辑状态`);
};

// 取消编辑状态按钮
const unmarkEditedBtn = document.createElement('button');
unmarkEditedBtn.textContent = '❌ 取消选中单元格的编辑状态';
unmarkEditedBtn.style.cssText = 'margin-right: 10px; padding: 8px 16px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;';
unmarkEditedBtn.onclick = () => {
  const selectedCells = ct.selectionManager.getSelectedCells();
  if (selectedCells.length === 0) {
    alert('请先选中单元格！');
    return;
  }
  selectedCells.forEach(cell => {
    ct.selectionManager.unmarkCellAsEdited(cell);
  });
  console.log(`✅ 已取消 ${selectedCells.length} 个单元格的编辑状态`);
};

// 清除所有编辑状态按钮
const clearAllEditedBtn = document.createElement('button');
clearAllEditedBtn.textContent = '🧹 清除所有编辑状态';
clearAllEditedBtn.style.cssText = 'margin-right: 10px; padding: 8px 16px; background: #faad14; color: white; border: none; border-radius: 4px; cursor: pointer;';
clearAllEditedBtn.onclick = () => {
  ct.selectionManager.clearAllEditedStates();
  console.log('✅ 已清除所有编辑状态');
};

// 选中指定单元格按钮
const selectSpecificCellBtn = document.createElement('button');
selectSpecificCellBtn.textContent = '🎯 选中(2,3)';
selectSpecificCellBtn.style.cssText = 'margin-right: 10px; padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;';
selectSpecificCellBtn.onclick = () => {
  const row = ct.body.rows[1]; // 第2行（索引从0开始）
  if (row && row.cells[2]) { // 第3列
    ct.selectionManager.selectSingleCell(row.cells[2]);
    console.log('✅ 已程序化选中单元格 (2,3)');
  } else {
    alert('单元格不存在！');
  }
};

// 标记指定单元格为已编辑按钮
const markSpecificCellBtn = document.createElement('button');
markSpecificCellBtn.textContent = '✏️ 编辑(2,3)';
markSpecificCellBtn.style.cssText = 'margin-right: 10px; padding: 8px 16px; background: #722ed1; color: white; border: none; border-radius: 4px; cursor: pointer;';
markSpecificCellBtn.onclick = () => {
  const row = ct.body.rows[1]; // 第2行（索引从0开始）
  if (row && row.cells[2]) { // 第3列
    ct.selectionManager.markCellAsEdited(row.cells[2]);
    console.log('✅ 已标记单元格 (2,3) 为已编辑状态');
  } else {
    alert('单元格不存在！');
  }
};

controlPanel.appendChild(selectSpecificCellBtn);
controlPanel.appendChild(markSpecificCellBtn);
controlPanel.appendChild(markEditedBtn);
controlPanel.appendChild(unmarkEditedBtn);
controlPanel.appendChild(clearAllEditedBtn);
pageContainer.appendChild(controlPanel);

// 创建日志区域
const logArea = document.createElement('div');
logArea.style.cssText = 'margin-top: 20px; padding: 15px; background: #f9f9f9; border: 1px solid #d9d9d9; border-radius: 4px; max-height: 200px; overflow-y: auto;';
logArea.innerHTML = '<h4 style="margin: 0 0 10px 0;">📝 操作日志：</h4><div id="log-content" style="font-family: monospace; font-size: 12px;"></div>';
pageContainer.appendChild(logArea);

// 重写 console.log 以显示在页面上
const logContent = document.getElementById('log-content');
const originalLog = console.log;
console.log = function(...args) {
  originalLog.apply(console, args);
  const logEntry = document.createElement('div');
  logEntry.style.cssText = 'padding: 4px 0; border-bottom: 1px solid #eee;';
  logEntry.textContent = args.join(' ');
  logContent?.appendChild(logEntry);
  logContent?.scrollTo(0, logContent.scrollHeight);
};

// 监听选择管理器的事件（通过重写方法来添加日志）
const originalStartSelection = ct.selectionManager.startSelection.bind(ct.selectionManager);
ct.selectionManager.startSelection = function(cell) {
  log(`开始选择：行 ${cell.row.index + 1}, 列 ${cell.column.index + 1}`, 'info');
  originalStartSelection(cell);
};

const originalUpdateSelection = ct.selectionManager.updateSelection.bind(ct.selectionManager);
ct.selectionManager.updateSelection = function(cell) {
  originalUpdateSelection(cell);
  const range = ct.selectionManager.getSelectionRange();
  if (range) {
    const rows = range.endRow - range.startRow + 1;
    const cols = range.endCol - range.startCol + 1;
    log(`选择区域：${rows} 行 × ${cols} 列`, 'info');
  }
};

const originalEndSelection = ct.selectionManager.endSelection.bind(ct.selectionManager);
ct.selectionManager.endSelection = function() {
  const range = ct.selectionManager.getSelectionRange();
  if (range) {
    const rows = range.endRow - range.startRow + 1;
    const cols = range.endCol - range.startCol + 1;
    log(`完成选择：${rows} 行 × ${cols} 列`, 'success');
  }
  originalEndSelection();
};

const originalCopySelection = ct.selectionManager.copySelection.bind(ct.selectionManager);
ct.selectionManager.copySelection = async function() {
  const range = ct.selectionManager.getSelectionRange();
  if (range) {
    const rows = range.endRow - range.startRow + 1;
    const cols = range.endCol - range.startCol + 1;
    await originalCopySelection();
    log(`已复制 ${rows} 行 × ${cols} 列到剪贴板`, 'success');
  } else {
    log('没有选中的单元格', 'error');
  }
};

// 初始日志
log('Canvas Table 已加载，可以开始选择单元格', 'success');
log('提示：按住鼠标左键拖拽可以选择多个单元格', 'info');
log('提示：选中后按 Ctrl+C 可以复制数据', 'info');

console.log('✅ Canvas Table 选择与复制演示已启动');
console.log('📋 表格实例:', ct);
console.log('🎯 选择管理器:', ct.selectionManager);

