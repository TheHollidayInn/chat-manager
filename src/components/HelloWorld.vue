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
        button.btn.btn-secondary(@click='archive(key, thread)') Archive
      .row
        .col.s12.m6
          .card(v-for='message in thread')
            .card-content
              span.card-title {{message.user}}
              p {{message.text}}
            .card-action
              a(href='#') This is a link
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
      loading: false
    }
  },
  async mounted () {
    axios.defaults.headers.common['x-api-user'] = process.env.HABITICA_USER_ID
    axios.defaults.headers.common['x-api-key'] = process.env.HABITICA_API_KEY
    await this.loadChat()
    this.archivedThreads = JSON.parse(localStorage.getItem('habitica-archived')) || {};
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
      const result = localStorage.setItem('habitica-archived', JSON.stringify(this.archivedThreads))
      console.log(JSON.stringify(this.archivedThreads))
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
