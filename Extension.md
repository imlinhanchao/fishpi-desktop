# 扩展开发指南

扩展目前分为两类：主题和插件。所有扩展都需要先新建一个 `package.json`。内容包含扩展的一些基本属性。如下示例：

```json
{
  "name": "xiaoice",                // 扩展唯一标识，同一个 publisher 下不可重复
  "publisher": "hancel",            // 扩展发布者
  "version": "1.0.0",               // 版本号
  "displayName": "小冰游戏",         // 扩展对外展示名
  "description": "摸鱼文字修仙游戏",  // 扩展的描述
  "main": "extension/index.js",      // 扩展的入口，主题为 css 文件，插件为 JavaScript 文件
  "author": "Hancel.Lin",            // 扩展的作者
  "homepage": "https://github.com/imlinhanchao/fishpi-ext-xiaoice",     // 扩展的首页，会连接在扩展页面
  "repository": "https://github.com/imlinhanchao/fishpi-ext-xiaoice",   // 扩展的仓库地址，若没有设置 homepage，则会连接这个地址
  "fishpi": {                        // 扩展的属性
    "type": "extension",             // 扩展的类型
    "icon": "public/icon.png"        // 扩展的 icon，会显示在扩展页面
  }
}
```

## 主题扩展

主题扩展相对简单，只要新建一个要设置的 CSS 的文件。可以先复制一份客户端的 [CSS 变量](src/renderer/theme/theme.css)修改主题颜色，还可以对各个不同页面选择器分别再写样式覆写。下面是各个不同页面的 id，可用于样式覆写获得更高优先级。

```less
#app                    // 全局页面
#home-sidebar           // 侧边栏
#main                   // 主页面
#header                 // 主页面顶部栏
#win-title              // 顶部栏标题处
#content                // 主页面内容区
#liveness               // 活跃度模块
#login                  // 登录页面
#breezemoons            // 清风明月页面
#chatroom               // 聊天室页面
#chats                  // 私聊页面
#setting                // 设置页面
#card                   // 个人名片窗口
#autocomplete           // 自动完成窗口
#redpacket              // 红包窗口
#img-form               // 图片弹出窗
```

## 插件扩展

插件扩展是通过将 JavaScript 作为模块引入到客户端中，并通过 `export` 接口实现各种对接客户端的功能。

### 入口函数

```javascript
function activate(context, electron):void
```

