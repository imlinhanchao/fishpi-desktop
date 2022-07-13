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
    <section class="redpacket" v-if="isSend">
        
    </section>

</section>
</template>

<script>
  export default {
    name: 'redpacket',
    components: {
    },
    mounted () {
        if (this.isSend) return;
        this.load(this.$route.params);
        document.body.addEventListener('keydown', (ev) => {
            if (ev.keyCode == 27) this.close();
        })
    },
    data () {
        return {
            redpacketData: null,
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
    },
    methods: {
        async load({ id, gesture }) {
            await this.$store.dispatch('fishpi/getInfo');
            let rsp = await this.$fishpi.chatroom.redpacket.open(id, gesture);
            if (!rsp) return;
            this.redpacketData = rsp;
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
    background: #f25745;
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
        background: var(--redpacket-background-color);
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
</style>