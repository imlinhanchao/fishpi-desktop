<template>
<div class="layout">
    <section class="content">
        <section class="chat-content" ref="chat-content" @mouseover="$refs['chat-content'].focus()" @mousewheel="chatScroll">
            <ScrollBar v-if="$refs.chatlist && $refs['chat-content']" class="chat-scroll" 
            :scroll="-chatScrollPos" :total="chatScrollTotal" @scrollTo="chatScrollPos = -$event"/>
            <section :style="{ bottom: `${chatScrollPos}px`}" class="chat-list" ref="chatlist" v-bind:key="1">
                <a class="chat-more" @click="loadMore">...</a>
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
        <MessageBox ref="msgbox" @clear="reload" :quote.sync="quote" :discussed.sync="discussed"/>
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
            await this.reload()
        },
        data () {
            return {
                chats: [],
                users: [],
                toBottom: false,
                mode: 'html',
                quote: null,
                discussed: null,
                chatScrollPos: 0,
                chatScrollTotal: 0,
            }    
        },
        watch: {
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
            firstMsg() {
                return this.chats.filter((item) => !item.redpacket && !item.whoGot).slice(-1)[0];
            }
        },
        methods: {
            async reload() {
                this.chats = [];
                await this.load(1);
                this.chatScrollTotal = this.$refs.chatlist.offsetHeight - this.$refs['chat-content'].offsetHeight;
            },
            async loadMore() {

            },
            async msgListener({ msg }) {

            },
            async load(page) {
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