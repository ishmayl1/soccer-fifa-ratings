import { defineStore } from 'pinia'
import api from '../api/axios'

export const useVoteStore = defineStore('votes', {
  state: () => ({
    voted: null,   // null = unknown, false = not voted, true = voted
    votedFor: null,
  }),

  actions: {
    async checkVote() {
      const { data } = await api.get('/votes/me')
      this.voted = data.voted
      this.votedFor = data.player ?? null
    },

    async castVote(playerId) {
      const { data } = await api.post('/votes', { playerId })
      this.voted = true
      this.votedFor = data.player
    },
  },
})
