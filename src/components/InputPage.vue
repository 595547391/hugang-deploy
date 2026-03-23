<template>
  <div class="input-page">
    <h1 class="title">护岗部署应用</h1>
    
    <div class="input-section">
      <div class="input-row">
        <input
          v-model="inputName"
          type="text"
          placeholder="请输入姓名"
          class="name-input"
          @keyup.enter="handleAdd"
        />
        <button class="add-btn" @click="handleAdd">添加</button>
      </div>
    </div>

    <div class="names-list">
      <div v-if="data.names.length === 0" class="empty-tip">
        暂无人员，请添加
      </div>
      <div
        v-for="name in data.names"
        :key="name"
        class="name-tag"
      >
        <span class="name-text">{{ name }}</span>
        <button class="delete-btn" @click="handleRemove(name)">✕</button>
      </div>
    </div>

    <div class="action-section">
      <button class="clear-btn" @click="handleClear">清空</button>
      <button class="deploy-btn morning" @click="goToDeploy('morning')">
        上午安排
      </button>
      <button class="deploy-btn evening" @click="goToDeploy('evening')">
        傍晚安排
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStorage } from '../composables/useStorage'

const emit = defineEmits(['navigate'])

const { data, addName, removeName, clearNames } = useStorage()
const inputName = ref('')

function handleAdd() {
  const name = inputName.value.trim()
  if (name) {
    addName(name)
    inputName.value = ''
  }
}

function handleRemove(name) {
  removeName(name)
}

function handleClear() {
  if (confirm('确定要清空所有人员吗？')) {
    clearNames()
  }
}

function goToDeploy(type) {
  emit('navigate', 'deploy', type)
}
</script>

<style scoped>
.input-page {
  min-height: 100vh;
  padding: 24px 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
  margin-bottom: 32px;
}

.input-section {
  margin-bottom: 24px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.name-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.name-input:focus {
  border-color: #4F46E5;
}

.add-btn {
  height: 44px;
  padding: 0 24px;
  background: #4F46E5;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:active {
  background: #4338ca;
}

.names-list {
  min-height: 200px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-content: flex-start;
}

.empty-tip {
  width: 100%;
  text-align: center;
  color: #9ca3af;
  padding: 40px 0;
}

.name-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(135, 206, 250, 0.3);
  border-radius: 18px;
}

.name-text {
  color: #2563EB;
  font-size: 14px;
  font-weight: 600;
}

.delete-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(220, 38, 38, 0.2);
  color: #dc2626;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.clear-btn {
  height: 44px;
  background: #FFFFFF;
  color: #dc2626;
  border: 2px solid #dc2626;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.deploy-btn {
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.deploy-btn:active {
  opacity: 0.8;
}

.deploy-btn.morning {
  background: #fbbf24;
  color: #78350f;
}

.deploy-btn.evening {
  background: #f97316;
  color: #FFFFFF;
}
</style>
