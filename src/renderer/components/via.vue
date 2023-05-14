<template>
  <span class="via">
    <Tooltip placement="bottom-start">
      <a v-if="client && client.url" target="_blank" :href="client.url">
        <Icon :custom="client.icon" size="12"></Icon>
      </a>
      <span v-else-if="client">
        <Icon :custom="client.icon" size="12"></Icon>
      </span>
      <div slot="content">
        <span class="version">{{ client.title }}{{ via.version || '未知' }}</span>
      </div>
    </Tooltip>
  </span>
</template>
<script>
export default {
  name: 'via',
  props: {
    via: {
      required: true
    },
  },
  data () {
    return {
      vias: [
        { mark: 'Windows', icon: 'fa fa-windows', url: 'https://github.com/imlinhanchao/fishpi-desktop/releases', title: '来自桌面客户端@' },
        { mark: 'macOS', icon: 'fa fa-apple', url: 'https://github.com/imlinhanchao/fishpi-desktop/releases', title: '来自桌面客户端@' },
        { mark: 'Linux', icon: 'fa fa-linux', url: 'https://github.com/imlinhanchao/fishpi-desktop/releases', title: '来自桌面客户端@' },
        { mark: 'Chrome', icon: 'fa fa-chrome', url: 'https://chrome.google.com/webstore/detail/fkaomdjjdbglkbcmfhhlioejkpacbbpe', title: '来自浏览器扩展@' },
        { mark: 'Edge', icon: 'mask edge', url: 'https://microsoftedge.microsoft.com/addons/detail/oldbilakhdpiamjbkocdcdnlnakainfm', title: '来自浏览器扩展@' },
        { mark: 'VSCode', icon: 'mask vscode', url: 'https://marketplace.visualstudio.com/items?itemName=hancel.pwl-chat', title: '来自 VSCode 扩展@' },
        { mark: 'IDEA', icon: 'mask idea', url: 'https://plugins.jetbrains.com/plugin/18091-pwl-chat', title: '来自 IDEA 扩展@' },
        { mark: 'Python', icon: 'mask python', url: 'https://fishpi.cn/article/1641135630423', title: '来自 Python 客户端@' },
        { mark: 'Golang', icon: 'mask golang', url: 'https://fishpi.cn/article/1641661864119', title: '来自 Golang 客户端@' },
        { mark: 'IceNet', icon: 'mask icenet', url: 'https://github.com/HereIsYui/pwl-xiaoice', title: '来自小冰机器人@' },
        { mark: 'ElvesOnline', icon: 'mask elves', url: 'https://github.com/imufwt/elves2', title: '来自凌机器人@' },
        { mark: 'Web', icon: 'mask web', title: '来自' },
        { mark: 'iOS', icon: 'fa fa-apple', title: '来自 iPhone 客户端' },
        { mark: 'Android', icon: 'fa fa-android', title: '来自 Android 客户端'},
        { mark: 'Mobile', icon: 'mask mobile', title: '来自' },
        { mark: 'Other', icon: 'mask other', title: '来自其他客户端: ' },
        { mark: 'Extension', icon: 'mask extension', title: '来自扩展程序' },
        { mark: 'PC', icon: 'mask pc', title: '来自桌面客户端' }
      ]
    }
  },
  computed: {
    client() {
      if (!this.via) return;
      let via = this.vias.find(v => (this.via.client || 'Other') == v.mark);
      return via || { title: '来自' + this.via.client + '@', icon: 'mask other', };
    },
  },
  methods: {
  }
}
</script>
<style lang="less" scoped>
.via {
    font-size: 40%;
    margin: 0 3px 0;
    a {
      display: inline-flex;
      align-items: center;
    }
    .mask {
      background-color: currentColor;
      -webkit-mask-size: 100% 100%;
      -webkit-mask-position: center;
      width: 1em;
      height: 1em;
      display: inline-block;
    }
    .vscode {
      -webkit-mask-image: url(../assets/via/vscode.svg);
    }
    .edge {
      -webkit-mask-image: url(../assets/via/edge.svg);
    }
    .extension {
      -webkit-mask-image: url(../assets/via/extension.svg);
    }
    .golang {
      -webkit-mask-image: url(../assets/via/golang.svg);
    }
    .idea {
      -webkit-mask-image: url(../assets/via/idea.svg);
    }
    .mobile {
      -webkit-mask-image: url(../assets/via/mobile.svg);
    }
    .other {
      -webkit-mask-image: url(../assets/via/other.svg);
    }
    .pc {
      -webkit-mask-image: url(../assets/via/pc.svg);
    }
    .python {
      -webkit-mask-image: url(../assets/via/python.svg);
    }
    .web {
      -webkit-mask-image: url(../assets/via/web.svg);
    }
    .icenet {
      -webkit-mask-image: url(../assets/via/icenet.svg);
    }
    .elves {
      -webkit-mask-image: url(../assets/via/elves.svg);
    }
    .version {
      font-weight: bold;
      font-size: 12px;
      margin-left: 2px;
      display: inline-block;
    }
}
</style>
<style lang="less">
.via {
  .ivu-tooltip-inner {
    padding: 2px 5px;
    min-height: auto;
  }
}
</style>