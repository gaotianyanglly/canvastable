import CanvasTable from "./CanvasTable";
import {BodyCell} from "../table/BodyCell";

/**
 * 选择区域信息
 */
export interface ISelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

/**
 * 单元格位置信息
 */
export interface ICellPosition {
  row: number;
  col: number;
}

/**
 * 单元格选择管理器
 * 负责处理单元格的选择、多选、复制和编辑状态管理
 */
export class SelectionManager {
  private table: CanvasTable;
  private selectedCells: BodyCell[] = [];
  private selectionRange: ISelectionRange | null = null;
  private isSelecting: boolean = false;
  private startCell: BodyCell | null = null;

  // 编辑状态管理
  private editedCells: Set<BodyCell> = new Set();

  // 悬停状态管理
  private hoveredCells: Set<BodyCell> = new Set();

  constructor(table: CanvasTable) {
    this.table = table;
    this.initKeyboardEvents();
  }

  /**
   * 初始化键盘事件监听
   */
  private initKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+C 或 Cmd+C (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        this.copySelection();
        e.preventDefault();
      }
    });
  }

  /**
   * 开始选择（鼠标按下）
   */
  startSelection(cell: BodyCell) {
    this.isSelecting = true;
    this.startCell = cell;
    // 先清除之前的选择状态（包括背景色）
    this.clearSelectionWithoutRender();
    // 选中新单元格
    this.selectCell(cell);
    // 触发重绘
    this.table.render();
  }

  /**
   * 更新选择（鼠标拖拽）
   */
  updateSelection(cell: BodyCell) {
    if (!this.isSelecting || !this.startCell) return;

    // 计算新的选择范围
    const startRow = Math.min(this.startCell.row.index, cell.row.index);
    const endRow = Math.max(this.startCell.row.index, cell.row.index);
    const startCol = Math.min(this.startCell.column.index, cell.column.index);
    const endCol = Math.max(this.startCell.column.index, cell.column.index);

    // 检查范围是否改变，避免不必要的重绘
    if (this.selectionRange &&
        this.selectionRange.startRow === startRow &&
        this.selectionRange.endRow === endRow &&
        this.selectionRange.startCol === startCol &&
        this.selectionRange.endCol === endCol) {
      return; // 范围没有改变，不需要重绘
    }

    // 清除之前的选择
    this.clearSelectionWithoutRender();

    this.selectionRange = { startRow, startCol, endRow, endCol };

    // 选中范围内的所有单元格
    for (let rowIdx = startRow; rowIdx <= endRow; rowIdx++) {
      const row = this.table.body.rows[rowIdx];
      if (!row) continue;

      for (let colIdx = startCol; colIdx <= endCol; colIdx++) {
        const cell = row.cells[colIdx];
        if (cell) {
          this.selectCell(cell);
        }
      }
    }

    this.table.render();
  }

  /**
   * 结束选择（鼠标释放）
   */
  endSelection() {
    this.isSelecting = false;
  }

  /**
   * 选中单个单元格（内部使用）
   */
  private selectCell(cell: BodyCell) {
    if (!this.selectedCells.includes(cell)) {
      this.selectedCells.push(cell);
      this.updateCellBackgroundColor(cell);
    }
  }

  /**
   * 选中单个单元格（公共方法）
   * 可以被外部调用，用于程序化选择单元格
   */
  selectSingleCell(cell: BodyCell) {
    // 清除之前的选择
    this.clearSelectionWithoutRender();

    // 选中新单元格
    this.selectedCells.push(cell);
    this.updateCellBackgroundColor(cell);

    // 设置选择范围为单个单元格
    this.selectionRange = {
      startRow: cell.row.index,
      startCol: cell.column.index,
      endRow: cell.row.index,
      endCol: cell.column.index
    };

    // 触发重绘
    this.table.render();
  }

  /**
   * 清除所有选择
   */
  clearSelection() {
    this.clearSelectionWithoutRender();
    this.table.render();
  }

  /**
   * 清除选择但不触发重绘（内部使用）
   *
   * 注意：此方法会保留悬停状态和编辑状态
   * - 悬停中的单元格会保持浅蓝色背景
   * - 已编辑的单元格会保持红色三角形标识
   */
  private clearSelectionWithoutRender() {
    // 先保存需要清除的单元格列表
    const cellsToReset = [...this.selectedCells];

    // 立即清空选中列表，确保 isCellSelected() 返回 false
    this.selectedCells = [];
    this.selectionRange = null;

    // 然后重置这些单元格的背景色
    // updateCellBackgroundColor 会自动检测悬停状态，所以不需要传递参数
    cellsToReset.forEach(cell => {
      this.updateCellBackgroundColor(cell);
    });
  }

  /**
   * 检查单元格是否被选中
   */
  isCellSelected(cell: BodyCell): boolean {
    return this.selectedCells.includes(cell);
  }

  /**
   * 更新单元格背景色
   * 优先级：选中状态 > 悬停状态 > 默认状态
   *
   * @param cell 要更新的单元格
   * @param isHovering 是否处于悬停状态（可选，如果不传则自动检测）
   */
  updateCellBackgroundColor(cell: BodyCell, isHovering?: boolean) {
    // 如果没有传递 isHovering 参数，则从 hoveredCells 中检测
    const actualIsHovering = isHovering !== undefined ? isHovering : this.hoveredCells.has(cell);

    if (this.isCellSelected(cell)) {
      // 选中状态：浅蓝色背景
      cell.style.backgroundColor = '#e6f7ff';
    } else if (actualIsHovering) {
      // 悬停状态：浅蓝色背景（与选中状态相同，保持一致性）
      cell.style.backgroundColor = '#e6f7ff';
    } else {
      // 默认状态：白色背景
      cell.style.backgroundColor = 'white';
    }

    // 更新悬停状态追踪
    if (isHovering !== undefined) {
      if (isHovering) {
        this.hoveredCells.add(cell);
      } else {
        this.hoveredCells.delete(cell);
      }
    }
  }

  /**
   * 复制选中的单元格数据到剪贴板
   * 格式：Excel 兼容（制表符分隔列，换行符分隔行）
   */
  async copySelection() {
    if (!this.selectionRange || this.selectedCells.length === 0) {
      console.log('没有选中的单元格');
      return;
    }

    const { startRow, startCol, endRow, endCol } = this.selectionRange;
    const rows: string[] = [];

    // 按行列顺序提取数据
    for (let rowIdx = startRow; rowIdx <= endRow; rowIdx++) {
      const row = this.table.body.rows[rowIdx];
      if (!row) continue;

      const rowData: string[] = [];
      for (let colIdx = startCol; colIdx <= endCol; colIdx++) {
        const cell = row.cells[colIdx];
        const cellText = cell ? String(cell.text || '') : '';
        rowData.push(cellText);
      }
      rows.push(rowData.join('\t')); // 使用制表符分隔列
    }

    const textToCopy = rows.join('\n'); // 使用换行符分隔行

    // 复制到剪贴板
    try {
      await navigator.clipboard.writeText(textToCopy);
      console.log('✅ 已复制到剪贴板:', textToCopy);
      console.log(`📋 复制了 ${endRow - startRow + 1} 行 × ${endCol - startCol + 1} 列`);
    } catch (err) {
      console.error('❌ 复制失败:', err);
      // 降级方案：使用旧的 execCommand
      this.fallbackCopy(textToCopy);
    }
  }

  /**
   * 降级复制方案（兼容旧浏览器）
   */
  private fallbackCopy(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      console.log('✅ 已复制到剪贴板（降级方案）');
    } catch (err) {
      console.error('❌ 降级复制也失败:', err);
    }
    document.body.removeChild(textarea);
  }

  /**
   * 获取当前选择的单元格
   */
  getSelectedCells(): BodyCell[] {
    return this.selectedCells;
  }

  /**
   * 获取选择范围
   */
  getSelectionRange(): ISelectionRange | null {
    return this.selectionRange;
  }

  /**
   * 是否正在选择
   */
  isCurrentlySelecting(): boolean {
    return this.isSelecting;
  }

  /**
   * 标记单元格为已编辑状态
   */
  markCellAsEdited(cell: BodyCell) {
    this.editedCells.add(cell);
    this.table.render();
  }

  /**
   * 取消单元格的编辑状态
   */
  unmarkCellAsEdited(cell: BodyCell) {
    this.editedCells.delete(cell);
    this.table.render();
  }

  /**
   * 检查单元格是否处于编辑状态
   */
  isCellEdited(cell: BodyCell): boolean {
    return this.editedCells.has(cell);
  }

  /**
   * 清除所有编辑状态
   */
  clearAllEditedStates() {
    this.editedCells.clear();
    this.table.render();
  }

  /**
   * 获取所有已编辑的单元格
   */
  getEditedCells(): BodyCell[] {
    return Array.from(this.editedCells);
  }

  /**
   * 检查单元格是否处于悬停状态
   */
  isCellHovered(cell: BodyCell): boolean {
    return this.hoveredCells.has(cell);
  }

  /**
   * 获取所有悬停的单元格
   */
  getHoveredCells(): BodyCell[] {
    return Array.from(this.hoveredCells);
  }
}

