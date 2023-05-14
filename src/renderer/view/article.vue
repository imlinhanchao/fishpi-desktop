<template>
<div id="article" class="layout vditor--dark" v-if="content" @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'article', instance: this}))">
    <header>
        <router-link title="返回" class="back-btn" to="/articles"><i class="fa-solid fa-caret-left"></i></router-link>
        <h1>{{ content.articleTitleEmoj }}</h1>
        <p>
            <Avatar :size="18" class="msg-avatar user-card" :title="content.articleAuthorName" :data-user="content.articleAuthorName" :src="content.articleAuthorThumbnailURL210" />
            <span>{{ content.articleAuthorName }}</span>
            <span class="info-item">|</span>
            <span class="info-item"><i class="fa-solid fa-eye"></i> {{ content.articlePostTimeDisplayFormat || content.articleViewCount }}</span>
            <span class="info-item" title="感谢">
                <Poptip
                    class="click"
                    v-if="content.articleAuthorName != $root.current.userName"
                    confirm
                    title="确认赠送 20 积分给该帖作者以表感谢？"
                    @on-ok="thank">
                    <i v-if="content.thanked" class="fa-solid fa-heart"></i>
                    <i v-else class="fa-regular fa-heart"></i>
                    <span> {{ content.articleThankCnt }}</span>
                </Poptip>
                <span v-else>
                    <i v-if="content.thanked" class="fa-solid fa-heart"></i>
                    <i v-else class="fa-regular fa-heart"></i>
                    <span> {{ content.articleThankCnt }}</span>
                </span>
            </span>
            <span class="info-item click" title="点赞" @click="vote('up')">
                <i v-if="content.articleVote == 0" class="fa-solid fa-thumbs-up"></i>
                <i v-else class="fa-regular fa-thumbs-up"></i>
                <span> {{ content.articleGoodCnt }}</span>
            </span>
            <span class="info-item click" title="点踩" @click="vote('down')">
                <i v-if="content.articleVote == 1" class="fa-solid fa-thumbs-up fa-rotate-180"></i>
                <i v-else class="fa-regular fa-thumbs-up fa-rotate-180"></i>
                <span> {{ content.articleBadCnt }}</span>
            </span>
        </p>
    </header>
    <main>
        <section class="vditor-reset article-content" v-html="content.articleContent"></section>
    </main>
    <footer>
        <Comment :comments="content.articleComments" />
    </footer>
</div>
</template>

<script>
    import Comment from '../components/comments.vue'
    export default {
        name: 'articleItem',
        components: {
            Comment,
        },
        mounted () {
            this.load(this.$route.params.id)
        },
        beforeDestroy () {
            this.unLoad();
        },
        data () {
            return {
                content: null,
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
            async load(id) {
                let rsp = await this.$fishpi.article.detail(id);
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.content = rsp.data.article;
                this.$root.title = this.content.articleTitleEmoj;
            },
            async thank() {
                if (this.content.thanked) return;
                let rsp = await this.$fishpi.article.thank(this.content.oId);
                console.log(rsp)
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.content.thanked = true;
                this.content.articleThankCnt += 1;
            },
            async vote(type) {
                let rsp = await this.$fishpi.article.vote(this.content.oId, type);
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                if (type == 'up') {
                    this.content.articleGoodCnt += this.content.articleVote == 0 ? -1 : 1;
                    this.content.articleVote = rsp.type == -1 ? 0 : -1;
                } else {
                    this.content.articleBadCnt += this.content.articleVote == 1 ? -1 : 1;
                    this.content.articleVote = rsp.type == -1 ? 1 : -1;
                }
            },
            async comment() {
               
            }
        }
    }
</script>
<style lang="less" scoped>
.layout {
    flex-direction: column;
    font-size: .8em;
    overflow: auto;
    height: 99%;
    background: var(--global-background-color);
    margin-bottom: 5px;
    header {
        text-align: center;
        position: sticky;
        top: 0;
        left: 0;
        background: var(--global-background-color);
        width: 100%;
        padding-bottom: 5px;
        z-index: 100;
        .back-btn {
            position: absolute;
            left: 0;
            top: -5px;
        }
        .info-item {
            display: inline-block;
            margin: 0 3px;
        }
        .click {
            cursor: pointer;
        }
    }
    main {
        padding: 10px 20px;
        line-height: 2;
        max-width: 800px;
        margin: 0 auto;
    }
}
</style>