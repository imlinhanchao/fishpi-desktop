import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [{
            path: '/',
            name: 'home',
            component: require('@/view/index').default,
            children: [{
                    path: 'login',
                    meta: {
                        title: '登录',
                        name: 'login'
                    },
                    component: () => import('./view/login')
                }, {
                    path: 'chatroom',
                    meta: {
                        title: '聊天室',
                        name: 'chatroom'
                    },
                    component: () => import('./view/home')
                }
            ],
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})