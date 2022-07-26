<template>
<div class="layout">
    <section class="content">
        <section class="chat-content" ref="chat-content" @mouseover="$refs['chat-content'].focus()" @mousewheel="chatScroll">
            <ScrollBar v-if="$refs.chatlist && $refs['chat-content']" class="chat-scroll" 
            :scroll="-chatScrollPos" :total="chatScrollTotal" @scrollTo="chatScrollPos = -$event"/>
            <section :style="{ bottom: `${chatScrollPos}px`}" class="chat-list" ref="chatlist" v-bind:key="1">
                <a class="chat-more" @click="loadMore">...</a>
                <ChatroomItem 
                    :ref="'msg-item-' + item.oId" 
                    v-for="item in chats" 
                    :item="item" 
                    :v-bind:key="itemKey(item)"
                    :plusone="item.dbUser
                    && item.dbUser.length > 0 
                    && item.oId == firstMsg.oId"
                    @msg="appendMsg"
                    @face="appendFace"
                    @quote="quoteMsg"
                ></ChatroomItem>
            </section>
        </section>
        <section class="discusse" v-if="discusse">
            <a href="javascript:void(0)" @dblclick.stop="sendDiscusse" @click="discussed = discusse">#{{discusse}}#</a> 
            <a href="javascript:void(0)" @click="modalDiscusse = true"><Icon custom="fa fa-pencil-square-o" /></a>
            <Modal
                v-model="modalDiscusse"
                title="编辑话题"
                @on-ok="editDiscusse">
                <p>修改话题需要16积分，将自动从账户中扣除；最大长度16字符，不合法字符将被自动过滤。</p>
                <Input v-model="newDiscusse" placeholder="话题" />
            </Modal>
        </section>
        <MessageBox ref="msgbox" @clear="reload" :quote.sync="quote" :discussed.sync="discussed"/>
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
    import ScrollBar from '../components/scrollbar.vue';
    export default {
        name: 'chatroom',
        components: {
            ChatroomItem, MessageBox, ScrollBar,
        },
        async mounted () {
            await this.reload()
            this.$fishpi.chatroom.removeListener(this.msgListener);
            this.$fishpi.chatroom.addListener(this.msgListener);
            document.body.addEventListener('load', () => {
                if (this.toBottom) this.$refs.chatlist.scrollTop = this.$refs.chatlist.scrollHeight;
            }, false);
            document.body.addEventListener('click', (ev) => {
                if (ev.target.className == 'discuss-msg') this.discussed = ev.target.dataset.discuss;
            }, false)
        },
        data () {
            return {
                chats: [],
                onlines: [],
                toBottom: false,
                mode: 'html',
                quote: null,
                discussed: null,
                newDiscusse: '',
                discusse: '',
                modalDiscusse: false,
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
                await this.load(2);
                this.chatScrollTotal = this.$refs.chatlist.offsetHeight - this.$refs['chat-content'].offsetHeight;
            },
            async loadMore() {
                let oId = this.chats[0].oId;
                let rsp = await this.$fishpi.chatroom.get({
                    oId,
                    mode: 1, size: 25, type: this.mode
                });
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.chats = this.mergeDoubleMsg(rsp.data.slice(0, rsp.data.length - 1)).reverse().concat(this.chats);
                this.$nextTick(() => {
                    console.log(this.$refs[`msg-item-${oId}`][0].$el.offsetHeight)
                    this.$refs.chatlist.scrollTo(0, this.$refs[`msg-item-${oId}`][0].$el.offsetHeight);
                    this.chatScrollTotal = this.$refs.chatlist.offsetHeight - this.$refs['chat-content'].offsetHeight;
                });
            },
            async msgListener({ msg }) {
                console.dir(msg);
                switch(msg.type) {
                    case 'online':
                        this.onlines = msg.data;
                        this.discusse = this.$fishpi.chatroom.discusse;
                        break;
                    case "discussChanged":
                        this.discusse = msg.data;
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
                        let ContentHeight = this.$refs.chatlist.offsetHeight;
                        let offset = -this.chatScrollPos;
                        let isBottom = offset < 500 || msg.data.userName == this.current.userName;
                        if (this.isMarkdown) msg.data.content = msg.data.md;
                        if (msg.type == 'msg' && msg.data.content == this.chats[this.chats.length - 1].content) {
                            this.chats[this.chats.length - 1].dbUser || (this.chats[this.chats.length - 1].dbUser = [])
                            this.chats[this.chats.length - 1].dbUser.push(msg.data)
                        }
                        else this.chats.push(msg.data);
                        console.log('offset:' + offset)
                        if(isBottom) {
                            this.toBottom = true;
                            this.chatScrollPos = 0;
                        }
                        else {
                            this.$nextTick(() => this.chatScrollPos += ContentHeight - this.$refs.chatlist.offsetHeight);
                            if(msg.type == 'msg'){
                                (msg.data.content.match(/(?<=<img[^>]*?src=")([^"]*?)(?=")/g) || []).forEach(i => {
                                    let img = new Image();
                                    img.onload = () => {
                                        this.chatScrollPos += ContentHeight - this.$refs.chatlist.offsetHeight
                                    }
                                    img.src = i;
                                })
                            } 
                        }
                        break;
                    case 'revoke': {
                        for (let i = 0; i < this.chats.length; i++) {
                            let c = this.chats[i];
                            if (this.chats[i].dbUser) this.chats[i].dbUser = this.chats[i].dbUser.filter(d => d.oId != msg.data)
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
                this.$nextTick(() => {
                    this.chatScrollTotal = this.$refs.chatlist.offsetHeight - this.$refs['chat-content'].offsetHeight;
                });
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
            appendMsg(msg) {
                this.$refs.msgbox.appendMsg({ regexp: null, data: msg});
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
            editDiscusse() {
                if (!this.newDiscusse) return;
                if (this.newDiscusse.length > 16) {
                    this.$Message.error('话题长度太长');
                    return;
                }
                this.$fishpi.chatroom.send(`[setdiscuss]${this.newDiscusse}[/setdiscuss]`)
            },
            sendDiscusse() {
                this.$fishpi.chatroom.send(`*\`# ${this.discusse} #\`*`)
                this.discussed = null;
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
    .discusse {
        text-align: center;
        font-size: 70%;
        margin: auto;
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
<style lang="less">
em.discuss-msg {
    cursor: pointer;
    padding: 2px 5px;
    &:hover {
        background: #57a3f3;
        border-radius: 5px;
    }
}
</style>
