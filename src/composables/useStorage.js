import { ref, watch } from 'vue'

const STORAGE_KEY = 'guard-deploy-data'

// 默认数据结构
const defaultData = {
  names: [],
  morningPositions: {},
  eveningPositions: {}
}

// 从 localStorage 加载数据
function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  }
  return { ...defaultData }
}

// 保存数据到 localStorage
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

export function useStorage() {
  const data = ref(loadData())

  // 监听数据变化，自动保存
  watch(data, (newData) => {
    saveData(newData)
  }, { deep: true })

  // 添加人员
  function addName(name) {
    if (name && !data.value.names.includes(name)) {
      data.value.names.push(name)
    }
  }

  // 删除人员
  function removeName(name) {
    const index = data.value.names.indexOf(name)
    if (index > -1) {
      data.value.names.splice(index, 1)
      // 同时删除位置信息
      delete data.value.morningPositions[name]
      delete data.value.eveningPositions[name]
    }
  }

  // 清空所有人员
  function clearNames() {
    data.value.names = []
    data.value.morningPositions = {}
    data.value.eveningPositions = {}
  }

  // 更新位置
  function updatePosition(type, name, position) {
    if (type === 'morning') {
      data.value.morningPositions[name] = position
    } else {
      data.value.eveningPositions[name] = position
    }
  }

  // 获取位置
  function getPosition(type, name) {
    if (type === 'morning') {
      return data.value.morningPositions[name] || null
    }
    return data.value.eveningPositions[name] || null
  }

  return {
    data,
    addName,
    removeName,
    clearNames,
    updatePosition,
    getPosition
  }
}
