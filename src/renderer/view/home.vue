<style lang="less" scoped>
.layout {
    width: 100%;
}
.sidebar {
    height: 100%;
    width: 2em;
    .feature-list {
        list-style: none;
        padding: 0;
        .feature-item {
            padding: 0 .5em;
            height: 2em;
            display: flex;
            i:hover {
                text-shadow: 0 0 5px var(--main-active-color);
            }
            &.feature-active {
                color: var(--main-active-color);
            }
        }
    }
}
</style>

<template>
<div class="layout">
    <section class="sidebar">
        <ul class="feature-list">
            <li class="feature-item" :class="{ 'feature-active': $route.meta.name == 'chatroom' }"><Icon custom="fa fa-comments" /></li>
            <li class="feature-item" :class="{ 'feature-active': $route.meta.name == 'chat' }"><Icon custom="fa fa-comment" /></li>
        </ul>
    </section>
</div>
</template>

<script>
  export default {
    name: 'home',
    component: {
    },
    mounted () {
        this.$ipc.send('main-event', { call: 'resize', args: { width: 800 } })
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
    },
    methods: {

    }
  }
</script>
