<template>
<div class="layout" v-if="current">
    <section class="breezemoons">
        <Input ref="message"
                type="text"
                v-model="message"
                placeholder="清风明月"
            >
                <Button
                    slot="append"
                    icon="md-send"
                    @click="send"
                    style="box-shadow:none;"
                    :loading="sending"
                ></Button>
            </Input>
    </section>
    <section class="content">
        <section class="br-item" v-for="b in contents">
            <Avatar class="msg-avatar user-card" :title="b.breezemoonAuthorName" :data-user="b.breezemoonAuthorName" :src="b.breezemoonAuthorThumbnailURL48" />
            <section class="br-contain">
                <section class="br-data">
                    <div class="arrow"></div><p class="br-content" v-html="b.breezemoonContent"></p>
                </section>
                <section class="br-time"><span>发自 {{b.breezemoonCity}}</span> <Time :time="b.breezemoonCreated" /></section>
            </section>
        </section>
        <section class="br-more">
            <Button type="text" @click="load(page+1)">
                <Icon custom="fa fa-caret-down" />
            </Button>
        </section>
    </section>
</div>
</template>

<script>
    export default {
        name: 'breezemoons',
        components: {
        },
        mounted () {
            this.load(this.page)
        },
        beforeDestroy () {
            this.unLoad();
        },
        data () {
            return {
                contents: [],
                page: 1,
                message: '',
                sending: false,
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
            unLoad() {
            },
            async load(page) {
                let rsp = await this.$fishpi.breezemoon.list(page);
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.contents = this.contents.concat(rsp.breezemoons);
                this.page = page;
            },
            async send() {
                if (!this.message) return;
                this.sending = true;
                let rsp = await this.$fishpi.breezemoon.send(this.message);
                if (rsp.code != 0) this.$Message.error(rsp.msg);
                else {
                    this.message = '';
                    rsp = await this.$fishpi.breezemoon.list(1);
                    this.contents.unshift(rsp.breezemoons[0]);
                }
                this.sending = false;
            }
        }
    }
</script>
<style lang="less" scoped>
.layout {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--main-chatroom-background-color);

    .msg-avatar {
        width: 41px;
        height: 35px;
        border-radius: 35px;
        cursor: pointer;
    }

    .breezemoons {
        padding: 10px;
    }

    .content {
        width: 100%;
        position: relative;
        overflow: auto;
    }

    .br-item {
        display: flex;
        flex-direction: row;
        width: 85%;
        padding: 5px 10px;
        .br-contain {
            display: flex;
            flex-direction: column;
            width: 100%;
            .br-data {
                display: flex;
                flex-direction: row;
                .arrow{
                    border: 5px solid transparent;
                    border-right: 5px solid var(--main-chatroom-message-background-color);
                    width: 0;
                    margin-top: 15px;
                    height: 0;
                }
                .br-content {
                    background-color: var(--main-chatroom-message-background-color);
                    border-radius: 5px;
                    padding: 8px 15px;
                    color: var(--main-chatroom-message-color);
                    word-break: break-word;
                    max-width: calc(100% - 45px);
                    overflow: auto;
                }
            }
            .br-time {
                padding: 0 10px;
                font-size: 70%;
                opacity: .5;
            }
        }
    }
    .br-more {
        text-align: center;
    }
}
</style>