import axios from 'axios'

const chatbotApi = axios.create({ baseURL: '/api' })

export const sendMessage = (message) =>
  chatbotApi.post('/chatbot/chat/', { message }, { headers: { 'Content-Type': 'application/json' } })
