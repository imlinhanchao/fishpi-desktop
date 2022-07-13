<template>
<div class="layout">
    <section class="content">
        <section class="chat-list" ref="chatlist" v-bind:key="1">
            <a class="chat-more" @click="loadMore">...</a>
            <ChatroomItem v-for="item in chats" :item="item" :v-bind:key="itemKey(item)"></ChatroomItem>
        </section>
        <MessageBox @clear="reload"/>
    </section>
    <section class="sidebar">
        <p>当前在线({{onlines.length}})</p>
        <ul class="online-list">
            <li class="online-item" v-for="user in onlines">
                <Avatar :src="user.userAvatarURL48" /><span class="online-user">{{user.userName}}</span>
            </li>
        </ul>
    </section>
</div>
</template>

<script>
    import ChatroomItem from '../components/chatroom-item.vue';
    import MessageBox from '../components/messagebox.vue';
    export default {
        name: 'chatroom',
        components: {
            ChatroomItem, MessageBox
        },
        async mounted () {
            await this.reload()
            this.$fishpi.chatroom.addListener(this.msgListener);
            document.body.addEventListener('load', () => {
                if (this.toBottom) this.$refs.chatlist.scrollTop = this.$refs.chatlist.scrollHeight;
            }, false);
        },
        data () {
            return {
                chats: [],
                onlines: [],
                toBottom: false,
                mode: 'html'
            }    
        },
        watch: {
        },
        filters: {
        },
        computed: {
            isMarkdown() {
                return this.mode == 'md'
            }
        },
        methods: {
            async reload() {
                this.chats = [];
                await this.load(1);
                await this.load(2);
            },
            async loadMore() {
                let rsp = await this.$fishpi.chatroom.get({
                    oId: this.chats[0].oId,
                    mode: 1, size: 25, type: this.mode
                });
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.chats = this.mergeDoubleMsg(rsp.data).reverse().concat(this.chats);
            },
            async msgListener({ msg }) {
                console.dir(msg);
                switch(msg.type) {
                    case 'online':
                        this.onlines = msg.data;
                        break;
                    case 'redPacketStatus':
                        {
                            for (let i = 0; i < this.chats.length; i++) {
                                let c = this.chats[i];
                                if (c.oId != msg.data.oId || c.type == 'redPacketStatus') continue;
                                this.chats[i].content.got++;
                                this.chats[i].content.who.push({
                                    userName: msg.data.whoGot,
                                    avatar: (this.onlines.find(u => u.userName == msg.data.whoGot) || {
                                        userAvatarURL: msg.data.userAvatarURL20
                                    }).userAvatarURL
                                });
                                break;
                            }
                        }
                        break;
                    case 'msg':
                    case 'redPacket':
                        msg.dbUser = [];
                        this.toBottom = false;
                        let offset = this.$refs.chatlist.scrollHeight - this.$refs.chatlist.scrollTop;
                        let isBottom = offset < 500;
                        if (this.isMarkdown) msg.data.content = msg.data.md;
                        if (msg.type == 'msg' && msg.content == this.chats[this.chats.length - 1].content) {
                            this.chats[this.chats.length - 1].dbUser || (this.chats[this.chats.length - 1].dbUser = [])
                            this.chats[this.chats.length - 1].dbUser.push(msg.data)
                        }
                        else this.chats.push(msg.data);
                        console.log('offset:' + offset)
                        if(isBottom) {
                            this.toBottom = true;
                            this.$nextTick(() => this.$refs.chatlist.scrollTo(0, this.$refs.chatlist.scrollHeight));
                            if(msg.type == 'msg'){
                                (msg.data.content.match(/(?<=<img[^>]*?src=")([^"]*?)(?=")/g) || []).forEach(i => {
                                    let img = new Image();
                                    img.onload = () => {
                                        this.$refs.chatlist.scrollTop = this.$refs.chatlist.scrollHeight
                                    }
                                    img.src = i;
                                })
                            } 

                        }
                        break;
                    case 'revoke': {
                        for (let i = 0; i < this.chats.length; i++) {
                            let c = this.chats[i];
                            if (this.chats[i].dbUser) this.chats[i].dbUser = this.chats[i].dbUser.filter(d => d.oId != msg.oId)
                            if (c.oId != msg.data) continue;
                            if (this.chats[i].dbUser && this.chats[i].dbUser.length) {
                                let nextUser = this.chats[i].dbUser.shift();
                                if(this.chats[i].dbUser.length) nextUser.dbUser = this.chats[i].dbUser;
                                this.chats[i] = nextUser;
                            }
                            else this.chats.splice(i, 1);
                            break;
                        }
                        break;
                    }
                }
            },
            async load(page) {
                let rsp = await this.$fishpi.chatroom.more(page, this.mode);
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.chats = this.mergeDoubleMsg(rsp.data).reverse().concat(this.chats);
                this.$nextTick(() => this.$refs.chatlist.scrollTop = this.$refs.chatlist.scrollHeight);
            },
            mergeDoubleMsg(contents) {
                contents.forEach((c, i) => {
                    contents[i].dbUser = []
                    if (!contents[i - 1]) return;
                    if (c.content.msgType == 'redPacket') return;
                    if (c.content != contents[i - 1].content) return;
                    contents[i - 1].hide = true;
                    contents[i].dbUser = contents[i - 1].dbUser || [];
                    contents[i - 1].dbUser = undefined;
                    contents[i].dbUser.splice(0, 0, contents[i - 1])
                });
                return contents.filter(c => !c.hide);
            },
            itemKey(item) {
                return (item.content.msgType || 'msg') + '_' + item.oId + (item.whoGot || '');
            },
        }
    }
</script>
<style lang="less" scoped>
.layout {
    width: 100%;
    height: 100%;
    display: flex;
    background: var(--main-chatroom-background-color);
    .content {
        display: flex;
        height: 100%;
        width: 100%;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
        .chat-list {
            padding-left: .5em;
            padding-bottom: .5em;
            overflow: auto;
            height: 100%;
            .chat-more {
                display: block;
                cursor: pointer;
                text-align: center;
                user-select: none;
                &:hover {
                    color: var(--global-active-color);
                }
            }
        }

    }
    .sidebar {
        background-color: var(--main-chatroom-sidebar-background-color);
        width: 10em;
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        flex: initial;
        .online-list {
            list-style: none;
            padding: 0;
            overflow-x: hidden;
            overflow-y: auto;
            height: 100%;
            width: 100%;
            .online-item {
                display: flex;
                align-items: center;
                .ivu-avatar {
                    width: 1.2em;
                    height: 1.2em;
                    line-height: 1.2em;
                    margin-right: 0.3em;
                }
                .online-user {
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                }
            }
        }
    }
}
@media (max-width: 500px) {

.layout {
    .sidebar {
        display: none;
    }
}

}
</style>
