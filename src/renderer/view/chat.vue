<template>
<div class="layout chat-layout" @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'chat', instance: this}))">
    <section class="content">
        <section class="chat-content" ref="chat-content" @mouseover="$refs['chat-content'].focus()" @mousewheel="chatScroll">
            <ScrollBar v-if="$refs.chatlist && $refs['chat-content']" class="chat-scroll" 
            :scroll="-chatScrollPos" :total="chatScrollTotal" @scrollTo="chatScrollPos = -$event"/>
            <section :style="{ bottom: `${chatScrollPos}px`}" class="chat-list" ref="chatlist" v-bind:key="1">
                <a class="chat-more" @click="loadMore" v-if="chats.length >= 25">...</a>
                <ChatItem 
                    :ref="'msg-item-' + item.oId" 
                    v-for="item in chats" 
                    :item="item" 
                    :v-bind:key="item.oId"
                    @msg="appendMsg"
                    @face="appendFace"
                    @quote="quoteMsg"
                ></ChatItem>
            </section>
        </section>
        <MessageBox :chatroom="false" ref="msgbox" @clear="reload" :quote.sync="quote" @send="send"/>
    </section>
</div>
</template>

<script>
    import ChatItem from '../components/chat-item.vue';
    import MessageBox from '../components/messagebox.vue';
    import ScrollBar from '../components/scrollbar.vue';
    export default {
        name: 'chat',
        components: {
            ChatItem, MessageBox, ScrollBar,
        },
        async mounted () {
            this.user = this.$route.params.user;
        },
        beforeDestroy() {
            this.unLoad();
        },
        data () {
            return {
                chats: [],
                toBottom: false,
                mode: 'html',
                quote: null,
                chatScrollPos: 0,
                chatScrollTotal: 0,
                user: '',
                page: 1,
            }    
        },
        watch: {
            $route() {
                this.user = this.$route.params.user;
            },
            user (newUser, oldUser) {
                this.$fishpi.chat.removeListener(oldUser, this.msgListener)
                this.reload()
            }
        },
        filters: {
        },
        computed: {
            isMarkdown() {
                return this.mode == 'md'
            },
            current() {
                return this.$root.current;
            },
        },
        methods: {
            async reload() {
                this.$root.title = this.user;
                let data = await this.$fishpi.user(this.user);
                this.$root.title = data.userNickname || data.userName;
                this.$fishpi.chat.addListener(this.msgListener, this.user)
                this.chats = [];
                await this.load(1);
                this.chatScrollTotal = this.$refs.chatlist.offsetHeight - this.$refs['chat-content'].offsetHeight;
            },
            unLoad() {
                this.$fishpi.chat.removeListener(this.user, this.msgListener)
            },
            async loadMore() {
                await this.load(this.page + 1);
            },
            async msgListener({ msg }) {
                if (msg.type == 'revoke') {
                    this.chats = this.chats.filter(item => item.oId != msg.data);
                    return;
                }
                console.dir(msg);
                this.chats.push(msg);
                this.$fishpi.chat.markRead(this.user);
            },
            async load(page) {
                let rsp = await this.$fishpi.chat.get({ user: this.user, page });
                if (rsp.result != 0) {
                    if (rsp.msg != '没有更多消息了') this.$Message.error(rsp.msg);
                    return;
                }
                this.chats = rsp.data.reverse().concat(this.chats);
                this.page = page;
            },
            appendMsg(msg) {
                this.$refs.msgbox.appendMsg({ regexp: null, data: msg });
            },
            appendFace(url) {
                try {
                    this.$fishpi.emoji.append(url);
                    this.$Message.info('添加成功');
                } catch (error) {
                    this.$Message.error(error.msg);
                }
            },
            quoteMsg(msg) {
                this.quote = msg;
            },
            chatScroll(ev) {
                if (ev.deltaY + this.chatScrollPos >= 0) {
                    this.chatScrollPos = 0;
                    return;
                }
                if (ev.deltaY + this.chatScrollPos <= this.$refs['chat-content'].offsetHeight - this.$refs.chatlist.offsetHeight) {
                    this.chatScrollPos = this.$refs['chat-content'].offsetHeight - this.$refs.chatlist.offsetHeight;
                    this.loadMore();
                    return;
                }
                this.chatScrollPos += ev.deltaY;
            },
            async send(msg, callback) {
                try {
                    await this.$fishpi.chat.send(this.user, msg);
                    callback();
                } catch (error) {
                    callback(error.message)
                }
            }
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
        position: relative;
        .chat-scroll {
            z-index: 2;
        }
        .chat-content {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            justify-content: flex-end;
            overflow: hidden;
            .chat-list {
                padding: .5em;
                padding-top: 0;
                overflow: auto;
                position:absolute;
                bottom: 0;
                width: 100%;
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