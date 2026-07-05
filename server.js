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

// ========== الصفحة الرئيسية (الواجهة) ==========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== API إنشاء الجلسة ==========
app.get('/pair', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ error: 'يرجى إدخال رقم الهاتف' });

  try {
    const authFolder = path.join(__dirname, 'sessions', 'auth_' + phone);
    if (!fs.existsSync(authFolder)) {
      fs.mkdirSync(authFolder, { recursive: true });
    }
    
    // 1. تحميل الجلسة المحفوظة (إذا وجدت)
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    // 2. جلب أحدث إصدار متوافق من المكتبة تلقائياً
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`✅ جاهز للاتصال... الإصدار: v${version.join('.')} (الأحدث: ${isLatest})`);

    // 3. إنشاء اتصال الواتساب
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
    });

    // 4. حدث حفظ بيانات الجلسة
    sock.ev.on('creds.update', saveCreds);

    // 5. مراقبة حالة الاتصال
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') {
        console.log(`🎉 تم ربط البوت بنجاح للرقم: ${phone}`);
      }
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`⚠️ انقطع الاتصال للرقم ${phone}. السبب: ${statusCode || 'غير معروف'}`);
        if (shouldReconnect) {
          console.log('🔄 جارٍ إعادة الاتصال تلقائياً...');
        } else {
          console.log('🚫 تم تسجيل الخروج.');
        }
      }
    });

    // 6. معالجة الأخطاء العامة
    sock.ev.on('error', (err) => {
      console.error('🔥 خطأ غير متوقع:', err);
    });

    // 7. آلية طلب رمز الاقتران
    if (!sock.authState.creds.registered) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        console.log(`⏳ جارٍ طلب رمز الاقتران للرقم ${phone}...`);
        const code = await sock.requestPairingCode(phone);
        console.log(`✅ رمز الاقتران: ${code}`);
        
        return res.json({ 
          code: code,
          message: '📱 افتح واتساب -> الأجهزة المرتبطة -> ربط جهاز -> أدخل هذا الرمز'
        });
      } catch (error) {
        console.error('❌ فشل طلب رمز الاقتران:', error.message);
        return res.json({ error: error.message });
      }
    } else {
      return res.json({ 
        code: 'ALREADY_PAIRED',
        message: '🔐 الجلسة مربوطة مسبقاً'
      });
    }
  } catch (e) {
    return res.json({ error: e.message });
  }
});

// ========== تشغيل السيرفر ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/pair?phone=212xxxxxxxxx`);
});
