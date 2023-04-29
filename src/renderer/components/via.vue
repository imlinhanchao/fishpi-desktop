<template>
  <span class="via">
    <a v-if="isWindows" target="_blank" :href="url.client" title="来自桌面客户端"><Icon custom="fa fa-windows" size="12"></Icon></a>
    <a v-if="isMac" target="_blank" :href="url.client" title="来自桌面客户端"><Icon custom="fa fa-apple" size="12"></Icon></a>
    <a v-if="isLinux" target="_blank" :href="url.client" title="来自桌面客户端"><Icon custom="fa fa-linux" size="12"></Icon></a>
    <a v-if="isChrome" target="_blank" :href="url.chrome" title="来自浏览器扩展"><Icon custom="fa fa-chrome" size="12"></Icon></a>
    <a v-if="isEdge" target="_blank" :href="url.edge" title="来自浏览器扩展"><Icon custom="fa fa-edge" size="12"></Icon></a>
    <a v-if="isVSCode" target="_blank" :href="url.vscode" title="来自 VSCode 扩展"><span class="vscode">&nbsp;</span></a>
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
    }
  },
  computed: {
    isWindows() {
      return this.content.match && this.content.match(/class="client-win32-message"/) != null;
    },
    isMac() {
      return this.content.match && this.content.match(/class="client-darwin-message"/) != null;
    },
    isLinux() {
      return this.content.match && this.content.match(/class="client-linux-message"/) != null;
    },
    isChrome() {
      return this.content.match && this.content.match(/class="chrome-extension-message"/) != null;
    },
    isEdge() {
      return this.content.match && this.content.match(/class="edge-extension-message"/) != null;
    },
    isVSCode() {
      return this.content.match && this.content.match(/class="vscode-extension-message"/) != null;
    },
    url() {
        return {
            chrome: 'https://chrome.google.com/webstore/detail/fkaomdjjdbglkbcmfhhlioejkpacbbpe,',
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
    .vscode {
        margin-top: 5px;
        background-color: currentColor;
        -webkit-mask-image: url(../assets/vscode.svg);
        -webkit-mask-size: 100% 100%;
        -webkit-mask-position: center;
        width: 1.5em;
        height: 1.5em;
        display: inline-block;
    }
}
</style>