<template>
<div class="layout">
    <article class="settings">
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
                    <Button style="width:10em;background: #141516" 
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
                        <Checkbox v-model="setting.message.notice.talk"@on-change="changeSetting" >聊天室聊到了</Checkbox>
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
    </article>
</div>
</template>

<script>
  import { position } from 'caret-pos';

    export default {
        name: 'setting',
        components: {
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
                shieldIndex: 0
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
            }
        },
        methods: {
            settingListener(setting) {
                this.setting = setting;
            },
            changeSetting() {
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
</style>
<style lang="less">
</style>
