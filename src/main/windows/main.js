import Page from './page'
import RedPacket from './redpacket'

class Main extends Page
{
    constructor(app, name) {
        super(app, name);
    }

    create(options = {}) {
        options = Object.assign({
            quitEvent: (event) => {
                this.app.quit()
            },
            show: true,
            frame: false,
            width: 400, 
            height: 600, 
            minWidth: 350
        }, options);
        return super.create(options);
    }

    get events() {
        return {
            close() {
                this.app.quit()
            },
            opacity(event, args) {
                if(!this.win) return;
                this.win.setOpacity(args.enable ? args.value / 100 : 1)
            },
            min() {
                if(!this.win) return;
                this.win.hide()
            },
            top(event, args) {
                if(!this.win) return;
                this.win.setAlwaysOnTop(args, 'floating')
            },
            resize(event, args) {
                if(!this.win) return;
                let size = this.win.getSize();
                this.win.setSize(args.width || size[0], args.height || size[1]);
            },
            getPosition(event, args, callback) {
                if(!this.win) return;
                let [x, y] = this.win.getPosition();
                callback({ x, y });
            },
            openRedpacket(event, id) {
                new RedPacket(this.app, 'redpacket').create({}, id);
            }
        }
    }
}

export default Main;