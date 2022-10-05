<template>
<div class="layout" v-if="ext">
    <webview :preload="preloadJs"
        webpreferences="contextIsolation=no"
        nodeintegration
        :id="`ext_${ext.id}`" 
        ref="webview" 
        :src="ext.url" 
        allowpopups
        @load="loaded"></webview>
</div>
</template>

<script>
    import path from 'path';
    import { shell } from 'electron'
    export default {
        name: 'context',
        components: {
        },
        mounted () {
            console.log(__static)
            if (!this.$route.params.ext) return;
            this.ext = this.getExt()
            if (!this.ext) return;
            this.$root.title = this.ext.name;
            this.$ipc.listen('fishpi.global.listener', this.listen);
            this.$nextTick(() => {
                this.$refs.webview.addEventListener('dom-ready', this.loaded);
                this.$refs.webview.addEventListener(`ipc-message`, async (event) => {
                    let [data, callback] = event.args
                    let rsp = (await this.$ipc.sendSync('fishpi.global.command', {
                        id: this.ext.id,
                        command: event.channel,
                        data,
                    }));
                    if (callback) {
                        this.$refs.webview.send(`${event.channel}.${callback}`, rsp);
                    }
                })
                this.$refs.webview.addEventListener('new-window', (e) => {
                    //shell.openExternal(e.url)
                    e.preventDefault();
                })
            })
        },
        beforeDestroy () {
            this.$ipc.removeListener('fishpi.global.listener', this.listen);
        },
        data () {
            return {
               ext: null,
            }    
        },
        watch: {
        },
        filters: {
        },
        computed: {
            preloadJs() {
                return path.join(__static, 'webview.js') 
            }
        },
        methods: {
            loaded() {
                if(!this.$refs.webview.isDevToolsOpened() && process.env.EXT_ENV == 'development') 
                    this.$refs.webview.openDevTools()
                this.$refs.webview.insertCSS(`
                    :root {
                        ${this.$root.extension.getCSSVarList()}
                    }
                    ::-webkit-scrollbar-corner {
                        background-color: transparent;
                    }
                    ::-webkit-scrollbar {
                        width: 5px;
                        height: 5px;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: var(--global-scroll-bar-color);
                    }
                `);
            },
            listen(event, rsp) {
                if (rsp.data.id != this.ext.id) return;
                this.$refs.webview.send(rsp.data.command, rsp.data.data)
            },
            getExt() {
                let sidebar = this.$root.sidebars.find(s => s.id == this.$route.params.ext);
                if (sidebar) return sidebar;
                let setting = this.$root.extension.extensions[this.$route.params.ext].fishpi.setting;
                if (setting) return {
                    id: this.$route.params.ext,
                    url: setting,
                    name: this.$root.extension.extensions[this.$route.params.ext].displayName + "设置"
                }
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
    webview {
        width: 100%;
        height: 100%;
        border: 0;
    }
}
</style>