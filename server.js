import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const API_URL = 'http://92.118.206.4:30277';

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

app.get('/code', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ error: 'يرجى إدخال رقم الهاتف' });
  try {
    const response = await fetch(`${API_URL}/api/session-abde/code?num=${phone}`);
    const data = await response.json();
    return res.json(data);
  } catch (e) {
    return res.json({ error: 'تعذر الاتصال بالسيرفر' });
  }
});

app.get('/creds.json', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ error: 'يرجى إدخال رقم الهاتف' });

  const credsFile = path.join(__dirname, 'auth_' + phone, 'creds.json');
  if (fs.existsSync(credsFile)) {
    const creds = fs.readFileSync(credsFile, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    return res.send(creds);
  }

  try {
    const response = await fetch(`${API_URL}/api/session-abde/code?num=${phone}`);
    const data = await response.json();
    return res.json(data);
  } catch (e) {
    return res.json({ error: 'تعذر الاتصال بالسيرفر' });
  }
});

const PORT = process.env.PORT || 30277;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
