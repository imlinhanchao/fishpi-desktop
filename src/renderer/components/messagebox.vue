<template>
    <section class="chat-editor">
        <section class="chat-toolbar">
            <input type="file" name="images" accept="image/*" ref="file" v-show="false" @change="uploadImg">
            <Button type="text" class="msg-control" @click="clear()" title="消息清屏"><Icon custom="fa fa-refresh"/></Button>
            <Button type="text" class="msg-control" @click="$refs['file'].click()" title="上传图片"><Icon custom="fa fa-picture-o"/></Button>
            <Button type="text" class="msg-control" @click="emojiForm = !emojiForm" title="发表情"><Icon custom="fa fa-smile-o"/></Button>
            <Button type="text" class="msg-redpacket msg-control" title="发红包" @click="sendRedpacket">
                <svg class="redpacket-icon">
                    <use xlink:href="#redPacketIcon"></use>
                </svg>
            </Button>
        </section>
        <section class="chat-sender">
            <section class="chat-msg ivu-input-wrapper ivu-input-wrapper-default ivu-input-type-textarea">
                <textarea 
                    ref="message"
                    v-model="msg" 
                    type="textarea" 
                    placeholder="简单聊聊"
                    :rows="3"
                    @keydown.enter.exact.prevent
                    @keyup.enter.exact="sendMsg"
                    @keyup.enter.ctrl.exact="msg += '\n'"
                    @keyup.up="selList(-1)"
                    @keyup.down="selList(1)"
                    @keyup.left="selList(-1)"
                    @keyup.right="selList(1)"
                    class="ivu-input ivu-input-no-border"
                >
                </textarea>
            </section>
            <Button
                class="chat-send"
                @click="sendMsg"
                :loading="sending"
            >
                <Icon custom="fa fa-paper-plane" />
            </Button>
            <section class="at-list" v-if="atList.length">
                <div class="at-item" @click="atUser(i)" :class="{ 'current-at':  currentSel == i}" v-for="(u, i) in atList"><Avatar :src="u.userAvatarURL"/> {{u.userName}}</div>
            </section>
            <section class="emoji-list" v-if="emojiList.length">
                <div class="emoji-item" @click="addEmoji(i)" :class="{ 'current-at':  currentSel == i}" v-for="(u, i) in emojiList"><img :src="u.url"/></div>
            </section>
        </section>
    </section>
</template>

