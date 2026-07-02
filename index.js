const express = require('express');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('flibu-baileys-official');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/pair', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ error: 'ضع رقم الهاتف' });
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_' + phone);
    const sock = makeWASocket({ 
      auth: state, 
      printQRInTerminal: false,
      browser: ["WA Pair Site", "Chrome", "1.0.0"]
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    await new Promise(r => setTimeout(r, 2000));
    const code = await sock.requestPairingCode(phone);
    
    res.json({ code });
  } catch (e) {
    res.json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
