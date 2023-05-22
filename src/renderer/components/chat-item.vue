<template>
<section class="msg-item" v-if="item.content" :class="{'msg-current': isCurrent}"  @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'chat-item', instance: this}))">
    <div class="msg-avatar-box" @contextmenu.stop="userMenuShow">
        <Avatar class="msg-avatar user-card" :data-user="item.senderUserName" :src="item.senderAvatar" />
    </div>
    <div :ref="`msg-${item.oId}`" :data-id="item.oId" class="msg-item-contain">
        <div ref="msg" class="msg-contain" @contextmenu.stop="msgMenuShow">
            <div class="arrow" v-if="!isImgOnly"/>
            <div class="msg-content md-style" :data-html="item.content" v-html="formatContent" v-if="!isImgOnly"/>
            <span class="msg-img" v-if="isImgOnly" v-html="formatContent"></span>
        </div>
    </div>
</section>
</template>

<script>
  export default {
    name: 'chat-item',
    components: {
    },
    props: {
        item: {
            required: true
        },
    },
    mounted () {
    },
    data () {
        return {
        }
    },
    watch: {
    },
    filters: {
    },
    computed: {
        formatContent() {
            return this.item.content.replace && this.item.content
                .replace(/(<a )/g, '$1target="_blank" ')
                .replace(/(<iframe[^>]*?src="(https:)*\/\/music.163.com\/outchain\/player\?type=\d&amp;id=(\d+)[^"]*?">\s*<\/iframe>)/, '<div class="netease-music"><div class="netease-cover" data-id="$3"></div>$1</div>')
                .replace(/(<img )/g, '$1data-action="preview" ')
                .replace(/href="https:\/\/fishpi.cn\/chat#chat(\d+)/g, 'class="reply-chat" data-reply="$1" href="#chat$1"');
        },
        isImgOnly() {
            return (!this.item.content.replace(/\n/g, '').match(/>[^<]+?</g)) && this.item.content.startsWith('<');
        },
        current() {
            return this.$root.current;
        },
        isCurrent() {
            return this.item.senderUserName == this.current.userName;
        },
     },
    methods: {
        emojiCode(target) {
            return `:${target.src.match(/\/([^\/.]*?)(.gif|.png)/)[1]}:`;
        },
        async userMenuShow(ev) {
            if (this.item.senderUserName == this.current.userName) return;
            let menu = [];
            menu.push({
                label: `发个专属红包`,
                click: () => {
                    this.$ipc.send('main-event', {
                        call: 'openRedpacket',
                        args: {
                            id: 'send',
                            user: this.item.senderUserName
                        }
                    });
                }
            });
            menu = menu.concat(await this.$root.getDefaultMenu(ev, { name: 'chat-item', instance: this}))
            this.$root.popupMenu(menu);
        },
        async msgMenuShow(ev) {
            let menu = [];
            let target = ev.target;
            if (this.item.senderUserName != this.current.userName) {
                menu.push({
                    label: `@${this.item.senderUserName}`,
                    click: () => {
                        this.$emit('msg', `@${this.item.senderUserName} `);
                    }
                });
            }
            else {
                menu.push({
                    label: '撤回',
                    click: () => {
                        this.$fishpi.chat.revoke(this.item.oId)
                        .then(rsp => rsp.code ? 
                            this.$message.error(rsp.msg) : 
                            this.$message.success('撤回成功')
                        );
                    }
                });
            }
            menu.push({
                label: '回复',
                click: () => {
                    this.$emit('quote', this.item);
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
            }
            menu = menu.concat(await this.$root.getDefaultMenu(ev, { name: 'chat-item', instance: this}))
            this.$root.popupMenu(menu);
        },
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
