import { app } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const APP_NAME = 'PhotoGenie';
const REGISTRY_PATH = 'HKEY_CLASSES_ROOT\\SystemFileAssociations\\image\\shell\\PhotoGenie';

/**
 * 添加右键菜单到 Windows 注册表
 */
export async function addContextMenu(): Promise<void> {
  if (process.platform !== 'win32') {
    console.log('Context menu registration is only supported on Windows');
    return;
  }

  try {
    const exePath = app.getPath('exe');
    
    // 创建主菜单项 (使用英文避免编码问题)
    await execAsync(`reg add "${REGISTRY_PATH}" /ve /d "Process with ${APP_NAME}" /f`);
    
    // 设置图标（可选）
    await execAsync(`reg add "${REGISTRY_PATH}" /v "Icon" /d "${exePath}" /f`);
    
    // 创建命令
    await execAsync(`reg add "${REGISTRY_PATH}\\command" /ve /d "\\"${exePath}\\" \\"%1\\"" /f`);
    
    console.log('Context menu registered successfully');
  } catch (error) {
    console.error('Failed to register context menu:', error);
    // 不抛出错误，允许应用继续运行
  }
}

/**
 * 从 Windows 注册表删除右键菜单
 */
export async function removeContextMenu(): Promise<void> {
  if (process.platform !== 'win32') {
    console.log('Context menu removal is only supported on Windows');
    return;
  }

  try {
    await execAsync(`reg delete "${REGISTRY_PATH}" /f`);
    console.log('Context menu removed successfully');
  } catch (error) {
    console.error('Failed to remove context menu:', error);
    throw error;
  }
}

/**
 * 检查右键菜单是否已注册
 */
export async function isContextMenuRegistered(): Promise<boolean> {
  if (process.platform !== 'win32') {
    return false;
  }

  try {
    await execAsync(`reg query "${REGISTRY_PATH}"`);
    return true;
  } catch {
    return false;
  }
}
