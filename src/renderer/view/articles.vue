<template>
<div id="article" class="layout" v-if="current" @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'articles', instance: this}))">
    <section ref="content" class="content">
        <section class="item" v-for="b in contents">
            <Avatar class="msg-avatar user-card" :title="b.articleAuthorName" :data-user="b.articleAuthorName" :src="b.articleAuthorThumbnailURL48" />
            <section class="content"><router-link :to="`/article/${b.oId}`">{{b.articleTitleEmoj}}</router-link></section>
            <section class="views">{{b.articleViewCntDisplayFormat || b.articleViewCount}}</section>
        </section>
        <section class="more">
            <Button type="text" @click="load(page+1)">
                <Icon custom="fa fa-caret-down" />
            </Button>
        </section>
    </section>
</div>
</template>

<script>
    import { ArticleListType } from 'fishpi'
    export default {
        name: 'articles',
        components: {
        },
        mounted () {
            this.load(this.page)
        },
        beforeDestroy () {
            this.unLoad();
        },
        data () {
            return {
                contents: [],
                page: 1,
                message: '',
                sending: false,
            }    
        },
        watch: {
        },
        filters: {
        },
        computed: {
            current() {
                return this.$root.current;
            },
        },
        methods: {
            unLoad() {
            },
            async load(page) {
                let rsp = await this.$fishpi.article.list({ type: ArticleListType.Reply, page });
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.contents = this.contents.concat(rsp.data.articles);
                this.page = page;
            },
            async send() {
                if (!this.message) return;
                this.sending = true;
                let rsp = await this.$fishpi.breezemoon.send(this.message);
                if (rsp.code != 0) this.$Message.error(rsp.msg);
                else {
                    this.message = '';
                    rsp = await this.$fishpi.breezemoon.list(1);
                    this.contents.unshift(rsp.breezemoons[0]);
                    this.$refs.content.scrollTo(0, 0);
                }
                this.sending = false;
            }
        }
    }
</script>
<style lang="less" scoped>
.layout {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--main-chatroom-background-color);

    .msg-avatar {
        min-width: 25px;
        width: 25px;
        height: 23px;
        border-radius: 50%;
        cursor: pointer;
    }
    .content {
        position: relative;
        overflow: auto;
    }

    .item {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 5px 0 5px 10px;
        .content {
            padding-left: 10px;
            word-break: break-word;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            word-wrap: normal;
            width: 100%;
        }
        .views {
            font-size: .8em;
            font-weight: bold;
            display: inline-block;
            background-color: var(--global-alpha-background-color);
            padding: 5px;
            border-radius: .8em;
            line-height: .8;
            height: 1.5em;
            opacity: .7;
        }
    }
    .more {
        text-align: center;
    }
}
</style>