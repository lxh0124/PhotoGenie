<template>
  <div class="preset-selector">
    <h3>选择预设模板</h3>
    <div class="preset-grid">
      <div
        v-for="preset in presets"
        :key="preset.id"
        class="preset-card"
        :class="{ selected: preset.id === selectedPresetId }"
        @click="selectPreset(preset)"
      >
        <div class="preset-header">
          <h4>{{ preset.name }}</h4>
          <div
            class="color-preview"
            :style="{
              backgroundColor: `rgb(${preset.background.r}, ${preset.background.g}, ${preset.background.b})`
            }"
          ></div>
        </div>
        <div class="preset-info">
          <div class="info-row">
            <span class="label">尺寸:</span>
            <span class="value">{{ preset.width }} × {{ preset.height }}px</span>
          </div>
          <div class="info-row">
            <span class="label">DPI:</span>
            <span class="value">{{ preset.dpi }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

interface Props {
  presets: Preset[]
  selectedPresetId?: string
}

defineProps<Props>()

const emit = defineEmits<{
  presetSelected: [preset: Preset]
}>()

function selectPreset(preset: Preset) {
  emit('presetSelected', preset)
}
</script>

<style scoped>
.preset-selector {
  width: 100%;
}

h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.preset-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.preset-card:hover {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preset-card.selected {
  border-color: #4CAF50;
  background: #f1f8f4;
  box-shadow: 0 2px 12px rgba(76, 175, 80, 0.2);
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preset-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.preset-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}
</style>
