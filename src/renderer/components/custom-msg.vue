<template>
<section ref="msg-view" class="custom-msg-item" 
    v-if="item.data" 
>
    {{ item.data }}
</section>
</template>

<script>
  export default {
    name: 'custom-msg',
    components: {
    },
    props: {
        item: {
            required: true
        },
    },
    mounted () {
    },
    updated() {
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
.custom-msg-item{
    text-align: center;
    font-size: 0.8em;
    opacity: .5;
}
</style>
