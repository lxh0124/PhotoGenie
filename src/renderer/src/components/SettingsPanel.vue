<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>设置</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="apiKey">Qwen API Key</label>
          <input
            id="apiKey"
            v-model="localSettings.qwenApiKey"
            type="password"
            placeholder="输入你的 API Key"
          />
          <span class="hint">用于智能抠图功能</span>
        </div>
        <div class="form-group">
          <label for="quality">默认图片质量: {{ localSettings.defaultQuality }}</label>
          <input
            id="quality"
            v-model.number="localSettings.defaultQuality"
            type="range"
            min="0"
            max="100"
            step="1"
          />
          <div class="range-labels">
            <span>低</span>
            <span>高</span>
          </div>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="localSettings.autoRemoveBackground"
              type="checkbox"
            />
            <span>自动移除背景</span>
          </label>
          <span class="hint">处理图片时自动进行抠图</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="handleClose">取消</button>
        <button class="save-btn" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Settings {
  qwenApiKey: string
  defaultQuality: number
  autoRemoveBackground: boolean
}

interface Props {
  show: boolean
  settings?: Settings
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const localSettings = ref<Settings>({
  qwenApiKey: '',
  defaultQuality: 95,
  autoRemoveBackground: false
})

watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { ...newSettings }
  }
}, { immediate: true, deep: true })

function handleClose() {
  emit('close')
}

async function handleSave() {
  const result = await window.electronAPI.saveSettings({
    qwenApiKey: localSettings.value.qwenApiKey,
    defaultQuality: localSettings.value.defaultQuality,
    autoRemoveBackground: localSettings.value.autoRemoveBackground
  })
  if (result.success) {
    emit('saved')
    emit('close')
  } else {
    alert('保存失败: ' + result.error)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-group input[type="password"],
.form-group input[type="text"] {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input[type="password"]:focus,
.form-group input[type="text"]:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-group input[type="range"] {
  width: 100%;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.hint {
  font-size: 12px;
  color: #999;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn,
.save-btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
  border-color: #999;
}

.save-btn {
  background: #4CAF50;
  border: none;
  color: white;
}

.save-btn:hover {
  background: #45a049;
}
</style>
