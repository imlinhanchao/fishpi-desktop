<template>
<section class="scroll-silder" ref="silder" @mousedown="scrollTo" v-if="total >= scroll - 20">
    <section class="scroll-top scroll-btn" @mousedown="$emit('scrollTo', total)">
        <Icon custom="fa fa-eject" />
    </section>
    <section ref="bar" class="scroll-bar">
        <section ref="bar-item" class="scroll-bar-item" :style="{ bottom: barPos }" 
            @mouseup="scrollMoveBegin = false"  @mousedown.stop="scrollBegin"></section>
    </section>
    <section class="scroll-bottom scroll-btn" @mousedown="$emit('scrollTo', 0)">
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
            scroll: {
                type: Number,
                required: true,
            },
            total: {
                type: Number,
                required: true,
            },
        },
        mounted () {
            document.body.removeEventListener('mousemove', this.scrollMove)
            document.body.addEventListener('mousemove', this.scrollMove)
            document.body.addEventListener('mouseup', () => {
                this.scrollMoveBegin = false;
            })
        },
        data () {
            return {
                scrollMoveBegin: false
            }
        },
        watch: {
        },
        filters: {
        },
        computed: {
            barPos() {
                return this.scroll / (this.total) * 100 + '%';
            },
        },
        methods: {
            scrollBegin(ev) {
                this.scrollMoveBegin = true;
                ev.preventDefault()
            },
            scrollMove(ev) {
                if(this.scrollMoveBegin) this.scrollTo(ev);
            },
            scrollTo(ev) {
                let bar = this.$refs.bar;
                let pos = this.$root.getElementPosition(bar);
                let scrollPercent = 1 - (ev.clientY - pos.y + 30) / (bar.offsetHeight + 30);
                if (scrollPercent > 1 || scrollPercent < 0) return;
                this.$emit('scrollTo', scrollPercent * this.total);
            }
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
        line-height: .5em;
    }
    .scroll-top > .ivu-icon{
        vertical-align: top;
    }
    .scroll-bottom > .ivu-icon {
        vertical-align: bottom;
    }
    .scroll-bar {
        position: relative;
        height: 100%;
        margin-top: 30px;
    }
    .scroll-bar-item {
        width: 100%;
        bottom: .5em;
        position: absolute;
        cursor: pointer;
        height: 30px;
        background: var(--global-scroll-bar-color);
    }
}
</style>