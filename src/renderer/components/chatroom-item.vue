<template>
<section class="msg-item" v-if="item.content" :class="{'msg-current': isCurrent}">
    <div class="msg-avatar-box" @contextmenu="userMenuShow" @dblclick="$router.push(`/chat/${item.userName}`)">
        <Avatar class="msg-avatar" :src="item.userAvatarURL" />
    </div>
    <div :ref="`msg-${item.oId}`" :data-id="item.oId" class="msg-item-contain">
        <div class="msg-user" :title="item.userName">{{item.userNickname || item.userName}}</div>
        <div class="redpacket-item" :title="emptyRedpacket ? '红包已领完' : readRedpacket ? '红包已领取' : '快快点击领取红包'"
            :class="{'redpacket-empty': emptyRedpacket || readRedpacket }" @click="open"
            v-if="isRedpacket">
            <div class="redpacket-contain">
                <div class="arrow"/>
                <div class="redpacket-content">
                    <div class="redpacket-main">
                        <svg class="redpacket-icon">
                            <use xlink:href="#redPacketIcon"></use>
                        </svg>
                        <div class="redpacket-msg">{{item.content.msg}}</div>
                    </div>
                    <div class="redpacket-type">
                        <div>{{redpacketType[item.content.type]}}</div>
                    </div>
                </div>
                <div v-if="item.content.type == 'rockPaperScissors' && !isCurrent && !emptyRedpacket && !readRedpacket" class="user-gesture">
                    <div class="gesture-choose" title="猜猜我出什么呢~" @click="gestureOpen=!gestureOpen">
                        <img src="../assets/gesture.png" alt="">
                    </div>
                    <div class="gesture-list" :class="{ 'gesture-open': gestureOpen} ">
                        <div class="gesture-item rock" @click="gesture(0)">
                            <img src="../assets/Rock.png" alt="" />
                        </div>
                        <div class="gesture-item scissors" @click="gesture(1)">
                            <img src="../assets/Scissors.png" alt="" />
                            </div>
                        <div class="gesture-item paper" @click="gesture(2)">
                            <img src="../assets/Paper.png" alt="" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="redpacket-users" v-if="item.content.who && item.content.who.length">
                <span class="redpacket-user" :key="u.userId" v-for="u in item.content.who" :title="u.userName">
                    <Avatar class="redpacket-avatar" :src="u.avatar" />
                </span>
                <span class="redpacket-word">领取了</span>
            </div>            
        </div>
        <div ref="msg" class="msg-contain" v-if="!isRedpacket" @contextmenu="msgMenuShow">
            <div class="arrow" v-if="!isImgOnly"/>
            <div class="msg-content md-style" :data-html="item.content" v-html="formatContent" v-if="!isImgOnly"/>
            <span class="msg-img" v-if="isImgOnly" v-html="formatContent"></span>
            <span class="plus-one" @click="doubleMsg" v-if="plusone">+1</span>
        </div>
        <div class="db-users" v-if="item.dbUser && item.dbUser.length">
            <span class="db-user" :key="db.oId" v-for="db in item.dbUser" :title="db.userNickame || db.userName">
                <Avatar class="db-avatar" :src="db.userAvatarURL" />
            </span>
            <span class="db-word">也这么说</span>
        </div>
    </div>
</section>
</template>

