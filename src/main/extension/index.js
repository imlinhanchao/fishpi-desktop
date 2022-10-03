import {
    ipcMain, Notification, shell
} from 'electron'
import fs from 'fs'
import path from 'path'
import Context from './context';

class Extensions 
{
    constructor(app, wins) {
        this.app = app;
        this.wins = wins;
        this.extensions = {};
        this.contexts = {};
        this.themes = {};
        ipcMain.on('fishpi.global.setting', (event, argv) => {
            let root = argv.root;
            try {
                fs.accessSync(root, fs.constants.R_OK);
                this.extensions = {};
                this.themes = {};        
                let extensionFolders = fs.readdirSync(root);
                extensionFolders.forEach(x => this.load(path.join(root, x)));
                if(argv.callback) event.sender.send('fishpi.global.setting-callback-' + argv.callback, 
                    { 
                        extensions: this.extensions, 
                        themes: this.themes 
                    })
            } catch (error) {
                console.error(error);
            }
        })

        ipcMain.on('fishpi.global.command', (event, argv) => {
            let { id, command, data } = argv;
            if (!this.contexts[id]) return;
            this.contexts[id].events.emit('command', command, data, (rsp) => {
                if(argv.callback) event.sender.send(
                    'fishpi.global.command-callback-' + argv.callback, 
                    rsp);
            })
        })

        ipcMain.on('fishpi.hooks.chatroom', async (event, argv) => {
            for(let c in this.contexts) {
                let context = this.contexts[c]
                if (context.hooks && context.hooks.messageEvent) {
                    argv.msg = await context.hooks.messageEvent(argv.msg)
                }
            }
            if(argv.callback) event.sender.send(
                'fishpi.hooks.chatroom-callback-' + argv.callback, 
                argv.msg);
        })

        ipcMain.on('fishpi.hooks.liveness', async (event, argv) => {
            for(let c in this.contexts) {
                let context = this.contexts[c]
                if (context.hooks && context.hooks.liveness) {
                    context.hooks.liveness(argv.liveness)
                }
            }
        })

        ipcMain.on('fishpi.hooks.sendMsg', async (event, argv) => {
            for(let c in this.contexts) {
                let context = this.contexts[c]
                if (context.hooks && context.hooks.sendMsgEvent) {
                    argv.msg = await context.hooks.sendMsgEvent(argv.msg)
                }
            }
            if(argv.callback) event.sender.send(
                'fishpi.hooks.sendMsg-callback-' + argv.callback, 
                argv.msg);
        })
    }

    load(folder) {
        let packageJson = path.join(folder, 'package.json');
        if (!fs.existsSync(packageJson)) return false;
        let attr = fs.readFileSync(packageJson);
        try {
            attr = JSON.parse(attr);
            if (!attr.fishpi) return false;
            attr.fishpi.root = folder;
            attr.fishpi.key = `${attr.publisher || 'unknown'}.${attr.name}`;
            if (attr.fishpi.type == 'theme') 
                this.themes[attr.fishpi.key] = attr;
            else 
            {
                this.extensions[attr.fishpi.key] = attr;
                if (this.contexts[attr.fishpi.key]) delete this.contexts[attr.fishpi.key];
                this.contexts[attr.fishpi.key] = new Context(attr, this.app, this.wins);
                this.extensions[attr.fishpi.key].fishpi.setting = this.contexts[attr.fishpi.key].setting;
            }   
        } catch (error) {
            console.error(`load ${folder} error: ${error.message}`);
        }
    }
}
export default Extensions;