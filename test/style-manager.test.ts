/**
 * StyleManager 单元测试
 */

import { StyleManager } from '../src/core/StyleManager';
import { DEFAULT_STYLE } from '../src/style/style';

describe('StyleManager', () => {
  let styleManager: StyleManager;

  beforeEach(() => {
    styleManager = new StyleManager();
  });

  describe('基础功能', () => {
    test('应该使用默认样式初始化', () => {
      const style = styleManager.getAll();
      expect(style.rowHeight).toBe(DEFAULT_STYLE.rowHeight);
      expect(style.fontSize).toBe(DEFAULT_STYLE.fontSize);
    });

    test('应该能够获取单个样式值', () => {
      const rowHeight = styleManager.get('rowHeight');
      expect(rowHeight).toBe(DEFAULT_STYLE.rowHeight);
    });

    test('应该能够设置单个样式值', () => {
      styleManager.set('rowHeight', 50);
      expect(styleManager.get('rowHeight')).toBe(50);
    });

    test('应该能够批量设置样式', () => {
      styleManager.setMultiple({
        rowHeight: 50,
        fontSize: '16px',
        textColor: '#333'
      });

      expect(styleManager.get('rowHeight')).toBe(50);
      expect(styleManager.get('fontSize')).toBe('16px');
      expect(styleManager.get('textColor')).toBe('#333');
    });
  });

  describe('样式变更通知', () => {
    test('设置样式应该触发变更回调', (done) => {
      styleManager.onChange((changedKeys) => {
        expect(changedKeys).toContain('rowHeight');
        done();
      });

      styleManager.set('rowHeight', 50);
    });

    test('批量设置样式应该触发一次回调', (done) => {
      let callCount = 0;

      styleManager.onChange((changedKeys) => {
        callCount++;
        expect(changedKeys).toContain('rowHeight');
        expect(changedKeys).toContain('fontSize');
        
        // 确保只调用一次
        setTimeout(() => {
          expect(callCount).toBe(1);
          done();
        }, 100);
      });

      styleManager.setMultiple({
        rowHeight: 50,
        fontSize: '16px'
      });
    });

    test('设置相同值不应该触发回调', () => {
      const callback = jest.fn();
      styleManager.onChange(callback);

      const currentValue = styleManager.get('rowHeight');
      styleManager.set('rowHeight', currentValue);

      expect(callback).not.toHaveBeenCalled();
    });

    test('应该能够取消监听', () => {
      const callback = jest.fn();
      const unsubscribe = styleManager.onChange(callback);

      unsubscribe();
      styleManager.set('rowHeight', 50);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('样式重置', () => {
    test('应该能够重置所有样式', () => {
      styleManager.setMultiple({
        rowHeight: 50,
        fontSize: '16px',
        textColor: '#333'
      });

      styleManager.reset();

      expect(styleManager.get('rowHeight')).toBe(DEFAULT_STYLE.rowHeight);
      expect(styleManager.get('fontSize')).toBe(DEFAULT_STYLE.fontSize);
      expect(styleManager.get('textColor')).toBe(DEFAULT_STYLE.textColor);
    });

    test('应该能够重置单个样式', () => {
      styleManager.set('rowHeight', 50);
      styleManager.resetKey('rowHeight');

      expect(styleManager.get('rowHeight')).toBe(DEFAULT_STYLE.rowHeight);
    });

    test('重置应该触发变更回调', (done) => {
      styleManager.set('rowHeight', 50);

      styleManager.onChange((changedKeys) => {
        expect(changedKeys).toContain('rowHeight');
        done();
      });

      styleManager.reset();
    });
  });

  describe('样式验证', () => {
    test('应该验证行高为正数', () => {
      expect(styleManager.validate('rowHeight', 50)).toBe(true);
      expect(styleManager.validate('rowHeight', 0)).toBe(false);
      expect(styleManager.validate('rowHeight', -10)).toBe(false);
    });

    test('应该验证字体大小格式', () => {
      expect(styleManager.validate('fontSize', '14px')).toBe(true);
      expect(styleManager.validate('fontSize', '16px')).toBe(true);
      expect(styleManager.validate('fontSize', '14')).toBe(false);
      expect(styleManager.validate('fontSize', 'large')).toBe(false);
    });

    test('应该验证颜色值', () => {
      expect(styleManager.validate('textColor', '#000000')).toBe(true);
      expect(styleManager.validate('textColor', 'red')).toBe(true);
      expect(styleManager.validate('textColor', '')).toBe(false);
    });

    test('setSafe 应该在验证失败时返回 false', () => {
      const result = styleManager.setSafe('rowHeight', -10);
      expect(result).toBe(false);
      expect(styleManager.get('rowHeight')).toBe(DEFAULT_STYLE.rowHeight);
    });

    test('setSafe 应该在验证成功时设置值', () => {
      const result = styleManager.setSafe('rowHeight', 50);
      expect(result).toBe(true);
      expect(styleManager.get('rowHeight')).toBe(50);
    });
  });
});

