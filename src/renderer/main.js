import { Menu, MenuItem, getCurrentWindow } from '@electron/remote';

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
Vue.locale = () => { };

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.config.devtools = true;

Vue.prototype.$ipc = ipc;

Object.defineProperty(Vue.prototype, "$fishpi", {
    get () {
        if(!this.$root.fishpi) this.$root.fishpi = new FishPi(this.$root.token);
        return this.$root.fishpi;
    }
});

router.beforeEach((to, from, next) => {
    if (!to.meta.notitle && to.meta.title) {
        if (window.$VueApp) window.$VueApp.title = to.meta.title;
    }
    else {
        if (window.$VueApp) window.$VueApp.title = '';
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
        this.$store.commit('fishpi/setToken', localStorage.getItem('token'));

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (!e.target.dataset.menu) return;
            const menu = Menu.buildFromTemplate(this.defaultMenu);
            menu.popup({ window: getCurrentWindow() })
        }, false)
    },
    data: {
        token: localStorage.getItem('token') || '',
        setting: new Setting(),
        title: '摸鱼派桌面客户端',
        liveness: 10,
        fishpi: null,
        defaultMenu: [{
            label: '复制',
            role: 'copy',
            accelerator: 'CmdOrCtrl+C',
        },{
            label: '粘贴',
            role: 'paste',
            accelerator: 'CmdOrCtrl+V',
        }],
    },
    methods: {
        isLogin() {
            return this.$store.getters['fishpi/isLogin'];
        },
        async logout() {
            await this.$store.dispatch('fishpi/logout');
            this.$router.push('/login');
            this.token = ''
            this.fishpi = null
        },
        getElementPosition(element) {
            let actualLeft = element.offsetLeft;
            let current = element.offsetParent;
                
            while (current !== null){
                actualLeft += current.offsetLeft;
                current = current.offsetParent;
            }
                
                
            let actualTop = element.offsetTop;
            current = element.offsetParent;
                
            while (current !== null){
                actualTop += current.offsetTop;
                current = current.offsetParent;
            }
            
            return {
                x: actualLeft,
                y: actualTop,
            }
        }
    },
    watch: {
        title(val) {
            document.title = val;
        }
    }
}).$mount('#app')
