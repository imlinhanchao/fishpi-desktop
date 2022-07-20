<template>
<section class="scroll-silder">
    <section class="scroll-top scroll-btn">
        <Icon custom="fa fa-eject" />
    </section>
    <section class="scroll-bar"></section>
    <section class="scroll-bottom scroll-btn">
        <Icon custom="fa fa-eject  fa-rotate-180" />
    </section>
</section>
</template>

<script>
    export default {
        name: 'scrollbar',
        components: {
        },
        props: {

        },
        mounted () {
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
<style lang="less" scoped>
.scroll-silder {
    height: 100%;
    width: .5em;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    text-align: right;
    .ivu-icon {
        font-size: .5em;
        color: var(--global-scroll-bar-color);
    }
    .scroll-btn {
        display: inline-block;
        cursor: pointer;
    }
    .scroll-top > .ivu-icon{
        vertical-align: top;
    }
    .scroll-bottom > .ivu-icon {
        vertical-align: bottom;
    }
    .scroll-bar {
        width: 100%;
        bottom: .5em;
        position: absolute;
        cursor: pointer;
        height: 3em;
        background: var(--global-scroll-bar-color);
    }
}
</style>