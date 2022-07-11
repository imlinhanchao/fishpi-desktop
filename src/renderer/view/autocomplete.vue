<template>
<div style="width: 500px;height:500px">
<div ref="autocomplete" class="autocomplete-list no-drag">
    <div :style="itemStyle"
        class="autocomplete-item"
        @click="choose(u.value)"
        :class="{ 'focus-at': focusIndex == i }"
        v-for="(u, i) in list"
      >
        <div class="auto-flex"><img v-if="u.img" :src="u.img" @load="resize"/> <span class="auto-text" v-if="u.text">{{u.text}}</span></div>
      </div>
</div>
</div>
</template>

<script>
  export default {
    name: 'autocomplete',
    components: {
    },
    mounted () {
        new BroadcastChannel('autocomplete').addEventListener("message", this.receive, false);
        document.body.addEventListener('load', () => this.resize());
        this.$ipc.send('autocomplete-event', { call: 'hide' });
    },
    data () {
        return {
            type: '',
            focusIndex: -1,
            list: [],
            direct: 'column',
            position: {
                x: 0,
                y: 0
            }
        }    
    },
    watch: {
    },
    filters: {
    },
    computed: {
        itemStyle() {
            return { display: this.direct == 'column' ? 'block' : 'inline-block' }
        }
    },
    methods: {
        choose(value) {
            new BroadcastChannel('autocomplete-choose').postMessage({ type: this.type, value });
        },
        receive(ev) {
            if (!ev.data || !ev.data.type) return;
            this.type = ev.data.type;
            this.list  = ev.data.list || [];
            this.direct = ev.data.direct || 'column';
            this.position = ev.data.caret || { x: 0, y: 0 };
            this.$nextTick(() => this.resize())
        },
        resize() {
            this.$ipc.send('autocomplete-event', { 
                call: 'resize', 
                args: { 
                    width: this.$refs.autocomplete.offsetWidth,
                    height: this.$refs.autocomplete.offsetHeight,
                } 
            })
            this.$ipc.send('autocomplete-event', { 
                call: 'position', 
                args: this.position
            })
            if (!this.list.length) this.$ipc.send('autocomplete-event', { call: 'hide' });
            else this.$ipc.send('autocomplete-event', { call: 'show' });
        }
    }
  }
</script>

<style lang="less" scoped>
.autocomplete-list {
    display: inline-block;
    flex-direction: column;
    background: var(--global-control-background-color);
    color: var(--global-control-text-color);
    margin-top: 15px;
    .autocomplete-item {
        display: inline-block;
        user-select: none;
        padding: .5em;
        cursor: pointer;
        &.focus-at, &:hover {
            background: var(--global-control-focus-color);
        }
        img {
            width: 30px;
        }
        .auto-flex {
            display:flex;

        }
        .auto-text {
            padding: 0 .5em;
        }
    }
}
</style>