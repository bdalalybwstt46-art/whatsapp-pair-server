const express = require('express')
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const cors = require('cors')
const app = express()

app.use(cors())

app.get('/pair', async (req, res) => {
  const phone = req.query.phone
  if (!phone) return res.json({ error: 'ضع رقم الهاتف' })
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_' + phone)
    const sock = makeWASocket({ auth: state, printQRInTerminal: false })
    sock.ev.on('creds.update', saveCreds)
    
    await new Promise(r => setTimeout(r, 2000))
    const code = await sock.requestPairingCode(phone)
    res.json({ code })
  } catch (e) {
    res.json({ error: e.message })
  }
})

app.listen(3000, () => console.log('Server running on port 3000'))
