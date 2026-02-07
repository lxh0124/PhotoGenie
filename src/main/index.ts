import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { setupIpcHandlers } from './ipc-handlers'
import { addContextMenu, isContextMenuRegistered } from './registry'

let mainWindow: BrowserWindow | null = null
let initialFilePath: string | null = null

// 初始化 electron-store
const store = new Store()

// 解析命令行参数获取文件路径
function getFilePathFromArgs(argv: string[]): string | null {
  // 开发模式: electron . file.jpg
  // 生产模式: app.exe file.jpg
  // 右键菜单: app.exe "C:\path\to\file.jpg"
  
  const args = argv.slice(process.defaultApp ? 2 : 1)
  
  for (const arg of args) {
    // 跳过 Electron/Chromium 参数
    if (arg.startsWith('--')) continue
    
    // 检查是否是图片文件
    if (/\.(jpg|jpeg|png|bmp|webp)$/i.test(arg)) {
      return arg
    }
  }
  
  return null
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  
  // 窗口加载完成后发送初始文件路径
  mainWindow.webContents.on('did-finish-load', () => {
    if (initialFilePath && mainWindow) {
      mainWindow.webContents.send('file-opened', initialFilePath)
      initialFilePath = null
    }
  })
}

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  // 处理第二个实例
  app.on('second-instance', (_event, commandLine, _workingDirectory) => {
    // 聚焦现有窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
      
      // 获取新的文件路径并发送给渲染进程
      const filePath = getFilePathFromArgs(commandLine)
      if (filePath) {
        mainWindow.webContents.send('file-opened', filePath)
      }
    }
  })

  app.whenReady().then(async () => {
    // 设置 IPC 处理器
    setupIpcHandlers(store)
    
    // 首次启动时注册右键菜单（仅 Windows，需要管理员权限）
    if (process.platform === 'win32' && !app.isPackaged) {
      const isRegistered = await isContextMenuRegistered()
      if (!isRegistered) {
        await addContextMenu()
        console.log('Context menu registration attempted')
      }
    }
    
    // 获取初始文件路径
    initialFilePath = getFilePathFromArgs(process.argv)
    
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
