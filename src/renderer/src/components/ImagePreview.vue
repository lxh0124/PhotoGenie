<template>
  <div class="preview-container">
    <h3>预览</h3>
    <div v-if="!originalImage && !processedImage" class="empty-state">
      <p>选择图片和预设模板开始处理</p>
    </div>
    <div v-else class="preview-content">
      <div class="comparison">
        <div class="preview-item">
          <h4>原图</h4>
          <div class="image-wrapper">
            <img v-if="originalImage" :src="originalImage" alt="Original" />
          </div>
        </div>
        <div class="preview-item">
          <h4>处理后</h4>
          <div class="image-wrapper">
            <div v-if="isProcessing" class="loading">
              <div class="spinner"></div>
              <p>处理中...</p>
            </div>
            <img v-else-if="processedImage" :src="processedImage" alt="Processed" />
            <div v-else class="placeholder">等待处理</div>
          </div>
        </div>
      </div>
      <div v-if="processedImage && !isProcessing" class="actions">
        <button class="save-btn" @click="handleSave">保存图片</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  originalImage?: string
  processedImage?: string
  isProcessing?: boolean
}

const props = defineProps<Props>()

async function handleSave() {
  const result = await window.electronAPI.saveFile()
  if (result.success && result.filePath) {
    const base64Data = props.processedImage?.split(',')[1] || ''
    const saveResult = await window.electronAPI.saveProcessedImage(base64Data, result.filePath)
    if (saveResult.success) {
      alert('保存成功！')
    } else {
      alert('保存失败: ' + saveResult.error)
    }
  }
}
</script>

<style scoped>
.preview-container {
  width: 100%;
}

h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  border: 1px dashed #ddd;
  border-radius: 8px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.preview-item h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.image-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.loading {
  text-align: center;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.placeholder {
  color: #999;
  font-size: 14px;
}

.actions {
  display: flex;
  justify-content: center;
}

.save-btn {
  padding: 12px 32px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #45a049;
}

.save-btn:active {
  transform: scale(0.98);
}
</style>
