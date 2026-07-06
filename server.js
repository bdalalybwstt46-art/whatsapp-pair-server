import express from 'express';
import cors from 'cors';
import pkg from 'flibu-baileys-official';
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = 'http://176.100.37.77:30222';

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>WA Pair</title><style>body{background:#0A1310;color:#EAF6EF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;}.card{background:#101E19;border-radius:20px;padding:30px 24px;max-width:400px;width:100%;text-align:center;}h1{color:#29D398;margin-bottom:8px;}p{color:#7C9A8E;margin-bottom:24px;}input{width:100%;padding:14px;border-radius:12px;border:1px solid #152820;background:#152820;color:#EAF6EF;font-size:16px;margin-bottom:16px;outline:none;direction:ltr;}button{width:100%;padding:14px;border-radius:12px;border:none;background:#29D398;color:#052015;font-weight:700;font-size:16px;cursor:pointer;}.error{color:#E8B339;margin-top:12px;display:none;}.result{margin-top:20px;display:none;}.code{font-size:32px;color:#29D398;letter-spacing:6px;margin:16px 0;direction:ltr;}</style></head><body><div class="card"><h1>اربط البوت بواتساب</h1><p>دخل رقم الهاتف باش نولدو ليك كود الربط</p><form id="f"><input type="text" id="n" placeholder="212772941308"><button type="submit" id="b">اطلب الكود</button><div class="error" id="e"></div></form><div class="result" id="r"><div class="code" id="c"></div><button onclick="navigator.clipboard.writeText(document.getElementById('c').textContent)">نسخ الكود</button></div></div><script>document.getElementById('f').addEventListener('submit',async function(e){e.preventDefault();document.getElementById('e').style.display='none';document.getElementById('r').style.display='none';var n=document.getElementById('n').value.replace(/[^0-9]/g,'');if(!n||n.length<8){document.getElementById('e').textContent='دخل رقم صحيح';document.getElementById('e').style.display='block';return;}document.getElementById('b').disabled=true;document.getElementById('b').textContent='جاري طلب الكود…';try{var r=await fetch('/pair?phone='+n);var d=await r.json();if(d.error){document.getElementById('e').textContent=d.error;document.getElementById('e').style.display='block';return;}document.getElementById('c').textContent=d.code;document.getElementById('r').style.display='block';navigator.clipboard.writeText(d.code);}catch(err){document.getElementById('e').textContent='ما قدرناش نتواصلو مع السيرفر.';document.getElementById('e').style.display='block';}finally{document.getElementById('b').disabled=false;document.getElementById('b').textContent='اطلب الكود';}});</script></body></html>`);
});

app.get('/pair', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ error: 'يرجى إدخال رقم الهاتف' });
  try {
    const response = await fetch(`${API_URL}/api/session-abde?num=${phone}`);
    const data = await response.json();
    return res.json(data);
  } catch (e) {
    return res.json({ error: 'تعذر الاتصال بالسيرفر' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
