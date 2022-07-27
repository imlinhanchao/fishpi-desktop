<template>
<div class="layout">
    <section class="sidebar">
        <ul class="chat-list">
            <li class="chat-item" v-for="user in users" @click="chatTo(user)">
                <Avatar :src="avatar(user)" />
            </li>
        </ul>
    </section>
    <section class="content">
        <router-view ref="content"/>
    </section>
</div>
</template>

<script>
    export default {
        name: 'chats',
        components: {
        },
        async mounted () {
            await this.load()
        },
        data () {
            return {
                users: [],
            }    
        },
        watch: {
        },
        filters: {
        },
        computed: {
            current() {
                return this.$root.current;
            },
        },
        methods: {
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
            chatTo(item) {
                let user = ''
                if (item.senderUserName == this.current.userName) user = item.receiverUserName;
                else user = item.senderUserName;
                this.$router.push(`/chat/${user}`)
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
        padding: 5px;
        .chat-item {
            margin: 5px;
            cursor: pointer;
        }
    }
}
</style>