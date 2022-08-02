<style lang="less" scoped>
.music-module {
    .music-player {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--global-background-color);
        max-width: calc(100vw - 300px);
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
        .music-name {
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        }
    }
    .music-btn {
        display: none;
    }
}
@media (max-width: 500px) {
.music-module {
    .music-btn {
        display: inline-block;
    }
    .music-player {
        position: absolute;
        opacity: .8;
        max-width: 100vw;
        width: 100vw;
        left: 0;
        top: 2em;
        z-index: 10;
        display: none;
        &.music-visible {
            display: flex;
        }
    }
}
}
</style>

<template>
    <span class="music-module no-drag">
        <Button class="music-btn" type="text" @click="visible=!visible" v-if="$root.playSongs.length > 0"><Icon class="" custom="fa fa-music"/></Button>
        <span :class="{'music-visible': visible }" class="music-player plyr--audio" v-if="$root.playSongs.length > 0">
            <button title="关闭播放器" class="audio-control-btn audio-close" @click="$root.playSongs = []"><Icon custom="fa fa-times"></Icon></button>
            <button title="上一首" v-if="$root.playSongs.length > 1" class="plyr__controls__item plyr__control plyr__control--pressed audio-control-btn" @click="$root.prevSong()"><Icon custom="fa fa-backward "></Icon></button>
            <span class="music-name">{{$root.currentMusic.artist}} - {{$root.currentMusic.name}}</span>
            <button title="下一首" v-if="$root.playSongs.length > 1" class="plyr__controls__item plyr__control plyr__control--pressed audio-control-btn" @click="$root.nextSong()"><Icon custom="fa fa-forward " ></Icon></button>
            <span><Player ref="audio" @ended="$root.nextSong()" :options="{
                plyr: {
                },
                iconUrl: './static/images/plyr.svg',
                controls: [ 'play', 'mute' ]
            }" :source="$root.currentMusic"></Player></span>
            <button title="移出播放列表" class="plyr__controls__item plyr__control plyr__control--pressed audio-control-btn" @click="$root.delSong()"><Icon custom="fa fa-trash-o audio-remove"></Icon></button>
        </span>
    </span>
</template>

<script>
  import Player from './player.vue'
  export default {
    name: 'music',
    components: {
        Player,
    },
    props: {

    },
    mounted () {
        document.addEventListener('click', (ev) => {
            let target = ev.target;
            if (target.className == 'netease-cover') this.$root.playMusic(target.dataset.id);
        }, false)
    },
    data () {
        return {
            visible: false,
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
