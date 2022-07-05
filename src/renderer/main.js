import ipc from './ipc'
import Setting from './setting'

import Vue from 'vue'
import axios from 'axios'
import VueWorker from 'vue-worker'
import FishPi from 'fishpi';

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

Vue.prototype.$ipc = ipc;
Vue.prototype.$fishpi = new FishPi();

router.beforeEach((to, from, next) => {
  if(!to.meta.notitle && to.meta.title) {
    if(window.$VueApp) window.$VueApp.title = to.meta.title;
  }
  else {
    if(window.$VueApp) window.$VueApp.title = '';
  }
  next();
});

/* eslint-disable no-new */
window.$VueApp = new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
  mounted() {
    this.title = document.title;
    this.$fishpi.setToken(this.token);
  },
  data: {
    token: localStorage.getItem('token') || '',
    setting: new Setting(),
    title: '摸鱼派桌面客户端',
    liveness: 10,
  },
  methods: {
    async isLogin() {
      if(!this.token) return false;
      let info = await this.$fishpi.account.info();
      console.dir(info)
      return info.code == 0;
    }
  },
  watch: {
    title(val) {
      document.title = val;
    }
  }
}).$mount('#app')
