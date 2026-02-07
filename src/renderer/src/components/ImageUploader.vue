<template>
  <div class="uploader">
    <div
      class="drop-zone"
      :class="{ 'drag-over': isDragging, 'has-image': currentImage }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="selectFile"
    >
      <div v-if="!currentImage" class="upload-prompt">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        <p>拖拽图片到此处或点击选择</p>
        <span class="hint">支持 JPG, PNG, BMP, WebP</span>
      </div>
      <div v-else class="image-preview">
        <img :src="currentImage" alt="Current image" />
        <button class="change-btn" @click.stop="selectFile">更换图片</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  imagePath?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  fileSelected: [filePath: string]
}>()

const isDragging = ref(false)
const currentImage = ref<string>('')

// Watch for external image path changes
watch(() => props.imagePath, async (newPath) => {
  if (newPath) {
    const result = await window.electronAPI.readFileAsBase64(newPath)
    if (result.success && result.data) {
      currentImage.value = result.data
    }
  }
}, { immediate: true })

async function selectFile() {
  const result = await window.electronAPI.selectFile()
  if (result.success && result.filePath) {
    const fileData = await window.electronAPI.readFileAsBase64(result.filePath)
    if (fileData.success && fileData.data) {
      currentImage.value = fileData.data
      emit('fileSelected', result.filePath)
    }
  }
}

async function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (/\.(jpg|jpeg|png|bmp|webp)$/i.test(file.name)) {
      const fileData = await window.electronAPI.readFileAsBase64(file.path)
      if (fileData.success && fileData.data) {
        currentImage.value = fileData.data
        emit('fileSelected', file.path)
      }
    }
  }
}
</script>

<style scoped>
.uploader {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover {
  border-color: #666;
  background: #f0f0f0;
}

.drop-zone.drag-over {
  border-color: #4CAF50;
  background: #e8f5e9;
}

.drop-zone.has-image {
  padding: 20px;
  border-style: solid;
}

.upload-prompt {
  color: #666;
}

.upload-prompt svg {
  margin: 0 auto 16px;
  color: #999;
}

.upload-prompt p {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.hint {
  font-size: 12px;
  color: #999;
}

.image-preview {
  position: relative;
  width: 100%;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
}

.change-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.change-btn:hover {
  background: #f5f5f5;
  border-color: #999;
}
</style>
