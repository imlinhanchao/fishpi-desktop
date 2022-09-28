<template>
<div class="layout" v-if="ext">
    <iframe ref="iframe" :src="ext.url" @load="loaded"></iframe>
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
        },
        beforeDestroy () {
            
        },
        data () {
            return {
               ext: null
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
                this.$refs.iframe.contentWindow.ipc = this.$ipc;
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