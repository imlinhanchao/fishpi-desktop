import Page from './page'

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
            size: { width: 400, height: 600 }
        }, options);
        return super.create(options);
    }

    get events() {
        return {
            close() {
                this.app.quit()
            },
            opacity(event, args) {
                if(this.win) this.win.setOpacity(args.enable ? args.value / 100 : 1)
            },
            min() {
                if(this.win) this.win.hide()
            },
            top(event, args) {
                if(this.win) this.win.setAlwaysOnTop(args, 'floating')
            }
        }
    }
}

export default Main;