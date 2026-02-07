# PhotoGenie - 智能证件照处理工具

Windows 桌面应用，支持智能抠图、背景替换、尺寸调整，适用于护照、签证、身份证等各类证件照场景。

## 功能特性

- 🎯 预设模板：护照、签证、身份证、学生证等常见规格
- 🤖 AI 抠图：阿里云 Qwen API 智能人像分割
- 🎨 背景替换：一键更换背景色（白底、蓝底、红底等）
- 📐 精确尺寸：像素级尺寸控制，DPI 设置
- 🖱️ 右键集成：图片文件右键菜单快速处理
- ⚡ 极简操作：拖拽上传，选择模板，自动处理

## 安装

### 开发环境要求

- Node.js 16+
- npm 或 yarn
- Windows 10/11

### 安装步骤

```bash
# 克隆项目
git clone <repository-url>
cd PhotoGenie

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 打包应用
npm run build
```

## 配置

### 1. 获取阿里云 Qwen API Key

1. 访问 [阿里云 DashScope](https://dashscope.aliyun.com/)
2. 注册/登录账号
3. 创建 API Key
4. 复制 API Key

### 2. 配置应用

启动应用后：

1. 点击右上角"设置"按钮
2. 粘贴 Qwen API Key
3. 设置默认图片质量（1-100）
4. 选择是否自动移除背景
5. 点击"保存"

## 使用方法

### 方式一：应用内上传

1. 启动应用
2. 拖拽图片到上传区域，或点击选择文件
3. 选择预设模板（如"中国护照"）
4. 自动处理完成后，点击"保存图片"

### 方式二：右键菜单（需管理员权限）

1. 右键点击图片文件
2. 选择"Process with PhotoGenie"
3. 应用自动打开并加载图片
4. 选择模板，保存结果

## 预设模板

| 模板名称 | 尺寸 (px) | DPI | 背景色 |
|---------|----------|-----|--------|
| 一寸证件照 | 295×413 | 300 | 白色 |
| 二寸证件照 | 413×626 | 300 | 白色 |
| 中国护照 | 354×472 | 300 | 白色 |
| 中国签证 | 354×472 | 300 | 白色 |
| 中国身份证 | 358×441 | 300 | 白色 |
| 学生证 | 260×378 | 300 | 蓝色 |
| 美国护照 | 600×600 | 300 | 白色 |
| 日本护照 | 354×472 | 300 | 白色 |

## 右键菜单注册

### 开发模式

开发模式下右键菜单注册会失败（需要管理员权限）。

### 生产模式

打包后的安装程序会自动注册右键菜单。手动注册：

```bash
# 以管理员身份运行 PowerShell
reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\image\shell\PhotoGenie" /ve /d "Process with PhotoGenie" /f
reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\image\shell\PhotoGenie" /v "Icon" /d "C:\path\to\PhotoGenie.exe" /f
reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\image\shell\PhotoGenie\command" /ve /d "\"C:\path\to\PhotoGenie.exe\" \"%1\"" /f
```

删除右键菜单：

```bash
reg delete "HKEY_CLASSES_ROOT\SystemFileAssociations\image\shell\PhotoGenie" /f
```

## 项目结构

```
PhotoGenie/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 应用入口
│   │   ├── ipc-handlers.ts # IPC 通信处理
│   │   └── registry.ts    # Windows 注册表操作
│   ├── preload/           # 预加载脚本
│   │   └── index.ts       # IPC API 暴露
│   ├── renderer/          # Vue 3 渲染进程
│   │   └── src/
│   │       ├── App.vue    # 主组件
│   │       └── components/ # UI 组件
│   ├── services/          # 业务逻辑
│   │   ├── qwen-api.ts    # Qwen API 调用
│   │   └── image-processor.ts # 图片处理
│   ├── templates/         # 场景模板
│   │   └── presets.json   # 预设配置
│   └── utils/             # 工具函数
│       └── storage.ts     # 数据存储
├── docs/                  # 文档
└── package.json
```

## 技术栈

- **框架**: Electron + Vue 3 + TypeScript
- **构建**: electron-vite
- **图片处理**: Sharp
- **AI 能力**: 阿里云 Qwen 视觉 API
- **数据存储**: electron-store

## 常见问题

### Q: API 调用失败？
A: 检查 API Key 是否正确配置，网络连接是否正常，API 额度是否充足。

### Q: 右键菜单不显示？
A: 需要管理员权限注册，或使用打包后的安装程序。

### Q: 图片处理失败？
A: 确保图片格式支持（JPG/PNG/BMP/WebP），文件未损坏，包含清晰人脸。

### Q: 处理速度慢？
A: AI 抠图需要调用云端 API，受网络影响。可关闭"自动移除背景"加快速度。

## 开发命令

```bash
# 开发模式（热重载）
npm run dev

# 类型检查
npm run typecheck

# 构建应用
npm run build

# 预览构建结果
npm run preview
```

## License

MIT
