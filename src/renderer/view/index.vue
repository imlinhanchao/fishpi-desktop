<template>
<div class="layout">
    <symbol id="redPacketIcon" viewBox="0 0 1024 1024">
        <path d="M705.2 445.28C689.12 536.48 608.608 606.256 512 606.256c-91.232 0-171.728-64.4-187.84-150.272l-134.16-80.496V783.36c0 59.04 48.304 101.968 101.968 101.968h440.064c59.04 0 101.968-48.288 101.968-101.968V370.128l-128.8 75.136zM512 219.856c91.232 0 166.368 64.4 187.84 150.256l134.16-85.856v-48.304c0-59.04-48.304-101.968-101.968-101.968H291.968c-53.664 0-101.968 42.928-101.968 101.968v59.04l134.16 80.48c16.112-91.216 96.608-155.616 187.84-155.616z" fill="#e6464b" p-id="4469"></path>
        <path d="M565.664 434.528h-26.832v-21.456h26.832c16.112 0 26.832-10.736 26.832-26.832 0-16.112-10.72-26.848-26.832-26.848h-16.096l32.208-32.192c10.72-10.72 10.72-26.832 0-37.568-10.736-10.72-26.848-10.72-37.568 0L512 327.2l-32.192-37.568c-10.736-10.72-26.848-10.72-37.568 0-10.736 10.72-10.736 26.832 0 37.568l32.192 32.192h-16.096c-16.096 0-26.832 10.736-26.832 26.848 0 16.096 10.72 26.832 26.832 26.832h32.192v21.456h-32.192c-16.096 0-26.832 10.736-26.832 26.832 0 16.112 10.72 26.848 26.832 26.848h32.192v37.568c0 16.096 10.736 26.816 26.848 26.816 16.096 0 26.832-10.72 26.832-26.816v-37.568h21.456c16.112 0 26.832-10.736 26.832-26.848 0-16.096-10.72-26.832-26.832-26.832z" fill="#fecd41" opacity="1" p-id="4470"></path>
    </symbol>
    <MainHeader :liveness="liveness" page="main"/>
    <Content class="content no-drag">
        <router-view />
    </Content>
    <Liveness :liveness="liveness" />
</div>
</template>

<script>
    import MainHeader from '../components/header.vue'
    import Liveness from '../components/liveness.vue'
    export default {
        name: 'home',
        components: {
            MainHeader, Liveness
        },
        async mounted () {
            if (!this.$root.isLogin()) return this.$router.push('/login');
            else this.$router.push('/chatroom');
            try {
                console.dir(await this.$store.dispatch('fishpi/getInfo'));
            } catch (error) {
                console.log(error);
                this.$root.logout();
            }
            if (!this.$route.meta.notitle && this.$route.meta.title) this.$root.title = this.$route.meta.title;
        },
        data () {
            return {
            }
        },
        watch: {
        },
        filters: {
        },
        computed: {
            liveness() {
                return this.$root.liveness || 0
            }
        },
        methods: {

        }
    }
</script>
<style lang="less" scoped>
.layout {
    background: var(--global-background-color);
    height: 100%;
}
.content {
    background: var(--global-background-color);
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 40px);
    margin: auto;
    flex-direction: column;
}
</style>
<style lang="less">
.md-style {
    a {
        border-bottom: 1px dashed #17233d;
    }
    img {
        max-height: 60vh;
        max-width: 40vw;
        cursor: pointer;
        background: #FFF;
        &[alt='图片表情'] {
            background: transparent;
        }
    }
    ul, ol {
        list-style-position: inside;
    }
    .msg-img {
        img.emoji {
            max-width: 40px;
        }
    }
    img.emoji {
        max-width: 20px;
        cursor: auto;
        vertical-align: middle;
        background: transparent;
    }
    h1,h2 {
        padding-bottom: .3em;
        border-bottom: 1px solid #eaecef
    }
    
    hr {
        background-color: #eaecef
    }
    
    blockquote {
        color: #6a737d;
        border-left: .25em solid #eaecef;
        padding-left: 5px;
    }
    
    iframe {
        border: 0;
        width: 100%;
    }
    
    table tr {
        border-top: 1px solid #c6cbd1;
        background-color: #fafbfc
    }
    
    table td, table th {
        border: 1px solid #dfe2e5
    }
    
    table tbody tr:nth-child(2n) {
        background-color: #fff
    }
    
    code:not(.hljs):not(.highlight-chroma) {
        background-color: rgba(27,31,35,.05)
    }

    pre,code {
        width: 100%;
        max-height: 300px;
        overflow: auto;
    }

    pre>code {
        margin: 0;
        font-size: 85%;
        padding: 0.5em;
        border-radius: 5px;
        display: block;
        overflow: auto;
        white-space: pre;
        font-family: mononoki,Consolas,"Liberation Mono",Menlo,Courier,monospace;
        word-break: initial;
        word-wrap: normal
    }
    
    kbd {
        color: #24292e;
        background-color: #fafbfc;
        border: 1px solid #d1d5da;
        box-shadow: inset 0 -1px 0 #d1d5da
    }
}

.msg-img {
    img {
        max-width: 100%;
    }
    [alt="图片表情"] {
        max-width: 100px;
    }
    iframe {
        border: 0;
    }
}
</style>