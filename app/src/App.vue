<script setup>
import { ref, computed } from 'vue'
import Home from './views/products/products.vue'
import About from './views/about.vue'

const routes = {
  '/': Home,
  '/about': About
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || NotFound
})
</script>

<template>
  <div id="app">
    <div id="navbar">
      <a href="#/">Home</a>
      <a href="#/about">About</a>
    </div>
    <div id="main-content">
      <component :is="currentView" />
    </div>
  </div>
</template>

<style>
#app {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0%;
}

#navbar {
  min-width: 150px;
  border-right: 1px solid #ccc;
  padding: 1em;
  flex-direction: column;
}

#main-content {
  flex-grow: 1;
  padding: 1em;
}
</style>