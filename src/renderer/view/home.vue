<style lang="less" scoped>
.layout {
    width: 100%;
    display: flex;
}
.sidebar {
    height: 100%;
    width: 3em;
    .feature-list {
        list-style: none;
        padding: 0;
        .feature-item {
            padding: 0 .5em;
            display: flex;
            justify-content: center;
            padding-bottom: 1em;
            cursor: pointer;
            i {
                font-size: 1.2em;
            }
            i:hover {
                text-shadow: 0 0 5px var(--global-active-color);
            }
            &.feature-active {
                color: var(--global-active-color);
            }
        }
    }
}
.content {
    width: calc(100vw - 3em);
    height: 100%;
}
</style>

<template>
<div class="layout">
    <section class="sidebar">
        <ul class="feature-list">
            <li class="feature-item" :class="{ 'feature-active': $route.meta.name == 'account' }" @click="toAccount"><Avatar :src="account.userAvatarURL" /></li>
            <li class="feature-item" :class="{ 'feature-active': $route.meta.name == 'chatroom' }" @click="$router.push('/chatroom')"><Icon custom="fa fa-comments" /></li>
            <li class="feature-item" 
                :class="{ 'feature-active': $route.meta.name == 'chat' }" 
                @click="$router.push('/chat')">
                <Badge :offset="[5, -2]" :title="`${chats}条未读私信`" :count="chats" :dot="true"><Icon custom="fa fa-comment"/></Badge>
            </li>
        </ul>
    </section>
    <section class="content">
        <router-view ref="content"/>
    </section>
</div>
</template>

<script>
  export default {
    name: 'home',
    components: {
    },
    mounted () {
        let size = {
            width: localStorage.getItem('main.size.width') || 800,
            height: localStorage.getItem('main.size.height') || undefined
        }
        this.$ipc.send('main-event', { call: 'resize', args: size })
        window.addEventListener('resize', () => {
            let size = {
                width: window.innerWidth,
                height: window.innerHeight,
            };
            localStorage.setItem('main.size.width', size.width)
            localStorage.setItem('main.size.height', size.height)
        });
        this.getUnread();
        this.$fishpi.chat.addListener(({msg}) => {
            switch(msg.command) {
                case 'chatUnreadCountRefresh': this.chats = msg.count; break;
                case 'refreshNotification': break;
                case 'newIdleChatMessage': this.chats++; break;
                case 'warnBroadcast': this.broadcast = {
                        text: msg.warnBroadcastText,
                        publisher: msg.who
                    };
                    break;
            }
        })
    },
    data () {
        return {
            chats: 0,
            broadcast: {
                text: '',
                publisher: ''
            }
        }    
    },
    watch: {
        $route() {
            this.$refs.content && this.$refs.content.unLoad && this.$refs.content.unLoad()
        }
    },
    filters: {
    },
    computed: {
        account() {
            return this.$root.current || {}
        }
    },
    methods: {
        async toAccount() {
            console.dir(await this.$fishpi.account.info())
        },
        async getUnread() {
            let rsp = await this.$fishpi.chat.unread();
            this.chats = rsp.data.length;
        }
    }
  }
</script>
