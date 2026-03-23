<script setup>
import { ref } from 'vue'
import InputPage from './components/InputPage.vue'
import DeployPage from './components/DeployPage.vue'

const currentPage = ref('input') // 'input' or 'deploy'
const deployType = ref('morning') // 'morning' or 'evening'

function handleNavigate(page, type) {
  currentPage.value = page
  if (type) {
    deployType.value = type
  }
}
</script>

<template>
  <InputPage 
    v-if="currentPage === 'input'" 
    @navigate="handleNavigate" 
  />
  <DeployPage 
    v-else 
    :type="deployType" 
    @navigate="handleNavigate" 
  />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

button {
  font-family: inherit;
}

input {
  font-family: inherit;
}
</style>
