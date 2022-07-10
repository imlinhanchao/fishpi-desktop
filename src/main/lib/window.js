import {
    BrowserWindow,
} from 'electron'

class Windows {
    constructor(app, options) {
        options = Object.assign({
            parent:null, frame:true, resizable:true,
            width:400, height: 600, skipbar:false, url:'', 
            quitEvent: null, show:false,
            transparent:true
        }, options);

        this.that = new BrowserWindow({
            minWidth: options.width * .7,
            minHeight: options.height * .7,
            transparent: options.transparent,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                contextIsolation: false,
            },
            ...options
        });

        this.app = app;
        this.that.setMenu(null);

        const winURL = process.env.NODE_ENV === 'development' ?
            `http://localhost:9080/#${options.url}` :
            `file://${__dirname}/index.html#${options.url}`

        this.loadURL(winURL)

        if (process.argv.slice(1).filter(a => a.indexOf('--dev') >= 0).length > 0) {
            this.openDevTools()
        }

        this.on('closed', (event) => {
            this.that = null;
            options.quitEvent && options.quitEvent(event)
        })
    
        this.on('enter-html-full-screen', () => {
    
        })
    
        this.on('leave-html-full-screen', () => {
    
        })
    

        options.show ? this.show() : this.hide()
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
    showInactive()      { return this.that.showInactive(...arguments); }
    hide()              { return this.that.hide(...arguments); }
    flashFrame()        { return this.that.flashFrame(...arguments); }
    setAlwaysOnTop()    { return this.that.setAlwaysOnTop(...arguments); }
    setOpacity()        { return this.that.setOpacity(...arguments); }
    setSize()           { return this.that.setSize(...arguments); }
    getSize()           { return this.that.getSize(...arguments); }
    getPosition()       { return this.that.getPosition(...arguments); }
    setPosition()       { return this.that.setPosition(...arguments); }
}

export default Windows