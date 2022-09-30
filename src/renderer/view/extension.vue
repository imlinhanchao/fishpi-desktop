<template>
<div class="layout">
    <div class="ext-list">
        <div class="ext-item" v-for="e in extensions" @click="current == e.fishpi.key">
            <div class="ext-icon">
                <img :src="iconPath(e)" />
            </div>
            <div class="ext-info">
                <h2>{{e.displayName || e.name}}<sub>{{e.version}}</sub></h2>
                <p class="ext-desc ellipsis">{{e.description}}</p>
                <p class="ext-author">{{e.author || e.publisher || "神秘开发者"}}</p>
            </div>
        </div>
    </div>
    <div class="ext-detail" v-if="current">

    </div>
</div>
</template>

<script>
    import path from 'path';
    export default {
        name: 'context',
        components: {
        },
        mounted () {
            for(let e in this.$root.extension.extensions) {
                this.extensions.push(this.$root.extension.extensions[e]);
            }
        },
        beforeDestroy () {
        },
        data () {
            return {
                extensions: [],
                current: null
            }
        },
        watch: {
        },
        filters: {
        },
        computed: {
            
        },
        methods: {
            iconPath(ext) {
                return path.join(ext.fishpi.root, ext.fishpi.icon)
            }
        }
    }
</script>
<style lang="less" scoped>
.layout {
    background: var(--main-chatroom-background-color);
    display: flex;
    height: 100%;
    flex-direction: row;
    .ext-list {
        width: 100%;
        .ext-item {
            display: flex;
            flex-direction: row;
            padding: 10px;
            border-bottom: 1px dashed var(--global-control-border-color);
            cursor: pointer;
            &:hover {
                background: var(--main-chatroom-sidebar-background-color);
            }
            .ext-icon img{
                width: 70px;
                height: 70px;
                margin: 5px;
            }
            .ext-info {
                margin-left: 10px;
                font-size: .8em;
                h2 {
                    font-size: 1.4em;
                    font-weight: 700;
                    sub {
                        border-radius: 5px;
                        font-weight: normal;
                        padding: 0 5px;
                        margin: 0 5px;
                        background: var(--main-chatroom-sidebar-background-color);
                        bottom: 0;
                    }
                }
                h2, p {
                    margin: 0;
                }
                .ext-desc {
                    font-weight: 100;
                }
                .ext-author {
                    font-weight: 400;
                }
            }
        }
    }
    .ext-detail {
        display: none;
    }
}
@media (max-width: 500px) {

.layout {
    .ext-detail {
        display: flex;
    }
}

}

</style>