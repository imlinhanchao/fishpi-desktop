<template>
<div id="chats" class="layout" v-if="current" @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'chats', instance: this}))">
    <section class="sidebar">
        <div class="chat-item" title="添加聊天用户" @click="chatWho">
            <Icon custom="fa fa-plus" />
        </div>        
        <ul class="chat-list">
            <li class="chat-item user-card" v-bind:key="userName(user)"
             :class="{ 'chat-active-item': userName(user) == $route.params.user }" 
             v-for="user in users" @click="chatTo(userName(user))" :data-user="userName(user)" :data-time="3">
                <Badge :count="user.unread" :dot="true" :title="`${user.unread}条未读私信`">
                    <Avatar :src="avatar(user)" :class="{ 'chat-active': userName(user) == $route.params.user }"/>
                </Badge>
            </li>
        </ul>
    </section>
    <section class="content">
        <section class="user-form" v-show="userForm">
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
            this.autocompleteBroad.addEventListener("message", ({ data }) => {
                switch(data.type) {
                    case 'user': 
                        this.chatTo(data.value);
                        this.user = ''
                        break;
                }
            }, false);

            this.$fishpi.chat.addListener(this.newMsgEvent);

            if (this.$route.params.user) {
                this.chatTo(this.$route.params.user)
            }
        },
        beforeDestroy () {
            this.autocompleteBroad.close();
            this.unLoad();
        },
        data () {
            return {
                users: [],
                newUser: [],
                userForm: false,
                user: '',
                autocompleteBroad: new BroadcastChannel('autocomplete-choose')
            }    
        },
        watch: {
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
            unLoad() {
                this.$fishpi.chat.removeListener(this.newMsgEvent);
            },
            newMsgEvent({msg}) {
                switch (msg.command) {
                    case 'chatUnreadCountRefresh':
                        if(msg.count > 0) this.loadUnread();
                        else this.users.forEach((u, i) => {
                            this.users[i].unread = 0;
                        });
                        break;
                    case 'newIdleChatMessage':
                        let i = this.users.findIndex(u => u.userName == msg.senderUserName);
                        this.users[i].unread = this.users[i].unread + 1;
                        break;
                }
            },
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
            async loadUnread() {
                let rsp = await this.$fishpi.chat.unread();
                this.users.forEach((u, i) => {
                    this.users[i].unread = 0;
                })
                rsp.data.forEach(d => {
                    let user = d.senderUserName;
                    let index = this.users.findIndex(u => u.userName == user);
                    this.users[index].unread = this.users[index].unread + 1;
                })
            },
            async load() {
                let rsp = await this.$fishpi.chat.list();
                this.users = rsp.data.map(d => ({ unread: 0, userName: this.userName(d), ...d }));
                await this.loadUnread();
            },
            appendMsg(msg) {
                this.$refs.msgbox.appendMsg({ regexp: null, data: msg });
            },
            avatar(item) {
                if (item.senderUserName == this.current.userName) return item.receiverAvatar;
                else return item.senderAvatar;
            },
            userName(item) {
                if (!item) return '';
                if (item.senderUserName == this.current.userName) return item.receiverUserName;
                else return item.senderUserName;
            },
            async chatTo(user) {
                let index = this.users.findIndex(u => this.userName(u) == user);
                this.sendAutoComplete([], 'user');
                if (index < 0) {
                    let data = await this.$fishpi.user(user);
                    if (data.code) return this.$Message.error('用户不存在');
                    let userItem = {
                        senderUserName: user,
                        receiverUserName: this.current.userName,
                        senderAvatar: data.userAvatarURL,
                        receiverAvatar: this.current.userAvatarURL,
                        unread: 0,
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
    .sidebar {
        display: flex;
        flex-direction: column;
        .chat-list {
            list-style: none;
            height: 100%;
            overflow: auto;
        }
        .chat-item {
            padding: 10px;
            cursor: pointer;
            text-align: center;
            .chat-active {
                box-shadow: 0 0 5px var(--global-active-color);
            }
            &.chat-active-item, &:hover {
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