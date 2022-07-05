import windows from '../windows'
import TrayModel from './tray'

let setting;
let tray;
let create = (app) => {
    let win = windows.create(app);
    new TrayModel(app, win).create();
    return win;
}

export default {
    create,
    windows
}