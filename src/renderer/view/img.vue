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
            @wheel="wheelHandle" :style="style"
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
        this.$ipc.listen('img-update',(event, url) => {
            this.$router.replace(url);
        });
        document.body.addEventListener('keydown', (ev) => {
            if (ev.keyCode == 27) window.close();
        });
    },
    data () {
        return {
            image: '',
            width: undefined,
            height: undefined,
            radio: 1,
            margin: 'auto',
            dragStartPos: {
                x: 0, y: 0
            },
            dragPos: {
                x: 0, y: 0
            },
            dragStartPointer: {
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
        },
        style() {
            return {
                width: this.width ? this.width + 'px' : 'auto',
                height: this.height ? this.height + 'px' : 'auto',
                left: this.dragPos.x ? this.dragPos.x + 'px' : 'auto',
                top: this.dragPos.y ? this.dragPos.y + 'px' : 'auto',
            }
        }
    },
    methods: {
        loadHandle() {
            let contentSize = {
                width: this.content.offsetWidth,
                height: this.content.offsetHeight,
            }
            this.radio = this.img.naturalHeight / this.img.naturalWidth;
            this.width = this.radio <= 1 ? contentSize.width : contentSize.height / this.radio;
            this.height = this.radio > 1 ? contentSize.height : contentSize.width * this.radio;
            this.dragPos.x = (contentSize.width - this.width) / 2;
            this.dragPos.y = (contentSize.height - this.height) / 2;
        },
        handleClose() {
            window.close();
        },

        handleOpen() {
            window.open(this.image);
        },
        wheelHandle(ev) {
            if (ev.deltaY > 0 && (this.width < 20 || this.height < 20)) return;
            let lastSize = {
                width: this.width,
                height: this.height,
            }
            this.width = Math.max(20, (this.width - ev.deltaY))
            this.height = this.width * this.radio;

            this.dragPos.x = ev.clientX - (ev.clientX - this.dragPos.x) / lastSize.width * this.width;
            this.dragPos.y = ev.clientY - (ev.clientY - this.dragPos.y) / lastSize.height * this.height;
        },
        dragStart(ev) {
            this.drag = true
            this.dragStartPointer = { x: ev.clientX, y: ev.clientY };
            this.dragStartPos = this.dragPos;
        },
        dragImg(ev) {
            if (!this.drag) return;
            this.dragPos = {
                x: this.dragStartPos.x + (ev.clientX - this.dragStartPointer.x),
                y: this.dragStartPos.y + (ev.clientY - this.dragStartPointer.y),
            }
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
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
}
.img {
    position: absolute;
    user-select: none;
}
</style>