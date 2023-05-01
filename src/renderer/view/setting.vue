<template>
<div id="setting" class="layout" @contextmenu="$root.popupMenu($root.getDefaultMenu($event, { name: 'setting', instance: this}))">
    <section class="update-card" v-if="update && updateModal">
        <header class="update-header">{{update.name}}</header>
        <section class="update-time">{{new Date(update.created_at).toLocaleString()}}</section>
        <section class="update-note md-style" v-html="tohtml(update.body)">
        </section>
        <footer>
            <section v-if="progress > 0" :title="progress + '%'" class="update-progress" :style="{ width: progress + '%' }"></section>
            <Button type="success" long @click="startUpdate">{{state}}</Button>
        </footer>
    </section>

    <article class="settings">
        <section class="app-version">
            <p><b>当前版本：</b><span>{{version}}</span></p>
            <p>
                <Button v-if="!update" type="success" size="small" @click="updateCheck" :loading="checking">{{updateBtn}}</Button>
                <Button v-if="update" type="success" size="small" @click="updateBegin" :loading="updating">{{updateBtn}}</Button>
            </p>
          </section>
          <p class="app-version">
            <label for="update-mirror">更新镜像：</label>
            <Input id="update-mirror" v-model="setting.global.updateMirror" @on-change="changeSetting" placeholder="更新镜像域名" />
          </p>
        <section id="setting_0">
            <Divider orientation="left">通用</Divider>
            <Form class="setting-form" :label-width="80" v-model="setting.global" :show-message="false">
                <FormItem label="透明窗体">
                    <section  class="opacity-form">
                        <i-switch v-model="setting.global.opacity.enable" @on-change="changeSetting"/>
                        <Slider title="透明度" @on-change="changeSetting" :disabled="!setting.global.opacity.enable" show-tip="always" v-model="setting.global.opacity.value" :min="10" :max="100"></Slider>
                    </section>
                </FormItem>
                <FormItem label="窗口置顶">
                    <i-switch v-model="setting.global.topWindow" @on-change="changeSetting"/>            
                </FormItem>
                <FormItem label="昨日活跃">
                    <i-switch title="自动领取" v-model="setting.global.autoReward" @on-change="changeSetting"/>            
                </FormItem>
                <FormItem label="网易音乐">
                    <Select v-model="setting.global.music" @on-change="changeSetting">
                        <Option :value="0" :key="0">点击播放</Option>
                        <Option :value="2" :key="2">点击加入播放列表</Option>
                        <Option :value="1" :key="1">点击播放并加入播放列表</Option>
                    </Select>            
                </FormItem>
            </Form>
        </section>
        <section id="setting_1">
            <Divider orientation="left">聊天室</Divider>
            <Form class="setting-form" :label-width="80" v-model="setting.chatroom" :show-message="false">
                <FormItem label="消息屏蔽">
                    <article class="shield-list">
                        <section v-for="(m, i) in setting.chatroom.shield" class="shield-item">
                            <section class="shield-type">
                                <Select v-model="m.type" @on-change="changeSetting">
                                    <Option v-for="s in shieldType" :value="s.value" :key="s.value">{{ s.text }}</Option>
                                </Select>
                            </section>
                            <section class="shield-value" v-if="!m.type.startsWith('redpacket')">
                                <Input v-model="m.value"  @on-keydown="getUser(m.value, 'user', i)" @on-change="changeSetting"/>
                            </section>
                            <Button type="text" @click="setting.chatroom.shield.splice(i, 1) && changeSetting()"><Icon custom="fa fa-trash-o"/></Button>
                        </section>
                        <section class="shield-add" @click="setting.chatroom.shield.push({
                            type: 'username',
                            value: ''
                        })"><Icon custom="fa fa-plus"/></section>
                    </article>
                </FormItem>
                <FormItem label="特别关心">
                    <Tag style="height:30px;line-height:30px;" color="success" v-for="(u, i) in setting.chatroom.careUsers" :key="u" :name="u" closable @on-close="setting.chatroom.careUsers.splice(i, 1) && changeSetting()">{{ u }}</Tag>
                    <Button style="width:10em;background: var(--global-control-background-color);" 
                        icon="ios-add" type="dashed" size="small" 
                        @click="pushCase">
                        <span @click.stop="$event.stopPropagation()"><Input ref="users" @on-keydown="getUser(careUser, 'care', 0)" @on-keyup.enter="pushCase" v-model="careUser" class="no-border" placeholder="用户名" /></span>
                    </Button>
                </FormItem>
                <FormItem label="红包提醒">
                    <i-switch v-model="setting.chatroom.redpackNotice" @on-change="changeSetting"/>            
                </FormItem>
            </Form>
        </section>
        <section id="setting_2">
            <Divider orientation="left">消息</Divider>
            <Form class="setting-form" :label-width="80" v-model="setting.message" :show-message="false">
                <FormItem label="消息提示">
                    <section style="display:flex;flex-wrap: wrap;">
                        <Checkbox v-model="setting.message.notice.chatroom" @on-change="changeSetting" >聊天室新消息</Checkbox>
                        <Checkbox v-model="setting.message.notice.chat" @on-change="changeSetting" >私聊新消息</Checkbox>
                        <Checkbox v-model="setting.message.notice.at" @on-change="changeSetting" >提及了我</Checkbox>
                        <Checkbox v-model="setting.message.notice.reply" @on-change="changeSetting" >收到回复</Checkbox>
                        <Checkbox v-model="setting.message.notice.sys" @on-change="changeSetting" >系统公告</Checkbox>
                        <Checkbox v-model="setting.message.notice.talk" @on-change="changeSetting" >聊天室聊到了</Checkbox>
                        <Input v-model="setting.message.notice.talkmsg" @on-change="changeSetting" size="small" placeholder="内容正则" style="width: auto;margin: 5px;"/>
                    </section>
                </FormItem>
                <FormItem label="提示方式">
                    <section style="display:flex;flex-wrap: wrap;">
                        <Checkbox v-model="setting.message.way.audio" @on-change="changeSetting">新消息声音</Checkbox>
                        <Checkbox v-model="setting.message.way.msg" @on-change="changeSetting">系统消息(聊天室除外)</Checkbox>
                    </section>
                </FormItem>
            </Form>
        </section>
        <section id="setting_3">
            <Divider orientation="left">快捷键</Divider>
            <Form class="setting-form" :label-width="80" v-model="setting.message" :show-message="false">
                <FormItem label="老板键">
                    <HotKeyInput
                        class="hotkey"
                        @change="changeHotKey('boss', $event)"
                        :hotkey.sync="setting.hotkey.boss"
                        placeholder="请按下组合按键">
                    </HotKeyInput>
                </FormItem>
            </Form>
        </section>
        <section id="setting_4">
            <Divider orientation="left">扩展</Divider>
            <Form class="setting-form" :label-width="80" v-model="setting.extensions" :show-message="false">
                <FormItem label="扩展目录">
                    <Input v-model="setting.extensions.root" @on-change="changeSetting" placeholder="扩展加载根目录" >
                        <Button slot="append" @click="openFolder"><Icon custom="fa fa-folder-open"/></Button>
                    </Input>
                </FormItem>
                <FormItem label="主题">
                    <Select v-model="setting.extensions.theme" @on-change="changeSetting('theme')">
                        <Option value="Default">默认</Option>
                        <Option v-for="v,t in themes" :value="`${t}`" :key="t">{{ v.description }}</Option>
                    </Select>
                </FormItem>
            </Form>
        </section>
    </article>
