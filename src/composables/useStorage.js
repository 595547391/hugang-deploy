import { ref, watch, computed } from 'vue'

const STORAGE_KEY = 'guard-deploy-data'

// 默认数据结构
const defaultData = {
  morningNames: [],
  eveningNames: [],
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
  return { ...defaultData, morningNames: [], eveningNames: [], morningPositions: {}, eveningPositions: {} }
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

  // 获取指定班次的人员名单
  function getNames(type) {
    return type === 'morning' ? data.value.morningNames : data.value.eveningNames
  }

  // 设置指定班次的人员名单
  function setNames(type, names) {
    if (type === 'morning') {
      data.value.morningNames = names
    } else {
      data.value.eveningNames = names
    }
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
    getNames,
    setNames,
    updatePosition,
    getPosition
  }
}
