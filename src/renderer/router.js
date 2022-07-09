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
                    path: '',
                    meta: {
                        title: '首页',
                        name: 'home'
                    },
                    component: () => import('./view/home'),
                    children: [{
                        path: 'chatroom',
                        meta: {
                            title: '聊天室',
                            name: 'chatroom'
                        },
                        component: () => import('./view/chatroom')
                    }
                ],
                }
            ],
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})