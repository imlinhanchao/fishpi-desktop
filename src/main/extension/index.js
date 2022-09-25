import {
    ipcMain, Notification, shell
} from 'electron'
import fs from 'fs'
import path from 'path'

class Extensions 
{
    constructor(app, wins) {
        this.app = app;
        this.wins = wins;
        this.extensions = {};
        this.themes = {};
        ipcMain.on('fishpi.global.setting', (event, argv) => {
            let root = argv.root;
            try {
                fs.accessSync(root, fs.constants.R_OK);
                this.extensions = {};
                this.themes = {};        
                let extensionFolders = fs.readdirSync(root);
                extensionFolders.forEach(x => this.load(path.join(root, x)));
                if(argv.callback) event.sender.send('fishpi.global.setting-callback-' + argv.callback, { extensions: this.extensions, themes: this.themes })
            } catch (error) {
                console.error(error);
            }
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
            if (attr.fishpi.type == "theme") 
                this.themes[`${attr.publisher || 'unknown'}.${attr.name}`] = attr;
            else 
                this.extensions[`${attr.publisher || 'unknown'}.${attr.name}`] = attr;
        } catch (error) {
            console.error(`load ${folder} error: ${error.message}`);
        }
    }
}
export default Extensions;