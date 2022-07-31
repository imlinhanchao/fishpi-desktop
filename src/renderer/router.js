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
                    }, {
                        path: 'chat',
                        meta: {
                            title: '私聊',
                            name: 'chat'
                        },
                        component: () => import('./view/chats'),
                        children: [{
                            path: ':user',
                            meta: {
                                title: '私聊',
                                name: 'chat'
                            },
                            component: () => import('./view/chat')
                        }]
                    }
                ],
                }
            ],
        },
        {
            path: '/autocomplete',
            name: 'autocomplete',
            component: () => import('./view/autocomplete'),
            meta: {
                name: 'autocomplete'
            }
        },
        {
            path: '/card/:user',
            name: 'card',
            component: () => import('./view/card'),
            meta: {
                name: 'card'
            }
        },
        {
            path: '/redpacket/:id',
            name: 'redpacket',
            component: () => import('./view/redpacket'),
            meta: {
                name: 'redpacket'
            }
        },
        {
            path: '/img/:imgpath',
            name: 'image',
            component: () => import('./view/img'),
            meta: {
                name: 'image-view'
            }
        },
        {
            path: '/redpacket/send/:user',
            name: 'redpacket',
            component: () => import('./view/redpacket'),
            meta: {
                name: 'redpacket'
            }
        },
        {
            path: '/redpacket/:id/:gesture',
            name: 'redpacket',
            component: () => import('./view/redpacket'),
            meta: {
                name: 'redpacket'
            }
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})