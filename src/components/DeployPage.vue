<template>
  <div class="deploy-page">
    <!-- 提示文字 -->
    <transition name="fade">
      <div v-if="showTip" class="tip-text">
        拖动名字可自由移动位置
      </div>
    </transition>

    <!-- 部署区域 -->
    <div
      ref="deployArea"
      class="deploy-area"
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    >
      <div
        v-for="name in data.names"
        :key="name"
        :ref="el => setNameRef(el, name)"
        class="name-label"
        :class="{ 'flashing': flashingNames.has(name) }"
        :style="getLabelStyle(name)"
        @touchstart.prevent="startDrag($event, name)"
        @touchmove.prevent="onDrag($event, name)"
        @touchend="endDrag(name)"
        @mousedown="startDrag($event, name)"
      >
        {{ name }}
      </div>
    </div>

    <!-- 底部按钮栏 -->
    <div class="bottom-bar">
      <button class="action-btn" @click="goBack">上一步</button>
      <button class="action-btn primary" @click="saveImage">保存图片</button>
      <button class="action-btn" @click="switchType">
        {{ type === 'morning' ? '傍晚安排' : '上午安排' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, reactive } from 'vue'
import html2canvas from 'html2canvas'
import { useStorage } from '../composables/useStorage'

const props = defineProps({
  type: {
    type: String,
    default: 'morning' // 'morning' or 'evening'
  }
})

const emit = defineEmits(['navigate'])

const { data, updatePosition, getPosition } = useStorage()

// 背景图片
const backgroundImage = computed(() => {
  return props.type === 'morning' ? '/morning-bg.png' : '/evening-bg.png'
})

// 提示文字
const showTip = ref(true)

// 闪烁的姓名集合
const flashingNames = ref(new Set())

// 部署区域引用
const deployArea = ref(null)

// 姓名标签引用
const nameRefs = reactive({})

// 用于计算默认位置的计数器
let defaultPositionCounter = 0

function setNameRef(el, name) {
  if (el) {
    nameRefs[name] = el
  }
}

// 获取标签位置样式
function getLabelStyle(name) {
  const pos = getPosition(props.type, name)
  if (pos) {
    return {
      left: `${pos.x}px`,
      top: `${pos.y}px`
    }
  }
  // 默认位置：右上角，每个姓名依次向下排列
  const index = data.value.names.indexOf(name)
  return {
    right: '20px',
    top: `${20 + index * 45}px`
  }
}

// 拖拽状态
const isDragging = ref(false)
const dragName = ref('')
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)

// 开始拖拽
function startDrag(event, name) {
  if (event.type === 'mousedown' && event.button !== 0) return
  
  isDragging.value = true
  dragName.value = name
  
  const el = nameRefs[name]
  if (!el) return
  
  const rect = el.getBoundingClientRect()
  const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX
  const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY
  
  dragStartX.value = clientX
  dragStartY.value = clientY
  dragOffsetX.value = clientX - rect.left
  dragOffsetY.value = clientY - rect.top
  
  el.style.position = 'absolute'
  el.style.right = 'auto'
  
  // 添加全局事件监听
  if (event.type === 'mousedown') {
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', endDrag)
  }
}

// 拖拽中
function onDrag(event, name) {
  if (!isDragging.value || dragName.value !== name) return
  
  const el = nameRefs[name]
  if (!el || !deployArea.value) return
  
  const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX
  const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY
  
  const areaRect = deployArea.value.getBoundingClientRect()
  
  let x = clientX - areaRect.left - dragOffsetX.value
  let y = clientY - areaRect.top - dragOffsetY.value
  
  // 边界限制
  x = Math.max(0, Math.min(x, areaRect.width - 108))
  y = Math.max(0, Math.min(y, areaRect.height - 36))
  
  el.style.left = `${x}px`
  el.style.top = `${y}px`
}

// 结束拖拽
function endDrag(name) {
  if (dragName.value !== name) return
  
  const el = nameRefs[name]
  if (el) {
    updatePosition(props.type, name, {
      x: parseInt(el.style.left) || 0,
      y: parseInt(el.style.top) || 0
    })
  }
  
  isDragging.value = false
  dragName.value = ''
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
}

// 返回输入界面
function goBack() {
  emit('navigate', 'input')
}

// 切换部署类型
function switchType() {
  const newType = props.type === 'morning' ? 'evening' : 'morning'
  emit('navigate', 'deploy', newType)
}

// 保存图片
async function saveImage() {
  if (!deployArea.value) return
  
  try {
    const canvas = await html2canvas(deployArea.value, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    })
    
    const link = document.createElement('a')
    link.download = `${props.type === 'morning' ? '上午班' : '傍晚班'}部署图.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('保存图片失败:', error)
    alert('保存图片失败，请重试')
  }
}

// 闪烁动画
function startFlashing(name) {
  flashingNames.value.add(name)
  
  let count = 0
  const interval = setInterval(() => {
    count++
    if (count >= 10) { // 闪烁5次（每次显示+隐藏）
      clearInterval(interval)
      flashingNames.value.delete(name)
    }
  }, 300)
}

// 检查新添加的姓名
onMounted(() => {
  // 3秒后隐藏提示
  setTimeout(() => {
    showTip.value = false
  }, 3000)
  
  // 检查没有位置记录的姓名（新添加的）
  nextTick(() => {
    data.value.names.forEach(name => {
      if (!getPosition(props.type, name)) {
        startFlashing(name)
      }
    })
  })
})
</script>

<style scoped>
.deploy-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.tip-text {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.75);
  color: #FFFFFF;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  z-index: 100;
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.deploy-area {
  flex: 1;
  width: 100%;
  background-size: contain;
  background-position: top center;
  background-repeat: no-repeat;
  background-color: #e0e0e0;
  position: relative;
  overflow: hidden;
  min-height: calc(100vw * 2);
}

.name-label {
  position: absolute;
  width: 108px;
  height: 36px;
  background: rgba(135, 206, 250, 0.3);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563EB;
  font-size: 14px;
  font-weight: 600;
  cursor: move;
  touch-action: none;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.name-label.flashing {
  animation: flash 0.3s ease-in-out infinite;
}

@keyframes flash {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.bottom-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #FFFFFF;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn {
  flex: 1;
  height: 44px;
  border: 2px solid #4F46E5;
  background: #FFFFFF;
  color: #4F46E5;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:active {
  opacity: 0.8;
}

.action-btn.primary {
  background: #4F46E5;
  color: #FFFFFF;
}
</style>
