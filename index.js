<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ربط البوت — WA Pair</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0A1310;
    --surface:#101E19;
    --surface-2:#152820;
    --accent:#29D398;
    --accent-dim:#0B8768;
    --text:#EAF6EF;
    --muted:#7C9A8E;
    --warn:#E8B339;
    --ring-w: 1px;
  }
  *{box-sizing:border-box; margin:0; padding:0;}
  body{
    background:
      radial-gradient(circle at 50% 18%, rgba(41,211,152,0.08), transparent 60%),
      var(--bg);
    color:var(--text);
    font-family:'Inter', sans-serif;
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px;
    overflow-x:hidden;
  }
  .stage{
    position:relative;
    width:100%;
    max-width:440px;
  }
  .rings{
    position:absolute;
    top:-140px; left:50%;
    transform:translateX(-50%);
    width:340px; height:340px;
    pointer-events:none;
    z-index:0;
  }
  .rings span{
    position:absolute;
    inset:0;
    border-radius:50%;
    border:1px solid rgba(41,211,152,0.35);
    animation: pulse 3.2s ease-out infinite;
  }
  .rings span:nth-child(2){ animation-delay:0.8s; }
  .rings span:nth-child(3){ animation-delay:1.6s; }
  @keyframes pulse{
    0%{ transform:scale(0.35); opacity:0; }
    15%{ opacity:0.9; }
    100%{ transform:scale(1); opacity:0; }
  }
  @media (prefers-reduced-motion: reduce){
    .rings span{ animation:none; opacity:0.15; }
  }

  .card{
    position:relative;
    z-index:1;
    background:var(--surface);
    border:1px solid rgba(255,255,255,0.06);
    border-radius:20px;
    padding:36px 30px 30px;
    box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6);
  }

  .eyebrow{
    display:flex;
    align-items:center;
    gap:8px;
    font-family:'JetBrains Mono', monospace;
    font-size:12px;
    letter-spacing:0.08em;
    color:var(--accent);
    margin-bottom:14px;
  }
  .dot{
    width:7px; height:7px; border-radius:50%;
    background:var(--accent);
    box-shadow:0 0 10px var(--accent);
  }

  h1{
    font-family:'Space Grotesk', sans-serif;
    font-weight:700;
    font-size:26px;
    line-height:1.3;
    margin-bottom:8px;
  }
  .sub{
    color:var(--muted);
    font-size:14.5px;
    line-height:1.6;
    margin-bottom:26px;
  }

  .field{
    margin-bottom:16px;
  }
  label{
    display:block;
    font-size:13px;
    color:var(--muted);
    margin-bottom:8px;
    font-family:'JetBrains Mono', monospace;
  }
  .input-wrap{
    display:flex;
    align-items:center;
    background:var(--surface-2);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:12px;
    padding:0 14px;
    transition:border-color .2s;
  }
  .input-wrap:focus-within{
    border-color:var(--accent);
  }
  .input-wrap span{
    color:var(--muted);
    font-family:'JetBrains Mono', monospace;
    font-size:14px;
  }
  input[type=text]{
    flex:1;
    background:transparent;
    border:none;
    outline:none;
    color:var(--text);
    font-family:'JetBrains Mono', monospace;
    font-size:16px;
    padding:14px 10px;
    letter-spacing:0.03em;
  }
  input::placeholder{ color:#4C6259; }

  .btn{
    width:100%;
    padding:15px;
    border:none;
    border-radius:12px;
    background:var(--accent);
    color:#052015;
    font-family:'Space Grotesk', sans-serif;
    font-weight:700;
    font-size:15px;
    cursor:pointer;
    transition:transform .15s, box-shadow .15s, opacity .15s;
    box-shadow: 0 8px 24px -8px rgba(41,211,152,0.5);
  }
  .btn:hover{ transform:translateY(-1px); }
  .btn:active{ transform:translateY(0); }
  .btn:disabled{ opacity:0.6; cursor:not-allowed; transform:none; }

  .error{
    display:none;
    margin-top:12px;
    padding:12px 14px;
    border-radius:10px;
    background:rgba(232,179,57,0.1);
    border:1px solid rgba(232,179,57,0.3);
    color:var(--warn);
    font-size:13.5px;
    line-height:1.5;
  }

  .result{
    display:none;
    margin-top:24px;
  }
  .code-label{
    font-family:'JetBrains Mono', monospace;
    font-size:12px;
    color:var(--muted);
    margin-bottom:10px;
    text-align:center;
  }
  .code-boxes{
    display:flex;
    justify-content:center;
    gap:8px;
    margin-bottom:18px;
    flex-wrap:wrap;
  }
  .code-boxes span{
    font-family:'JetBrains Mono', monospace;
    font-weight:700;
    font-size:22px;
    background:var(--surface-2);
    border:1px solid var(--accent-dim);
    color:var(--accent);
    border-radius:8px;
    padding:10px 12px;
    min-width:34px;
    text-align:center;
  }
  .copy-btn{
    display:block;
    width:100%;
    text-align:center;
    padding:11px;
    border-radius:10px;
    border:1px solid rgba(255,255,255,0.1);
    background:transparent;
    color:var(--text);
    font-family:'Inter', sans-serif;
    font-size:13.5px;
    cursor:pointer;
    margin-bottom:20px;
  }
  .copy-btn:hover{ border-color:var(--accent); color:var(--accent); }

  .steps{
    list-style:none;
    counter-reset: step;
    border-top:1px solid rgba(255,255,255,0.06);
    padding-top:18px;
  }
  .steps li{
    counter-increment: step;
    display:flex;
    gap:12px;
    font-size:13.5px;
    color:var(--muted);
    line-height:1.6;
    margin-bottom:10px;
  }
  .steps li::before{
    content: counter(step);
    flex-shrink:0;
    width:20px; height:20px;
    border-radius:50%;
    background:var(--surface-2);
    border:1px solid rgba(41,211,152,0.3);
    color:var(--accent);
    font-family:'JetBrains Mono', monospace;
    font-size:11px;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .steps b{ color:var(--text); font-weight:600; }

  .status{
    margin-top:16px;
    font-family:'JetBrains Mono', monospace;
    font-size:12.5px;
    color:var(--muted);
    text-align:center;
    display:none;
  }
  .status.on{ color:var(--accent); }

  footer{
    text-align:center;
    margin-top:22px;
    font-size:11.5px;
    color:#425850;
  }
</style>
</head>
<body>

<div class="stage">
  <div class="rings"><span></span><span></span><span></span></div>

  <div class="card">
    <div class="eyebrow"><span class="dot"></span>WA PAIR · جلسة بوت واتساب</div>
    <h1>اربط البوت ديالك بواتساب</h1>
    <p class="sub">دخل رقم الهاتف باش نولدو ليك كود ديال الربط. غادي تدخلو من واتساب فهاتفك، من غير ما تسكانيو أي QR.</p>

    <form id="pairForm">
      <div class="field">
        <label for="number">رقم الهاتف (بصيغة دولية)</label>
        <div class="input-wrap">
          <span>+</span>
          <input type="text" id="number" inputmode="numeric" placeholder="212772941308" autocomplete="off">
        </div>
      </div>
      <button type="submit" class="btn" id="submitBtn">ولّد الكود</button>
      <div class="error" id="errorBox"></div>
    </form>

    <div class="result" id="resultBox">
      <div class="code-label">دخل هاد الكود فواتساب</div>
      <div class="code-boxes" id="codeBoxes"></div>
      <button class="copy-btn" id="copyBtn">نسخ الكود</button>
      <div class="status" id="statusBox">⏳ فانتظار الربط…</div>
    </div>

    <ol class="steps">
      <li><b>واتساب</b> ← الإعدادات ← <b>الأجهزة المرتبطة</b></li>
      <li>اضغط على <b>ربط جهاز</b> ← <b>الربط برقم الهاتف</b></li>
      <li>دخل الكود اللي فوق قبل ما ينتهي صلاحيته</li>
    </ol>
  </div>

  <footer>الكود صالح لمدة قصيرة فقط. ما تشاركوش مع حد.</footer>
</div>

<script>
// ⚠️ بدّل هاد الرابط بالرابط ديال السيرفر (Render/Koyeb/Railway)
const BACKEND_URL = 'https://your-backend.onrender.com';

const form = document.getElementById('pairForm');
const numberInput = document.getElementById('number');
const submitBtn = document.getElementById('submitBtn');
const errorBox = document.getElementById('errorBox');
const resultBox = document.getElementById('resultBox');
const codeBoxes = document.getElementById('codeBoxes');
const copyBtn = document.getElementById('copyBtn');
const statusBox = document.getElementById('statusBox');

let currentCode = '';

function showError(msg){
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}
function clearError(){
  errorBox.style.display = 'none';
}
function renderCode(code){
  currentCode = code;
  codeBoxes.innerHTML = '';
  code.split('').forEach(ch => {
    const el = document.createElement('span');
    el.textContent = ch;
    codeBoxes.appendChild(el);
  });
  resultBox.style.display = 'block';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();
  resultBox.style.display = 'none';
  statusBox.style.display = 'none';
  statusBox.classList.remove('on');

  const number = numberInput.value.replace(/[^0-9]/g, '');
  if (!number || number.length < 8) {
    showError('دخل رقم صحيح بصيغة دولية، بلا + وبلا 00 (مثلا 212612345678).');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'كنولدو الكود…';

  try {
    // نستعملو GET /pair?phone= رقم
    const res = await fetch(BACKEND_URL + '/pair?phone=' + number);
    const data = await res.json();

    if (data.error) {
      showError(data.error);
      return;
    }

    renderCode(data.code);
    statusBox.style.display = 'block';
    statusBox.textContent = '⏳ دخل الكود فواتساب قبل ما ينتهي';

  } catch (err) {
    showError('ما قدرناش نتواصلو مع السيرفر.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'ولّد الكود';
  }
});

copyBtn.addEventListener('click', () => {
  if (!currentCode) return;
  navigator.clipboard.writeText(currentCode).then(() => {
    copyBtn.textContent = 'تم النسخ ✓';
    setTimeout(() => copyBtn.textContent = 'نسخ الكود', 1500);
  });
});
</script>

</body>
</html>
