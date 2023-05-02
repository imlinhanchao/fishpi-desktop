<template>
  <span class="via" v-if="content.match">
    <a v-if="via" target="_blank" :href="via.url" :title="via.title">
      <Icon :custom="via.icon" size="12"></Icon>
      <span class="version" v-if="version">@{{ version }}</span>
    </a>
  </span>
</template>
<script>
export default {
  name: 'via',
  props: {
    content: {
      required: true
    },
  },
  data () {
    return {
      vias: [
        { mark: 'client-win32-message', icon: 'fa fa-windows', url: 'https://github.com/imlinhanchao/fishpi-desktop/releases', title: '来自桌面客户端' },
        { mark: 'client-darwin-message', icon: 'fa fa-apple', url: 'https://github.com/imlinhanchao/fishpi-desktop/releases', title: '来自桌面客户端' },
        { mark: 'client-linux-message', icon: 'fa fa-linux', url: 'https://github.com/imlinhanchao/fishpi-desktop/releases', title: '来自桌面客户端' },
        { mark: 'chrome-extension-message', icon: 'fa fa-chrome', url: 'https://chrome.google.com/webstore/detail/fkaomdjjdbglkbcmfhhlioejkpacbbpe', title: '来自浏览器扩展' },
        { mark: 'edge-extension-message', icon: 'fa fa-edge', url: 'https://microsoftedge.microsoft.com/addons/detail/oldbilakhdpiamjbkocdcdnlnakainfm', title: '来自浏览器扩展' },
        { mark: 'vscode-extension-message', icon: 'vscode', url: 'https://marketplace.visualstudio.com/items?itemName=hancel.pwl-chat', title: '来自 VSCode 扩展' },
      ]
    }
  },
  computed: {
    via() {
      let via = this.vias.find(v => this.content.match && this.content.match(new RegExp(`class="${v.mark}("|\\s)`)) != null);
      console.log('via', via);
      return via;
    },
    isWindows() {
      return this.content.match && this.content.match(/class="client-win32-message("|\s)/) != null;
    },
    isMac() {
      return this.content.match && this.content.match(/class="client-darwin-message("|\s)/) != null;
    },
    isLinux() {
      return this.content.match && this.content.match(/class="client-linux-message("|\s)/) != null;
    },
    isChrome() {
      return this.content.match && this.content.match(/class="chrome-extension-message("|\s)/) != null;
    },
    isEdge() {
      return this.content.match && this.content.match(/class="edge-extension-message("|\s)/) != null;
    },
    isVSCode() {
      return this.content.match && this.content.match(/class="vscode-extension-message("|\s)/) != null;
    },
    version() {
      return this.content.match && (this.content.match(/ver-([^"]+)/)||[null])[1];
    },
    url() {
        return {
            chrome: 'https://chrome.google.com/webstore/detail/fkaomdjjdbglkbcmfhhlioejkpacbbpe',
            edge: 'https://microsoftedge.microsoft.com/addons/detail/oldbilakhdpiamjbkocdcdnlnakainfm',
            vscode: 'https://marketplace.visualstudio.com/items?itemName=hancel.pwl-chat',
            client: 'https://github.com/imlinhanchao/fishpi-desktop/releases'
        }
    }
  },
  methods: {
  }
}
</script>
<style lang="less" scoped>
.via {
    font-size: 40%;
    margin: 0 3px 0;
    opacity: .3;
    a {
      display: inline-flex;
      align-items: center;
    }
    .vscode {
      background-color: currentColor;
      -webkit-mask-image: url(../assets/vscode.svg);
      -webkit-mask-size: 100% 100%;
      -webkit-mask-position: center;
      width: 1em;
      height: 1em;
      display: inline-block;
    }
    .version {
      font-weight: bold;
      font-size: 12px;
      margin-left: 2px;
    }
}
</style>