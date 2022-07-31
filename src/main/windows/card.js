import Page from './page'

class RedPacket extends Page
{
    constructor(app, name) {
        super(app, name);
        
    }

    create(options = {}, user) {
        options = Object.assign({
            url: `card/${user}`,
            show: true,
            frame: false,
            width: 400, 
            height: 200, 
            skipTaskbar: true,
            resizable: false,
        }, options);
        let ret = super.create(options);
        return ret;
    }

    get events() {
        return {
            hide() {
                if(!this.win) return;
                this.win.hide()
            },
            show() {
                if(!this.win) return;
                this.win.setAlwaysOnTop(true, 'floating')
                this.win.showInactive()
            },
        }
    }
}

export default RedPacket;