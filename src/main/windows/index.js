import Main from './main'
let windows = {

}

let _app = null;

let create = (app) => {
    windows.main = new Main(app, 'main').create();

    _app = app
    return windows;
}


export default { 
    create,
    windows
}