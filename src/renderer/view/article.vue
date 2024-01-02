<template>
<div id="article" class="layout" v-if="content" @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'article', instance: this}))">
    <header>
        <div class="view-list" :title="`有 ${ heat } 个人和你一起在看`" ref="heatRef">
            <div class="view-item" :data-heat="heat" :style="{ width: `${heat * 3}px` }"></div>
        </div>
        <a title="返回" class="back-btn" @click="goBack"><i class="fa-solid fa-caret-left"></i></a>
        <h1>{{ content.articleTitleEmoj }}</h1>
        <p>
            <Avatar :size="18" style="min-width: 18px;" class="msg-avatar user-card" :title="content.articleAuthorName" :data-user="content.articleAuthorName" :src="content.articleAuthorThumbnailURL210" />
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
            <span class="info-item click" title="评论" @click="toComment">
                <i class="fa-solid fa-message"></i>
                <span> {{ content.articleComments.length }}</span>
            </span>
        </p>
    </header>
    <section class="container">
        <main ref="main">
            <section class="vditor-reset article-content" v-html="articleContent"></section>
            <section class="article-time" v-if="content.articleUpdateTime != content.articleCreateTime">
              更新于 <time>{{ content.articleUpdateTimeStr }}</time> 
            </section>
            <section class="article-time" v-else>
              发表于 <time>{{ content.articleCreateTimeStr }}</time> 
            </section>
        </main>
        <article class="rewarded" v-if="content.articleRewardPoint">
          <Poptip
            class="rewarded-click"
            v-if="!content.rewarded"
            confirm
            :title="`确定要打赏 ${content.articleRewardPoint} 积分给该帖子作者？`"
            @on-ok="reward">
            <section class="rewarded-click">
              <span class="rewarded-text"><a href="javascript:void(0)">打赏</a> {{ content.articleRewardPoint }} 积分后可见</span>
              <span class="rewarded-count">{{ content.rewardedCnt }} 打赏</span>
            </section>
          </Poptip>
          <section class="rewarded-content" v-else>
            <span class="rewarded-text vditor-reset" v-html="content.articleRewardContent"></span>
            <span class="rewarded-count">{{ content.rewardedCnt }} 打赏</span>
          </section>
        </article>
        <footer ref="comment">
            <MessageBox 
                @anonymous="$event => comment.commentAnonymous = $event"
                @visible="$event => comment.commentVisible = $event" 
                placeholder="说点什么" 
                class="msg-box" 
                ref="msgbox" 
                :comment="comment" 
                :chatroom="false"
                :reply.sync="reply"
                @send="commented"
            />
            <Comment :comments="content.articleComments" :pagination="pagination" @reply="replyed"/>
        </footer>
    </section>
</div>
</template>

