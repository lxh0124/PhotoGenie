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

export interface ElectronAPI {
  processImage: (filePath: string, options: ProcessImageOptions) => Promise<{
    success: boolean
    data?: string
    mimeType?: string
    error?: string
  }>
  getPresets: () => Promise<{
    success: boolean
    presets: Preset[]
    error?: string
  }>
  getSettings: () => Promise<{
    success: boolean
    settings: Settings
    error?: string
  }>
  saveSettings: (settings: Partial<Settings>) => Promise<{
    success: boolean
    error?: string
  }>
  selectFile: () => Promise<{
    success: boolean
    filePath?: string
    canceled?: boolean
    error?: string
  }>
  saveFile: (defaultPath?: string) => Promise<{
    success: boolean
    filePath?: string
    canceled?: boolean
    error?: string
  }>
  saveProcessedImage: (base64Data: string, filePath: string) => Promise<{
    success: boolean
    error?: string
  }>
  onFileOpened: (callback: (filePath: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
