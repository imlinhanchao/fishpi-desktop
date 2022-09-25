<style lang="less" scoped>
.layout-form {
    padding: 20px 0.5em;
    width: 95%;
    margin: auto;
    i {
        width: 15px;
    }
}
.layout-logo {
    text-align: center;
    font-size: 2.5em;
    font-weight: lighter;
    color: var(--global-text-color);
    a { 
        color: inherit;
        vertical-align: middle;
    }
    img {
        width: 2em;
        vertical-align: middle;
    }
    span {
        vertical-align: middle;
    }
}
.login-footer {
    display: flex;
    flex-direction: row;
    .register-btn { 
        margin-left: 5px;
    }
}
.layout {
    height: auto;
}
</style>

<template>
<div id="login" class="layout">
    <section class="layout-logo">
        <img src="../assets/icon.png" alt="" /><span>摸鱼派·登录</span>
    </section> 
    <Form id="login-form" ref="loginForm" :model="login" :rules="ruleValidate" class="layout-form">
        <FormItem prop="username">
            <Input
                type="text"
                v-model="login.username"
                placeholder="用户名"
                @on-keyup.enter="$refs['password'].focus()"
            >
                <Icon custom="fa fa-user" slot="prepend"></Icon>
            </Input>
        </FormItem>
        <FormItem prop="passwd">
            <Input ref="password"
                id="password"
                :type="passwdType"
                v-model="login.passwd"
                placeholder="密码"
                @on-keyup.enter="$refs['mfacode'].focus()"
            >
                <Icon custom="fa fa-lock" slot="prepend"></Icon>
                <Button
                    slot="append"
                    :icon="showIcon"
                    @click="isPasswdShow=!isPasswdShow"
                    style="box-shadow:none;"
                ></Button>
            </Input>
        </FormItem>
        <FormItem prop="mfacode">
            <Input ref="mfacode"
                type="text"
                v-model="login.mfaCode"
                placeholder="两步验证码"
                @on-keyup.enter="submit('loginForm')"
            >
                <Icon custom="fa fa-shield" slot="prepend"></Icon>
            </Input>
        </FormItem>
        <div class="login-footer">
            <Button type="success" long @click="submit('loginForm')" :loading="login_loading">登录</Button>
            <Button type="default" class="register-btn" long @click="register">注册</Button>
        </div>
    </Form>
</div>
</template>

<script>
  export default {
    name: 'home',
    components: {
    },
    mounted () {
        if (this.$root.isLogin()) return this.$router.push('/');
        this.$ipc.send('main-event', { call: 'resize', args: { width: 400 } })
    },
    data () {
        const validatePasswd = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入您的密码'));
            } else {
                callback();
            }
        };
        const validateUser = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入您的用户名'));
            } else {
                callback();
            }
        };
        return {
            login: {
                username: localStorage.getItem('username') || '',
                passwd: localStorage.getItem('passwd') || '',
                mfaCode: '',
            },
            isPasswdShow: false,
            ruleValidate: {
                username: [{ validator: validateUser, trigger: 'blur' }],
                passwd: [{ validator: validatePasswd, trigger: 'blur' }],
            },
            login_loading: false,
        }    
    },
    watch: {
    },
    filters: {
    },
    computed: {
        showIcon() {
            return this.isPasswdShow ? 'md-eye-off' : 'md-eye';
        },
        passwdType() {
            return this.isPasswdShow ? 'text' : 'password';
        },
    },
    methods: {
        submit(form, first=false) {
            this.$refs[form].validate(async valid => {
                if (!valid) return;
                try {
                    this.login_loading = true;
                    this.$root.token = await this.$root.login(this.login);
                    localStorage.setItem('username', this.login.username);
                    localStorage.setItem('passwd', this.login.passwd);
                    this.$router.push('/chatroom');
                } catch (err) {
                    this.$Message.error(err.message);
                }
                this.login_loading = false;
            });
        },
        register() {
            window.open(`https://fishpi.cn/register?r=imlinhanchao`);
        }
    }
  }
</script>
