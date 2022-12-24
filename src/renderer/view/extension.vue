<template>
<div class="layout" @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'extension', instance: this}))">
    <div class="ext-list">
        <div class="ext-item" :ref="e.fishpi.key" v-bind:key="e.fishpi.key" v-for="e in extensions" @click="viewDetail(e)">
            <div class="ext-icon">
                <img :src="iconPath(e)" />
            </div>
            <div class="ext-info">
                <h2><a target="_blank" :href="e.homepage || e.repository || 'javascript:void(0)'">{{e.displayName || e.name}}</a><sub>{{e.version}}</sub></h2>
                <p class="ext-desc ellipsis">{{e.description}}</p>
                <div class="ext-footer">
                    <p class="ext-author">{{e.author || e.publisher || "神秘开发者"}}</p>
                    <Button type="primary" 
                        size="small" 
                        v-if="e.fishpi.setting"
                        @click="$router.push(`/context/${e.fishpi.key}`)">设置</Button>
                </div>
            </div>
        </div>
    </div>
    <div class="ext-detail">
        <div class="md-style" v-html="detailHTML"></div>
    </div>
</div>
</template>

<script>
    import path from 'path';
    import fs from 'fs';
    import { marked } from 'marked';
    export default {
        name: 'context',
        components: {
        },
        mounted () {
            for(let e in this.$root.extension.extensions) {
                this.extensions.push(this.$root.extension.extensions[e]);
            }
        },
        beforeDestroy () {
        },
        data () {
            return {
                extensions: [],
                current: null,
                detailHTML: ''
            }
        },
        watch: {
        },
        filters: {
        },
        computed: {
            
        },
        methods: {
            iconPath(ext) {
                return path.join(ext.fishpi.root, ext.fishpi.icon)
            },
            viewDetail(ext) {
                if (this.current && this.current.fishpi.key == ext.fishpi.key) this.current = null;
                else this.current = ext;
                let files = fs.readdirSync(ext.fishpi.root);
                let readme = files.find(f => f.match(/readme/i));
                if (readme) {
                    readme = path.join(ext.fishpi.root, readme);
                    fs.readFile(readme, (err, data) => {
                        this.detailHTML = this.changeResPath(marked(data.toString(), {
                            "async": false,
                            "baseUrl": null,
                            "breaks": false,
                            "extensions": null,
                            "gfm": true,
                            "headerIds": true,
                            "headerPrefix": "",
                            "highlight": null,
                            "langPrefix": "language-",
                            "mangle": true,
                            "pedantic": false,
                            "sanitize": false,
                            "sanitizer": null,
                            "silent": false,
                            "smartypants": false,
                            "tokenizer": null,
                            "walkTokens": null,
                            "xhtml": false
                        }), ext.fishpi.root)
                    })
                }
                else this.detailHTML = "<p>作者什么也没有介绍。</p>"
            },
            changeResPath(html, root) {
                return html.replace(/src="*\.*\//g, `src="${root}${path.sep}`)
                    .replace(/<a /g, `<a target="_blank"`);
            }
        }
    }
</script>
<style lang="less" scoped>
.layout {
    background: var(--main-chatroom-background-color);
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: row;
    .ext-list {
        width: 100%;
        .ext-item {
            display: flex;
            flex-direction: row;
            padding: 10px;
            border-bottom: 1px dashed var(--global-control-border-color);
            width: 100%;
            &:hover {
                background: var(--main-chatroom-sidebar-background-color);
            }
            .ext-icon img{
                width: 70px;
                height: 70px;
                margin: 5px;
            }
            .ext-info {
                margin-left: 10px;
                font-size: .8em;
                width: 100%;
                h2 {
                    font-size: 1.4em;
                    font-weight: 700;
                    sub {
                        border-radius: 5px;
                        font-weight: normal;
                        padding: 0 5px;
                        margin: 0 5px;
                        background: var(--main-chatroom-sidebar-background-color);
                        bottom: 0;
                    }
                }
                h2, p {
                    margin: 0;
                }
                .ext-desc {
                    font-weight: 100;
                }
                .ext-author {
                    font-weight: 400;
                }
            }
            .ext-footer {
                width: 100%;
                display: flex;
                justify-content: space-between;
            }
        }
    }
    .ext-detail {
        display: none;
        padding: 15px;
        flex: 1;
        background: var(--main-chatroom-sidebar-background-color);
        overflow: auto;
    }
}
@media (min-width: 600px) {

.layout {
    .ext-detail {
        display: flex;
    }
    .ext-list {
        width: 300px;
    }
    .ext-item {
        cursor: pointer;
    }
}

}

</style>
<style lang="less">
.ext-detail {
    .md-style {
        img {
            background: transparent; 
        }
    }
}
</style>