<template>
<div id="comments" @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'comments', instance: this}))">
    <ul>
        <li :id="`comment-item-${c.oId}`" class="comment-item" v-for="(c, i) in comments.reverse()" :data-id="c.oId">
            <Avatar :src="c.commentAuthorThumbnailURL" />
            <div class="comment-main">
                <div class="comment-header">
                    <div class="comment-user">
                        <span class="comment-user-name">{{ c.commentAuthorName }}</span>
                        <span :title="`跳转回复`" class="comment-reply" v-if="c.commentOriginalCommentId" @click="showReply(c.commentOriginalCommentId)">
                            <i class="fa-solid fa-reply fa-flip-horizontal"></i>
                            <Avatar :src="c.commentOriginalAuthorThumbnailURL" :size="15" />
                        </span>
                    </div>
                    <div class="comment-time">{{ c.commentCreateTimeStr || c.commentCreateTime }}</div>
                </div>
                <div class="comment-content vditor-reset" v-html="formatComment(c.commentContent)"></div>
                <div class="comment-footer">
                    <span class="info-item click" title="删除"
                      v-if="c.commentAuthorName == $root.current.userName">
                      <Poptip
                            class="click"
                            confirm
                            :title="`你确定要删除这条评论吗？`"
                            @on-ok="remove(c, i)">
                            <i class="fa-solid fa-trash"></i>
                        </Poptip>
                    </span>
                    <span class="info-item" title="感谢">
                        <Poptip
                            class="click"
                            v-if="c.commentAuthorName != $root.current.userName"
                            confirm
                            :title="`确认赠送 15 积分给 ${c.commentAuthorName} 以表感谢？`"
                            @on-ok="thank(c)">
                            <i v-if="c.rewarded" class="fa-solid fa-heart"></i>
                            <i v-else class="fa-regular fa-heart"></i>
                            <span> {{ c.commentThankCnt }}</span>
                        </Poptip>
                        <span v-else>
                            <i v-if="c.rewarded" class="fa-solid fa-heart"></i>
                            <i v-else class="fa-regular fa-heart"></i>
                            <span> {{ c.commentThankCnt }}</span>
                        </span>
                    </span>
                    <span class="info-item click" title="点赞" @click="vote(c, 'up')">
                        <i v-if="c.commentVote == 0" class="fa-solid fa-thumbs-up"></i>
                        <i v-else class="fa-regular fa-thumbs-up"></i>
                        <span> {{ c.commentGoodCnt }}</span>
                    </span>
                    <span class="info-item click" title="点踩" @click="vote(c, 'down')">
                        <i v-if="c.commentVote == 1" class="fa-solid fa-thumbs-up fa-rotate-180"></i>
                        <i v-else class="fa-regular fa-thumbs-up fa-rotate-180"></i>
                        <span> {{ c.commentBadCnt }}</span>
                    </span>
                    <span class="info-item click" title="回复" @click="reply(c)">
                        <i class="fa-solid fa-reply"></i>
                    </span>
                </div>
            </div>
        </li>
    </ul>
</div>
</template>

<script>
    export default {
        name: 'comments',
        props: {
            comments: {
                type: Array,
                default: () => {
                    return {}
                }
            }
        },
        components: {
        },
        mounted () {
        },
        beforeDestroy () {
            this.unLoad();
        },
        data () {
            return {
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
            formatComment(comment) {
              return comment.replace(/(<a )/g, '$1target="_blank" ')
                .replace(/(<iframe[^>]*?src="(https:)*\/\/music.163.com\/outchain\/player\?type=\d&amp;id=(\d+)[^"]*?">\s*<\/iframe>)/, '<div class="netease-music"><div class="netease-cover" data-id="$3"></div>$1</div>')
                .replace(/(<img )/g, '$1data-action="preview" ')
            },
            async thank(comment) {
                if (comment.rewarded) return;
                let rsp = await this.$fishpi.comment.thank(comment.oId);
                console.log(rsp)
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                comment.rewarded = true;
                comment.commentThankCnt += 1;
            },
            async vote(comment, type) {
                let rsp = await this.$fishpi.comment.vote(comment.oId, type);
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                if (type == 'up') {
                    comment.commentGoodCnt += comment.commentVote == 0 ? -1 : 1;
                    comment.commentBadCnt += comment.commentVote == 1 ? -1 : 0;
                    comment.commentVote = rsp.type == 0 ? -1 : 0;
                } else {
                    comment.commentBadCnt += comment.commentVote == 1 ? -1 : 1;
                    comment.commentGoodCnt += comment.commentVote == 0 ? -1 : 0;
                    comment.commentVote = rsp.type == 1 ? -1 : 1;
                }
            },
            reply(comment) {
                this.$emit('reply', {
                    oId: comment.oId,
                    userName: comment.commentAuthorName,
                    content: comment.commentContent
                })
            },
            async remove(comment, index) {
                let rsp = await this.$fishpi.comment.remove(comment.oId);
                if (rsp.code != 0) {
                    this.$Message.error(rsp.msg);
                    return;
                }
                this.comments.splice(index, 1);
            },
            showReply(commentId) {
                document.querySelector(`#comment-item-${commentId}`).scrollIntoView({
                    behavior: 'smooth'
                });
            },
        }
    }
</script>
<style lang="less" scoped>
#comments {
    font-size: .8em;
    margin: 15px 0 5px;
    padding: 0 10
    px;
    ul {
        padding: 10px 0;
        border-top: 1px dashed currentColor;
    }
    .comment-item {
        display: flex;
        flex-direction: row;
        padding: 5px;
        .comment-header {
            font-size: 1em;
            display: flex;
            justify-content: space-between;
        }
        .comment-main {
            padding: 0 5px;
            width: 100%;
        }
        &:hover {
            background-color: var(--global-alpha-background-white);
        }
        .comment-reply {
            cursor: pointer;
        }
    }
    .comment-footer {
        display: flex;
        justify-content: flex-end;
        .info-item {
            display: inline-block;
            margin: 0 3px;
        }
        .click {
            cursor: pointer;
        }
    }
}
</style>