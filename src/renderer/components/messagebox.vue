<template>
    <section class="chat-editor" :class="{'chat-resizing': resize}" 
        @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'messagebox', instance: this}, true), true)"
    >
        <section class="chat-toolbar">
            <input type="file" name="images" accept="image/*" ref="file" v-show="false" @change="uploadImg">
            <Button v-if="!comment" type="text" class="msg-control" @click="clear()" title="消息清屏">
                <Icon custom="fa fa-refresh"/>
            </Button>
            <Button type="text" class="msg-control" @click="$refs['file'].click()"
                :title="uploading ? '上传中...' : '上传图片'"
                :loading="uploading">
                <Icon class="btn-icon" custom="fa fa-picture-o"/>
            </Button>
            <Button type="text" class="msg-control emoji-btn" :class="{ 'active': emojiForm }"
                @click="emojiForm = !emojiForm" 
                title="发表情"><Icon custom="fa fa-smile-o"/></Button>
            <Button v-if="chatroom" type="text" class="msg-control"
                @click="modalBarrage = true" title="发弹幕"><Icon custom="fa fa-bullhorn"/></Button>
            <Button v-if="chatroom" type="text" class="msg-redpacket msg-control" title="发红包" @click="sendRedpacket">
                <svg class="redpacket-icon">
                    <use xlink:href="#redPacketIcon"></use>
                </svg>
            </Button>
            <Emoji class="emoji-form" ref="emoji" v-show="emojiForm" @emoji="pushEmoji" />
            <Modal
                v-model="modalBarrage"
                title="发个弹幕"
                :loading="sending"
                @on-ok="sendBarrage">
                <p>发送弹幕每次将花费 <b>{{ barragePay.cost }}</b> <span>{{ barragePay.unit }}</span>；最大长度32字符。</p>
                <section class="barrage-form">
                    <ColorPicker v-model="barrage.color" />
                    <Input v-model="barrage.word" placeholder="弹幕" @keydown.enter="sendBarrage" max-length="32" />
                </section>
            </Modal>
            <Button v-if="comment" type="text" class="msg-control" :class="{ 'active': comment.commentAnonymous }"
                @click="$emit('anonymous', !comment.commentAnonymous)" 
                title="匿名"><Icon custom="fa-solid fa-mask"/></Button>
            <Button v-if="comment" type="text" class="msg-control" :class="{ 'active': comment.commentVisible }"
                @click="$emit('visible', !comment.commentVisible)" 
                title="仅楼主可见"><Icon custom="fa-solid fa-lock"/></Button>
        </section>
        <section class="chat-sender-resize" @mousedown="resizeBegin"><hr></section>
        <section class="chat-sender">
            <section class="chat-msg ivu-input-wrapper ivu-input-wrapper-default ivu-input-type-textarea">
                <textarea data-menu="true"
                    spellcheck="false"
                    ref="message"
                    v-model="msg" 
                    type="textarea" 
                    :placeholder="placeholder"
                    :rows="3"
                    @keydown.enter.exact.prevent
                    @keyup.enter.exact="sendMsg"
                    @keyup.enter.ctrl.exact="msg += '\n'"
                    class="ivu-input ivu-input-no-border"
                    :style="{
                        height: msgHeight + 'px'
                    }"
                >
                </textarea>
            </section>
            <Button
                :style="{
                    height: msgHeight + 'px'
                }"
                class="chat-send"
                @click="sendMsg"
                :loading="sending"
            >
                <Icon v-if="!sending" custom="fa fa-paper-plane" />
            </Button>
            <section class="msg-more">
                <Tooltip placement="top-start" v-if="quote" :max-width="innerWidth * .8">
                    <Tag closable @on-close="$emit('update:quote', null)" color="success" v-if="quote">回复：@{{quote.userName}}</Tag>
                    <div slot="content">
                        <div class="msg-quote-tip md-style" v-html="quote.content"></div>
                    </div>
                </Tooltip>
                <Tooltip placement="top-start" v-if="reply && reply.oId" :max-width="innerWidth * .8">
                    <Tag closable @on-close="$emit('update:reply', null)" color="success">回复：@{{reply.userName}}</Tag>
                    <div slot="content">
                        <div class="msg-quote-tip md-style" v-html="reply.content"></div>
                    </div>
                </Tooltip>
                <Tag closable @on-close="$emit('update:discussed', null)" color="primary" v-if="discussed">#{{discussed}}#</Tag>
            </section>
        </section>
    </section>
