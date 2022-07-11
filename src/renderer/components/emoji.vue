<template>
<section class="emoji-form">
    <Tabs value="emoji" type="card">
        <TabPane :label="emojiLabel" name="emoji">
            <article class="face-list">
                <section class="face-item" v-for="e in defaults" :title="e.name" @click="sendFace(e.name, 'emoji')">
                    <img :src="e.url" :alt="e.name">
                </section>
            </article>
        </TabPane>
        <TabPane :label="facesLabel" name="faces">
            <article class="face-list face-diy">
                <section class="face-item" @contextmenu="menu(e)" v-for="e in faces" @click="sendFace(e, 'fav')">
                    <img :src="e">
                </section>               
            </article>
        </TabPane>
    </Tabs>
</section>
</template>

<script>
    export default {
        name: 'emoji',
        components: {
        },
        props: {

        },
        mounted () {
            this.loadFav();
        },
        data () {
            return {
                emojiLabel: (h) => {
                    return h('div', {
                            attrs: {
                                title: '默认'
                            }
                        }, [
                        h('span', ['🙂'])
                    ])
                },
                facesLabel: (h) => {
                    return h('div', {
                            attrs: {
                                title: '收藏'
                            }
                        }, [
                        h('span', ['⭐'])
                    ])
                },
                faces: []
            }
        },
        watch: {
        },
        filters: {
        },
        computed: {
            defaults() {
                return Object.keys(this.$fishpi.emoji.default).map(e => ({
                    name: e, url: this.$fishpi.emoji.default[e]
                }))
            }
        },
        methods: {
            async loadFav() {
                this.faces = await this.$fishpi.emoji.get();
            },
            sendFace(value, type) {
                this.$emit('emoji', { value, type });
            },
            menu(f) {
                this.$root.popupMenu([{
                    label: '删除',
                    click: () => {
                        this.faces.splice(this.faces.indexOf(f), 1);
                        this.$fishpi.emoji.set(this.faces);
                    }
                }])
            }
        }
    }
</script>
<style lang="less" scoped>
.emoji-form {
    position: absolute;
    width: 100%;
    bottom: 2em;
    .face-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        overflow: auto;
        height: 250px;
        &.face-diy {
            .face-item {
                margin: 2px;
                width: 59px;
                height: 59px;
                overflow: hidden;
                background-size: cover;
                position: relative;
                .face-space {
                    display: inline-block;
                    width: 59px;
                    height: 59px;
                }
                .face-remove {
                    position: absolute;
                    top: -5px;
                    right: 5px;
                    font-size: .5em;
                    .ivu-btn {
                        padding: 0;
                    }
                }
                img {
                    max-width: 100%;
                    max-height: 100%;
                    width: auto;
                }
            }
            .msg-quote-tip {
                img {
                    width: auto;
                    max-width: 100px;
                    max-height: 100px;
                }
            }
        }
        .face-add {
            width: 59px;
            height: 59px;
            cursor: pointer;
            line-height: 59px;
            text-align: center;
            margin: 2px;
            border: 1px dashed #6a737d
        }
        .face-item {
            width: 5%;
            min-width: 2em;
            padding: 5px;
            cursor: pointer;
            img {
                width: 100%;
            }
        }
    }
}
</style>
<style lang="less">
.ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-tab {
    background: #515a6e;
}
.ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-tab-active {
    background: #131415;
}
.emoji-form {
    .ivu-tabs-tabpane {
        background-color: var(--main-emoji-background-color);
    }
    .ivu-tabs-bar {
        margin-bottom: 0;
        border: 0;
    }
}
</style>