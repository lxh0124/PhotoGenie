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

export interface ProcessImageResult {
  success: boolean
  data?: string
  mimeType?: string
  error?: string
}

export interface PresetsResult {
  success: boolean
  presets?: Preset[]
  error?: string
}

export interface SettingsResult {
  success: boolean
  settings?: Settings
  error?: string
}

export interface FileResult {
  success: boolean
  filePath?: string
  canceled?: boolean
  error?: string
}

export interface SaveResult {
  success: boolean
  error?: string
}

export interface ElectronAPI {
  processImage: (filePath: string, options: ProcessImageOptions) => Promise<ProcessImageResult>
  getPresets: () => Promise<PresetsResult>
  getSettings: () => Promise<SettingsResult>
  saveSettings: (settings: Partial<Settings>) => Promise<SaveResult>
  selectFile: () => Promise<FileResult>
  saveFile: (defaultPath?: string) => Promise<FileResult>
  saveProcessedImage: (base64Data: string, filePath: string) => Promise<SaveResult>
  onFileOpened: (callback: (filePath: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
