import path from 'path'
import {
    Notification, 
} from 'electron'

export default {
    rootPath: process.env.NODE_ENV == 'development' ? 
    path.resolve(__dirname, '..', '..', '..') :
    process.resourcesPath,
    notice(args) {
        return new Notification({icon: path.join(__static, 'icon', 'icon@3x.png'), ...arg })
    }
}