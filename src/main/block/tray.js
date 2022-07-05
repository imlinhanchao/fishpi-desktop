import {
    Menu,
    Tray,
    ipcMain,
    nativeImage,
} from 'electron'
import path from 'path'
import Package from '../../../package.json'

class TrayModel {
    constructor(app, windows) {
        this.app = app;
        this.windows = windows;
        this.timer = null
        this.tick = 0
        this.count = 0        
        this.icon = path.join(__static, 'icon', 'icon.png');
    }

    reset() {
        this.tray.setToolTip(Package.description)
        this.tray.setImage(this.icon)
        clearInterval(this.timer)
        this.timer = null;
        this.tick = 0;
        this.count = 0;
        this.icon = path.join(__static, 'icon', 'icon.png');
    }

    get menu() {
        return Menu.buildFromTemplate([
            {
                label: 'Developer Tool',
                type: 'normal',
                click: () => {
                    this.windows.main.webContents.openDevTools({mode:'detach'})
                }
            },{
                label: 'Show',
                type: 'normal',
                click: () => {
                    this.windows.main.show()
                }
            },
            {
                label: 'Quit',
                type: 'normal',
                click: () => {
                    this.app.quit()
                }
            }
        ])
    }

    create() {
        this.tray = new Tray(this.icon);
        this.tray.setContextMenu(this.menu);
        this.tray.on('double-click', () => {
            this.windows.main.show();
        })
        ipcMain.on('tray.msg', (event, args) => {
            if (this.windows.main.isVisable() && 
               (this.windows.main.isFocused() || this.windows.main.isAlwaysOnTop())
            ) return;
    
            this.count ++;
            this.tray.setToolTip(`摸鱼派聊天室-你有${count}条新消息`)
            this.flash();
        })
        this.tray.on('click', () => {
            if (this.count <= 0) return;
            this.windows.main.show();
        })
        this.windows.main.on('focus', () => {
            this.reset();
        })
        this.windows.main.on('restore', () => {
            this.reset();
        })
        return this.tray;
    }

    flash() {
        if(this.windows.main.isVisable()) this.windows.main.flashFrame(true);
            
        if (this.timer != null) return;

        this.timer = setInterval(() => {
            this.tick += 1;
            if (this.tick % 2 === 0) {
                this.tray.setImage(this.icon)
            } else {
                this.tray.setImage(nativeImage.createEmpty())
            }
        }, 500)
    }
}


export default TrayModel;