<template>
<main ref="main" class="layout no-drag" @mouseleave="close" v-if="info" :style="background">
    <symbol id="iconPoints" viewBox="0 0 1024 1024"><path d="M18.963 493.037a493.037 493.037 0 1 0 986.074 0 493.037 493.037 0 1 0-986.074 0z" fill="#FDA203" p-id="6038"></path><path d="M512 151.704c208.593 0 379.26 170.666 379.26 379.259S720.592 910.223 512 910.223s-379.26-170.667-379.26-379.26S303.408 151.703 512 151.703m0-113.777c-273.067 0-493.037 219.97-493.037 493.037S238.933 1024 512 1024s493.037-219.97 493.037-493.037S785.067 37.926 512 37.926z" fill="#EF7819" p-id="6039"></path><path d="M512 113.778c208.593 0 379.26 170.666 379.26 379.259S720.592 872.297 512 872.297 132.74 701.63 132.74 493.036 303.408 113.777 512 113.777M512 0C238.933 0 18.963 219.97 18.963 493.037S238.933 986.074 512 986.074s493.037-219.97 493.037-493.037S785.067 0 512 0z" fill="#FFE32B" p-id="6040"></path><path d="M1005.037 458.904v34.133c0 174.46-91.022 326.163-227.556 413.393C906.43 796.444 993.66 637.156 1005.037 458.904z" fill="#FAEC92" p-id="6041"></path><path d="M18.963 493.037C18.963 219.97 238.933 0 512 0h26.548C269.274 15.17 56.888 238.933 56.888 512c0 155.496 72.06 299.615 182.045 390.637-132.74-87.23-219.97-238.933-219.97-409.6z m0 0C18.963 219.97 238.933 0 512 0h26.548C269.274 15.17 56.888 238.933 56.888 512c0 155.496 68.268 292.03 178.253 386.844C102.4 811.614 18.963 663.704 18.963 493.037z" fill="#F9DA12" p-id="6042"></path><path d="M496.83 705.422l-117.57 49.304c-18.964 7.585-41.72 0-49.304-18.963-3.793-3.793-3.793-11.378-3.793-18.963l15.17-121.363c0-11.378-3.792-18.963-7.585-26.548l-79.644-91.022c-15.17-15.17-11.378-37.926 3.792-53.097 0-7.585 7.585-11.377 11.378-11.377l121.363-26.549c11.378-3.792 18.963-7.585 22.756-15.17l64.474-106.193c11.377-18.962 34.133-22.755 53.096-11.377l11.378 11.377 64.474 106.193c3.792 7.585 15.17 15.17 22.755 15.17l121.363 26.549c18.963 3.792 30.341 22.755 26.548 45.51 0 7.586-3.792 11.378-7.585 15.171l-79.644 91.022c-7.585 7.585-7.585 18.963-7.585 26.548l11.377 121.363c0 22.756-15.17 37.926-34.133 41.719-7.585 0-11.378 0-18.963-3.793l-117.57-49.303c-11.378-3.793-15.17 0-26.548 3.792z" fill="#FE8624" p-id="6043"></path><path d="M735.763 185.837c-60.682-45.511-140.326-72.06-223.763-72.06-26.548 0-53.096 3.793-79.644 7.586L485.452 0H512c98.607 0 193.422 30.34 269.274 79.644l-45.511 106.193z" fill="#FFE853" p-id="6044"></path><path d="M496.83 690.252l-117.57 45.511c-18.964 7.585-41.72 0-49.304-18.963-3.793-3.793-3.793-11.378-3.793-18.963l11.378-121.363c0-11.378-3.793-18.963-7.585-26.548l-83.437-94.815c-15.17-15.17-11.378-37.926 3.792-53.096 3.793-3.793 11.378-7.585 15.17-7.585l121.363-26.549c11.378-3.792 18.963-7.585 22.756-15.17l64.474-106.192c11.378-18.963 34.133-22.756 53.096-11.378l11.378 11.378 68.267 102.4c3.792 7.585 15.17 15.17 22.755 15.17l121.363 26.548c18.963 3.793 34.134 26.548 26.548 45.511 0 7.585-3.792 11.378-7.585 15.17l-79.644 91.023c-7.585 7.585-11.378 18.963-7.585 26.548l11.377 121.363c0 22.755-15.17 37.926-34.133 41.718-7.585 0-11.378 0-18.963-3.792l-117.57-49.304c-7.585 7.585-18.963 7.585-26.548 11.378z" fill="#FFF42B" p-id="6045"></path><path d="M398.222 728.178l-18.963 7.585c-18.963 7.585-41.718 0-49.303-18.963-3.793-3.793-3.793-11.378-3.793-18.963l11.378-121.363c0-11.378-3.793-18.963-7.585-26.548l-83.437-94.815c-15.17-15.17-11.378-37.926 3.792-53.096 3.793-3.793 11.378-7.585 15.17-7.585l121.363-26.549c11.378-3.792 18.963-7.585 22.756-15.17l64.474-106.192c11.378-18.963 34.133-22.756 53.096-11.378l11.378 11.378 68.267 102.4c3.792 7.585 15.17 15.17 22.755 15.17l18.963 3.792C512 428.563 409.6 565.096 398.223 728.178z" fill="#FFFE4F" p-id="6046"></path><path d="M391.86 442.197a30.34 56.889 44.999 1 0 80.451-80.455 30.34 56.889 44.999 1 0-80.451 80.455zM621.985 705.422c-7.585-7.585-3.792-18.963 3.793-26.548s18.963-7.585 26.548-3.793 3.793 18.963-3.793 26.549-18.963 11.377-26.548 3.792z" fill="#FFFFFF" p-id="6047"></path></symbol>
    <section ref="content" style="margin-top: 50vh;max-height: 50vh">
        <header  class="info-header no-drag">
            <section class="info-avatar" @click="GotoHome">
                <Avatar shape="square" size="large" class="msg-avatar" :src="info.userAvatarURL" />
            </section>
            <section class="info-name">
                <section><span class="info-nick">{{info.userNickname}}</span><span class="info-username">{{info.userName}}</span></section>
                <section class="info-sysmetal">
                    <img v-for="s in info.sysMetal" :src="s.icon" :title="s.description" />
                </section>
            </section>
        </header>
        <section class="info-content no-drag">
            <section>{{info.userIntro}}</section>
            <section class="info-other">
                <section class="info-basic">
                    <section class="info-role"><img :src="roleImg[info.userRole]" :alt="info.userRole" :title="info.userRole"></section>
                    <section class="info-money">
                        <a :href="`https://fishpi.cn/member/${info.userName}/points`" title="24283 积分" target="_blank">
                            <svg>
                                <use xlink:href="#iconPoints"></use>
                            </svg>
                        </a>
                    </section>
                    <section class="info-city" v-if="info.userCity" :title="info.userCity">
                        <Icon custom="fa fa-map-marker"/>
                    </section>
                </section>
                <section class="info-state">
                    <Tag class="info-online" :color="info.userOnlineFlag ? 'error': 'default'">{{onlineMsg}}</Tag>
                    <Button v-if="current.userName != info.userName" @click="chat">私聊</Button>
                </section>
            </section>
        </section>
    </section>
