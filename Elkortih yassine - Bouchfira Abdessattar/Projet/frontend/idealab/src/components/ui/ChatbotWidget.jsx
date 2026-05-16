import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Send, X, Bot } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { sendMessage } from '../../api/chatbot.api'

const ease = [0.22, 1, 0.36, 1]

const SUGGESTIONS = [
  'How do I submit an idea?',
  'What is the SGV score?',
  'What are the idea statuses?',
  'How does the review process work?',
]

export default function ChatbotWidget() {
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm the IdeaLab assistant. How can I help you today?" },
  ])
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const res = await sendMessage(msg)
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.reply }])
    } catch (e) {
      const errMsg = e?.response?.data?.error || 'Sorry, something went wrong. Please try again.'
      setMessages((prev) => [...prev, { role: 'bot', text: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3'>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease }}
            className='relative flex h-[480px] w-80 flex-col overflow-hidden rounded-2xl border border-secondary/15 bg-primary shadow-[0_24px_64px_rgba(104,26,21,0.18)]'
          >
            {/* Header */}
            <div className='flex items-center gap-3 border-b border-secondary/10 bg-secondary px-4 py-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15'>
                <Bot size={16} className='text-primary' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-bold text-primary'>IdeaLab Assistant</p>
                <p className='text-[10px] text-primary/50'>Always here to help</p>
              </div>
              <button onClick={() => setOpen(false)} className='text-primary/50 hover:text-primary'>
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className='flex-1 space-y-3 overflow-y-auto px-4 py-4'>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-secondary text-primary rounded-br-sm'
                      : 'bg-secondary/8 text-secondary rounded-bl-sm border border-secondary/10'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className='flex justify-start'>
                  <div className='rounded-2xl rounded-bl-sm border border-secondary/10 bg-secondary/8 px-4 py-3'>
                    <div className='flex gap-1'>
                      {[0,1,2].map((i) => (
                        <motion.div key={i} className='h-1.5 w-1.5 rounded-full bg-secondary/40'
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions - only on first message */}
            {messages.length === 1 && (
              <div className='flex flex-wrap gap-1.5 border-t border-secondary/8 px-4 py-2'>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className='rounded-full border border-secondary/20 px-2.5 py-1 text-[11px] font-semibold text-secondary/60 transition-all hover:border-secondary/40 hover:text-secondary'>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className='flex items-center gap-2 border-t border-secondary/10 px-3 py-3'>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder='Ask me anything...'
                className='flex-1 rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-2 text-sm text-secondary placeholder:text-secondary/30 outline-none focus:border-secondary/40'
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className='flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary transition-opacity disabled:opacity-30'
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className='flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary shadow-[0_8px_32px_rgba(104,26,21,0.30)] text-primary'
      >
        <AnimatePresence mode='wait'>
          {open
            ? <motion.div key='x'  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={22} /></motion.div>
            : <motion.div key='c'  initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><MessageCircle size={22} /></motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
