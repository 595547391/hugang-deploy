<script setup>
import { ref } from 'vue'
import InputPage from './components/InputPage.vue'
import DeployPage from './components/DeployPage.vue'

const currentPage = ref('input')
const deployType = ref('morning')

function handleNavigate(page, type) {
  currentPage.value = page
  if (type) {
    deployType.value = type
  }
}
</script>

<template>
  <div id="app-container">
    <InputPage 
      v-if="currentPage === 'input'" 
      @navigate="handleNavigate" 
    />
    <DeployPage 
      v-else 
      :type="deployType" 
      @navigate="handleNavigate" 
    />
  </div>
</template>

<style>
#app-container {
  min-height: 100vh;
}
</style>
