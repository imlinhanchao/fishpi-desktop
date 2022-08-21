class Setting {
    constructor() {
        let setting = localStorage.getItem('setting');
        this.setting = setting ? JSON.parse(setting) : Setting.default;
        this.id = new Date().getTime();
        this.Listeners = []
        new BroadcastChannel('settings').addEventListener("message", (ev) => {
            if (ev.data.id != this.id) this.update(ev.data.setting, false);
        }, false);
    }

    get value() {
        return this.setting;
    }

    static get default() {
        return {
            global: {
                opacity: {
                    enable: false,
                    value: 60,
                },
                topWindow: false,
                autoReward: false,
                music: 0,
            },
            chatroom: {
                shield: [],
                careUsers: [],
                redpackNotice: false,
            },
            message: {
                notice: {
                    chatroom: false, chat: false, at: false, reply: false, sys: false, talk: false, talkmsg: ''
                },
                way: {
                    audio: false, msg: false,
                }
            }
        }
    }

    addListener(callback) {
        if (this.Listeners.indexOf(callback) >= 0) return false;
        this.Listeners.push(callback);
    }

    removeListener(callback) {
        if (this.Listeners.indexOf(callback) < 0) return false;
        this.Listeners.splice(this.Listeners.indexOf(callback), 1);
    }

    broadcast() {
        new BroadcastChannel('settings').postMessage({ setting: this.value, id: this.id });
    }

    config (area, key, value) {
        this.setting[area][key] = value;
        this.save();
    }

    update (setting, broadcast=true) {
        this.setting = Object.assign(this.setting, setting);
        this.save(broadcast);
    }

    save(broadcast) {
        localStorage.setItem('setting', JSON.stringify(this.setting));
        if (broadcast) this.broadcast();
        this.Listeners.forEach((call) => {
            if (call instanceof Function) call(this.value)
        })
    }
}

export default Setting;