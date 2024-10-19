<template>
<section ref="msg-view" class="msg-item" 
    :data-height="contentHeight"
    :title="isBaggager ? `${item.userNickname || item.userName}: ${item.content}` : item.time"
    v-if="item.content" 
    :class="{ barrager: isBaggager, 'msg-current': isCurrent}" 
    :style="autoVisibleStyle" 
    @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'chatroom-item', instance: this}))"
>
    <div class="msg-avatar-box" @contextmenu.stop="userMenuShow" @dblclick="$router.push(`/chat/${item.userName}`)">
        <Avatar class="msg-avatar user-card" :data-user="item.userName" :src="item.userAvatarURL" />
    </div>
    <div :ref="`msg-${item.oId}`" :data-id="item.oId" class="msg-item-contain">
        <div class="msg-user" @contextmenu.stop="userMenuShow" :title="item.userName">
            <span><span :title="item.userName">{{item.userNickname || item.userName}}</span>
            <Via :via="item.via || {}" /></span>
        </div>
        <div class="redpacket-item" :class="{'redpacket-empty': emptyRedpacket || readRedpacket }" v-if="isRedpacket" @contextmenu.stop="redPacketMenuShow">
        <div class="redpacket-contain">
            <div class="arrow"></div>
                <div class="redpacket-content" @click="open" :title="emptyRedpacket ? '红包已领完' : readRedpacket ? '红包已领取' : '快快点击领取红包'">
                    <div class="redpacket-main">
                        <svg class="redpacket-icon">
                            <use xlink:href="#redPacketIcon"></use>
                        </svg>
                        <div class="redpacket-msg">{{item.content.msg}}</div>
                    </div>
                    <div class="redpacket-type">
                        <div>{{redpacketType[item.content.type]}}</div>
                        <div><i class="fa-solid fa-coins"></i> {{item.content.money}}</div>
                    </div>
                </div>
                <div title="猜猜我出什么呢~" v-show="item.content.type == 'rockPaperScissors' && !isCurrent && !emptyRedpacket && !readRedpacket" class="user-gesture">
                    <div class="gesture-list gesture-open">
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
                <span @contextmenu.stop="userMenuShow($event, u.userName)" :data-user="u.userName" class="redpacket-user user-card" :key="u.userId" v-for="u in item.content.who" :title="u.userName">
                    <Avatar class="redpacket-avatar" :src="u.avatar" />
                </span>
                <span class="redpacket-word">领取了</span>
            </div>            
        </div>
        <div ref="msg" class="msg-contain" v-if="!isRedpacket" @contextmenu.stop="msgMenuShow">
            <div class="arrow" v-if="!isImgOnly"/>
            <WeatherCard v-if="isWeatherMsg" :data="item.content" />
            <MusicCard v-else-if="isMusicMsg" :data="item.content"/>
            <span class="msg-img" v-else-if="isImgOnly" v-html="formatContent"></span>
            <div v-else class="msg-content" :style="{
                color: item.barragerColor, 
            }" :data-html="item.content">
              <div class="msg-view" :class="{ 'msg-overflow': overflow && !expend }">
                <div ref="msgView" class="md-style" v-html="formatContent"></div>
              </div>
              <div :title="expend ? '合并' : '展开'" @click="expend = !expend" v-if="overflow" class="msg-more">
                <i :class="{ 'fa-rotate-180': expend }" class="fa-solid fa-caret-down"></i>
              </div>
            </div>
            <span class="plus-one" @click="doubleMsg" v-if="plusone">+1</span>
        </div>
        <div class="db-users" v-if="hasDbUser">
            <span @contextmenu.stop="userMenuShow($event, db.userName)" :data-user="db.userName" class="db-user user-card" :key="db.oId" v-for="db in item.dbUser" :title="db.userNickname || db.userName">
                <Avatar class="db-avatar" :src="db.userAvatarURL" />
            </span>
            <span class="db-word">也这么说</span>
        </div>
    </div>
</section>
</template>

