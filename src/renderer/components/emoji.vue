<template>
<section class="emoji-form">
    <Tabs value="emoji" type="card">
        <TabPane :label="emojiLabel" name="emoji">
            <article class="face-list">
                <section class="face-item" v-for="e in defaults" :title="e.name" @click="sendFace(e.name)">
                    <img :src="e.url" :alt="e.name">
                </section>
            </article>
        </TabPane>
        <TabPane :label="facesLabel" name="faces">
            <article class="face-list face-diy">
               
            </article>
        </TabPane>
    </Tabs>
</section>
</template>

<script>
    export default {
        name: 'emoji',
        components: {
        },
        props: {

        },
        mounted () {
            this.loadFav();
        },
        data () {
            return {
                emojiLabel: (h) => {
                    return h('div', {
                            attrs: {
                                title: '默认'
                            }
                        }, [
                        h('span', ['🙂'])
                    ])
                },
                facesLabel: (h) => {
                    return h('div', {
                            attrs: {
                                title: '收藏'
                            }
                        }, [
                        h('span', ['⭐'])
                    ])
                },
                faces: []
            }
        },
        watch: {
        },
        filters: {
        },
        computed: {
            defaults() {
                return Object.keys(this.$fishpi.emoji.default).map(e => ({
                    name: e, url: this.$fishpi.emoji.default[e]
                }))
            }
        },
        methods: {
            async loadFav() {
                this.faces = await this.$fishpi.emoji.get();
            },
            sendFace(name) {

            }
        }
    }
</script>
<style lang="less" scoped>

</style>
