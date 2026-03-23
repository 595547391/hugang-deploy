<script setup>
import { ref, computed, onMounted, nextTick, reactive } from 'vue'
import html2canvas from 'html2canvas'
import { useStorage } from './composables/useStorage'

const { data, getNames, setNames, updatePosition, getPosition } = useStorage()

// 当前部署类型
const currentType = ref('morning')

// 部署模式
const isDeployMode = ref(false)

// 提示文字
const showTip = ref(false)

// 闪烁的姓名集合
const flashingNames = ref(new Set())

// 部署区域引用
const deployArea = ref(null)

// 姓名标签引用
const nameRefs = reactive({})

function setNameRef(el, name) {
  if (el) {
    nameRefs[name] = el
  }
}

// 当前背景图片
const backgroundImage = computed(() => {
  return currentType.value === 'morning' ? '/morning-bg.png' : '/evening-bg.png'
})

// 当前标题
const currentTitle = computed(() => {
  return currentType.value === 'morning' ? '上午班' : '傍晚班'
})

// 当前人员名单
const currentNames = computed(() => {
  return getNames(currentType.value)
})

// 获取标签位置样式
function getLabelStyle(name) {
  const pos = getPosition(currentType.value, name)
  if (pos) {
    return {
      left: `${pos.x}px`,
      top: `${pos.y}px`
    }
  }
  // 默认位置
  const index = currentNames.value.indexOf(name)
  return {
    right: '20px',
    top: `${20 + index * 45}px`
  }
}

// 拖拽状态
const isDragging = ref(false)
const dragName = ref('')
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
  
  dragOffsetX.value = clientX - rect.left
  dragOffsetY.value = clientY - rect.top
  
  el.style.position = 'absolute'
  el.style.right = 'auto'
  
  if (event.type === 'mousedown') {
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', endDrag)
  }
}

// 拖拽中
function onDrag(event) {
  if (!isDragging.value) return
  
  const el = nameRefs[dragName.value]
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
function endDrag() {
  const el = nameRefs[dragName.value]
  if (el) {
    updatePosition(currentType.value, dragName.value, {
      x: parseInt(el.style.left) || 0,
      y: parseInt(el.style.top) || 0
    })
  }
  
  isDragging.value = false
  dragName.value = ''
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
}

// 进入部署模式
function startDeploy(type) {
  currentType.value = type
  isDeployMode.value = true
  showTip.value = true
  
  // 3秒后隐藏提示
  setTimeout(() => {
    showTip.value = false
  }, 3000)
  
  // 检查新添加的姓名
  nextTick(() => {
    currentNames.value.forEach(name => {
      if (!getPosition(currentType.value, name)) {
        startFlashing(name)
      }
    })
  })
}

// 返回主页
function goBack() {
  isDeployMode.value = false
}

// 切换部署类型
function switchType() {
  currentType.value = currentType.value === 'morning' ? 'evening' : 'morning'
  
  nextTick(() => {
    currentNames.value.forEach(name => {
      if (!getPosition(currentType.value, name)) {
        startFlashing(name)
      }
    })
  })
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
    link.download = `${currentTitle.value}部署图.png`
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
    if (count >= 10) {
      clearInterval(interval)
      flashingNames.value.delete(name)
    }
  }, 300)
}

// 处理输入框变化
function handleMorningInput(event) {
  const text = event.target.value
  const names = text.split('\n').map(n => n.trim()).filter(n => n)
  setNames('morning', names)
}

function handleEveningInput(event) {
  const text = event.target.value
  const names = text.split('\n').map(n => n.trim()).filter(n => n)
  setNames('evening', names)
}

// 获取文本内容
const morningText = computed(() => data.value.morningNames.join('\n'))
const eveningText = computed(() => data.value.eveningNames.join('\n'))
</script>

<template>
  <!-- 主页面 -->
  <div v-if="!isDeployMode" class="main-page">
    <!-- 标题区 -->
    <div class="header">
      <h1 class="main-title">护岗部署</h1>
      <p class="sub-title">输入人员名单安排具体岗位</p>
    </div>

    <!-- 双栏输入区 -->
    <div class="input-section">
      <!-- 左栏：上午班 -->
      <div class="input-column">
        <div class="column-header">上午班名单</div>
        <textarea
          class="name-textarea"
          :value="morningText"
          placeholder="输入或粘贴名字&#10;每行一个名字"
          @input="handleMorningInput"
        ></textarea>
      </div>

      <!-- 右栏：傍晚班 -->
      <div class="input-column">
        <div class="column-header">傍晚班名单</div>
        <textarea
          class="name-textarea"
          :value="eveningText"
          placeholder="输入或粘贴名字&#10;每行一个名字"
          @input="handleEveningInput"
        ></textarea>
      </div>
    </div>

    <!-- 双栏示意图区 -->
    <div class="preview-section">
      <!-- 左栏：早上示意图 -->
      <div class="preview-column">
        <div class="column-header">早上</div>
        <div class="preview-card">
          <div class="preview-image" style="background-image: url('/morning-bg.png')"></div>
          <button class="update-btn" @click="startDeploy('morning')">更新图片</button>
        </div>
      </div>

      <!-- 右栏：傍晚示意图 -->
      <div class="preview-column">
        <div class="column-header">傍晚</div>
        <div class="preview-card">
          <div class="preview-image" style="background-image: url('/evening-bg.png')"></div>
          <button class="update-btn" @click="startDeploy('evening')">更新图片</button>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="footer">
      <button class="start-btn" @click="startDeploy('morning')">开始护岗部署</button>
    </div>
  </div>

  <!-- 部署模式 -->
  <div v-else class="deploy-page">
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
        v-for="name in currentNames"
        :key="name"
        :ref="el => setNameRef(el, name)"
        class="name-label"
        :class="{ 'flashing': flashingNames.has(name) }"
        :style="getLabelStyle(name)"
        @touchstart.prevent="startDrag($event, name)"
        @touchmove.prevent="onDrag"
        @touchend="endDrag"
        @mousedown="startDrag($event, name)"
      >
        {{ name }}
      </div>
    </div>

    <!-- 底部按钮栏 -->
    <div class="bottom-bar">
      <button class="action-btn" @click="goBack">返回</button>
      <button class="action-btn primary" @click="saveImage">保存图片</button>
      <button class="action-btn" @click="switchType">
        {{ currentType === 'morning' ? '傍晚安排' : '上午安排' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 主页面样式 */
.main-page {
  min-height: 100vh;
  background: #FFFFFF;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  padding: 20px 0;
}

.main-title {
  font-size: 28px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
}

.sub-title {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

/* 双栏输入区 */
.input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.input-column {
  flex: 1;
}

.column-header {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
}

.name-textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: #F5F5F5;
  font-size: 14px;
  color: #333333;
  resize: none;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

.name-textarea::placeholder {
  color: #999999;
}

/* 双栏示意图区 */
.preview-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex: 1;
}

.preview-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-card {
  background: #F5F5F5;
  border-radius: 12px;
  padding: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-image {
  flex: 1;
  min-height: 150px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  background-color: #E0E0E0;
}

.update-btn {
  width: 100%;
  height: 36px;
  margin-top: 8px;
  border: none;
  border-radius: 8px;
  background: #E8E8E8;
  color: #2563EB;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* 底部按钮 */
.footer {
  padding: 16px 0;
}

.start-btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 25px;
  background: #4F46E5;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}

/* 部署页面样式 */
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
