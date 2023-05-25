<template>
<div id="chatroom" class="layout" v-if="current" @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'chatroom', instance: this}))">
    <section class="content">
        <section class="chat-content" ref="chat-content" @mouseover="$refs['chat-content'].focus()" @mousewheel="chatScroll">
            <ScrollBar v-if="$refs.chatlist && $refs['chat-content']" class="chat-scroll" 
            :scroll="-chatScrollPos" :total="chatScrollTotal" @scrollTo="chatScrollPos = -$event"/>
            <section :style="{ bottom: `${chatScrollPos}px`}" class="chat-list" ref="chatlist" v-bind:key="1">
                <a class="chat-more" @click="loadMore">...</a>
                <ChatroomItem v-if="item.content && !isShield(item)" 
                    :ref="'msg-item-' + item.oId" 
                    v-for="(item, i) in chats" 
                    :item="item" 
                    :v-bind:key="itemKey(item)"
                    :plusone="item.dbUser
                    && item.dbUser.length > 0 
                    && item.oId == firstMsg.oId"
                    @msg="appendMsg"
                    @face="appendFace"
                    @quote="quoteMsg"
                ></ChatroomItem>
                <CustomMsg :item="item"  v-else-if="item.type == 'customMessage'"></CustomMsg>
            </section>
            <section v-if="newMessage > 0" class="chat-new" @click="gotoMsg(chats[chats.length - newMessage].oId)">
                <Icon custom="fa fa-angle-double-down" /> {{newMessage}} 条新消息 
                <span class="chat-new-close" @click.stop="newMessage = 0">×</span>
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
                <Input max-length="16" v-model="newDiscusse" placeholder="话题" />
            </Modal>
        </section>
        <MessageBox ref="msgbox" @clear="reload(true)" :quote.sync="quote" :discussed.sync="discussed"/>
    </section>
    <section class="sidebar-box">
        <!-- 折叠按钮 -->
        <div class="sidebar-toggle" @click="showSidebar = !showSidebar">
            <Icon custom="fa fa-angle-right" v-if="showSidebar"/>
            <Icon custom="fa fa-angle-left" v-else />
        </div>
        <section class="sidebar" :class="{ 'sidebar-hide': !showSidebar }">
            <p>当前在线({{onlines.length}})</p>
            <p><Input v-model="onlineSearch" placeholder="搜索" /></p>
            <ul class="online-list">
                <li 
                    class="online-item user-card" 
                    :data-user="user.userName" 
                    v-for="user in onlines.filter(o => !onlineSearch || o.userName.includes(onlineSearch))" @contextmenu.stop="userMenuShow($event, user)"  
                    @dblclick="$router.push(`/chat/${user.userName}`)">
                    <Avatar :src="user.userAvatarURL48" /><span class="online-user">{{user.userName}}</span>
                </li>
            </ul>
        </section>
    </section>
</div>
</template>

