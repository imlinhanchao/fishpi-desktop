import Page from './page'

class Autocomplete extends Page
{
    constructor(app, name) {
        super(app, name);
        
    }

    create(options = {}) {
        options = Object.assign({
            url: 'autocomplete',
            show: true,
            frame: false,
            width: 150, 
            height: 200, 
            minWidth: 0,
            minHeight: 0,
            alwaysOnTop :true,
            skipTaskbar: true,
            resize: false,
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
            resize(event, args) {
                if(!this.win) return;
                let size = this.win.getSize();
                this.win.setSize(parseInt(args.width || size[0]), parseInt(args.height || size[1]));
            },
            position(event, args) {
                if(!this.win) return;
                let pos = this.win.getPosition();
                this.win.setPosition(parseInt(args.x || pos[0]), parseInt(args.y || pos[1]));
            }
        }
    }
}

export default Autocomplete;