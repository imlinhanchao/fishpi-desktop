import Main from './main'
import Autocomplete from './autocomplete'
let windows = {

}

let _app = null;

let create = (app) => {
    windows.main = new Main(app, 'main').create();
    windows.autocomplete = new Autocomplete(app, 'autocomplete').create();

    _app = app
    return windows;
}


export default {
    create,
    windows
}