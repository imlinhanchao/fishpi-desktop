<style lang="less" scoped>
.layout {
    background: var(--main-background-color);
    height: 100%;
}
.content {
    background: var(--main-background-color);
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 40px);
    margin: auto;
    flex-direction: column;
}
</style>

<template>
<div class="layout">
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
            if (!await this.$root.isLogin()) this.$router.push('/login');
            else this.$router.push('/chatroom');
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
