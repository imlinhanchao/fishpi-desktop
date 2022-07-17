<style lang="less" scoped>
.layout {
    width: 100%;
    display: flex;
}
.sidebar {
    height: 100%;
    width: 3em;
    .feature-list {
        list-style: none;
        padding: 0;
        .feature-item {
            padding: 0 .5em;
            display: flex;
            justify-content: center;
            padding-bottom: 1em;
            cursor: pointer;
            i {
                font-size: 1.2em;
            }
            i:hover {
                text-shadow: 0 0 5px var(--global-active-color);
            }
            &.feature-active {
                color: var(--global-active-color);
            }
        }
    }
}
.content {
    width: calc(100vw - 3em);
    height: 100%;
}
</style>

<template>
<div class="layout">
    <section class="sidebar">
        <ul class="feature-list">
            <li class="feature-item" :class="{ 'feature-active': $route.meta.name == 'account' }" @click="toAccount"><Avatar :src="account.userAvatarURL" /></li>
            <li class="feature-item" :class="{ 'feature-active': $route.meta.name == 'chatroom' }" @click="$router.push('/chatroom')"><Icon custom="fa fa-comments" /></li>
            <li class="feature-item" :class="{ 'feature-active': $route.meta.name == 'chat' }"><Icon custom="fa fa-comment" /></li>
        </ul>
    </section>
    <section class="content">
        <router-view ref="content"/>
    </section>
</div>
</template>

<script>
  export default {
    name: 'home',
    components: {
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
        account() {
            return this.$root.current || {}
        }
    },
    methods: {
        async toAccount() {
            console.dir(await this.$fishpi.account.info())
        }
    }
  }
</script>
