import Page from './page'

class Img extends Page
{
    constructor(app, name) {
        super(app, name);
        
    }

    create(options = {}, args) {
        let size = args.size;
        if (size.width < 400) { size.height = size.height * 400 / size.width; size.width = 400; }
        if (size.width > 800) { size.height = size.height * 800 / size.width; size.width = 800; }
        if (size.height > 600) { size.width = size.width * 600 / size.height; size.height = 600; }
        if (size.height < 100) size.height += 150;
        size.height += 10;

        options = Object.assign({
            url: `img/${encodeURIComponent(args.url)}`,
            show: true,
            frame: false,
            width: size.width, 
            height: size.height, 
            minWidth: size.width,
            minHeight: size.height,
            resizable: true,            
            skipTaskbar: true,
        }, options);
        let ret = super.create(options);
        return ret;
    }

    setImage(args) {
        let size = args.size;
        if (size.width < size.height) {
            if (size.height > 600) { size.width = size.width * 600 / size.height; size.height = 600; }
            if (size.height < 100) size.height += 150;
        }
        else {
            if (size.width < 400) { size.height = size.height * 400 / size.width; size.width = 400; }
            if (size.width > 800) { size.height = size.height * 800 / size.width; size.width = 800; }
        }
        size.height += 10;
        this.win.setSize(parseInt(size.width), parseInt(size.height));
        this.win.webContents.send('img-update', `/img/${encodeURIComponent(args.url)}`);
    }

    get events() {
        return {
            hide() {
                if(!this.win) return;
                this.win.hide()
            },
            show() {
                if(!this.win) return;
                this.win.showInactive()
            },
            resize(event, args) {
                if(!this.win) return;
                let size = this.win.getSize();
                this.win.setSize(parseInt(args.width || size[0]), parseInt(args.height || size[1]));
            },
        }
    }
}

export default Img;