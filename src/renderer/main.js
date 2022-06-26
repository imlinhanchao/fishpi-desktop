import ipc from './ipc'
import Setting from './setting'
import fs from 'fs';
import path from 'path';

import Vue from 'vue'
import axios from 'axios'
import VueWorker from 'vue-worker'

import App from './App'
import router from './router'
import store from './store'

import iView from 'view-design'
import 'view-design/dist/styles/iview.css'
import './theme/theme.css'
import './theme/index.css'
import './theme/font-awesome.css'
import './theme/highlight.css'

Vue.use(iView)
Vue.use(VueWorker)
Vue.locale = () => {};

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.config.devtools = true;
Vue.$ipc = ipc;

router.beforeEach((to, from, next) => {
  console.dir(to);
  if(!to.meta.notitle) document.title = '摸鱼派 - ' + to.meta.title;
  next();
});

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
  mounted() {
  },
  data: {
    token: localStorage.getItem('token') || '',
    setting: new Setting(),
    ipc,
  },
  methods: {
  },
  computed: {
    title() {
        return document.title;
    },
    isLogin() {
      return !!this.token
    }
  },
  watch: {
  }
}).$mount('#app')
