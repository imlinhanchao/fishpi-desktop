<style lang="less" scoped>
.layout {
    background: var(--main-background-color);
}
</style>

<template>
<div class="layout">
    <MainHeader :liveness="liveness" page="main"/>
    <Content class="content">
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
        mounted () {
            if (!this.$root.isLogin) this.$router.push('/login');
        },
        data () {
            return {
                liveness: 10,
                timer: 0,
            }
        },
        watch: {
        },
        filters: {
        },
        computed: {

        },
        methods: {

        }
    }
</script>
