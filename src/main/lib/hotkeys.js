import { globalShortcut } from 'electron'

let hotkeys = {

}

class HotKey
{
    static register(type, hotkey, fn) {
        hotkey = hotkey.replace(/win/i, 'Super');
        if (hotkeys[type]) {
            globalShortcut.unregister(hotkeys[type]);
        }
        globalShortcut.register(hotkey, fn)
        hotkeys[type] = hotkey;
    }

    
}

export default HotKey;