<script>
  export default {
    name: 'messagebox',
    components: {
    },
    props: {
        quote: {
            type: Object,
        },
        chatroom: {
            type: Boolean,
            default: true
        },
    },
    mounted () {
    },
    data () {
        return {
            msg: '',
            sending: false,
            emojiForm: false,
            atList: [],
            emojiList: [],
            currentSel: -1,
            faceForm: false,
            lastCursor: 0,
        }
    },
    watch: {
        msg(val) {
            let data = val.slice(0, this.msgCursor());
            let matAt = data.match(/@([^\s]+?)$/);
            let matEmoji = data.match(/:([^:]+?)$/);
            if (matAt) this.getAt(matAt[1]);
            else if (matEmoji) this.getEmoji(matEmoji[1]);
            else this.emojiList = this.atList = [];
        },
        quote (val) {
            if (val == null) this.msg =  this.msg.replace(/^并说：/, '');
            else if(!this.msg.startsWith('并说：')) this.msg = '并说：' + this.msg;
        }
    },
    filters: {
    },
    computed: {
        current() {
            return this.$store.getters['fishpi/account'];
        },
    },
    methods: {
        async sendMsg() {
            if (this.chatroom) {
                return this.sendChatroom();
            }
        },
        async sendChatroom() {
            if (this.currentSel >= 0) {
                if (this.atList.length > 0) this.atUser(this.currentSel);
                if (this.emojiList.length > 0) this.addEmoji(this.currentSel);
                return;
            }
            if (!this.msg) return;
            if (this.quote) {
                let raw = this.quote.md || await this.$fishpi.chatroom.raw(this.quote.oId);
                raw = raw.split("\n").map((r) => `>${r}`).join("\n").trim();
                let at = this.quote.userName != this.current.userName
                    ? `@${this.quote.userName} `
                    : "";
                this.msg = `${at}引用：\n\n${raw}\n\n${this.msg}`;
                this.$emit('update:quote', null)
            }
            let rsp = await this.$fishpi.chatroom.send(this.msg);
            if (!rsp) return;
            if (rsp.code != 0) {
                this.$root.msg('error', rsp.msg);
                return false;
            }
            this.msg = "";
            window.scrollTo(0, 0);
            return true;
        },
        clear() {

        },
        sendRedpacket() {

        },
        uploadImg() {

        },
        msgCursor() {
            return this.$refs['message'].selectionStart
        },
        async getAt(name) {
            if (!name) return;
            let rsp = await this.$fishpi.names(name);
            if (!rsp) return;
            if (rsp.code != 0) {
                this.$Message.error(rsp.msg);
                return;
            }
            this.atList = rsp.data;
            this.currentSel = -1;
            this.lastCursor = this.msgCursor();
        },
        selList(i) {
            let len = this.atList.length || this.emojiList.length;
            if (len == 0) return;
            this.currentSel = (this.currentSel + i) % len;
            this.$refs['message'].setSelectionRange(this.lastCursor, this.lastCursor)
        },
        atUser(i) {
            let data = '@' + this.atList[i].userName + ' ';
            this.atList = [];
            this.currentSel = -1;
            this.appendMsg({ regexp: /@([^\s]*?)$/, data })
        },
        getEmoji(name) {
            if (!name || name.length < 1) return;
            this.emojiList = Object.keys(this.$fishpi.emoji.default)
                .filter(e => e.startsWith(name))
                .slice(0, 5).map(e => ({ name:e, url: this.$fishpi.emoji.default[e] }));
            this.currentSel = -1;
            this.lastCursor = this.msgCursor();
        },
        addEmoji(i) {
            let data = this.$root.emoji.get(this.emojiList[i].name);
            this.emojiList = [];
            this.currentSel = -1;
            this.appendMsg({ regexp: /:([^:]+?)$/, data })
        },
        appendMsg({ regexp, data }){
            let preMsg = this.msg.slice(0, this.lastCursor)
            if(regexp) preMsg = preMsg.replace(regexp, data);
            else preMsg += data;
            this.msg = preMsg + this.msg.slice(this.lastCursor);
            this.$nextTick(() => {
                this.$refs['message'].focus();
                this.$refs['message'].setSelectionRange(preMsg.length, preMsg.length)
                this.emojiList = this.atList = []
            });
        },
    }
  }
</script>

<style lang="less" scoped>
.chat-editor {
    display: flex;
    flex-direction: column;
    box-shadow: 0px -1px 1px 0px rgba(255, 255, 255, .1);
    .chat-toolbar {
        display: flex;
        align-items: center;
        .msg-redpacket {
            padding: 0 8px;
            svg {
                width: 20px;
                height: 20px;
                display: inline;
                vertical-align: middle;
            }
        }
    }
    .chat-sender {
        display: flex;
        width: 100%;
        .chat-msg {
            width: 100%;
            border-radius: 0;
        }
        .chat-send {
            height: 100%;
            border-radius: 0;
            background: var(--global-append-btn-background-color);
            color: var(--global-active-color);
            border-color: var(--global-control-border-color);
            border-left: 0;
        }
        .emoji-list {
            position: absolute;
            background: var(--vscode-input-background);
            top: 2.5em;
            z-index: 90;
            left: 0;
            color: var(--vscode-input-foreground);
            box-shadow: 0px 1px 2px 0px var(--vscode-input-border);
            overflow: hidden;
            .at-item,
            .emoji-item {
                padding: 6px 5px;
                user-select: none;
                cursor: pointer;
            }
            .current-at {
                background: rgba(100, 100, 100, 0.5);
            }
            }
            .emoji-list {
            display: flex;
            flex-direction: row;
            .emoji-item {
                img {
                width: 30px;
                }
            }
            }
    }
}
</style>
<style lang="less">

</style>