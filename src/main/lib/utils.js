import path from 'path'

export default {
    rootPath: process.env.NODE_ENV == 'development' ? 
    path.resolve(__dirname, '..', '..', '..') :
    process.resourcesPath
}