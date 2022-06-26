import {
    BrowserWindow,
} from 'electron'

class Windows {
    constructor(app, {
        parent=null, frame=true, resizable=true,
        size={}, skipbar=false, url='', quitEvent, show=false,
        transparent=true
    }) {

        this.that = new BrowserWindow({
            parent: parent,
            width: size.width,
            height: size.height,
            minWidth: size.width * .7,
            minHeight: size.height * .7,
            transparent: transparent,
            frame: frame,
            resizable: resizable,
            skipTaskbar: skipbar,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                contextIsolation: false,
            },
        });

        this.app = app;
        this.setMenu(null);

        const winURL = process.env.NODE_ENV === 'development' ?
            `http://localhost:9080/#${url}` :
            `file://${__dirname}/index.html#${url}`

        this.loadURL(winURL)

        if (process.argv.slice(1).filter(a => a.indexOf('--dev') >= 0).length > 0) {
            this.openDevTools()
        }

        this.on('closed', (event) => {
            this.that = null;
            quitEvent && quitEvent(event)
        })
    
        this.on('enter-html-full-screen', () => {
    
        })
    
        this.on('leave-html-full-screen', () => {
    
        })
    

        show ? this.show() : this.hide()
    }

    get widows ()       { return this.that; }
    get webContents()   { return this.that.webContents; }
    get isVisible()     { return this.that.isVisible(); }
    get isFocused()     { return this.that.isFocused(); }

    openDevTools()      { return this.that.openDevTools(...arguments); }
    setMenu()           { return this.that.setMenu(...arguments); }
    loadURL()           { return this.that.loadURL(...arguments); }
    on()                { return this.that.on(...arguments); }
    show()              { return this.that.show(...arguments); }
    hide()              { return this.that.hide(...arguments); }
    flashFrame()        { return this.that.flashFrame(...arguments); }
    setAlwaysOnTop()    { return this.that.setAlwaysOnTop(...arguments); }
    setOpacity()        { return this.that.setOpacity(...arguments); }
}

export default Windows