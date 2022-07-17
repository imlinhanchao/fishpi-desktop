<template>
    <section class="chat-editor">
        <section class="chat-toolbar">
            <input type="file" name="images" accept="image/*" ref="file" v-show="false" @change="uploadImg">
            <Button type="text" class="msg-control" @click="clear()" title="消息清屏">
                <Icon custom="fa fa-refresh"/>
            </Button>
            <Button type="text" class="msg-control" @click="$refs['file'].click()"
                :title="uploading ? '上传中...' : '上传图片'"
                :loading="uploading">
                <Icon class="btn-icon" custom="fa fa-picture-o"/>
            </Button>
            <Button type="text" class="msg-control" :class="{ 'active-emoji': emojiForm }"
                @click="emojiForm = !emojiForm" 
                title="发表情"><Icon custom="fa fa-smile-o"/></Button>
            <Button type="text" class="msg-redpacket msg-control" title="发红包" @click="sendRedpacket">
                <svg class="redpacket-icon">
                    <use xlink:href="#redPacketIcon"></use>
                </svg>
            </Button>
            <Emoji ref="emoji" v-show="emojiForm" @emoji="pushEmoji" />
        </section>
        <section class="chat-sender">
            <section class="chat-msg ivu-input-wrapper ivu-input-wrapper-default ivu-input-type-textarea">
                <textarea data-menu="true"
                    spellcheck="false"
                    ref="message"
                    v-model="msg" 
                    type="textarea" 
                    placeholder="简单聊聊"
                    :rows="3"
                    @keydown.enter.exact.prevent
                    @keyup.enter.exact="sendMsg"
                    @keyup.enter.ctrl.exact="msg += '\n'"
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
            <section class="msg-more">
                <Tooltip placement="top-start" v-if="quote" :max-width="innerWidth * .8">
                    <Tag closable @on-close="quote=null" color="success" v-if="quote">回复：@{{quote.userName}}</Tag>
                    <div slot="content">
                        <div class="msg-quote-tip md-style" v-html="quote.content"></div>
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
        discussed: {
            type: String,
        },
        chatroom: {
            type: Boolean,
            default: true
        },
    },
    mounted () {
        new BroadcastChannel('autocomplete-choose').addEventListener("message", ({ data }) => {
            switch(data.type) {
                case 'at': this.atUser(data.value); break;
                case 'emoji': this.addEmoji(data.value); break;
            }
        }, false);
        document.removeEventListener('paste', this.onPaste);
        document.addEventListener('paste', this.onPaste);
    },
    data () {
        return {
            msg: '',
            sending: false,
            emojiForm: false,
            faceForm: false,
            lastCursor: 0,
            uploading: false,
        }
    },
    watch: {
        msg(val) {
            let data = val.slice(0, this.msgCursor());
            let matAt = data.match(/@([^\s]+?)$/);
            let matEmoji = data.match(/:([^:]+?)$/);
            if (matAt) this.getAt(matAt[1]);
            else if (matEmoji) this.getEmoji(matEmoji[1]);
            else this.sendAutoComplete([], 'at');
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
        }
    },
    methods: {
        async sendMsg() {
            if (this.chatroom) {
                return this.sendChatroom();
            }
        },
        async sendChatroom() {
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
            this.$emit('clear');
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
                    if (items[i].type.indexOf('html') !== -1) {
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
                let atList = await this.$fishpi.names(name);
                let autocomplete = atList.map(a => ({ 
                    value: a.userName, text: a.userName, img: a.userAvatarURL48
                }))
                this.sendAutoComplete(autocomplete, 'at');
                this.lastCursor = this.msgCursor();
            } catch (error) {
                
            }
        },
        atUser(value) {
            let data = '@' + value + ' ';
            this.sendAutoComplete([], 'at');
            this.appendMsg({ regexp: /@([^\s]*?)$/, data })
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
        }
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
        .active-emoji {
            color: var(--global-active-color)
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
    }
}
</style>
<style lang="less">

</style>