<script>
    import MessageBox from '../components/messagebox.vue';
    import Comment from '../components/comments.vue'
    export default {
        name: 'articleItem',
        components: {
            Comment, MessageBox
        },
        async mounted () {
            await this.load(this.$route.params.id)
            this.$fishpi.article.heat(this.$route.params.id).then(async data => {
              this.heat = data;
              this.listenRws = await this.$fishpi.article.addListener({
                id: this.content.oId,
                type: this.content.articleType,
              }, async ({ data }) => {
                try {
                    const msg = JSON.parse(data);
                    if (msg.type == 'articleHeat') {
                        this.updateHeat(msg.operation == '+' ? 1 : -1);
                    }
                    else if (msg.commentOnArticleId == this.content.oId) {
                        if (!this.content.articleComments.some(c => c.oId == msg.oId)) 
                            this.content.articleComments.push(msg);
                    }
                } catch (error) {
                  
                }
              })
            });
        },
        beforeDestroy () {
            this.unLoad();
        },
        data () {
            return {
                content: null,
                pagination: null,
                message: '',
                sending: false,
                comment: {
                    articleId: '',
                    commentAnonymous: false,
                    commentVisible: false,
                    commentContent: false,
                    commentOriginalCommentId: ''
                },
                reply: {
                    oId: '',
                    content: '',
                    userName: ''
                },
                heat: 0,
                listenRws: null,
                heatIn: false,
                heatOut: false,
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
            articleContent() {
                return this.content && this.content.articleContent.replace(/(<a )/g, '$1target="_blank" ')
                .replace(/(<iframe[^>]*?src="(https:)*\/\/music.163.com\/outchain\/player\?type=\d&amp;id=(\d+)[^"]*?">\s*<\/iframe>)/, '<div class="netease-music"><div class="netease-cover" data-id="$3"></div>$1</div>')
                .replace(/(<img )/g, '$1data-action="preview" ')
            }
        },
        methods: {
            updateHeat(n) {
                const heatEle = document.createElement('div');
                heatEle.className = n > 0 ? 'heat-in' : 'heat-out';
                this.$refs.heatRef.appendChild(heatEle);
                setTimeout(() => {
                    this.$refs.heatRef.removeChild(heatEle);
                    this.heat += n;
                }, 2000);
            },
            goBack() {
              this.unLoad();
              this.$router.go(-1);
            },
            unLoad() {
              if (this.listenRws) this.listenRws.close();
            },
            async load(id) {
                let rsp = await this.$fishpi.article.detail(id);
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.content = rsp.data.article;
                this.pagination = rsp.data.pagination;
                this.$root.title = this.content.articleTitleEmoj;
                this.comment.articleId = id;
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
            async reward() {
                if (this.content.rewarded) return;
                let rsp = await this.$fishpi.article.reward(this.content.oId);
                console.log(rsp)
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.content.rewarded = true;
                this.content.rewardedCnt += 1;
                this.content.articleRewardContent = rsp.articleRewardContent;
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
            replyed(reply) {
                this.reply = reply;
                this.$refs.msgbox.$el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
               });
            },
            async toComment() {
               this.$refs.msgbox.$el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
               });
            },
            async commented(commentContent, callback) {
                let rsp = await this.$fishpi.comment.send({ 
                  ...this.comment, 
                  commentContent, 
                  commentOriginalCommentId: this.reply && this.reply.oId 
                })
                if (rsp.code) return callback(rsp.msg);
                callback();
                await this.load(this.$route.params.id);
                this.reply = null;
            }
        }
    }
</script>
<style lang="less" scoped>
.layout {
    flex-direction: column;
    font-size: .8em;
    background: var(--article-background-color);
    margin-bottom: 5px;
    position: relative;
    height: 99%;
    padding-right: 5px;
    header {
        text-align: center;
        position: sticky;
        top: 0;
        left: 0;
        background: var(--article-header-background-color);
        width: 100%;
        padding-bottom: 5px;
        z-index: 100;
        .view-list {
            position: absolute;
            top: 2px;
            right: 5px;
            width: 100%;
            z-index: 84;
            height: 3px;
            cursor: pointer;
            .view-item {
                position: absolute;
                height: 3px;
                background-color: var(--article-heat-color);
                z-index: 1;
                bottom: -3px;
                right: 0;
            }
        }
        .back-btn {
            position: absolute;
            left: 0;
            top: -5px;
            z-index: 85;
        }
        .info-item {
            display: inline-block;
            margin: 0 3px;
        }
        .click {
            cursor: pointer;
        }
    }
    .container {
        overflow: auto;
        height: 99%;
        flex-direction: column;
        display: flex;
    }
    main {
        padding: 10px 20px;
        line-height: 2;
        max-width: 800px;
        margin: 0 auto;
    }
    .msg-box {
        flex-direction: column-reverse;
        margin: 0 10px;
    }

    footer {
        padding-top: 10px;
    }

    .article-time {
        text-align: right;
        font-style: italic;
        opacity: .5;
    }

    .rewarded {
      padding: 5px 10px;
      margin: 5px 10px;
      border-radius: 5px;
      background-size: 45px 45px;
      background-color: var(--global-control-focus-color);
      background-image: linear-gradient(-45deg, var(--global-control-focus-color) 25%, transparent 25%, transparent 50%, var(--global-control-focus-color) 50%, var(--global-control-focus-color) 75%, transparent 75%, transparent);
      .rewarded-click {
        width: 100%;
        cursor: pointer;
        position: relative;
        user-select: none;
        height: 50px;
        /deep/ .ivu-poptip-rel {
          width: 100%;
        }
        .rewarded-count {
          bottom: 0;
        }
      }
      .rewarded-count {
        position: absolute;
        bottom: -1em;
        right: 0;
      }
      .rewarded-content {
        position: relative;
        margin-bottom: 1em;
      }
    }
}
</style>