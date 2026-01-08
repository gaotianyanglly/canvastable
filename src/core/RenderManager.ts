/**
 * 渲染管理器
 * 负责优化渲染性能，避免不必要的重绘
 */
export class RenderManager {
  private rafId: number | null = null;
  private isPending: boolean = false;
  private renderCallback: () => void;
  private lastRenderTime: number = 0;
  private minRenderInterval: number = 16; // 约60fps

  // 脏区域标记
  private dirtyRegions: Set<string> = new Set();
  private fullRenderNeeded: boolean = false;

  constructor(renderCallback: () => void) {
    this.renderCallback = renderCallback;
  }

  /**
   * 请求渲染
   * @param immediate 是否立即渲染，默认false（使用RAF）
   */
  requestRender(immediate: boolean = false): void {
    if (immediate) {
      this.performRender();
      return;
    }

    if (this.isPending) {
      return;
    }

    this.isPending = true;
    this.rafId = requestAnimationFrame(() => {
      this.performRender();
    });
  }

  /**
   * 执行渲染
   */
  private performRender(): void {
    const now = performance.now();
    
    // 节流：如果距离上次渲染时间太短，延迟到下一帧
    if (now - this.lastRenderTime < this.minRenderInterval) {
      this.rafId = requestAnimationFrame(() => {
        this.performRender();
      });
      return;
    }

    this.isPending = false;
    this.lastRenderTime = now;
    
    try {
      this.renderCallback();
    } catch (error) {
      console.error('Render error:', error);
    }
    
    // 清除脏区域标记
    this.dirtyRegions.clear();
    this.fullRenderNeeded = false;
  }

  /**
   * 标记脏区域
   */
  markDirty(region: string): void {
    this.dirtyRegions.add(region);
  }

  /**
   * 标记需要全量渲染
   */
  markFullRender(): void {
    this.fullRenderNeeded = true;
  }

  /**
   * 检查是否需要全量渲染
   */
  needsFullRender(): boolean {
    return this.fullRenderNeeded;
  }

  /**
   * 获取脏区域
   */
  getDirtyRegions(): Set<string> {
    return new Set(this.dirtyRegions);
  }

  /**
   * 取消待处理的渲染
   */
  cancelPending(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.isPending = false;
    }
  }

  /**
   * 设置最小渲染间隔
   */
  setMinRenderInterval(interval: number): void {
    this.minRenderInterval = Math.max(0, interval);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.cancelPending();
    this.dirtyRegions.clear();
  }
}

/**
 * 离屏Canvas管理器
 * 用于优化复杂内容的渲染
 */
export class OffscreenCanvasManager {
  private cache: Map<string, {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    timestamp: number;
  }> = new Map();

  private maxCacheSize: number = 50;
  private maxCacheAge: number = 60000; // 60秒

  /**
   * 获取或创建离屏Canvas
   */
  getCanvas(key: string, width: number, height: number): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  } {
    // 清理过期缓存
    this.cleanExpiredCache();

    let cached = this.cache.get(key);
    
    if (cached) {
      // 检查尺寸是否匹配
      if (cached.canvas.width === width && cached.canvas.height === height) {
        cached.timestamp = Date.now();
        return { canvas: cached.canvas, ctx: cached.ctx };
      } else {
        // 尺寸不匹配，删除旧的
        this.cache.delete(key);
      }
    }

    // 创建新的离屏Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const entry = { canvas, ctx, timestamp: Date.now() };
    this.cache.set(key, entry);

    // 如果缓存过大，删除最旧的
    if (this.cache.size > this.maxCacheSize) {
      this.removeOldest();
    }

    return { canvas, ctx };
  }

  /**
   * 清除指定缓存
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.maxCacheAge) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 删除最旧的缓存
   */
  private removeOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((value, key) => {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 设置最大缓存数量
   */
  setMaxCacheSize(size: number): void {
    this.maxCacheSize = Math.max(1, size);
  }

  /**
   * 设置最大缓存时间
   */
  setMaxCacheAge(age: number): void {
    this.maxCacheAge = Math.max(0, age);
  }
}

