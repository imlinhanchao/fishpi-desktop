<template>
<section class="redpacket-window">
    <section class="redpacket-control">
        <Button type="text" @click="close"><Icon custom="fa fa-times"></Icon></Button>
    </section>
    <section class="redpacket" v-if="redpacketData != null">
        <section class="redpacket-bg"></section>
        <header>
            <p class="redpacket-title"><Avatar :src="redpacketData.info.userAvatarURL" size="small"/> {{redpacketData.info.userName}} 的红包 </p>
            <p class="redpacket-msg">{{redpacketData.info.msg}}</p>
            <p class="redpacket-count">总计{{redpacketData.info.got}}/{{redpacketData.info.count}}</p>
        </header>
        <main class="redpacket-content">
            <section>
                <p class="redpacket-current redpacket-money">
                    {{redpacketTitle}}
                </p>
            </section>
            <section class="redpacket-list">
                <ul>
                    <li v-for="w in redpacketData.who" :style="{ fontWeight: maxRedpacket == w.userMoney ? 'bolder' : 'normal' }">
                        <span class="redpacket-user"><Avatar :src="w.avatar" /> {{w.userName}}</span>
                        <span class="redpacket-max redpacket-tip" 
                            v-if="redpacketData.who.find(w => w.userMoney == maxRedpacket).userName == w.userName 
                            && redpacketData.info.got == redpacketData.info.count
                            ">来自老王的认可</span>
                        <span class="redpacket-zero redpacket-tip" v-if="0 == w.userMoney">0 溢事件</span>
                        <span class="redpacket-money">{{w.userMoney}} 积分</span>
                    </li>
                </ul>
            </section>
        </main>
    </section>
    <section class="redpacket redpacket-form" v-if="isSend">
        <section class="redpacket-bg"></section>
        <header class="no-drag">
            <p class="redpacket-title"><span>发个</span>
                <Select v-model="redpacket.type">
                    <Option v-for="item in redpacketType" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            <span>红包</span></p>
        </header>
        <Form class="no-drag" ref="redpacketForm" :model="redpacket" :label-width="60" :show-message="false">
            <FormItem label="发给谁" v-if="isSpecify">
                <section class="user-list">
                    <span v-for="u in onlineList" @click="reciverCheck(u)"
                        class="user-item" 
                        :title="u.userName" 
                        :class="{ 'user-check': redpacket.recivers.indexOf(u.userName) >= 0 }">
                        <Avatar :src="u.userAvatarURL"></Avatar>
                    </span>
                </section>
            </FormItem>
            <FormItem label="积分"><InputNumber v-model="redpacket.money" :min="32" :max="20000" placeholder="积分" /></FormItem>
            <FormItem v-if="isRockPaperScissors" label="个数"><InputNumber v-model="redpacket.count" :min="1" :max="1000" placeholder="个数" /></FormItem>
            <FormItem label="留言"><Input type="textarea" :rows="3" v-model="redpacket.msg" :placeholder="defaultRedpackWord[redpacket.type]" /></FormItem>
        </Form>
        <div class="no-drag">
            <Button class="redpacket-send" type="error" @click="sendRedpacket">包红包</Button>
        </div>
    </section>
</section>
</template>

<script>
  export default {
    name: 'redpacket',
    components: {
    },
    mounted () {
        document.body.addEventListener('keydown', (ev) => {
            if (ev.keyCode == 27) this.close();
        });
        this.$fishpi.chatroom.addListener(({ msg }) => {
            if (msg.type == 'online') this.onlineList = msg.data;
        });
        if (this.isSend) return;
        this.load(this.$route.params);
    },
    data () {
        return {
            redpacketData: null,
            redpacket: {
                type: 'random',
                money: 32,
                count: 2,
                msg: '',
                recivers: []
            },
            onlineList: []
        }    
    },
    watch: {
    },
    filters: {
    },
    computed: {
        current() {
            return this.$store.getters['fishpi/account'];
        },
        isSend() {
            return this.$route.params.id == 'send'
        },
        maxRedpacket() {
            return this.redpacketData && Math.max(...this.redpacketData.who.map(a => a.userMoney))
        },
        redpacketTitle() {
            let money = this.redpacketData.who.find(
                (w) => w.userName == this.current.userName
            );
            this.redpacketData.recivers = this.redpacketData.recivers || [];
            this.redpacketData.recivers = this.redpacketData.recivers.filter(r => r && typeof(r) == 'string');
            let specify = (this.redpacketData.recivers.length && this.redpacketData.recivers.indexOf(this.current.userName) >= 0)
            let msg;
            if (this.redpacketData.recivers.length && !specify) {
                msg = "会错意了"
            } else if (!money) {
                msg = "错过一个亿";
            } else {
                msg = money.userMoney == 0
                    ? "抢了个寂寞"
                    : `${money.userMoney} 积分`;
            }

            return msg
        },
        redpacketType() {
            return [
                { label: '拼手气红包', value: 'random' },
                { label: '普通红包', value: 'average' },
                { label: '专属红包', value: 'specify' },
                { label: '心跳红包', value: 'heartbeat' },
                { label: '猜拳红包', value: 'rockPaperScissors' },
            ]
        },
        isSpecify() {
            return this.redpacket.type == 'specify';
        },
        isRockPaperScissors() {
            return this.redpacket.type == 'rockPaperScissors';
        },
        defaultRedpackWord() {
            return {
                random: '摸鱼者，事竟成！',
                average: '平分红包，人人有份！',
                specify: '试试看，这是给你的红包吗？',
                heartbeat: '玩的就是心跳！'
            }
        },
    },
    methods: {
        async load({ id, gesture }) {
            await this.$store.dispatch('fishpi/getInfo');
            let rsp = await this.$fishpi.chatroom.redpacket.open(id, gesture);
            if (!rsp) return;
            this.redpacketData = rsp;
        },
        async sendRedpacket() {
            if (this.redpacket.count <= 0) return;
            if (this.redpacket.type == 'specify' && this.redpacket.recivers.length == 0) {
                this.$Message.error('请至少选择一个人收红包');
                return;
            }
            let redpacket = Object.assign({}, this.redpacket);
            redpacket.msg = redpacket.msg || this.defaultRedpackWord[redpacket.type];
            let data = { 
                msg: redpacket.msg, 
                money: redpacket.money, 
                count: redpacket.count,
                recivers: redpacket.recivers,
                type: redpacket.type
            } 
            await this.$fishpi.chatroom.send(`[redpacket]${JSON.stringify(data)}[/redpacket]`);
            this.close();
        },
        reciverCheck(user) {
            let index = this.redpacket.recivers.indexOf(user.userName);
            if(index < 0) this.redpacket.recivers.push(user.userName);
            else this.redpacket.recivers.splice(index, 1);
        },
        close() {
            window.close();
        }
    }
  }