- `context`: 这是一个事件处理器，可以监听从主程序发送的系统消息，也可以自定义消息与自己嵌入的 `webview` 通信。
- `electron`: 这是一个原生的 `Electron` 对象，可以用于调用各种 electron 的原生 API[📃](https://www.electronjs.org/zh/docs/latest/api/app)，实现诸如新建窗口或其他系统操作。

例如：
```javascript
function activate(context, electron) {
    // 插件激活操作
}
// extension.js
module.exports = {
    activate
}
```

### 可选接口

可选接口不是非必须实现。

```javascript
function getSettingUrl():string
```
设置扩展设置地址，返回一个 html 文件地址，如果文件包含其他支援引用，必须使用相对于此文件的相对地址。或有实现该函数，则会在扩展页面出现一个设置按钮。

```javascript
function hooks(): {
    async messageEvent(msg:Message) : Message | Boolean | Null,
    async sendMsgEvent(text:string): string,
    async liveness(data:Number) : void,
}
```
返回一个 hook 对象，分别实现三个函数（可选），用于 hook 聊天室操作。

- `messageEvent`: 新的聊天消息 Hook，返回 False 或 Null 则 中断响应该消息，返回 True 则继续响应，也可以对消息内容做修改。数据结构见 [Message 对象定义](#message-对象定义)
- `sendMsgEvent`: 发送消息 Hook，不会 Hook 复读与红包消息。`text` 为发送内容的原文。可以进行修改后返回。若不修改也要返回 `text`。
- `liveness`: 活跃度响应 Hook，当客户端有请求到活跃度数据时，会调用此函数，`data` 为活跃度数值。注意：客户端启动后一分钟才会首次反馈此数据。反馈频次为 1 分钟一次。

### Context 对象接口详解

入口函数 `activate` 包含 `Context` 对象，基于 `EventEmitter` 实现。目前 `Context` 包含以下接口：

- `fishpi`: fishpi 接口对象，具体参考 [Fishpi API Package](https://github.com/imlinhanchao/fishpi-api-package) 。
- `function on(event, listener:(...args: any[]) => void)`: 事件监听接口，目前包含如下事件。
  - `login`: 用户登录，监听函数为 `(token) => void`，`token` 为用户登录 API。此时 `fishpi` 可以调用需用户登录态接口。
  - `logout`: 用户退出登录。
  - `quit`: 客户端退出。
  - `command`: 用户自定义事件监听，监听函数为 `(event:string, args:data, callback:(data) => void) => void`，具体使用方法见 [Webview 通信](#webview-通信)。
- `function once(event, listener:(...args: any[]) => void)`: 同上，仅触发一次。
- `function off(event, listener:(...args: any[]) => void)`: 关闭指定函数与事件的监听。
- `function send(event, data:any)`: 发送自定义事件到 Webview。
- `function setSidebar(icon:string, url:string)`: 设置侧边栏，`icon` 为侧边栏 icon 图片地址，需为纯色 svg。`url` 为侧边栏对应 Webview 地址。

### Webview 通信

扩展支援自定义侧边栏页面或设置界面为 Webview，只需要通过 `Context.setSidebar` （侧边栏）和 `getSettingUrl` （设置界面）指定。在开发模式下，载入 Webview 时会启动开发者调试工具。通过给客户端传参 `--dev` 或设置环境变量 `EXT_ENV` 为 `development` 后启动客户端来进入开发模式。

所有 Webview 都包含一个 `$ipc` 对象：
```javascript
$ipc = {
    /**
     * 发送自定义事件到扩展后端
     * - `event`: 自定义事件
     * - `args`: 事件参数
     * - `callback`: 扩展后端回传数据回调，可不传
     */
    send (event:string, args:any[, callback:(data) => void]):void,
    /**
     * 发送自定义事件到扩展后端，后端通过 Context 监听 `command` 事件获取
     * - `event`: 自定义事件
     * - `args`: 事件参数
     * return 后端返回的数据
     */
    invoke (event:string, args:any): Promise<any>,
    /**
     * 监听后端发送的自定义事件
     * - `event`: 自定义事件
     * - `listener`: 监听函数
     */
    on (event:string, listener:(data) => void):void,
    /**
     * 关闭自定义事件监听
     * - `event`: 自定义事件
     * - `listener`: 监听函数
     */
    off (event:string, listener:(data) => void):void,
}
```

Webview 通信示例：
```javascript
// Webview 发送自定义事件到后端：
$ipc.send('send-event', 'send data', (rsp) => {
    console.dir(rsp);
})

// Webview 发送自定义事件到后端，异步获取后端 Response：
let rsp = await $ipc.invoke('invoke-event', 'invoke data')
console.dir(rsp);

// Extension 监听 Webview 发送事件
context.on('command', (command, args, callback) => {
    switch (command) {
        case 'send-event': 
            console.log(args) // 'send data'
            callback('get send');
            break;
        case 'invoke-event': 
            console.log(args) // 'invoke data'
            callback('get invoke');
            break;
    }
})

// Webview 监听 Extension
$ipc.on('on-event', (data) => {
    console.log(data) // 'your data'
})

// Extension 发送事件到 Webview
context.send('on-event', 'your data')
```

### Message 对象定义

```typescript
type Message = {
    /**
     * 消息类型，
     */
    type: 'online'|'discussChanged'|'revoke'|'msg'|'redPacket'|'redPacketStatus';
    /**
     * 消息内容
     */
    data: OnlineMsg | discussMsg | RevokeMsg | ChatMsg | RedpacketMsg | RedpacketStatusMsg
}

/**
 * 在线用户消息
 */
type OnlineMsg = Array<{
    /**
     * 用户首页
     */
    homePage: string, 
    /**
     * 用户头像
     */
    userAvatarURL: string, 
    /**
     * 用户名
     */
    userName: string,
}>

/**
 * 主题修改消息，主题内容
 */
type discussMsg = string

/**
 * 撤回消息，被撤回消息的 oId
 */
type RevokeMsg = string

/**
 * 聊天消息
 */
type ChatMsg = {
    /**
     * 消息 oId
     */
    oId: string, 
    /**
     * 消息发送时间
     */    
    time: string, 
    /**
     * 发送者用户名
     */
    userName: string, 
    /**
     * 发送者昵称
     */
    userNickname: string, 
    /**
     * 发送者头像
     */
    userAvatarURL: string, 
    /**
     * 消息内容
     */
    content: string, 
    /**
     * 消息内容 Markdown
     */
    md: string
}

/**
 * 红包消息
 */
type RedpacketMsg = {
    /**
     * 消息 oId
     */
    oId: string, 
    /**
     * 消息发送时间
     */    
    time: string, 
    /**
     * 发送者用户名
     */
    userName: string, 
    /**
     * 发送者昵称
     */
    userNickname: string, 
    /**
     * 发送者头像
     */
    userAvatarURL: string, 
    /**
     * 消息内容
     */
    content: {
        /**
         * 固定为 redPacket
         */
        msgType: string;
        /**
         * 红包数
         */
        count: number;
        /**
         * 领取数
         */
        got: number;
        /**
         * 内含积分
         */
        money: number;
        /**
         * 祝福语
         */
        msg: string;
        /**
         * 发送者 id
         */
        senderId: string;
        /**
         * 红包类型
         */
        type: string;
        /**
         * 接收者，专属红包有效
         */
        recivers: Array<string>;
        /**
         * 已领取者列表
         */
        who: Array<{
            /**
             * 用户 id
             */
            userId: string;
            /**
             * 用户名
             */
            userName: string;
            /**
             * 用户头像
             */
            avatar: string;
            /**
             * 领取到的积分
             */
            userMoney: number;
            /**
             * 领取积分时间
             */
            time: string;
        }>
    }, 
}

type RedpacketStatusMsg = {
    /**
     * 对应红包消息 oId
     */
    oId: string, 
    /**
     * 红包个数
     */
    count: number, 
    /**
     * 已领取数量
     */
    got: number, 
    /**
     * 发送者信息
     */
    whoGive: any, 
    /**
     * 领取者信息
     */
    whoGot: Array<any>
}
```