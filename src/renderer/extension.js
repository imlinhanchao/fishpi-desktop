import ipc from './ipc'
import path from 'path'

class Extension {
    constructor() {
        this.themes = {};
    }

    async loadTheme(setting) {
        let { themes } = await ipc.sendSync('fishpi.global.setting', setting.extensions)

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

    getCSSVarList() {
        let lstVar = Array.from(document.styleSheets)
        .filter(
          sheet =>
            sheet.href === null || sheet.href.startsWith(window.location.origin)
        )
        .reduce(
          (acc, sheet) =>
            (acc = [
              ...acc,
              ...Array.from(sheet.cssRules).reduce(
                (def, rule) =>
                  (def =
                    rule.selectorText === ":root"
                      ? [
                          ...def,
                          ...Array.from(rule.style).filter(name =>
                            name.startsWith("--")
                          )
                        ]
                      : def),
                []
              )
            ]),
          []
        );

        return lstVar.map(v => {
            return `${v}:${getComputedStyle(document.documentElement).getPropertyValue(v)}`
        }).join(';')
    }
}

export default Extension;