<script>
    import ChatroomItem from '../components/chatroom-item.vue';
    import CustomMsg from '../components/custom-msg.vue';
    import MessageBox from '../components/messagebox.vue';
    import ScrollBar from '../components/scrollbar.vue';
    export default {
        name: 'chatroom',
        components: {
            ChatroomItem,
            MessageBox,
            ScrollBar,
            CustomMsg
        },
        async mounted () {
            await this.reload()
            this.onlines = this.$fishpi.chatroom.onlines;
            this.discusse = this.$fishpi.chatroom.discusse;
            this.$fishpi.chatroom.addListener(this.msgListener);
            document.body.addEventListener('click', this.discussClick, false)
            this.$root.setting.addListener(this.settingListener);
        },
        beforeDestroy() {
            this.unLoad();
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
                newMessage: 0,
                setting: this.$root.setting.value.chatroom,
                onlineSearch: '',
                showSidebar: !localStorage.getItem('showSidebar') || localStorage.getItem('showSidebar') == 'true',
            }    
        },
        watch: {
            $route(to, from) {
                if (this.$route.query.id) {
                    setTimeout(() => {
                        this.focusMsg(this.$route.query.id);
                    }, to.path == from.path ? 1 : 1000)
                }
            },
            showSidebar(val) {
                localStorage.setItem('showSidebar', val);
            },
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
            async focusMsg(oId) {
                let ele = this.$refs[`msg-item-${oId}`];
                if (!ele) return;
                ele = ele[0]
                let top = ele.$el.offsetTop;
                if (top < this.chatScrollTotal + this.chatScrollPos) {
                    this.chatScrollPos = top - this.chatScrollTotal;
                }
                ele.highlight();
                this.$router.push(`/chatroom`);
            },
            async reload(reconnect=false) {
                this.chats = [];
                if (reconnect) await this.$fishpi.chatroom.reconnect();
                await this.load(1);
                await this.load(2);
                this.chatScrollTotal = this.$refs.chatlist.offsetHeight - this.$refs['chat-content'].offsetHeight;
            },
            unLoad() {
                this.$fishpi.chatroom.removeListener(this.msgListener);
                document.body.removeEventListener('click', this.discussClick)
                this.$root.setting.removeListener(this.settingListener);
            },
            settingListener(setting) {
                this.setting = setting.chatroom;
            },
            isShield(msg) {
                if (msg.type != 'msg' && msg.type != 'redpacket') return;
                return this.setting.shield.find(s => {
                    if (s.value == '' && !s.type.startsWith('redpacket')) return false;
                    switch(s.type)
                    {
                        case 'username': return msg.userName == s.value;
                        case 'content': return !msg.content.match || (msg.content || '').match(new RegExp(s.value)) != null;
                        case 'redpacket': return msg.content.msgType == 'redPacket';
                    }
                    return false;
                }) != null
            },
            async loadMore() {
                if (this.chats.length == 0) return;
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
                let m = await this.$ipc.sendSync('fishpi.hooks.chatroom', { msg });
                if (m) msg = m === true ? msg : m;
                else return;
                switch(msg.type) {
                    case 'online':
                        this.$root.onlines = this.onlines = msg.data;
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
                    case 'customMessage': {
                        this.chats.push(msg);
                        break;
                    }
                    case 'barrager': {
                        msg.data = {
                            content: msg.data.barragerContent,
                            userName: msg.data.userName,
                            userNickname: msg.data.userNickname,
                            userAvatarURL: msg.data.userAvatarURL,
                            barragerColor: msg.data.barragerColor,
                        }
                    }
                    case 'msg':
                    case 'redPacket':
                        this.toBottom = false;
                        let ContentHeight = this.$refs.chatlist.offsetHeight;
                        let offset = -this.chatScrollPos;
                        let isBottom = offset < 500 || msg.data.userName == this.current.userName;
                        msg.data.dbUser = []
                        if (this.isMarkdown && msg.type != 'redPacket') msg.data.content = msg.data.md;
                        if (msg.type == 'msg' && msg.data.content == this.chats[this.chats.length - 1].content) {
                            this.chats[this.chats.length - 1].dbUser || (this.chats[this.chats.length - 1].dbUser = [])
                            this.chats[this.chats.length - 1].dbUser.push(msg.data)
                        }
                        else {
                            if (!isBottom) this.newMessage ++;
                            this.chats.push(msg.data);
                        }
                        console.log('offset:' + offset)
                        if(isBottom) {
                            this.toBottom = true;
                            this.chatScrollPos = 0;
                            this.newMessage = 0;
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
                        let ContentHeight = this.$refs.chatlist.offsetHeight;
                        let offset = -this.chatScrollPos;
                        let isBottom = offset < 500;

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
                        if (!isBottom) 
                            this.$nextTick(() => this.chatScrollPos += ContentHeight - this.$refs.chatlist.offsetHeight);
                        else 
                            this.chatScrollPos = 0;
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
            discussClick(ev) {
                if (ev.target.className == 'discuss-msg') this.discussed = ev.target.dataset.discuss;
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
                this.$root.sendMsg(`[setdiscuss]${this.newDiscusse}[/setdiscuss]`)
            },
            sendDiscusse() {
                this.$root.sendMsg(`*\`# ${this.discusse} #\`*`)
                this.discussed = null;
            },
            chatScroll(ev) {
                if (ev.deltaY + this.chatScrollPos >= 0) {
                    this.chatScrollPos = 0;
                    this.newMessage = 0;
                    return;
                }
                if (ev.deltaY + this.chatScrollPos <= this.$refs['chat-content'].offsetHeight - this.$refs.chatlist.offsetHeight) {
                    this.chatScrollPos = this.$refs['chat-content'].offsetHeight - this.$refs.chatlist.offsetHeight;
                    this.loadMore();
                    return;
                }
                this.chatScrollPos += ev.deltaY;
            },
            async userMenuShow(ev, item) {
                if (item.userName == this.current.userName) return;
                let menu = [];
                menu.push({
                    label: `@${item.userName}`,
                    click: () => {
                        this.appendMsg(`@${item.userName} `);
                    }
                });
                menu.push({
                    label: `单独聊聊`,
                    click: () => {
                        this.$router.push(`/chat/${item.userName}`);
                    }
                });
                menu.push({
                    label: `访问主页`,
                    click: () => {
                        window.open(`https://fishpi.cn/member/${item.userName}`);
                    }
                });    
                menu.push({
                    label: `发个专属红包`,
                    click: () => {
                        this.$ipc.send('main-event', {
                            call: 'openRedpacket',
                            args: {
                                id: 'send',
                                user: item.userName
                            }
                        });
                    }
                });
                menu = menu.concat(await this.$root.getDefaultMenu(ev, { name: 'chatroom', instance: this}))
                this.$root.popupMenu(menu);
            },
            gotoMsg(oId) {
                if (!oId || !this.$refs['msg-item-' + oId]) return;
                let ele = this.$refs['msg-item-' + oId][0];
                if (!ele) return;
                this.chatScrollPos = ele.$el.offsetTop + ele.$el.offsetHeight - this.$refs.chatlist.offsetHeight;
                this.newMessage = 0;
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
            .chat-new {
                cursor: pointer;
                position: absolute;
                bottom: 10px;
                right: 10px;
                background: var(--global-active-color);
                padding: 5px;
                border-radius: 5px;
                .chat-new-close {
                    cursor: pointer;
                    border-left: 1px solid #AAA;
                    padding-left: 4px;
                    font-size: 1.2em;
                    line-height: 1;
                    vertical-align: text-top;
                }
            }
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
    .sidebar-box {
        position: relative;
        .sidebar-toggle {
            position: absolute;
            top: 50%;
            bottom: 50%;
            border-radius: 50% 0 0 50%;
            left: -1em;
            width: 1em;
            height: 5em;
            margin: auto;
            line-height: 1.5em;
            text-align: center;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--main-chatroom-sidebar-background-color);
            &:hover {
                color: var(--global-active-color);
            }
        }
    }
    .sidebar {
        &.sidebar-hide {
            width: 0;
            padding: 0;
        }
        transition: all .5s;
        background-color: var(--main-chatroom-sidebar-background-color);
        width: 10em;
        padding: 0.5em;
        padding-bottom: 0;
        display: flex;
        flex-direction: column;
        flex: initial;
        overflow: hidden;
        height: 100%;
        .online-list {
            margin-top: 5px;
            list-style: none;
            padding: 0;
            overflow-x: auto;
            overflow-y: auto;
            height: 100%;
            .online-item {
                display: flex;
                align-items: center;
                .ivu-avatar {
                    min-width: 1.2em;
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

.layout .sidebar-box {
    .sidebar, .sidebar-toggle {
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