</main>
</template>

<script>
  export default {
    name: 'card',
    component: {
    },
    async mounted () {
        let user = this.$route.params.user;
        this.current = await this.$root.getInfo();
        this.info = await this.$fishpi.user(user);
        document.body.addEventListener('keydown', (ev) => {
            if (ev.keyCode == 27) this.close();
        });
        this.$ipc.listen('user-update', async (event, user) => {
            this.$router.replace(`/card/${user}`);
            this.info = await this.$fishpi.user(user);
        });
    },
    updated() {
        if(this.$refs.content) {
            let size = {
                width: 400,
                height: this.$refs.content.scrollHeight * 2,
            }
            this.$ipc.send('card-event', {
                call: 'resize',
                args: size
            })
        }
    },
    data () {
        return {
            info: null,
            current: {},
        }
    },
    watch: {
    },
    filters: {
    },
    computed: {
        roleImg() {
            return {
                '管理员': 'https://pwl.stackoverflow.wiki/adminRole.png',
                'OP': 'https://pwl.stackoverflow.wiki/opRole.png',
                '纪律委员': 'https://pwl.stackoverflow.wiki/policeRole.png',
                '超级会员': 'https://pwl.stackoverflow.wiki/svipRole.png',
                '成员': 'https://pwl.stackoverflow.wiki/vipRole.png',
                '新手': 'https://pwl.stackoverflow.wiki/newRole.png'
            }
        },
        onlineMsg() {
            return this.info.userOnlineFlag ? '在线' : '离线'
        },
        background() {
            return this.info.cardBg ? { backgroundImage: `url(${this.info.cardBg})` } : undefined;
        }
    },
    methods: {
        close() {
            this.$ipc.send('card-event', {
                call: 'hide'
            });
            this.info = null;
        },
        chat() {
            new BroadcastChannel('main-router').postMessage({ url: `/chat/${this.info.userName}` }); 
            this.close();
        },
        GotoHome() {
            window.open(`https://fishpi.cn/member/${this.info.userName}`);
        }
    }
  }
</script>

<style lang="less" scoped>
.layout {
    background: transparent;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-size: cover;
    background-position: 50%;
    height: 100vh;
    width: 100vw;
    .info-header {
        background: var(--global-alpha-background-color);
        display: flex;
        .info-avatar {
            margin: 0 10px;
            margin-top: -64px;
            cursor: pointer;
            .ivu-avatar {
                height: 100px;
                width: 100px;
            }
        }
        .info-name {
            display: flex;
            align-items: center;
        }
        .info-sysmetal {
            display: flex;
            align-items: center;
            img {
                width: 20px;
            }
        }
        .info-nick {
            font-size: 1.2em;
            max-width: 50vw;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        }
        .info-username {
            padding: 5px;
            font-size: .8em;
            color: var(--global-control-text-color);
        }
    }

    .info-content {
        background: var(--global-alpha-background-color);
        padding: 0 10px;
        .info-other {
            display: flex;
            justify-content: space-between;
            height: 2.5em;
            padding: .5em 0;
            .info-basic {
                display: flex;
                align-items: center;
                section {
                    margin-right: 8px;
                }
                .info-role {
                    img {
                        height: 1.5em;
                        display: block;
                    }
                }
                .info-money {
                    display: inline;
                    height: 1.5em;
                    svg {
                        width: 1.5em;
                        height: 1.5em;
                    }
                }
                .info-city {
                    display: inline-block;
                    font-size: 1.5em;
                    vertical-align: middle;
                    line-height: .5em;
                    color: #3fd814
                }
            }
        }
        .info-state {
            display: flex;
            align-items: center;
            .info-online {
                margin: 0 5px;
            }
            button {
                height: 22px;
                padding: 0 8px;
                font-size: 12px;
                margin: 0;
            }
        }
    }
}

</style>