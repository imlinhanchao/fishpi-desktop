<template>
<div class="layout" v-if="ext">
    <webview :preload="preloadJs"
        nodeintegration
        :id="`ext_${ext.id}`" 
        ref="webview" 
        :src="ext.url" 
        @load="loaded"></webview>
</div>
</template>

<script>
    import path from 'path';
    export default {
        name: 'context',
        components: {
        },
        mounted () {
            console.log(__static)
            if (!this.$route.params.ext) return;
            this.ext = this.$root.sidebars.find(s => s.id == this.$route.params.ext);
            if (!this.ext) return;
            this.$root.title = this.ext.name;
            this.$ipc.listen('fishpi.global.listener', this.listen);
            this.$nextTick(() => {
                this.$refs.webview.addEventListener('dom-ready', () => {
                    if(!this.$refs.webview.isDevToolsOpened()) this.$refs.webview.openDevTools()
                })
                this.$ref.webview.addEventListener(`ipc-message`, (event) => {
                    let rsp = (await this.$ipc.sendSync('fishpi.global.command', {
                        id: this.ext.id,
                        command: event.channel,
                        data: event.args,
                    }));
                })
            })
            window.$webviewIpc = {
                send: async(command, data) => {
                    let rsp = (await this.$ipc.sendSync('fishpi.global.command', {
                        id: this.ext.id,
                        command,
                        data,
                    }));
                    console.dir(rsp);
                    return rsp;
                },

                on: (command, fn) => {
                    if(!this.listener[command]) this.listener[command] = [];
                    this.listener[command].push(fn)
                },

                off: (command, fn) => {
                    if (!this.listener[command]) return;
                    let index = this.listener[command].indexOf(fn);
                    if (index < 0) return;
                    this.listener[command].splice(index, 1);
                }
            }
        },
        beforeDestroy () {
            this.$ipc.removeListener('fishpi.global.listener', this.listen);
        },
        data () {
            return {
               ext: null,
               listener: {}
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
                this.$refs.webview
                    .contentDocument.getElementsByTagName('html')[0]
                    .setAttribute('style', this.$root.extension.getCSSVarList());
                let style = document.createElement('style');
                style.appendChild(document.createTextNode(`
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
                `))
                this.$refs.webview.contentDocument.head.appendChild(style);
                this.$refs.webview.contentWindow.$ipc = window.$webviewIpc;
            },
            listen(event, rsp) {
                if (rsp.data.id != this.ext.id) return;
                if (!this.listener[command]) return;
                this.listener[command].forEach(fn => fn(rsp.data.data));
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