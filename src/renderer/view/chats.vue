<template>
<div class="layout" v-if="current">
    <section class="sidebar">
        <ul class="chat-list">
            <li class="chat-item" title="添加聊天用户" @click="chatWho">
                <Icon custom="fa fa-plus" />
            </li>            
            <li class="chat-item" 
             :class="{ 'chat-active-item': userName(user) == $route.params.user }" 
             v-for="user in users" @click="chatTo(userName(user))">
                <Avatar :src="avatar(user)" :class="{ 'chat-active': userName(user) == $route.params.user }"/>
            </li>
        </ul>
    </section>
    <section class="content">
        <section class="user-form" v-if="userForm">
            <Input type="text" ref="users" v-model="user"
                placeholder="想和谁聊聊？"
                @on-keydown.enter="chatTo(user)"
                @on-keydown.esc="userForm = false"></Input>
        </section>
        <router-view ref="content"/>
    </section>
</div>
</template>

<script>
  import { position } from 'caret-pos';
    export default {
        name: 'chats',
        components: {
        },
        async mounted () {
            await this.load()
            new BroadcastChannel('autocomplete-choose').addEventListener("message", ({ data }) => {
                switch(data.type) {
                    case 'user': 
                        this.sendAutoComplete([], 'user');
                        this.chatTo(data.value);
                        this.user = ''
                        break;
                }
            }, false);

            if (this.$route.params.user) {
                this.chatTo(this.$route.params.user)
            }
        },
        data () {
            return {
                users: [],
                userForm: false,
                user: ''
            }    
        },
        watch: {
            $route() {
                this.$refs.content && this.$refs.content.unLoad && this.$refs.content.unLoad();
            },
            user () {
                this.getUser(this.user);
            },
            userForm() {
                if (!this.userForm) return;
                this.$nextTick(() => this.$refs.users.focus())
            }
        },
        filters: {
        },
        computed: {
            current() {
                return this.$root.current;
            },
        },
        methods: {
            async getUser(name) {
                if (!name) return;
                try {
                    let atList = await this.$fishpi.names(name);
                    let autocomplete = atList.map(a => ({ 
                        value: a.userName, text: a.userName, img: a.userAvatarURL48
                    }))
                    this.sendAutoComplete(autocomplete, 'user');
                } catch (error) {
                    
                }
            },
            async sendAutoComplete(list, type, direct) {
                new BroadcastChannel('autocomplete').postMessage({ list, type, direct, caret: await this.getCaretPos() });
            },
            async getCaretPos() {
                let winPos = (await this.$ipc.sendSync('main-event', {
                    call: 'getPosition',
                })).data
                let msgPos = this.$root.getElementPosition(this.$refs['users'].$el);
                let caretPos = position(this.$refs['users'].$el.getElementsByTagName('input')[0]);
                return {
                    x: msgPos.x + caretPos.left + winPos.x,
                    y: msgPos.y + caretPos.top + caretPos.height + winPos.y
                }
            },
            async load() {
                let rsp = await this.$fishpi.chat.list();
                console.dir(rsp);
                this.users = rsp.data;
            },
            appendMsg(msg) {
                this.$refs.msgbox.appendMsg({ regexp: null, data: msg });
            },
            avatar(item) {
                if (item.senderUserName == this.current.userName) return item.receiverAvatar;
                else return item.senderAvatar;
            },
            userName(item) {
                if (item.senderUserName == this.current.userName) return item.receiverUserName;
                else return item.senderUserName;
            },
            async chatTo(user) {
                let index = this.users.findIndex(u => this.userName(u) == user);
                if (index < 0) {
                    let data = await this.$fishpi.user(user);
                    let userItem = {
                        senderUserName: user,
                        receiverUserName: this.current.userName,
                        senderAvatar: data.userAvatarURL,
                        receiverAvatar: this.current.userAvatarURL,
                    }
                    this.users.unshift(userItem);
                }
                this.$router.push(`/chat/${user}`)
                this.userForm = false;
            },
            chatWho() {
                this.userForm = true;
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
    .chat-list {
        list-style: none;
        .chat-item {
            padding: 10px;
            cursor: pointer;
            text-align: center;
            .chat-active {
                box-shadow: 0 0 5px var(--global-active-color);
            }
            &.chat-active-item {
                background: var(--main-chatroom-background-color);
            }
        }
    }
    .content {
        width: 100%;
        position: relative;
        .user-form {
            position: absolute;
            top: 3em;
            width: 100%;
            text-align: center;
            z-index: 3;
            .ivu-input-wrapper {
                margin: 10px;
                max-width: 200px;
            }
        }
    }
}
</style>