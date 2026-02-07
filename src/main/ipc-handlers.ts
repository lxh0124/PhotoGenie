import { ipcMain, dialog } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import * as imageProcessor from '../services/image-processor';
import { createQwenService } from '../services/qwen-api';
import type Store from 'electron-store';

export interface ProcessImageOptions {
  width: number;
  height: number;
  dpi?: number;
  background?: {
    r: number;
    g: number;
    b: number;
  };
  removeBackground?: boolean;
  quality?: number;
}

export interface Preset {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  background: {
    r: number;
    g: number;
    b: number;
  };
}

const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'id-photo-1inch',
    name: '一寸证件照',
    width: 295,
    height: 413,
    dpi: 300,
    background: { r: 255, g: 255, b: 255 }
  },
  {
    id: 'id-photo-2inch',
    name: '二寸证件照',
    width: 413,
    height: 626,
    dpi: 300,
    background: { r: 255, g: 255, b: 255 }
  },
  {
    id: 'passport-photo',
    name: '护照照片',
    width: 390,
    height: 567,
    dpi: 300,
    background: { r: 255, g: 255, b: 255 }
  },
  {
    id: 'driver-license',
    name: '驾驶证照片',
    width: 260,
    height: 378,
    dpi: 300,
    background: { r: 255, g: 255, b: 255 }
  }
];

/**
 * 设置所有 IPC 处理器
 */
export function setupIpcHandlers(store: Store): void {
  // 处理图片
  ipcMain.handle('process-image', async (_event, filePath: string, options: ProcessImageOptions) => {
    try {
      console.log('Processing image:', filePath, options);
      
      // 读取原始图片
      const imageBuffer = await readFile(filePath);
      
      let processedBuffer = imageBuffer;
      
      // 如果需要移除背景
      if (options.removeBackground) {
        const apiKey = store.get('qwenApiKey') as string;
        if (!apiKey) {
          throw new Error('Qwen API Key not configured');
        }
        
        const qwenService = await createQwenService(apiKey);
        const segmentResult = await qwenService.segmentPerson(imageBuffer);
        
        if (!segmentResult.success || !segmentResult.maskData) {
          throw new Error(segmentResult.error || 'Failed to segment person');
        }
        
        // 替换背景
        processedBuffer = await imageProcessor.replaceBackground(
          imageBuffer,
          segmentResult.maskData,
          options.background || { r: 255, g: 255, b: 255 }
        );
      }
      
      // 调整尺寸
      processedBuffer = await imageProcessor.adjustImageSize(
        processedBuffer,
        options.width,
        options.height,
        options.background || { r: 255, g: 255, b: 255 }
      );
      
      // 设置 DPI
      if (options.dpi) {
        processedBuffer = await imageProcessor.setImageDPI(processedBuffer, options.dpi);
      }
      
      // 返回 base64 编码的图片
      return {
        success: true,
        data: processedBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      };
    } catch (error) {
      console.error('Image processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
  
  // 获取预设模板
  ipcMain.handle('get-presets', async () => {
    try {
      const customPresets = store.get('customPresets', []) as Preset[];
      return {
        success: true,
        presets: [...DEFAULT_PRESETS, ...customPresets]
      };
    } catch (error) {
      console.error('Get presets error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
  
  // 获取设置
  ipcMain.handle('get-settings', async () => {
    try {
      const qwenApiKey = store.get('qwenApiKey', '') as string;
      const defaultQuality = store.get('defaultQuality', 95) as number;
      const autoRemoveBackground = store.get('autoRemoveBackground', false) as boolean;
      
      return {
        success: true,
        settings: {
          qwenApiKey,
          defaultQuality,
          autoRemoveBackground
        }
      };
    } catch (error) {
      console.error('Get settings error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
  
  // 保存设置
  ipcMain.handle('save-settings', async (_event, settings: Record<string, any>) => {
    try {
      Object.entries(settings).forEach(([key, value]) => {
        store.set(key, value);
      });
      
      return { success: true };
    } catch (error) {
      console.error('Save settings error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
  
  // 选择文件
  ipcMain.handle('select-file', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          {
            name: 'Images',
            extensions: ['jpg', 'jpeg', 'png', 'bmp', 'webp']
          }
        ]
      });
      
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }
      
      return {
        success: true,
        filePath: result.filePaths[0]
      };
    } catch (error) {
      console.error('Select file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
  
  // 保存文件
  ipcMain.handle('save-file', async (_event, defaultPath?: string) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath,
        filters: [
          {
            name: 'JPEG Image',
            extensions: ['jpg', 'jpeg']
          },
          {
            name: 'PNG Image',
            extensions: ['png']
          }
        ]
      });
      
      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
      }
      
      return {
        success: true,
        filePath: result.filePath
      };
    } catch (error) {
      console.error('Save file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
  
  // 读取本地文件为 base64
  ipcMain.handle('read-file-as-base64', async (_event, filePath: string) => {
    try {
      const buffer = await readFile(filePath);
      const base64 = buffer.toString('base64');
      const ext = filePath.split('.').pop()?.toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      
      return {
        success: true,
        data: `data:${mimeType};base64,${base64}`
      };
    } catch (error) {
      console.error('Read file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}
