import Page from './page'

class Autocomplete extends Page
{
    constructor(app, name) {
        super(app, name);
        
    }

    create(options = {}, id) {
        options = Object.assign({
            url: `redpacket/${id}`,
            show: true,
            frame: false,
            width: 250, 
            height: 400, 
            minWidth: 250,
            minHeight: 400,
            alwaysOnTop :true,
            resize: true,            
            skipTaskbar: true,
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

export default Autocomplete;