<template lang="pug">
.row.threads
  .col.s12.m6.offset-m3
    h2 Bug Guild
  .col.s12.m6.offset-m3(v-for='(thread, key) in threads')
    h5(@click='selectThread(key)')
      | {{key}} {{thread.length}}
      .btn.btn-primary Toggle
    .card(v-for='message in thread', v-if='activeThread === key')
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
      activeThread: ''
    }
  },
  async mounted () {
    axios.defaults.headers.common['x-api-user'] = process.env.HABITICA_USER_ID
    axios.defaults.headers.common['x-api-key'] = process.env.HABITICA_API_KEY
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
    this.threads = threads
  },
  methods: {
    selectThread (key) {
      if (this.activeThread === key) {
        this.activeThread = ''
        return
      }
      this.activeThread = key
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .threads {
    text-align: left;
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
