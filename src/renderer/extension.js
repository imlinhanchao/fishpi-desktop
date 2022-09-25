import ipc from './ipc'
import path from 'path'

class Extension {
    constructor() {
        this.themes = {}
    }

    async loadTheme(setting) {
        let { themes } = await ipc.sendSync('fishpi.global.setting', { 
            root: setting.extensions.root 
        })
        console.log(themes)

        this.themes = themes;
        if (this.lastTheme == setting.extensions.theme) return;
        this.lastTheme = setting.extensions.theme;
        let csslink = document.getElementById('theme-link')
        if (csslink) document.head.removeChild(csslink);
        let theme = themes[setting.extensions.theme];
        if (theme) {
            let cssPath = path.join(theme.fishpi.root, theme.main);
            csslink = document.createElement("link"); 
            csslink.id = "theme-link";
            csslink.setAttribute("rel", "stylesheet"); 
            csslink.setAttribute("type", "text/css"); 
            csslink.setAttribute("href", cssPath); 
            document.head.appendChild(csslink);
        }
    }
}

export default Extension;
