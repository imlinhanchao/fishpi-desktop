import ipc from './ipc'

class Notice {
    constructor(setting) {
        this.updateSetting(setting)
        this.lastOnline = null;
        this.current = {};
        this.noticed = {
            at:[],
            reply:[],
            comment:[],
            sys:[]
        }

    }

    updateSetting(setting) {
        this.setting = setting
    }

    setApi(fishpi) {
        this.fishpi = fishpi;
    }

    setAudio(audio) {
        this.audio = audio;
    }

    setCurrent(current) {
        this.current = current;
    }

    chatroomMsg(msg) {
        switch(msg.type) {
            case 'online': {
                let userNames = msg.data.map(u => u.userName);
                if (this.lastOnline == null) {
                    this.lastOnline = userNames;
                    break;
                }
                let newOnline = userNames.filter(u => this.lastOnline.indexOf(u) < 0);
                let careUsers = this.setting.value.chatroom.careUsers;
                newOnline.forEach(u => {
                    if (careUsers.indexOf(u) >= 0) {
                        this.sysNotice('特别关心', `你的特别关心 ${u} 上线啦~`);
                    }
                })
                break;
            }

            case 'redPacket': {
                if (this.setting.value.chatroom.redpackNotice && msg.data.userName != this.current.userName) {
                    this.sysNotice('红包提醒', `${msg.data.userNickname} 发红包啦~`, null, () => {
                        new BroadcastChannel('main-router').postMessage({ url: `/chatroom?id=${msg.oId}` }); 
                    });
                    this.audioNotice();
                }
                break;
            }

            case 'msg': {
                if (this.setting.value.message.notice.chatroom) this.audioNotice();
                if (!this.setting.value.message.notice.talk) break;
                if (msg.data.md.match(new RegExp(this.setting.value.message.talkmsg))) {
                    this.sysNotice('关心的消息', `${msg.data.userNickname} 说：“${msg.data.md}”`, null, () => {
                        new BroadcastChannel('main-router').postMessage({ url: `/chatroom?id=${msg.oId}` }); 

                    });
                    this.audioNotice();
                }
            }
        }
    }

    noticeMsg(notice) {
        switch(notice.command) {
            case 'refreshNotification': {
                this.checkNotice();
                break;
            }
            case 'newIdleChatMessage': {
                if (!this.setting.value.message.notice.chat) return;
                this.audioNotice();
                this.sysNotice('新消息', `${notice.senderUserName} 说：“${notice.preview.replace(/(.{10}).*/, '$1...')}”`, null, () =>{
                    new BroadcastChannel('main-router').postMessage({ url: `/chat/${notice.senderUserName}` }); 
                });
                break;
            }
        }
    }

    sysNotice(title, body, url, callback) {
        if (!this.setting.value.message.way.msg) return;
        ipc.send('win-notice', { title, body, url }, callback)
    }

    audioNotice() {
        if (!this.setting.value.message.way.audio) return;
        this.audio.play()
    }

    async checkNotice() {
        let noticeCnt = await this.fishpi.notice.count();
        if (noticeCnt.unreadNotificationCnt == 0) return;

        if (noticeCnt.unreadReplyNotificationCnt > 0) {
            this.noticeReply();
        }

        if (noticeCnt.unreadCommentedNotificationCnt > 0) {
            this.noticeComment();
        }

        if (noticeCnt.unreadAtNotificationCnt > 0) {
            this.noticeAt();
        }

        if (noticeCnt.unreadSysAnnounceNotificationCnt > 0) {
            this.noticeSys();
        }
    }

    async noticeReply() {
        if(!this.setting.value.message.notice.reply) return;
        let rsp = await this.fishpi.notice.list('reply');
        let data = rsp.data.filter(d => !d.hasRead && this.noticed.reply.indexOf(d.oId) < 0);
        if (data.length == 0) return;
        data.forEach(d => {
            this.noticed.reply.push(d.oId);
            this.sysNotice(d.commentArticleTitle, 
            `${d.userName}回复你 ${this.$root.toText(d.content)}`, `https://fishpi.cn${d.commentSharpURL}`)
        })
    }

    async noticeAt() {
        if(!this.setting.value.message.notice.at) return;
        let rsp = await this.fishpi.notice.list('at');
        console.dir(rsp)
        let data = rsp.data.filter(d => !d.hasRead && !d.deleted && this.noticed.at.indexOf(d.oId+d.dataType) < 0);
        if (data.length == 0) return;
        data.forEach(d => {
            this.noticed.at.push(d.oId+d.dataType);
            if(d.dataType == 38) { // 聊天室 @
                this.sysNotice(`${d.userName}在聊天室 @ 你`, this.toText(d.content), null, async () => {
                    await this.fishpi.notice.makeRead('at');
                    new BroadcastChannel('main-router').postMessage({ url: `/chatroom?id=${d.dataId}` }); 
                })
            }
        })
    }

    async noticeComment() {
        if(!this.setting.value.message.notice.reply) return;
        let rsp = await this.fishpi.notice.list('commented');
        console.dir(rsp)
        let data = rsp.data.filter(d => !d.hasRead && this.noticed.comment.indexOf(d.oId) < 0);
        if (data.length == 0) return;
        data.forEach(d => {
            this.noticed.comment.push(d.oId);
            this.sysNotice(d.commentArticleTitle, 
            `${d.commentAuthorName}评论你 ${this.$root.toText(d.commentContent)}`, `https://fishpi.cn${d.commentSharpURL}`)
        })
    }

    async noticeSys() {
        if(!this.setting.value.message.notice.sys) return;
        let rsp = await this.$root.pwl.noticelist('sys-announce');
        if (rsp.code != 0) return;
        console.dir(rsp)
        let data = rsp.data.filter(d => !d.hasRead && this.noticed.sys.indexOf(d.dataId) < 0);
        if (data.length == 0) return;
        data.forEach(d => {
            this.noticed.sys.push(d.dataId);
            this.sysNotice('摸鱼派系统通知', d.commentArticleTitle, `https://fishpi.cn/article/${d.dataId}`)
        })
    }

    toText(html) {
        let div = document.createElement('div')
        div.innerHTML = html;
        return div.textContent;
    }
}

export default Notice;