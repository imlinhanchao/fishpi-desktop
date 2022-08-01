import Page from './page'
import RedPacket from './redpacket'
import Card from './card'
import Img from './img'
import {
    dialog
} from 'electron'
import fs from 'fs'

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
        let page = super.create(options);
        page.on('focus', () => {
            if(!this.card) return;
            this.card.windows.hide();
        })
        return page
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
                this.win.setSize(parseInt(args.width || size[0]), parseInt(args.height || size[1]));
            },
            getPosition(event, args, callback) {
                if(!this.win) return;
                let [x, y] = this.win.getPosition();
                callback({ x, y });
            },
            openRedpacket(event, args) {
                if (args == 'send' || args.id == 'send') {
                    if(!this.redpacket) 
                        this.redpacket = new RedPacket(this.app, 'redpacket').create({
                            quitEvent: () => {
                                this.redpacket = null
                            }
                        }, args);
                    else 
                        this.redpacket.show();
                }
                else new RedPacket(this.app, 'redpacket').create({}, args);
            },
            openImage(event, args) {
                if(!this.img) 
                {
                    this.img = new Img(this.app, 'img');
                    this.img.create({
                        quitEvent: () => {
                            this.img = null
                        },
                        parent: this.win
                    }, args);
                }
                else 
                    this.img.setImage(args);
            },
            faceImport(event, argv, callback) {
                try {
                    let filePath = dialog.showOpenDialogSync(this.win.windows, {
                        title: '导入表情文件',
                        buttonLabel: '导入',
                        filters: [
                            { name: '表情文件', extensions: ['txt'] },
                        ]
                    })
                    if (!filePath) return;
                    let data = fs.readFileSync(filePath[0]).toString();
                    data = data.split('\n').filter(d => d.startsWith('http'));
                    callback(data);
                } catch (err) {
                    console.error(err)
                }
            },
            faceExport (event, argv) {
                try {
                    let filePath = dialog.showSaveDialogSync(this.win.windows, {
                        title: '导出表情文件',
                        buttonLabel: '导出',
                        filters: [
                            { name: '表情文件', extensions: ['txt'] },
                        ]
                    })
                    if (!filePath) return;
                    fs.writeFileSync(filePath, argv);
                } catch (err) {
                    console.error(err)
                }
            },
            viewCard(event, { user, pos }) {
                if(!this.card) {
                    this.card = new Card(this.app, 'card').create({
                        quitEvent: () => {
                            this.card = null
                        },
                        parent: this.win.windows
                    }, user);
                } else {
                    this.card.webContents.send('user-update', user);
                }
                this.card.setPosition(parseInt(pos.x), parseInt(pos.y));
                this.card.setSize(400, 200);
                this.card.showInactive(); 
            }
        }
    }
}

export default Main;