</template>

<script>
  import { position } from 'caret-pos';
  import Emoji from './emoji.vue';
  export default {
    name: 'messagebox',
    components: {
        Emoji
    },
    props: {
        quote: {
            type: Object,
        },
        reply: {
            type: Object,
        },
        discussed: {
            type: String,
        },
        chatroom: {
            type: Boolean,
            default: true
        },
        placeholder: {
            type: String,
            default: '简单聊聊'
        },
        comment: {
            type: Object,
        }
    },
    mounted () {
        this.autocompleteBroad.addEventListener("message", ({ data }) => {
            switch(data.type) {
                case 'at': this.atUser(data.value); break;
                case 'emoji': this.addEmoji(data.value); break;
            }
        }, false);
        if (this.chatroom) {
            this.$fishpi.chatroom.barragePay().then(data => this.barragePay = data);
        }
        document.addEventListener('paste', this.onPaste);
        document.addEventListener('mousemove', this.resizeMove);
        document.addEventListener('mouseup', this.resizeEnd);
        document.addEventListener('click', this.closeEmoji);
    },
    beforeDestroy() {
        document.removeEventListener('mouseup', this.resizeEnd);
        document.removeEventListener('mousemove', this.resizeMove);
        document.removeEventListener('paste', this.onPaste);
        document.removeEventListener('click', this.closeEmoji);
        this.autocompleteBroad.close();
    },
    data () {
        return {
            msg: '',
            sending: false,
            emojiForm: false,
            faceForm: false,
            lastCursor: 0,
            uploading: false,
            resize: false,
            msgHeight: localStorage.getItem('message-height') || 80,
            autocompleteBroad: new BroadcastChannel('autocomplete-choose'),
            modalBarrage: false,
            barragePay: {
                cost: 20,
                unit: '积分'
            },
            barrage: {
                word: '',
                color: '#FFFFFF',
            },
            atList: [],
            msgDebounce: 0,
        }
    },
    watch: {
        msg(val) {
            if (this.msgDebounce) clearTimeout(this.msgDebounce);
            this.msgDebounce = setTimeout(() => {
                this.msgDebounce = 0;
                let data = val.slice(0, this.msgCursor());
                let matAt = data.match(/@([^\s]+?)$/);
                let matEmoji = data.match(/:([^:]+?)$/);
                if (matAt) this.getAt(matAt[1]);
                else if (matEmoji) this.getEmoji(matEmoji[1]);
                else this.sendAutoComplete(this.atList = [], 'at');
            }, 5)
        },
        quote (val) {
            if (val == null) this.msg =  this.msg.replace(/^并说：/, '');
            else if(!this.msg.startsWith('并说：')) this.msg = '并说：' + this.msg;
        },
        emojiForm(val) {
            if(this.emojiForm) {
                this.$refs.emoji.loadFav();
            }
        }
    },
    filters: {
    },
    computed: {
        current() {
            return this.$root.current;
        },
        innerWidth() {
            return window.innerWidth
        },
        client() {
            return {
                'win32': 'Windows',
                'darwin': 'MacOS',
                'linux': 'Linux',
            }
        }
    },
    methods: {
        clearMsg() {
            this.msg = '';
        },
        closeEmoji(ev) {
            if (!ev.target.closest('.emoji-form') && !ev.target.closest('.emoji-btn')) {
                this.emojiForm = false;
                return false;
            }
        },
        async sendBarrage() {
            if (!this.barrage.word) return;
            this.sending = true;
            let rsp = await this.$fishpi.chatroom.barrage(this.barrage.word, this.barrage.color);
            this.sending = false;
            if (rsp.error) this.$Message.error(rsp.msg);
            else {
                this.modalBarrage = false;
                this.barrage.word = '';
                this.$Message.success(rsp.msg);
            }
        },
        async sendMsg() {
            if (this.sending) return;
            this.msg = this.toMusicBox(this.msg);
            if (this.comment) {
                return await this.$emit('send', this.msg);
            }
            else if (this.chatroom) {
                return await this.sendChatroom();
            }
            else {
                if (this.quote) {
                    let raw = this.quote.markdown;
                    raw = raw.split("\n").map((r) => `>${r}`).join("\n").trim();
                    this.msg = `回复：\n\n${raw}\n\n${this.msg}`;
                    this.$emit('update:quote', null)
                }
                this.sending = true;
                this.$emit('send', this.msg, (error) => {
                    this.sending = false;
                    if (error) this.$Message.error(rsp.msg);
                    else this.msg = '';
                });
            }
        },
        async sendChatroom() {
            if (!this.msg) return;
            let msg = this.msg;
            if (this.quote) {
                let raw = this.quote.md || await this.$fishpi.chatroom.raw(this.quote.oId);
                raw = raw.split("\n").map((r) => `>${r}`).join("\n").trim();
                let at = this.quote.userName != this.current.userName
                    ? `@${this.quote.userName} `
                    : "";
                msg = `回复${at}：\n\n${raw}\n\n${msg}`;
                this.$emit('update:quote', null)
            }
            if (this.discussed) {
                msg += `\r\n*\`# ${this.discussed} #\`*`
                this.$emit('update:discussed', null)
            }
            msg = msg.replace(/<span class="[^"]+-message"\/>/g, '')
            msg = await this.$ipc.sendSync('fishpi.hooks.sendMsg', { msg });
            if (msg) {
                let src_msg = this.msg;
                this.msg = "";
                this.sending = true;
                let rsp = await this.$root.sendMsg(msg);
                this.sending = false;
                if (!rsp) return;
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    this.msg = src_msg;
                    return false;
                }
                window.scrollTo(0, 0);
            }
            return true;
        },
        clear() {
            this.$emit('clear');
        },
        toMusicBox(msg) {
            let songRegexp = /http(?:s):\/\/music.163.com\/(?:#\/|)song\?id=(\d+)(&[\w=]+)*/g;
            let listRegexp = /http(?:s):\/\/music.163.com\/(?:#\/|)album\?id=(\d+)(&[\w=]+)*/g;
            if (msg.match(songRegexp)) msg = msg.replace(songRegexp, `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=100% height=52 src="//music.163.com/outchain/player?type=2&id=$1&auto=0&height=32"></iframe>`);
            else if (msg.match(listRegexp)) msg = msg.replace(listRegexp, `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=100% height=210 src="//music.163.com/outchain/player?type=1&id=$1&auto=0&height=430"></iframe>`)
            return msg;
        },
        sendRedpacket() {
            this.$ipc.send('main-event', {
                call: 'openRedpacket',
                args: 'send'
            })
        },
        async onPaste(ev) {
            let items = ev.clipboardData && ev.clipboardData.items;
            let file = [];
            if (items && items.length) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        file.push(items[i].getAsFile());
                        break;
                    }
                    if (items[i].type.indexOf('html') !== -1 && this.htmlGetImg) {
                        let files = await this.htmlGetImg(items[i])
                        files = files || []
                        files = files.map(f => constructFileFromLocalFileData(new LocalFileData(f.replace(/file:\/\/\//g, ''))))
                        file = file.concat(files);
                    }
                }
            }
            if (file.length == 0) return;
            this.lastCursor = this.msgCursor();
            await this.uploadImg({ target: { files: file}});
        },
        async uploadImg(ev) {
            let files = Array.from(ev.target.files);
            this.uploading = true;
            let rsp = await this.$fishpi.upload(files);
            this.uploading = false;
            if (rsp.code != 0) {
                this.$Message.error(rsp.msg);
                return;
            }
            let fileData = rsp.data.succMap;
            let filenames = Object.keys(fileData)
            
            this.lastCursor = this.msgCursor();
            this.appendMsg({ regexp: null, data: filenames.map(f => `![${f}](${fileData[f]})`).join('') }); 
        },
        msgCursor() {
            return this.$refs['message'].selectionStart
        },
        async getCaretPos() {
            let winPos = (await this.$ipc.sendSync('main-event', {
                call: 'getPosition',
            })).data
            let msgPos = this.$root.getElementPosition(this.$refs['message']);
            let caretPos = position(this.$refs['message']);
            return {
                x: msgPos.x + caretPos.left + winPos.x,
                y: msgPos.y + caretPos.top + caretPos.height + winPos.y
            }
        },
        async sendAutoComplete(list, type, direct) {
            new BroadcastChannel('autocomplete').postMessage({ list, type, direct, caret: await this.getCaretPos() });
        },
        async getAt(name) {
            if (!name) return;
            try {
                this.atList = await this.$fishpi.names(name);
                let autocomplete = this.atList.map(a => ({ 
                    value: a.userName, text: a.userName, img: a.userAvatarURL48
                }))
                this.sendAutoComplete(autocomplete, 'at');
                this.lastCursor = this.msgCursor();
            } catch (error) {
                
            }
        },
        atUser(value) {
            let data = '@' + value + ' ';
            this.appendMsg({ regexp: /@([^\s]*?)$/, data })
            this.$nextTick(() => this.sendAutoComplete([], 'at'));
        },
        getEmoji(name) {
            if (!name || name.length < 1) return;
            let autocomplete = Object.keys(this.$fishpi.emoji.default)
                .filter(e => e.startsWith(name))
                .slice(0, 5).map(e => ({ value: e, img: this.$fishpi.emoji.default[e] }));
            this.sendAutoComplete(autocomplete, 'emoji', 'row');
            this.lastCursor = this.msgCursor();
        },
        addEmoji(value) {
            let data = `:${value}:`;
            this.sendAutoComplete([], 'emoji');
            this.appendMsg({ regexp: /:([^:]+?)$/, data })
        },
        appendMsg({ regexp, data }){
            let preMsg = this.msg.slice(0, this.lastCursor)
            if(regexp) preMsg = preMsg.replace(regexp, data);
            else preMsg += data;
            this.msg = preMsg + this.msg.slice(this.lastCursor);
            this.$nextTick(() => {
                this.sendAutoComplete([], 'at');
                this.$refs.message.focus();
                this.$refs.message.setSelectionRange(preMsg.length, preMsg.length)
            });
        },
        pushEmoji(emoji) {
            this.lastCursor = this.msgCursor();
            if (emoji.type == 'emoji') {
                this.appendMsg({ regexp: null, data: `:${emoji.value}:` });
            }
            else if(emoji.type == 'fav') {
                this.appendMsg({ regexp: null, data: `![图片表情](${emoji.value})` });
            }
            this.emojiForm = false;
        },
        resizeBegin(ev) {
            this.resize = true;
            ev.preventDefault()
        },
        resizeMove(ev) {
            if (!this.resize) return;
            let height = window.innerHeight - ev.clientY - 1;
            console.log(height)
            this.msgHeight = height;
            localStorage.setItem('message-height', height);
        },
        resizeEnd(ev) {
            this.resize = false;
        }
    }
  }
</script>

<style lang="less" scoped>
.chat-editor {
    display: flex;
    flex-direction: column;
    box-shadow: 0px -1px 1px 0px rgba(255, 255, 255, .1);
    &.chat-resizing {
        cursor: row-resize;
        .ivu-input {
            cursor: row-resize;
        }
        .chat-sender-resize {
            hr {
                cursor: row-resize;
                border-color: var(--global-active-color);
            }
        }
    }
    .chat-toolbar {
        display: flex;
        align-items: center;
        position: relative;
        .msg-redpacket {
            padding: 0 8px;
            svg {
                width: 20px;
                height: 20px;
                display: inline;
                vertical-align: middle;
            }
        }
        .ivu-btn.ivu-btn-loading {
            .btn-icon {
                display: none;
            }
        }
        .active {
            color: var(--global-active-color);
            background-color: transparent;
        }
    }
    .chat-sender-resize {
        cursor: row-resize;
        hr {
            height: 0;
            border: 2px solid var(--global-background-color);
            border-left: 0;
            border-right: 0;
            &:hover {
                border-color: var(--global-active-color);
            }
        }
    }
    .chat-sender {
        display: flex;
        width: 100%;
        position: relative;
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
        .msg-more {
            position: absolute;
            bottom: 0;
            left: 0;
        }
        .ivu-input {
            resize: none;
        }
    }
}
.barrage-form {
    display: flex;
}
</style>
<style lang="less">

</style>