<style lang="less" scoped>
.header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    height: 40px;
    h1 {
        font-size: 1em;
        padding: 0 5px;
        font-weight: normal;
        user-select: none;
        -webkit-app-region: drag;
        img {
            height: 1.5em;
            vertical-align: middle;
            -webkit-app-region: drag;
        }
        span {
            vertical-align: middle;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
            max-width: calc(100vw - 170px);
            display: inline-block;
            -webkit-app-region: drag;
        }
    }
    .control {
        -webkit-app-region: no-drag;
        padding-right: 5px;
        i {
            font-size: 1em;
        }
    }
}
.win-top-btn, .win-opacity-btn {
    &.win-checked {
        color: #57a3f3;
        transform: rotate(45deg);
        .cirle-empty {
            border-color: #57a3f3
        }
    }
}
.cirle-empty {
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: .5em;
    border: 2px dashed #aca49a;
    vertical-align: middle;
}
</style>

<template>
<header class="drag header" :title="'已摸鱼' + liveness + '%'">
    <h1 class="drag"> <img src='../assets/icon.png' />
    <span id="win-title" class="drag">{{ '摸鱼派 - ' + $root.title || '摸鱼派'}}</span></h1>
    <span class="control no-drag">
        <Button type="text" @click="handleMin"><Icon custom="fa fa-minus"></Icon></Button>
        <Button type="text" @click="handleOpacity" class="win-opacity-btn" :class="{ 'win-checked': opacity.enable }"><span class="cirle-empty"></span></Button>
        <Button type="text" @click="handleTop" class="win-top-btn" :class="{ 'win-checked': wintop }"><Icon custom="fa fa-thumb-tack"></Icon></Button>
        <Button type="text" @click="handleClose"><Icon custom="fa fa-times"></Icon></Button>
    </span>
</header>
</template>

<script>
  export default {
    name: 'main-header',
    components: {
    },
    props: {
        liveness: {
            required: true
        },
        page: {
            required: true
        }
    },
    mounted () {
    },
    data () {
        return {
            wintop: false,
            opacity: {
                enable: false,
                value: 60
            },
        }
    },
    watch: {
    },
    filters: {
    },
    computed: {
        title() {
            return document.title;
        },
    },
    methods: {
        handleClose() {
            this.$ipc.send(`${this.page}-event`, { call: 'close' });
        },

        handleMin() {
            this.$ipc.send(`${this.page}-event`, { call: 'min' });
        },
        
        handleTop() {
            this.wintop = !this.wintop;
            this.$ipc.send(`${this.page}-event`, { 
                call: 'top', args: this.wintop 
            });
        },
        
        handleOpacity() {
            this.opacity.enable = !this.opacity.enable;
            this.$ipc.send(`${this.page}-event`, { 
                call: 'opacity', args: this.opacity 
            })
        },
    }
  }
</script>
