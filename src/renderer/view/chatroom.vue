<template>
<div class="layout">
    <section class="content">
        <section class="chat-list" ref="chatlist">
            <ChatroomItem v-for="item in chats" :item="item" :v-bind:key="itemKey(item)"></ChatroomItem>
        </section>
        <MessageBox />
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
            await this.load(1);
            await this.load(2);
            this.$fishpi.chatroom.addListener(this.msgListener);
        },
        data () {
            return {
                chats: [],
                onlines: [],
            }    
        },
        watch: {
        },
        filters: {
        },
        computed: {
        },
        methods: {
            async msgListener({ msg }) {
                console.dir(msg);
                switch(msg.type) {
                    case 'online':
                        this.onlines = msg.data;
                        break;
                    case 'msg':
                    case 'redPacket':
                        msg.dbUser = [];
                        if (msg.type == 'msg' && msg.content == this.chats[this.chats.length - 1].content) {
                            this.chats[this.chats.length - 1].dbUser || (this.chats[this.chats.length - 1].dbUser = [])
                            this.chats[this.chats.length - 1].dbUser.push(msg)
                        }
                        else this.chats.push(msg.data);
                        this.$nextTick(() => this.$refs.chatlist.scrollTop = this.$refs.chatlist.scrollHeight);
                        break;
                }
            },
            async load(page) {
                let rsp = await this.$fishpi.chatroom.more(page);
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
