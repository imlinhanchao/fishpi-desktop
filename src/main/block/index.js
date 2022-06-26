import windows from '../windows'
import TrayModel from './tray'

let setting;
let tray;
let create = (app) => {
    let win = windows.create(app);
    console.dir(TrayModel);
    (new TrayModel(app, win)).create();
    return win;
}

export default {
    create,
    windows
}