</div>
</template>

<script>
  import { position } from 'caret-pos';
  import Package from '../../../package.json'
  import { marked } from 'marked';
  import HotKeyInput from '../components/hotkey.vue';

    export default {
        name: 'setting',
        components: {
            HotKeyInput
        },
        async mounted () {
            this.autocompleteBroad.addEventListener("message", ({ data }) => {
                switch(data.type) {
                    case 'care': 
                        this.careUser = data.value;
                        break;
                    case 'user': 
                        this.setting.chatroom.shield[this.shieldIndex].value = data.value;
                        break;
                }
                this.sendAutoComplete([], data.type);
            }, false);
            this.$root.setting.addListener(this.settingListener);
            this.updateCheck();
            this.$root.extension.loadTheme(this.setting);
        },
        beforeDestroy() {
            this.$root.setting.removeListener(this.settingListener);
            this.autocompleteBroad.close();
        },
        data () {
            return {
                careUser: '',
                setting: this.$root.setting.value,
                autocompleteBroad: new BroadcastChannel('autocomplete-choose'),
                currentActive: document.activeElement,
                shieldIndex: 0,
                version: Package.version,
                updateBtn: '检查更新',    
                progress: 0,
                state: '更新',
                updating: false,
                update: null,
                updateModal: false,
                checking: false,
            }    
        },
        watch: {
        },
        filters: {
        },
        computed: {
            shieldType(){
                return [
                    { value: 'username', text: '用户' },
                    { value: 'content', text: '内容(支持正则)' },
                    { value: 'redpacket', text: '红包' },
                ]
            },
            themes() {
                return this.$root.extension.themes;
            }
        },
        methods: {
            settingListener(setting) {
                this.setting = setting;
            },
            changeSetting(type) {
                this.$root.setting.update(this.setting);
                if (type == 'theme') this.$root.extension.loadTheme(this.setting);
            },
            changeHotKey(type, hotkey) {
                this.$root.setting.registerHotkey(type, hotkey.text || hotkey);
                this.$root.setting.update(this.setting);
            },
            async pushCase() {
                if (this.careUser == '' || this.setting.chatroom.careUsers.indexOf(this.careUser) >= 0) return
                let rsp = await this.$fishpi.user(this.careUser);
                if (rsp.userName != this.careUser) {
                    this.$Message.error('用户名不存在');
                    return;
                }
                this.setting.chatroom.careUsers.push(this.careUser);
                this.careUser = ''
                this.changeSetting();
            },
            async getUser(name, type, index) {
                if (!name || !this.$refs['users']) return;
                try {
                    let atList = await this.$fishpi.names(name);
                    let autocomplete = atList.map(a => ({ 
                        value: a.userName, text: a.userName, img: a.userAvatarURL48
                    }))
                    this.shieldIndex = index;
                    this.sendAutoComplete(autocomplete, type);
                } catch (error) {
                    
                }
            },
            async sendAutoComplete(list, type, direct) {
                new BroadcastChannel('autocomplete').postMessage({ list, type, direct, caret: await this.getCaretPos() });
            },
            async getCaretPos() {
                this.currentActive =  document.activeElement
                let winPos = (await this.$ipc.sendSync('main-event', {
                    call: 'getPosition',
                })).data
                let msgPos = this.$root.getElementPosition(this.currentActive);
                let caretPos = position(this.currentActive);
                return {
                    x: msgPos.x + caretPos.left + winPos.x,
                    y: msgPos.y + caretPos.top + caretPos.height + winPos.y
                }
            },
            async updateCheck() {
                this.checking = true;
                let rsp = await this.$ipc.sendSync('win-update');
                this.checking = false;
                console.log(rsp)
                if (!rsp) return;
                this.update = rsp.data;
                if (!this.update) this.updateBtn = '已是最新';
                else this.updateBtn = '开始更新'
            },
            updateBegin() {
                this.updateModal = true;
            },
            startUpdate() {
                if (this.updating) return;
                this.updating = true;
                let that = this;
                this.update.mirror = this.setting.global.updateMirror;
                this.$ipc.send('win-update-app', this.update, 
                    (ev, data) => {
                        console.dir(data);
                        if (data.state == 'data'){
                            that.progress = data.pro;
                            that.state = '下载中' + (that.progress > 0 ? `(${that.progress}%)` : '');
                        }
                        else if(data.state == 'finish') {
                            that.state = '下载完成，等待更新'
                        }
                        else if(data.state == 'done') {
                            that.state = '更新完成，请重启生效'
                        }
                        else if (data.state == 'fail') {
                            that.state = '自动更新失效，请手动下载'
                            window.open(`https://github.com/imlinhanchao/fishpi-desktop/releases/${this.update.tag_name}`)
                        }
                    }
                );
            },
            tohtml (markdown) {
                return marked(markdown, { sanitize: true })
            },
            async openFolder() {
                let folder = (await this.$ipc.sendSync('main-event', {
                    call: 'openFolder',
                    args: this.setting.extensions.root
                })).data;
                if (folder[0]) {
                    this.setting.extensions.root = folder[0]
                    this.changeSetting()
                }
            }
        }
    }
