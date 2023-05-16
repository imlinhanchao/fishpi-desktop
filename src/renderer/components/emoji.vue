<template>
<section class="emoji-form"  @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'emoji', instance: this}))">
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
                <section class="face-item" @contextmenu.stop="menu(e)" v-for="e in faces" @click="sendFace(e, 'fav')">
                    <img :src="e">
                </section>    
                <section class="face-add" @click="$refs['facefile'].click()">
                    <Icon custom="fa fa-plus" />
                    <input type="file" name="images" accept="image/*" ref="facefile" v-show="false" @change="uploadFace">
                </section>
                <section class="face-add" @click="exportFace" title="导出">
                    <Icon custom="fa fa-download" />
                </section>
                <section class="face-add" @click="importFaces" title="导入">
                    <Icon custom="fa fa-upload" />
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
                        this.faces = this.$fishpi.emoji.remove(f);
                    }
                }])
            },
            exportFace() {
                this.$ipc.send('main-event', {
                    call: 'faceExport',
                    args: this.faces.join('\n')
                });
            },
            async importFaces() {
                try {
                    let urls = (await this.$ipc.sendSync('main-event', {
                        call: 'faceImport',
                        args: this.faces.join('\n')
                    })).data;
                    console.dir(urls)
                    urls = urls.filters(u => this.faces.indexOf(u) < 0);
                    this.faces = this.faces.concat(urls);
                    this.$fishpi.emoji.set(this.faces);
                    this.$Message.info(`成功导入${urls.length}个表情`)
                } catch (error) {
                    this.$Message.error(error.message)
                }
            },
            async uploadFace(ev) {
                let files = Array.from(ev.target.files)
                let rsp = await this.$fishpi.upload(files);
                if (!rsp) return;
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                let fileData = rsp.data.succMap;
                for(let d in fileData) {
                    this.faces.push(fileData[d]);
                }
                this.$fishpi.emoji.set(this.faces);
            }
        }
    }
</script>
<style lang="less" scoped>
.emoji-form {
    position: absolute;
    width: calc(100% - 10px);
    bottom: 2em;
    z-index: 100;
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
    background: var(--main-emoji-background-color);
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