import { defineStore } from 'pinia'
import api from '../api/axios'

export const usePlayerStore = defineStore('players', {
  state: () => ({
    players: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPlayers(search = '') {
      this.loading = true
      this.error = null
      try {
        const params = search ? { search } : {}
        const { data } = await api.get('/players', { params })
        this.players = data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load players'
      } finally {
        this.loading = false
      }
    },

    async createSelf(payload) {
      const { data } = await api.post('/players/self', payload)
      this.players.unshift(data)
      return data
    },

    async createPlayer(payload) {
      const { data } = await api.post('/players', payload)
      this.players.unshift(data)
      return data
    },

    async updatePlayer(id, payload) {
      const { data } = await api.put(`/players/${id}`, payload)
      const idx = this.players.findIndex((p) => p._id === id)
      if (idx !== -1) this.players[idx] = data
      return data
    },

    async deletePlayer(id) {
      await api.delete(`/players/${id}`)
      this.players = this.players.filter((p) => p._id !== id)
    },

    async updateProfile(id, payload) {
      const { data } = await api.patch(`/players/${id}/profile`, payload)
      const idx = this.players.findIndex((p) => p._id === id)
      if (idx !== -1) this.players[idx] = data
      return data
    },

    async uploadPhoto(file) {
      const form = new FormData()
      form.append('photo', file)
      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.filename
    },

    async fetchUsers() {
      const { data } = await api.get('/players/users/list')
      return data
    },

    async setUserRole(userId, role) {
      const { data } = await api.patch(`/auth/users/${userId}/role`, { role })
      return data
    },
  },
})
