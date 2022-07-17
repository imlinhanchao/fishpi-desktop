<template>
<section class="layout">
    <header class="drag header">
        <h1 class="drag"> <img src='../assets/icon.png' />
        <span id="win-title" class="drag" :title="imageName">{{ imageName }}</span></h1>
        <span class="control no-drag">
            <Button type="text" @click="handleOpen"><Icon custom="fa fa-external-link"></Icon></Button>
            <Button type="text" @click="handleClose"><Icon custom="fa fa-times"></Icon></Button>
        </span>
    </header>
    <Content class="img-content no-drag" ref="content">
        <img draggable="false"
            @load="loadHandle" ref="img" class="img" 
            v-if="image" :src="image" 
            @mousedown="dragStart" @mousemove="dragImg" @mouseup="dragOver"
            @wheel="wheelHandle" :style="{ width: width + 'px', height: height + 'px', maxWidth, maxHeight, margin }"
        />
    </Content>
</section>
</template>

<script>
  import path from 'path'

  export default {
    name: 'image-view',
    component: {
    },
    mounted () {
        this.image = this.$route.params.imgpath;
        document.title = path.basename(this.image);
        window.addEventListener('resize', () => {
            this.wheelHandle({ deltaY: 0 });
        })
        this.$ipc.listen('img-update',(event, url) => {
            this.$router.replace(url);
        });
    },
    data () {
        return {
            image: '',
            width: undefined,
            height: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
            margin: 'auto',
            dragPos: {
                x: 0, y: 0
            },
            dragScroll: {
                x: 0, y: 0
            },
            drag: false,
            radio: 0,
        }
    },
    watch: {
        $route(val) {
            this.image = this.$route.params.imgpath;
            document.title = path.basename(this.image);
        }
    },
    filters: {
    },
    computed: {
        imageName() {
            return this.image ? path.basename(this.image) : '';
        },
        img() {
            return this.$refs.img;
        },
        content() {
            return this.$refs.content.$el
        }
    },
    methods: {
        loadHandle() {
            this.radio = this.img.naturalHeight / this.img.naturalWidth;
            this.maxWidth = window.innerWidth - 50
            this.maxHeight = window.innerHeight - 80
            this.width = this.img.width > this.img.height ? this.maxWidth : this.maxHeight / this.radio;
            this.height = this.img.height > this.img.width ? this.maxHeight : this.maxWidth * this.radio;
        },
        handleClose() {
            window.close();
        },

        handleOpen() {
            window.open(this.image);
        },
        wheelHandle(ev) {
            if (ev.deltaY > 0 && this.maxWidth < 20) return;
            this.maxWidth = this.maxHeight = 'none';
            this.width = Math.max(20, (this.width - ev.deltaY))
            this.height = this.width * this.radio;
        },
        dragStart(ev) {
            this.drag = true
            this.dragPos = { x: ev.clientX, y: ev.clientY };
            this.dragScroll = { x: this.content.scrollTop, y: this.content.scrollLeft };
        },
        dragImg(ev) {
            if (!this.drag) return;
            this.content.scrollTo(this.dragScroll.x - (ev.clientX - this.dragPos.x), 
                            this.dragScroll.y - (ev.clientY - this.dragPos.y));
        },
        dragOver(ev) {
            this.drag = false
        }
    }
  }
</script>

<style lang="less" scoped>
.layout {
    background: var(--global-background-color);
    padding: 5px;
    display: flex;
    flex-direction: column;
    height: 100vh;
}
header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    height: 40px;
    h1 {
        font-size: 1em;
        padding: 0 5px;
        font-weight: normal;
        img {
            height: 1.5em;
            vertical-align: middle;
        }
        span {
            vertical-align: middle;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
            max-width: calc(100vw - 160px);
            display: inline-block;
        }
    }
    .control {
        i {
            font-size: 1.5em;
        }
    }
}
.img-content {
    display: flex;
    overflow: auto;
}
.img {
    margin: auto;
    user-select: none;
}
</style>