<script>
  export default {
    name: 'chatroom-item',
    components: {
    },
    props: {
        item: {
            required: true
        },
        plusone: {
            type: Boolean,
            default: false
        },
    },
    mounted () {
    },
    data () {
        return {
            gestureOpen: false,
            readed: false,
        }
    },
    watch: {
    },
    filters: {
    },
    computed: {
        emptyRedpacket() {
            return this.item.content.got == this.item.content.count;
        },
        readRedpacket() {
            return this.readed || (this.item.content.who && this.item.content.who.find(w => w.userName == this.current.userName))
        },
        isRedpacket() {
            return this.item.content.msgType == 'redPacket'
        },
        formatContent() {
            return this.item.content.replace && this.item.content
                .replace(/(<a )/g, '$1target="_blank" ')
                .replace(/(<iframe[^>]*?src="(https:)*\/\/music.163.com\/outchain\/player\?type=\d&amp;id=(\d+)[^"]*?">\s*<\/iframe>)/, '<div class="netease-music"><div class="netease-cover" data-id="$3"></div>$1</div>')
                .replace(/(<img )/g, '$1data-action="preview" ')
                .replace(/<em><code># (.*?) #<\/code><\/em>/g, '<em class="discuss-msg" title="跟随话题"><code class="discuss-msg" data-discuss="$1"># $1 #<\/code><\/em>')

        },
        isImgOnly() {
            return (!this.item.content.replace(/\n/g, '').match(/>[^<]+?</g)) && this.item.content.startsWith('<');
        },
        current() {
            return this.$root.current;
        },
        isCurrent() {
            return this.item.userName == this.current.userName;
        },
        redpacketType() {
            return {
                random: '拼手气红包',
                average: '普通红包',
                specify: '专属红包',
                heartbeat: '心跳红包',
                rockPaperScissors: '猜拳红包',
            }
        },
     },
    methods: {
        emojiCode(target) {
            return `:${target.src.match(/\/([^\/.]*?)(.gif|.png)/)[1]}:`;
        },
        async doubleMsg() {
            this.$fishpi.chatroom.send(this.item.md || await await this.$fishpi.chatroom.raw(this.item.oId))
        },
        userMenuShow(ev) {
            if (this.item.userName == this.current.userName) return;
            let menu = [];
            menu.push({
                label: `@${this.item.userName}`,
                click: () => {
                    this.$emit('msg', `@${this.item.userName} `);
                }
            });
            menu.push({
                label: `单独聊聊`,
                click: () => {
                    this.$router.push(`/chat/${this.item.userName}`);
                }
            });
            menu.push({
                label: `发个专属红包`,
                click: () => {
                    this.$ipc.send('main-event', {
                        call: 'openRedpacket',
                        args: {
                            id: 'send',
                            user: this.item.userName
                        }
                    });
                }
            });
            this.$root.popupMenu(menu);
        },
        msgMenuShow(ev) {
            let menu = [];
            let target = ev.target;
            if (this.item.userName != this.current.userName) {
                menu.push({
                    label: `@${this.item.userName}`,
                    click: () => {
                        this.$emit('msg', `@${this.item.userName} `);
                    }
                });
            }
            menu.push({
                label: '回复',
                click: () => {
                    this.$emit('quote', this.item);
                }
            });
            
            menu.push({
                label: '复读一下',
                click: () => {
                    this.doubleMsg();
                }
            });
            if (target.nodeName.toLowerCase() == 'img') {
                if (target.className == 'emoji') {
                    menu.push({
                        label: this.emojiCode(target),
                        click: () => {
                            this.$emit('msg', this.emojiCode(target));
                        }
                    });
                }
                else {
                    menu.push({
                        label: '添加表情',
                        click: () => {
                            this.$emit('face', target.src);
                        }
                    });
                }
            }
            if (this.item.userName == this.current.userName
            || ['纪律委员', 'OP', '管理员'].indexOf(this.current.userRole) >= 0) {
                menu.push({
                    label: '撤回',
                    click: () => {
                        this.$fishpi.chatroom.revoke(this.item.oId);
                    }
                });
            }
            if (['纪律委员', 'OP', '管理员'].indexOf(this.current.userRole) >= 0
            && this.item.dbUser && this.item.dbUser.length > 0) {
                menu.push({
                    label: '撤回复读',
                    click: () => {
                        if (!confirm('是否确定批量撤回所有复读消息？')) return;
                        this.item.dbUser.forEach(m => this.$fishpi.chatroom.revoke(m.oId));
                        this.$fishpi.chatroom.revoke(this.item.oId);
                    }
                });
            }
            let selection = window.getSelection();
            if (selection.rangeCount > 0 && !selection.isCollapsed) menu = menu.concat(this.$root.defaultMenu)
            this.$root.popupMenu(menu);
        },
        open() {
            if (this.item.content.type == 'rockPaperScissors')
                this.gestureOpen = !this.gestureOpen;
            if (this.item.content.type == 'rockPaperScissors' 
            && this.item.userName != this.current.userName 
            && !this.emptyRedpacket 
            && !this.readRedpacket) return;
            this.$ipc.send('main-event', {
                call: 'openRedpacket',
                args: this.item.oId
            })
            this.readed = this.item.content.type != 'rockPaperScissors' ;
        },
        gesture(type) {
            this.$ipc.send('main-event', {
                call: 'openRedpacket',
                args: { 
                    id: this.item.oId,
                    gesture: type,
                }
            })
        }
    }
  }
</script>
<style lang="less" scoped>
.msg-item{
    display: flex;
    flex-direction: row;
    margin: 5px 0;

    .msg-avatar-box {
        position: relative;
        .msg-avatar {
            width: 35px;
            height: 35px;
            border-radius: 35px;
            margin-top: 1.5em;
            cursor: pointer;
        }
    }

    .msg-item-contain{
        display: flex;
        flex-direction: column;
        width: 85%;
        position: relative;

        .redpacket-item {
            display:flex;
            flex-direction: column;
            .redpacket-contain {
                display: flex;
                flex-direction: row;
                cursor: pointer;
            }
            user-select: none;
            .user-gesture {
                display: flex;
                flex-direction: row;
                align-items: center;
            }
            .gesture-choose {
                position: relative;
                z-index: 2;
                img {
                    width: 1.5em;
                    margin: 0 3px;
                }
            }
            .gesture-list {
                position: relative;
                display: flex;
                height: 100%;
                .gesture-item {
                    position: absolute;
                    z-index: 1;
                    top: 1.6em;
                    left: -1.9em;
                    transition: all .5s;
                    img {
                        width: 1.5em;
                        border-radius: 50%;
                        overflow: hidden;
                        margin: 0 3px;
                        &:hover {
                            box-shadow: 0 0 3px 0 #FA0 ;
                        }
                    }
                }
                &.gesture-open {
                    img {
                        width: 2.5em;
                    }
                    .rock {
                        top: -1em;
                        left: -1em;
                    }
                    .scissors {
                        top: 1.1em;
                        left: 0.5em;
                    }
                    .paper {
                        top: 3em;
                        left: -1em;
                    }
                }
            }
            &.redpacket-empty {
                .redpacket-content {
                    background: var(--main-redpacket-readed-background-color);
                }
                .arrow {
                    border-right-color: var(--main-redpacket-readed-background-color);
                }
            }
            .arrow {
                border-right-color: var(--main-redpacket-background-color);
            }
            .redpacket-content{
                display: flex;
                flex-direction: column;
                background: var(--main-redpacket-background-color);
                border-radius: 5px;
                padding-right: 10px;
                .redpacket-main {
                    display: inline-flex;
                    align-items: center;
                }
                .redpacket-icon {
                    width: 64px;
                    height: 64px;
                }
                .redpacket-msg {
                    color: var(--main-redpacket-message-color);
                }
                .redpacket-type {
                    border-top: 1px solid var(--main-redpacket-type-border-color);
                    color: var(--main-redpacket-type-color);
                    padding: 2px;
                    margin: 0 10px;
                    font-size: .5em;
                }
            }
        }

        .msg-user{
            margin-left: 1em;
            font-size: .8em;
        }

        .arrow{
            border: 5px solid transparent;
            border-right: 5px solid var(--main-redpacket-message-color);
            width: 0;
            margin-top: 15px;
            height: 0;
        }
    }
    .msg-contain{
        display: flex;
        flex-direction: row;
        position: relative;
        width: 100%;

        .msg-content{
            background-color: var(--main-redpacket-message-color);
            border-radius: 5px;
            padding: 8px 15px;
            color: var(--main-chatroom-message-color);
            word-break: break-word;
            max-width: calc(100% - 45px);
            overflow: auto;
        }

        .msg-img {
            padding: 5px 10px;
            display: inline-block;
            font-size: 0;
            max-width: 90%;
        }
        .plus-one {
            font-size: .8em;
            margin: auto 5px;
            font-weight: bolder;
            color: var(--main-chatroom-plusone-color);
            height: 25px;
            width: 25px;
            background: var(--main-chatroom-plusone-background-color);
            border-radius: 15px;
            text-align: center;
            cursor: pointer;
            font-family: mononoki,Consolas,"Liberation Mono",Menlo,Courier,monospace;
        }
    }
    .db-users, .redpacket-users {
        padding: 5px 0 5px 10px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        .db-user, .redpacket-user {
            padding: 2px;
        }
        .db-avatar, .redpacket-avatar {
            width: 25px;
            height: 25px;
        }
        .db-word, .redpacket-word {
            display: inline-block;
            padding-left: 5px;
        }
    }
    &.msg-current {
        flex-direction: row-reverse;
        .msg-contain {
            flex-direction: row-reverse;
        }
        .arrow {
            border-right-color: transparent;
            border-left-color: var(--main-chatroom-user-message-background-color);
        }
        .msg-content {
            background-color: var(--main-chatroom-user-message-background-color);
            color: var(--main-chatroom-user-message-color);
        }
        .msg-user {
            text-align: right;
            margin-right: 1em;
        }
        .plus-one {
            left: -1.5em;
            right: auto;
        }
        .msg-img {
            text-align: right;
        }
        .redpacket-item {
            .redpacket-contain {
                flex-direction: row-reverse;
                .arrow {
                    border-right-color: transparent;
                    border-left-color: var(--main-redpacket-background-color);
                }
                &.redpacket-empty {
                    .arrow {
                        border-right-color: transparent;
                        border-left-color: var(--main-redpacket-readed-background-color);
                    }
                }
                .redpacket-type {
                    display: flex;
                    justify-content: space-between;
                }
            }
        }
        .db-users, .redpacket-users {
            justify-content: flex-end;
        }
    }
}
</style>
