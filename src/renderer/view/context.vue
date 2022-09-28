<template>
<div class="layout" v-if="ext">
    <iframe :id="`ext_${ext.id}`" ref="iframe" :src="ext.url" @load="loaded"></iframe>
</div>
</template>

<script>
    export default {
        name: 'context',
        components: {
        },
        mounted () {
            if (!this.$route.params.ext) return;
            this.ext = this.$root.sidebars.find(s => s.id == this.$route.params.ext);
            if (!this.ext) return;
            this.$root.title = this.ext.name;
            this.$ipc.listen('fishpi.global.listener', this.listen);
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
           
        },
        methods: {
            loaded() {
                this.$refs.iframe
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
                this.$refs.iframe.contentDocument.head.appendChild(style);
                this.$refs.iframe.contentWindow.$ipc = window.$webviewIpc;
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
    iframe {
        width: 100%;
        height: 100%;
        border: 0;
    }
}
</style>