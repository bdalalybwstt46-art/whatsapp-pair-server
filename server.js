import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@flibu-official/baileys';
import pino from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========== API URL ==========
const API_URL = 'http://92.118.206.4:30029';

// ========== الصفحة الرئيسية (الواجهة) ==========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== API إنشاء الجلسة ==========
app.get('/pair', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ error: 'يرجى إدخال رقم الهاتف' });

  try {
    // توجيه الطلب إلى السيرفر الرئيسي
    const response = await fetch(`${API_URL}/api/session-abde?num=${phone}`);
    const data = await response.json();
    return res.json(data);
  } catch (e) {
    // إذا فشل الاتصال، استعمل السيرفر المحلي
    try {
      const authFolder = path.join(__dirname, 'sessions', 'auth_' + phone);
      if (!fs.existsSync(authFolder)) {
        fs.mkdirSync(authFolder, { recursive: true });
      }
      
      const { state, saveCreds } = await useMultiFileAuthState(authFolder);
      const { version } = await fetchLatestBaileysVersion();
      
      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
          console.log(`✅ تم ربط الرقم: ${phone}`);
        }
      });

      if (!sock.authState.creds.registered) {
        await new Promise(r => setTimeout(r, 2000));
        const code = await sock.requestPairingCode(phone);
        return res.json({ code });
      } else {
        return res.json({ code: 'ALREADY_PAIRED' });
      }
    } catch (err) {
      return res.json({ error: err.message });
    }
  }
});

// ========== تشغيل السيرفر ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Connected to API: ${API_URL}`);
});
