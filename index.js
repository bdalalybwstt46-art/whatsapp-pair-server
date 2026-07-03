const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers
} = require('flibu-baileys-official');
const { Boom } = require('@hapi/boom');

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_DIR = path.join(__dirname, 'auth_info');

app.use(cors());
app.use(express.static(__dirname)); // يسيرفي index.html من نفس المجلد

let sock = null;
let isConnecting = false;

// دالة كتبدا اتصال واتساب وترجع سوكت جاهز
async function startSocket() {
  if (isConnecting) return sock;
  isConnecting = true;

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log('✅ تم الاتصال بواتساب بنجاح');
      isConnecting = false;
    }
    if (connection === 'close') {
      isConnecting = false;
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ الاتصال انقطع. إعادة المحاولة:', shouldReconnect);
      if (shouldReconnect) {
        startSocket();
      } else {
        // تم تسجيل الخروج - نحذف بيانات الجلسة القديمة
        if (fs.existsSync(AUTH_DIR)) {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        }
      }
    }
  });

  return sock;
}

// Endpoint لتوليد كود الربط
app.get('/pair', async (req, res) => {
  try {
    const phone = (req.query.phone || '').replace(/[^0-9]/g, '');

    if (!phone || phone.length < 8) {
      return res.status(400).json({ error: 'رقم الهاتف غير صحيح' });
    }

    const client = await startSocket();

    // كنتسناو شوية باش السوكت يكون جاهز للـ pairing
    if (!client.authState?.creds?.registered) {
      setTimeout(async () => {
        try {
          const code = await client.requestPairingCode(phone);
          if (!res.headersSent) {
            res.json({ code });
          }
        } catch (err) {
          console.error('خطأ فتوليد الكود:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'ما قدرناش نولدو الكود، عاود حاول' });
          }
        }
      }, 2000);
    } else {
      res.json({ error: 'الجهاز مربوط بالفعل' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ فالسيرفر' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 السيرفر خدام على البورت ${PORT}`);
});