</script>

<style lang="less" scoped>
.redpacket-control {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 1000;
    -webkit-app-region: no-drag;
    .ivu-icon {
        color: var(--redpacket-text-color);
    }
}
.redpacket {
    position: relative;
    margin: auto;
    border-radius: 10px;
    color: var(--redpacket-text-color);
    padding: 10px;
    overflow: hidden;
    background: var(--redpacket-background-color);
    z-index: 100;
    height: 100vh;
    display: flex;
    flex-direction: column;
    header {
        position: relative;
        z-index: 2;
        text-align: center;
    }
    .redpacket-bg {
        border-radius: 300px;
        width: 600px;
        height: 600px;
        border: 2px solid var(--redpacket-border-color);
        background: var(--redpacket-header-background-color);
        position: absolute;
        top: -420px;
        left: -175px;
        z-index: 1;
    }
    .redpacket-msg {
        color: #24292e;
        font-size: .8em;
        min-height: 2em;
    }
    .redpacket-user {
        width: calc(100% - 70px);
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
    }
    .redpacket-money {
        color: #fee3aa;
    }
    .redpacket-content {
        position: relative;
        padding-top: 0;
        z-index: 2;
        color: var(--redpacket-username-color);
        display: flex;
        flex-direction: column;
        height: 100%;
        ul {
            list-style: none;
            padding: 0;
            li {
                margin: 10px 0;
                display: flex;
                justify-content: space-between;
                position: relative;
            }
        }
    }
    .redpacket-current {
        color: var(--redpacket-text-color);
        text-align: center;
        font-size: 1.5em;
        margin: 10px 0 30px;
        &.redpacket-money {
            font-size: 2em;
            margin-top: 5px;
        }
    }
    .redpacket-list {
        height: 100%;
        overflow: auto;
        padding: 5px;
    }
    .redpacket-tip {
        cursor: default;
        position: absolute;
        font-size: .6em;
        padding: 0 5px;
        left: 35px;
        top: 2.5em;
        border-radius: 5px;
        font-weight: normal;
        &.redpacket-max {
            color: var(--redpacket-max-tip-text-color);
            background-color: var(--redpacket-max-tip-background-color);
            border-color: var(--redpacket-max-tip-border-color);
        }
        &.redpacket-zero {
            color: var(--redpacket-zero-tip-text-color);
            background-color: var(--redpacket-zero-tip-background-color);
            border-color: var(--redpacket-zero-tip-border-color);
        }
    }
}

.redpacket-form {
    header {
        margin: 2em auto;
        .ivu-select {
            width: 9em;
        }

    }
    .redpacket-bg {
        top: -500px;
    }
    .ivu-form-item {
        margin-bottom: 5px;
    }
    .user-list {
        max-width: 80vw;
        max-height: 6em;
        overflow: auto;
        .user-item {
            display: inline-block;
            margin: 2px;
        }
        .user-check {
            .ivu-avatar-image {
                border: 2px inset #000;
                box-shadow: 0 0 5px #000;
            }
        }
    }
    .redpacket-send {
        width: 100%;
        color: var(--redpacket-header-background-color);
        background: var(--redpacket-border-color);
        border: 2px solid var(--redpacket-border-color);
        border-radius: 10px;
        font-weight: bold;
    }
}
</style>
<style lang="less">
.redpacket-form {
    .ivu-form .ivu-form-item-label {
        color: inherit;
        font-weight: bold;
    }
    .ivu-select-selection {
        background: transparent;
        color: var(--redpacket-text-color);
        border: 0;
        box-shadow: none;
        .ivu-select-selected-value {
            font-size: 130%;
            font-weight: bold;
        }
    }
    .ivu-select-arrow {
        color: var(--redpacket-text-color);
    }
    
    .ivu-select-dropdown {
        background: var(--redpacket-text-color);
        color: #000;
        .ivu-select-item {
            color: inherit;
        }
    }
    .ivu-input-number-handler-wrap, .ivu-input-number-handler-down{
        background: transparent;
        border: 0;
    }
    .ivu-input-number-handler-down-inner, .ivu-input-number-handler-up-inner {
        color: var(--redpacket-text-color);
        &:hover {
            color: var(--redpacket-text-color);
        }
    }
    .ivu-input, .ivu-input-number, input {
        background: transparent;
        border: 0;
        outline: 0;
        box-shadow: none;
        border-bottom: 2px solid var(--redpacket-border-color);
        color: #FFF;
        &::-webkit-input-placeholder {
            color: #CECECE
        }
    }
}
</style>