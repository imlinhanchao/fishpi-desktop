<style lang="less" scoped>
.layout {
    width: 100%;
    display: flex;
}
.sidebar {
    height: 100%;
    width: 3em;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
    <section id="home-sidebar" class="sidebar">
        <ul class="feature-list">
            <li class="feature-item user-card-click" :data-user="account.userName" :class="{ 'feature-active': $route.meta.name == 'account' }"><Avatar :src="account.userAvatarURL" /></li>
            <li class="feature-item" title="聊天室" :class="{ 'feature-active': $route.meta.name == 'chatroom' }" @click="$router.push('/chatroom')"><Icon custom="fa fa-comments" /></li>
            <li class="feature-item" title="私聊"
                :class="{ 'feature-active': $route.meta.name == 'chat' }" 
                @click="$router.push('/chat')">
                <Badge :offset="[5, -2]" :title="`${chats}条未读私信`" :count="chats" :dot="true"><Icon custom="fa fa-comment"/></Badge>
            </li>
            <li class="feature-item" title="清风明月" :class="{ 'feature-active': $route.meta.name == 'breezemoons' }" @click="$router.push('/breezemoons')"><Icon custom="fa fa-leaf" /></li>
        </ul>
        <ul class="feature-list">
            <li class="feature-item" :class="{ 'feature-active': $route.meta.name == 'setting' }" @click="$router.push('/setting')"><Icon custom="fa fa-cog" /></li>
        </ul>
    </section>
    <section class="content">
        <router-view ref="content"/>
    </section>
    <Modal
        v-model="broadcastShow"
        class-name="vertical-center-modal">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="ios-information-circle"></Icon>
            <span>摸鱼派社区紧急公告</span>
        </p>
        <section v-html="broadcast.text"></section>
        <section><p style="text-align:right">———— {{broadcast.publisher}}</p></section>
        <div slot="footer">
            <Button type="error" size="large" long @click="broadcastShow = false">已阅</Button>
        </div>
    </Modal>
</div>
</template>

<script>
  export default {
    name: 'home',
    components: {
    },
    async mounted () {
        let size = {
            width: localStorage.getItem('main.size.width') || 800,
            height: localStorage.getItem('main.size.height') || undefined
        }
        this.$ipc.send('main-event', { call: 'resize', args: size })
        window.addEventListener('resize', this.resizeListener);
        if (!this.$root.isLogin()) return;
        this.getUnread();
        this.$fishpi.chat.addListener(this.noticeListener)
        this.$fishpi.chatroom.addListener(this.msgListener);
        this.routerBroadcast.addEventListener("message", this.routerListener, false);
        if (this.$root.setting.value.global.autoReward){
            let points = await this.$fishpi.account.rewardLiveness();
            if (points > 0) {
                this.$Message.info({
                    content: `已领取昨日活跃度奖励 ${points} 积分`,
                    duration: 5,
                    closable: true
                })
            }
        }
        this.$root.notice.setCurrent(this.account);
    },
    beforeDestroy() {
        this.unLoad();
    },
    data () {
        return {
            chats: 0,
            broadcast: {
                text: '',
                publisher: ''
            },
            broadcastShow: false,
            routerBroadcast: new BroadcastChannel('main-router')
        }    
    },
    watch: {
        $route() {
            
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
        },
        unLoad() {
            this.$fishpi.chat.removeListener(this.noticeListener);
            this.$fishpi.chatroom.removeListener(this.msgListener);
            window.removeEventListener('resize', this.resizeListener);
            this.routerBroadcast.close();
        },
        async msgListener({ msg }) {
            this.$root.notice.chatroomMsg(msg);
        },
        noticeListener({msg})  {
            this.$root.notice.noticeMsg(msg);
            switch(msg.command) {
                case 'chatUnreadCountRefresh': this.chats = msg.count; break;
                case 'refreshNotification': break;
                case 'newIdleChatMessage': this.chats++; break;
                case 'warnBroadcast': this.broadcast = {
                        text: msg.warnBroadcastText,
                        publisher: msg.who
                    };
                    this.broadcastShow = true;
                    break;
            }
        },
        routerListener({ data }) {
            if (!data.url) return;
            if (data.logout) this.$root.logout();
            this.$router.push(data.url);
        },
        resizeListener() {
            if (this.$route.path == '/login') return;
            let size = {
                width: window.innerWidth,
                height: window.innerHeight,
            };
            localStorage.setItem('main.size.width', size.width)
            localStorage.setItem('main.size.height', size.height)
        }
    }
  }
</script>