<script>
  import Via from './via';
  import WeatherCard from './weather-card.vue';
  import MusicCard from './music-card.vue';
  export default {
    name: 'chatroom-item',
    components: {
        Via,
        WeatherCard,
        MusicCard,
    },
    props: {
        item: {
            required: true
        },
        plusone: {
            type: Boolean,
            default: false
        },
        visible: {
            type: Boolean,
            default: true,
        }
    },
    mounted () {
        this.$nextTick(() => {
            if (this.isBaggager) {
                setTimeout(() => {
                    this.$refs['msg-view'].classList.add('barrager-show');
                }, 100);
            }
            if (this.$refs.msgView) this.overflow = this.$refs.msgView.offsetHeight > 200;
        })
    },
    updated() {
        if (this.autoHide) return;
        this.contentHeight = this.$refs['msg-view'].offsetHeight;
        this.autoHide = true;
    },
    data () {
        return {
            gestureOpen: false,
            readed: false,
            contentHeight: 0,
            autoHide: false,
            overflow: false,
            expend: false,
        }
    },
    watch: {
        'item.dbUser'(n, o) {
            if (o.length == 0) this.autoHide = false;
        },
        'item.content'() {
            this.$nextTick(() => {
                if (this.$refs.msgView) this.overflow = this.$refs.msgView.offsetHeight > 200;
            });
        }
    },
    filters: {
    },
    computed: {
        isWeatherMsg() {
            return this.item.content.msgType == 'weather'
        },
        isMusicMsg() {
            return this.item.content.msgType == 'music'
        },
        autoVisibleStyle() {
            return {
                containIntrinsicSize: this.contentHeight > 0 ? this.contentHeight + 'px' : 'unset',
                contentVisibility: this.autoHide ? 'auto' : 'unset',
            }
        },
        hasDbUser() {
            return this.item.dbUser.length > 0
        },
        emptyRedpacket() {
            return this.item.content.got == this.item.content.count;
        },
        readRedpacket() {
            return this.readed || (this.item.content.who && this.item.content.who.find(w => w.userName == this.current.userName))
        },
        isBaggager() {
            return !!this.item.barragerColor
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
                .replace(/href="https:\/\/fishpi.cn\/cr#chatroom(\d+)/g, 'class="reply" data-reply="$1" href="#chatroom$1"');
        },
        isImgOnly() {
            return !this.isBaggager && !this.item.content.msgType && (!this.item.content.replace(/\n/g, '').match(/>[^<]+?</g)) && this.item.content.startsWith('<');
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
          if (!this.isBaggager)
            this.$root.sendMsg(this.item.md || await this.$fishpi.chatroom.raw(this.item.oId))
          else            
            this.$fishpi.chatroom.barrage(this.item.content, this.item.barragerColor)
        },
        highlight() {
            this.$refs['msg-view'].style.background = 'rgba(255,255,255,.1)'
            setTimeout(() => {
                this.$refs['msg-view'].style.background = 'transparent'
            }, 700)
        },
        async userMenuShow(ev, userName) {
            userName = userName || this.item.userName;
            if (userName == this.current.userName) return;
            let menu = [];
            menu.push({
                label: `@${userName}`,
                click: () => {
                    this.$emit('msg', `@${userName} `);
                }
            });
            menu.push({
                label: `单独聊聊`,
                click: () => {
                    this.$router.push(`/chat/${userName}`);
                }
            });
            menu.push({
                label: `访问主页`,
                click: () => {
                    window.open(`https://fishpi.cn/member/${userName}`);
                }
            });
            menu.push({
                label: `发个专属红包`,
                click: () => {
                    this.$ipc.send('main-event', {
                        call: 'openRedpacket',
                        args: {
                            id: 'send',
                            user: userName
                        }
                    });
                }
            });
            menu = menu.concat(await this.$root.getDefaultMenu(ev, { name: 'chatroom-item', instance: this}))
            this.$root.popupMenu(menu);
        },
        
        //添加红包复制地址
        redPacketMenuShow() {
            let menu = []
            if (this.item.content.msgType == 'redPacket') {
                menu.push({
                    label: '复制红包地址',
                    click: () => {
                        navigator.clipboard.writeText(`https://fishpi.cn/cr?oId=${this.item.oId}#chatroom${this.item.oId}`)
                    }
                });
            }
            this.$root.popupMenu(menu,true);
        },
        
        async msgMenuShow(ev) {
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
            if (target.className == 'netease-cover' && !this.$root.inPlayList(target.dataset.id)) {
                menu.push({
                    label: `加入播放列表`,
                    click: () => {
                        this.$root.playMusic(target.dataset.id, true);
                    }
                });
            }
            if (target.className == 'netease-cover' && this.$root.inPlayList(target.dataset.id)) {
                menu.push({
                    label: `移出播放列表`,
                    click: () => {
                        this.$root.removeSong(target.dataset.id);
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
            menu.push({
                label: '复制地址',
                click: () => {
                  navigator.clipboard.writeText(`https://fishpi.cn/cr?oId=${this.item.oId}#chatroom${this.item.oId}`)
                }
            });
            menu.push({
                label: `发个专属红包给 ${this.item.userNickname || this.item.userName}`,
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
                    menu.push({
                        label: '复制图片',
                        click: () => {
                            this.$root.copyImg(target);
                        }
                    });
                }
            }else{
                menu.push({
                    label: '复制消息',
                    click: async () => {
                        navigator.clipboard.writeText(this.item.md || await this.$fishpi.chatroom.raw(this.item.oId))
                    }
                });
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
            menu = menu.concat(await this.$root.getDefaultMenu(ev, { name: 'chatroom-item', instance: this}))
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
    transition: .5s background;
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
            }
            user-select: none;
            .user-gesture {
                display: flex;
                flex-direction: row;
                align-items: center;
            }
            .gesture-choose {
                position: relative;
                z-index: 5;
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
                    z-index: 2;
                    top: 1.6em;
                    left: -1.9em;
                    transition: all .2s;
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
                padding-right: 5px;
                cursor: pointer;
                max-width: 54vw;
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
                    display: flex;
                    justify-content: space-between;
                }
            }
        }

        .msg-user{
            margin-left: 1em;
            font-size: .8em;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            line-height: 1.5;
        }

        .arrow{
            border: 5px solid transparent;
            border-right: 5px solid var(--main-chatroom-message-background-color);
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
            background-color: var(--main-chatroom-message-background-color);
            border-radius: 5px;
            color: var(--main-chatroom-message-color);
            word-break: break-word;
            max-width: calc(100% - 45px);
            overflow: hidden;
            position: relative;
            .msg-view {
              padding: 8px 15px;
              width: 100%;
              &.msg-overflow {
                max-height: 150px;
              }
            }
            .msg-more {
                cursor: pointer;
                text-align: center;
                background: linear-gradient(to bottom, transparent 0%, var(--main-chatroom-message-background-color-darken) 100%);
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
            }
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
            min-width: 25px;
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
            min-width: 25px;
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
        --main-chatroom-message-background-color: var(--main-chatroom-user-message-background-color);
        --main-chatroom-message-color: var(--main-chatroom-user-message-color);
        .msg-contain {
            flex-direction: row-reverse;
        }
        .arrow {
            border-right-color: transparent;
            border-left-color: var(--main-chatroom-message-background-color);
        }
        .msg-user {
            justify-content: flex-end;
            margin-right: 1em;
            display: flex;
            flex-direction: row-reverse;
            justify-content: end;
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

    &.barrager {
        background-color: var(--main-chatroom-barrager-background-color);
        border-radius: 45px;
        margin: 10px 5px;
        font-weight: bold;
        box-shadow: 0 0 5px 1px var(--main-chatroom-barrager-background-color);
        overflow: hidden;
        transition: all .5s;
        height: 0;
        opacity: 0;
        width: 0%;
        max-width: calc(95%);
        display: inline-flex;
        &.barrager-show {
            opacity: 1;
            height: 45px;
            animation: shake 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both 0.2s;
            width: auto;
        }
        .msg-content {
            background-color: transparent;
            white-space: nowrap;
            text-overflow: ellipsis;
            max-width: calc(100%);
        }
        .msg-user, .arrow {
            display: none;
        }
        .msg-avatar-box .msg-avatar {
            min-width: 45px;
            width: 45px;
            height: 45px;
            margin: 0;
        }
        .msg-item-contain, .msg-contain {
            display: inline-flex;
            width: auto;
            max-width: calc(100%);
        }
        &.msg-current {
            flex-direction: row;
            .msg-contain {
                flex-direction: row;
            }
        }
    }
}

@keyframes shake {
  0% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(-8px);
  }
  40% {
    transform: translateY(0);
  }
  60% {
    transform: translateY(-4px);
  }
  80% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-2px);
  }
}
</style>
