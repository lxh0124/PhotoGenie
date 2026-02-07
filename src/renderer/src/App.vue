<template>
  <div id="app">
    <header class="app-header">
      <h1>PhotoGenie</h1>
      <button class="settings-btn" @click="showSettings = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"/>
        </svg>
        设置
      </button>
    </header>

    <main class="app-main">
      <div class="left-panel">
        <section class="section">
          <ImageUploader
            :image-path="currentImagePath"
            @file-selected="handleFileSelected"
          />
        </section>

        <section class="section">
          <PresetSelector
            :presets="presets"
            :selected-preset-id="selectedPreset?.id"
            @preset-selected="handlePresetSelected"
          />
        </section>
      </div>

      <div class="right-panel">
        <ImagePreview
          :original-image="originalImageUrl"
          :processed-image="processedImageData"
          :is-processing="isProcessing"
        />
      </div>
    </main>

    <SettingsPanel
      :show="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @saved="loadSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ImageUploader from './components/ImageUploader.vue'
import PresetSelector from './components/PresetSelector.vue'
import ImagePreview from './components/ImagePreview.vue'
import SettingsPanel from './components/SettingsPanel.vue'

interface Preset {
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

interface Settings {
  qwenApiKey: string
  defaultQuality: number
  autoRemoveBackground: boolean
}

const currentImagePath = ref<string>('')
const originalImageUrl = ref<string>('')
const selectedPreset = ref<Preset | null>(null)
const processedImageData = ref<string>('')
const isProcessing = ref(false)
const showSettings = ref(false)
const presets = ref<Preset[]>([])
const settings = ref<Settings>({
  qwenApiKey: '',
  defaultQuality: 95,
  autoRemoveBackground: false
})

let unsubscribeFileOpened: (() => void) | null = null

onMounted(async () => {
  // Load presets
  const presetsResult = await window.electronAPI.getPresets()
  if (presetsResult.success) {
    presets.value = presetsResult.presets
  }

  // Load settings
  await loadSettings()

  // Listen for file opened events (right-click menu)
  unsubscribeFileOpened = window.electronAPI.onFileOpened((filePath: string) => {
    handleFileSelected(filePath)
  })
})

onUnmounted(() => {
  if (unsubscribeFileOpened) {
    unsubscribeFileOpened()
  }
})

async function loadSettings() {
  const result = await window.electronAPI.getSettings()
  if (result.success) {
    settings.value = result.settings
  }
}

async function handleFileSelected(filePath: string) {
  currentImagePath.value = filePath
  
  const fileData = await window.electronAPI.readFileAsBase64(filePath)
  if (fileData.success && fileData.data) {
    originalImageUrl.value = fileData.data
  }
  
  processedImageData.value = ''
  
  // Auto-process if preset is selected
  if (selectedPreset.value) {
    processImage()
  }
}

function handlePresetSelected(preset: Preset) {
  selectedPreset.value = preset
  
  // Auto-process if image is loaded
  if (currentImagePath.value) {
    processImage()
  }
}

async function processImage() {
  if (!currentImagePath.value || !selectedPreset.value) {
    return
  }

  isProcessing.value = true
  processedImageData.value = ''

  try {
    const result = await window.electronAPI.processImage(currentImagePath.value, {
      width: selectedPreset.value.width,
      height: selectedPreset.value.height,
      dpi: selectedPreset.value.dpi,
      background: {
        r: selectedPreset.value.background.r,
        g: selectedPreset.value.background.g,
        b: selectedPreset.value.background.b
      },
      removeBackground: settings.value.autoRemoveBackground,
      quality: settings.value.defaultQuality
    })

    if (result.success && result.data) {
      processedImageData.value = `data:${result.mimeType};base64,${result.data}`
    } else {
      alert('处理失败: ' + result.error)
    }
  } catch (error) {
    alert('处理失败: ' + (error as Error).message)
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
#app {
  font-family: system-ui, -apple-system, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.app-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: #f5f5f5;
  border-color: #999;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  overflow: auto;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
