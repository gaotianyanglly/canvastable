import {ICanvasTable} from "../typings/CanvasTable";
import {DEFAULT_STYLE} from "../style/style";

type ITableStyleProps = ICanvasTable.ITableStyleProps;
type StyleChangeCallback = (changedKeys: string[]) => void;

/**
 * 样式管理器
 * 负责管理表格的所有样式配置，支持动态修改和变更监听
 */
export class StyleManager {
  private style: ITableStyleProps;
  private changeCallbacks: Set<StyleChangeCallback> = new Set();
  private defaultStyle: ITableStyleProps;

  constructor(initialStyle?: Partial<ITableStyleProps>) {
    this.defaultStyle = {...DEFAULT_STYLE};
    this.style = {...DEFAULT_STYLE, ...initialStyle};
  }

  /**
   * 获取样式值
   */
  get<K extends keyof ITableStyleProps>(key: K): ITableStyleProps[K] {
    return this.style[key];
  }

  /**
   * 获取所有样式
   */
  getAll(): Readonly<ITableStyleProps> {
    return {...this.style};
  }

  /**
   * 设置单个样式
   */
  set<K extends keyof ITableStyleProps>(
    key: K,
    value: ITableStyleProps[K]
  ): void {
    if (this.style[key] !== value) {
      this.style[key] = value;
      this.notifyChange([key as string]);
    }
  }

  /**
   * 批量设置样式
   */
  setMultiple(styles: Partial<ITableStyleProps>): void {
    const changedKeys: string[] = [];

    (Object.keys(styles) as Array<keyof ITableStyleProps>).forEach((key) => {
      const newValue = styles[key];
      if (newValue !== undefined && this.style[key] !== newValue) {
        (this.style as any)[key] = newValue;
        changedKeys.push(key as string);
      }
    });

    if (changedKeys.length > 0) {
      this.notifyChange(changedKeys);
    }
  }

  /**
   * 重置为默认样式
   */
  reset(): void {
    const changedKeys = Object.keys(this.style).filter(
      (key) => this.style[key as keyof ITableStyleProps] !== 
               this.defaultStyle[key as keyof ITableStyleProps]
    );

    this.style = {...this.defaultStyle};

    if (changedKeys.length > 0) {
      this.notifyChange(changedKeys);
    }
  }

  /**
   * 重置单个样式为默认值
   */
  resetKey<K extends keyof ITableStyleProps>(key: K): void {
    const defaultValue = this.defaultStyle[key];
    if (this.style[key] !== defaultValue) {
      this.style[key] = defaultValue;
      this.notifyChange([key as string]);
    }
  }

  /**
   * 监听样式变更
   */
  onChange(callback: StyleChangeCallback): () => void {
    this.changeCallbacks.add(callback);
    
    // 返回取消监听的函数
    return () => {
      this.changeCallbacks.delete(callback);
    };
  }

  /**
   * 通知样式变更
   */
  private notifyChange(changedKeys: string[]): void {
    this.changeCallbacks.forEach((callback) => {
      callback(changedKeys);
    });
  }

  /**
   * 验证样式值
   */
  validate<K extends keyof ITableStyleProps>(
    key: K,
    value: ITableStyleProps[K]
  ): boolean {
    const keyStr = key as string;

    // 数字类型验证
    if (['rowHeight', 'columnWidth', 'headerRowHeight', 'padding'].includes(keyStr)) {
      return typeof value === 'number' && value > 0;
    }

    // 颜色类型验证
    if (['borderColor', 'textColor', 'headerBackColor', 'backgroundColor'].includes(keyStr)) {
      return typeof value === 'string' && value.length > 0;
    }

    // 字体大小验证
    if (keyStr === 'fontSize') {
      return typeof value === 'string' && /^\d+px$/.test(value as string);
    }

    // 字体名称验证
    if (keyStr === 'fontFamily') {
      return typeof value === 'string' && value.length > 0;
    }

    // 宽高验证
    if (['width', 'height'].includes(keyStr)) {
      return (typeof value === 'string' || typeof value === 'number') &&
             (value as any) !== '';
    }

    return true;
  }

  /**
   * 安全设置样式（带验证）
   */
  setSafe<K extends keyof ITableStyleProps>(
    key: K,
    value: ITableStyleProps[K]
  ): boolean {
    if (this.validate(key, value)) {
      this.set(key, value);
      return true;
    }
    console.warn(`Invalid style value for ${key}:`, value);
    return false;
  }
}

