import { contextBridge, ipcRenderer } from 'electron'

export interface ProcessImageOptions {
  width: number
  height: number
  dpi?: number
  background?: {
    r: number
    g: number
    b: number
  }
  removeBackground?: boolean
  quality?: number
}

export interface Preset {
  id: string
  name: string
  width: number
  height: number
  dpi: number
  background: {
    r: number
    g: number
    b: number
  }
}

export interface Settings {
  qwenApiKey: string
  defaultQuality: number
  autoRemoveBackground: boolean
}

// 暴露安全的 IPC API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 处理图片
  processImage: (filePath: string, options: ProcessImageOptions) => 
    ipcRenderer.invoke('process-image', filePath, options),
  
  // 获取预设模板
  getPresets: () => 
    ipcRenderer.invoke('get-presets'),
  
  // 获取设置
  getSettings: () => 
    ipcRenderer.invoke('get-settings'),
  
  // 保存设置
  saveSettings: (settings: Partial<Settings>) => 
    ipcRenderer.invoke('save-settings', settings),
  
  // 选择文件
  selectFile: () => 
    ipcRenderer.invoke('select-file'),
  
  // 保存文件对话框
  saveFile: (defaultPath?: string) => 
    ipcRenderer.invoke('save-file', defaultPath),
  
  // 保存处理后的图片
  saveProcessedImage: (base64Data: string, filePath: string) => 
    ipcRenderer.invoke('save-processed-image', base64Data, filePath),
  
  // 监听文件打开事件（右键菜单或第二实例）
  onFileOpened: (callback: (filePath: string) => void) => {
    const subscription = (_event: any, filePath: string) => callback(filePath)
    ipcRenderer.on('file-opened', subscription)
    
    // 返回取消订阅函数
    return () => {
      ipcRenderer.removeListener('file-opened', subscription)
    }
  }
})
