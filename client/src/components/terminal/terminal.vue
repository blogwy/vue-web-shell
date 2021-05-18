<template>
  <div id="terminal"></div>
</template>

<script>
import Terminal from './terminal.js'
import openSocket from 'socket.io-client'
export default {
  data () {
    return {
      socketClient: null,
      beforeUnloadTime: null,
      gapTime: null,
      tunnel_id: null
    }
  },
  components: {},
  computed: {},
  watch: {},
  mounted () {
    // 填写一个开通ssh主机ip和账号密码
    const sshInfo = {
      ip: '127.0.0.1',
      username: '',
      password: ''
    }
    const term = new Terminal({ cursorBlink: true })
    term.open(document.getElementById('terminal'))
    term.fit()
    const socket = openSocket('http://127.0.0.1:3100/ssh')
    this.socketClient = socket
    socket.on('connect', () => {
      console.log('---连接成功---')
      console.log(`---socket.id：${socket.id}---`)
      socket.emit('init_data', sshInfo)
    })
    term.on('data', res => {
      socket.emit('ssh_client_data', res)
    })
    socket.on('ssh_server_data', res => {
      term.write(res)
    })
    window.addEventListener('beforeunload', () => this.beforeunloadHandler())
    window.addEventListener('unload', () => this.unloadHandler())
  },
  created () {},
  beforeDestroy () {
    window.removeEventListener('beforeunload', () => this.beforeunloadHandler())
    window.removeEventListener('unload', () => this.unloadHandler())
  },
  methods: {
    beforeunloadHandler () {
      this.beforeUnloadTime = new Date().getTime()
    },
    async unloadHandler () {
      this.gapTime = new Date().getTime() - this.beforeUnloadTime
      // 判断是窗口关闭还是刷新
      if (this.gapTime <= 5) {
        // 页面关闭前的操作
        this.socketClient.emit('ssh_client_close', 'test')
        this.socketClient.close()
        // 关闭隧道
        await this.$api.nodes.stopTunnel.request({ tunnel_id: this.tunnel_id })
      }
    }
  }
}
</script>

<style scoped>
#terminal{
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 999;
}
</style>