</script>
<style lang="less" scoped>
.layout {
    width: 100%;
    height: 100%;
    display: block;
    background-color: var(--main-chatroom-background-color);
    overflow: auto;
    .settings {
        width: 100%;
        padding: 10px 15px;
        max-width: 500px;
        padding-bottom: 20px;
    }
    .ivu-divider {
        color:inherit;
        margin: 5px 0;
    }
    .setting-form {
        margin: 10px 0;
        .ivu-form-item {
            margin-bottom: 5px;
        }
    }
}
.shield-list {
    border-radius: 5px;
    border: 1px solid var(--global-control-border-color);
    padding:5px;
    .shield-item {
        display: flex;
        padding: 5px;
        border-bottom: 1px solid var(--global-control-border-color);
        .shield-type {
            width: 100%;
            margin-right: 5px;
        }
        .shield-value {
            width: 100%;
            margin-right: 5px;
        }
    }
    .shield-add {
        text-align: center;
        cursor: pointer;
    }
}
.app-version {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 5px 0;
    * {
      white-space: nowrap;
    }
}
.update-card {
    overflow: hidden;
    position: absolute;
    width: 70vw;
    top: 0; bottom: 0;
    left: 0; right: 0;
    margin: auto;
    background: #131415;
    box-shadow: 1px 1px 1px #aca49a;
    border-radius: 10px;
    max-height:50vh;
    padding: 10px 0 0;
    display: flex;
    flex-direction: column;
    z-index: 5000;
    header {
        text-align: center;
        font-size: 2em;
    }
    .update-time {
        font-size: .8em;
        color: #454647;
        text-align: center;
    }
    .update-note {
        max-height: 40vh;
        overflow: auto;
        padding: 0 15px 40px;
    }
    .update-progress {
        background: var(--global-active-color);
        height: 5px;
        margin: 0;
    }
    footer {
        margin: 0;
        position: absolute;
        width: 100%;
        bottom: 0;
    }
}
</style>
<style lang="less">
</style>
