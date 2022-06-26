class Setting {
    constructor() {
        let setting = localStorage.getItem('setting');
        this.setting = setting ? JSON.parse(setting) : {
            opacity: {
                enable: localStorage.getItem('window-opacity') == '1',
                value: 60,
            },
            topWindow: localStorage.getItem('window-top') == '1',
            messageShield: [],
            careUsers: []
        }
        this.setting.notice = this.setting.notice || {}
        localStorage.removeItem('window-opacity')
        localStorage.removeItem('window-top')
    }

    get value() {
        return this.setting;
    }

    config (key, value) {
        this.setting[key] = value;
        this.save();
    }

    save() {
        localStorage.setItem('setting', JSON.stringify(this.setting));
    }
}

export default Setting;