<template lang="pug">
.row.threads
  .col.s12.nav
    .col.s10
      h5 Bug Guild
    .col.s2.action-buttons
      button.btn.btn-primary(@click='refresh()', :disabled='loading') Refresh
  .col.s12.m2.sidebar
    .thread(v-for='(thread, key) in threads', v-if='!archivedThreads[key]', @click='selectThread(key)')
      strong {{key}} {{thread.length}}
  .col.s12.m10.messages
    div(v-for='(thread, key) in threads', v-if='activeThread === key')
      .sub-nav
        strong Actions
        button.btn.btn-secondary(@click='archive(key, thread)', :disabled='loading') Archive
      .row
        .col.s12.m6
          .card(v-for='message in thread')
            .card-content
              span.card-title {{message.user}}
              strong UserID: {{message.uuid}}
              br
              p.message-content {{message.text}}
            .card-action
              a.modal-trigger(@click.prevent='reply(message)', href="#modal1") Reply
              a.red-text.text-darken-1(@click.prevent='remove(message)') Remove

  #modal1.modal
    .modal-content
      h4 Replying to {{messageReplyingTo.user}}
      textarea.replyarea(v-model='replyText')
    .modal-footer
      a.modal-action.modal-close.waves-effect.waves-red.btn-flat.red-text.text-darken-1 Cancel
      a.modal-action.modal-close.waves-effect.waves-green.btn-flat(@click.prevent='sendMessage()') Send
</template>

<script>
import axios from 'axios'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import uniq from 'lodash/uniq'

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      chat: [],
      threads: [],
      activeThread: '',
      archivedThreads: {},
      loading: false,
      messageReplyingTo: {},
      replyText: ''
    }
  },
  async mounted () {
    axios.defaults.headers.common['x-api-user'] = process.env.HABITICA_USER_ID
    axios.defaults.headers.common['x-api-key'] = process.env.HABITICA_API_KEY
    this.archivedThreads = JSON.parse(localStorage.getItem('habitica-archived')) || {}
    await this.loadChat()
  },
  methods: {
    selectThread (key) {
      this.activeThread = key
    },
    async refresh () {
      this.loading = true
      await this.loadChat()
      this.loading = false
    },
    async loadChat () {
      const groupResponse = await axios.get('https://habitica.com/api/v3/groups/a29da26b-37de-4a71-b0c6-48e72a900dac')
      this.chat = groupResponse.data.data.chat
      this.threads = groupBy(this.chat, 'uuid')

      let threads = {}
      const userNames = uniq(map(this.chat, 'user'))
      userNames.forEach(userName => {
        const messagesWithUser = this.chat.filter(message => {
          return message.user === userName || message.text.indexOf(userName) !== -1
        })
        threads[userName] = messagesWithUser
      })

      for (let key in threads) {
        if (this.archivedThreads[key] && this.archivedThreads[key] !== threads[key][0].id) {
          this.archivedThreads[key] = false
        }
      }

      this.threads = threads
    },
    archive (key, thread) {
      this.$set(this.archivedThreads, key, thread[0].id)
      this.activeThread = ''
      localStorage.setItem('habitica-archived', JSON.stringify(this.archivedThreads))
    },
    reply (message) {
      this.$set(this, 'messageReplyingTo', message)
      this.replyText = ''
      this.replyText += this.messageReplyingTo.text
      $('#modal1').modal() //  eslint-disable-line
    },
    async sendMessage () {
      this.loading = true
      await axios.post('https://habitica.com/api/v3/groups/a29da26b-37de-4a71-b0c6-48e72a900dac/chat', {
        message: this.replyText
      })
      // @TODO: can we not refresh the full chat
      await this.refresh()
      // console.log(chatResponse)
    },
    async remove (message) {
      if (!confirm('Are you sure you want to remove this message?')) return
      this.loading = true
      await axios.delete(`https://habitica.com/api/v3/groups/a29da26b-37de-4a71-b0c6-48e72a900dac/chat/${message.id}`)
      await this.refresh()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .nav {
    padding-top: 0;
    padding-left: 2em;
    width: 100%;
    height: 55px;
    background: #fff;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.08);
  }

  .sub-nav {
    width: 100%;
    padding: 1em;
    background-color: #2bbbad;
    color: #fff;
  }

  .sub-nav button {
    margin-left: 1em;
  }

  .action-buttons {
    margin-top: .5em;
  }

  .sidebar {
    border-top: 5px solid #2bbbad;
    background: #fff;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.08);
    height: calc(100%);
    overflow: scroll;
  }

  .messages {
    height: 100%;
    overflow: scroll;
    margin-left: 0 !important;
    padding-left: 0 !important;
    margin-right: 0 !important;
    padding-right: 0 !important;
  }

  .message-content {
    white-space: pre-wrap;
  }

  .threads {
    text-align: left;
    height: 100%;
  }

  .thread {
    padding: 2em 1em;
    border-bottom: solid 1px #efefef;
  }

  .thread:hover {
    cursor: pointer;
    background-color: #F2F5F7;
  }

  .btn {
    margin-left: .2em;
    padding: 0 1rem;
    height: auto;
    font-size: .6rem;
  }

  .card-action a:hover {
    cursor: pointer;
  }

  .replyarea {
    min-height: 200px;
  }

  h1, h2 {
    font-weight: normal;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
</style>
