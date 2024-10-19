<template>
  <div class="music-card" v-if="data">
    <div class="netease-music">
      <div class="netease-cover" :data-id="id">
      </div>
      <section class="cover">
        <img :src="data.coverURL" alt="Cover" />
        <img class="play" src="../assets/play.png" alt="Play" />
      </section>
      <section class="info">
        <h3>{{ data.title }}<span class="sub" v-if="music"> - {{ music.artist }}</span></h3>
        <p>点击聆听</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      required: true
    }
  },
  computed: {
    id() {
      return this.data.source.match(/id=(\d+)/)[1];
    },
  },
  data() {
    return {
      music: null,
    };
  },
  methods: {
  },
  async mounted() {
    let infoApi = `http://music.163.com/api/song/detail/?id=${this.id}&ids=%5B${this.id}%5D`; 
    let rsp = await fetch(infoApi).then(r => r.json());
    if (rsp.code != 200 || !rsp.songs.length) return;
    this.music = {
        ...this.data,
        artist: rsp.songs[0].artists.map(a => a.name).join(','),
        name: rsp.songs[0].name,
        img: rsp.songs[0].album.picUrl,
        url: `http://music.163.com/song/media/outer/url?id=${this.id}`
    }
  },
};
</script>

<style lang="less" scoped>
.music-card {
  color: var(--main-chatroom-message-color);
  background-color: var(--main-chatroom-message-background-color);
  border-radius: 6px;
  overflow: hidden;
}
.netease-music {
  display: flex;
  flex-direction: row;
  height: 70px;
  .netease-cover {
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
  .cover {
    img {
      height: 100%;
    }
    .play {
      position: absolute;
      top: 0;
      bottom: 0;
      margin: auto;
      width: 30px;
      height: 30px;
      left: 20px;
    }
  }

  .info {
    padding: 10px;
    h3 {
      font-size: 14px;
      margin: 0;
      font-weight: normal;
    }
    p {
      font-size: 12px;
      margin-top: 10px;
      text-align: center;
      opacity: .3;
    }
    .sub {
      font-size: 12px;
      opacity: .7;
    }
  }
}
</style>