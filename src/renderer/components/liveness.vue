<style lang="less" scoped>
footer {
    -webkit-app-region: no-drag;
    background: var(--global-background-color);
}
.liveness {
    background: #57a3f3;
    position: absolute;
    z-index: 1000;
    cursor: pointer;
    -webkit-app-region: no-drag;
}
.liveness-top-left {
    left: 1px;
    top: 1px;    
    height: 2px;
}
.liveness-top-right {
    right: 1px;
    top: 1px;    
    height: 2px;
}
.liveness-left {
    left: 1px;
    bottom: 1px;
    width: 2px;
}
.liveness-right {
    right: 1px;
    bottom: 1px;
    width: 2px;
}
.liveness-bottom {
    left: 1px;
    right: 1px;
    bottom: 1px;
    margin: auto;
    height: 2px;
}</style>

<template>
<footer>
    <div class="liveness liveness-top-left" :title="livenessTitle" :style="{ width: top + 'px', background: background }"></div>
    <div class="liveness liveness-top-right" :title="livenessTitle" :style="{ width: top + 'px', background: background }"></div>
    <div class="liveness liveness-left" :title="livenessTitle" :style="{ height: side + 'px', background: background }"></div>
    <div class="liveness liveness-right" :title="livenessTitle" :style="{ height: side + 'px', background: background }"></div>
    <div class="liveness liveness-bottom" :title="livenessTitle" :style="{ width: (bottom * 2) + 'px', background: background }"></div>
</footer>
</template>

<script>
    export default {
        name: 'liveness',
        components: {
        },
        props: {
            liveness: {
                required: true
            }
        },
        mounted () {
            window.addEventListener('resize', () => {
                this.screen = {
                    height: window.innerHeight - 2,
                    width: window.innerWidth - 2
                };
            })
        },
        data () {
            return {
                screen: {
                    height: window.innerHeight - 2,
                    width: window.innerWidth - 2
                },
            }
        },
        watch: {
        },
        filters: {
        },
        computed: {
            background() {
                return this.liveness >= 10 ? 'var(--liveness-active-color)' : 'var(--liveness-normal-color)'
            },
            livenessTitle() {
                return this.liveness + '%'
            },
            title() {
                return document.title;
            },
            len () {
                return this.liveness / 100 * this.size;
            },
            bottom() {
                return Math.min(this.len, this.screen.width / 2)
            },
            side () {
                return Math.min(this.len - this.bottom, this.screen.height)
            },
            top () {
                return this.len - this.bottom - this.side;
            },
            size () {
                return this.screen.height + this.screen.width
            },
        },
        methods: {
            handleClose() {
                ipcRenderer.send('win-close');
            },

            handleMin() {
                ipcRenderer.send('win-min');
            },
            
            handleTop() {
                this.wintop = !this.wintop;
                ipcRenderer.send('win-top', this.wintop)
                this.$root.setting.config('topWindow', this.wintop);
                this.$root.ipc.send('win-setting-change', this.$root.setting.value)
            },
            
            handleOpacity() {
                this.opacity.enable = !this.opacity.enable;
                ipcRenderer.send('win-opacity', this.opacity)
                this.$root.setting.config('opacity', this.opacity);
                this.$root.ipc.send('win-setting-change', this.$root.setting.value)
            },
        }
    }
</script>
