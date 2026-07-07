import express from 'express';
import cors from 'cors';
import pkg from 'flibu-baileys-official';
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = pkg;
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const API_URL = 'http://92.118.206.4:30130';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/pair', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ error: 'يرجى إدخال رقم الهاتف' });

  try {
    const response = await fetch(`${API_URL}/api/session-abde?num=${phone}`);
    const data = await response.json();
    if (data.code) return res.json(data);
  } catch (e) {}

  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_' + phone);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({ version, auth: state, printQRInTerminal: false });
    sock.ev.on('creds.update', saveCreds);
    if (!sock.authState.creds.registered) {
      await new Promise(r => setTimeout(r, 2000));
      const code = await sock.requestPairingCode(phone);
      return res.json({ code });
    }
    return res.json({ code: 'ALREADY_PAIRED' });
  } catch (e) {
    return res.json({ error: e.message });
  }
});

app.get('/code', (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ error: 'يرجى إدخال رقم الهاتف' });
  const credsFile = path.join(__dirname, 'auth_' + phone, 'creds.json');
  if (fs.existsSync(credsFile)) {
    const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
    return res.json({ session_code: Buffer.from(JSON.stringify(creds)).toString('base64') });
  }
  return res.json({ error: 'الجلسة غير موجودة' });
});

const PORT = process.env.PORT || 30130;
app.listen(PORT, () => console.log(`Server running on http://92.118.206.4:${PORT}`));
