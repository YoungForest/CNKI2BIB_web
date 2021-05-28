import Vue from 'vue';
import App from '@/app.vue';
import VueClipboard from 'vue-clipboard2'
import router from './router';
import store from './store';
 
Vue.use(VueClipboard)
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
