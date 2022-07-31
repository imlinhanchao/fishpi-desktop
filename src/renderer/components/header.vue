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
        color: var(--header-btn-checked-color);
        transform: rotate(45deg);
        .cirle-empty {
            border-color: var(--header-btn-checked-color)
        }
    }
}
.cirle-empty {
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: .5em;
    border: 2px dashed var(--global-control-text-color);
    vertical-align: middle;
}
.music-player {
    display: flex;
    align-items: center;
    .audio-control-btn {
        line-height: 15px;
        vertical-align: middle;
        width: 32px;
        height: 32px;
        margin: 2px;
        text-align: center;
        padding: 0;
        &.audio-close {
            background: transparent;
            color: inherit;
            border: 0;
            cursor: pointer;
        }
    }
}
</style>

<template>
<header class="drag header">
    <h1 class="drag"> <img src='../assets/icon.png' />
    <span id="win-title" class="drag">{{ '摸鱼派 - ' + $root.title || '摸鱼派'}}</span></h1>
    <Music />
    <span class="control no-drag" :title="!simple ? '已摸鱼' + liveness + '%' : ''">
        <Button type="text" @click="handleMin"><Icon custom="fa fa-minus"></Icon></Button>
        <Button v-if="!simple" type="text" @click="handleOpacity" class="win-opacity-btn" :class="{ 'win-checked': opacity.enable }"><span class="cirle-empty"></span></Button>
        <Button v-if="!simple" type="text" @click="handleTop" class="win-top-btn" :class="{ 'win-checked': wintop }"><Icon custom="fa fa-thumb-tack"></Icon></Button>
        <Button type="text" @click="handleClose"><Icon custom="fa fa-times"></Icon></Button>
    </span>
</header>
</template>

<script>
  import Music from './music.vue'
  export default {
    name: 'main-header',
    components: {
        Music
    },
    props: {
        liveness: {
            required: false
        },
        page: {
            required: true
        },
        simple: {
            default: false
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
