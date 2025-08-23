const amountEl = document.getElementById('amount');
const fromEl   = document.getElementById('from');
const toEl     = document.getElementById('to');
const swapBtn  = document.getElementById('swap');
const convertBtn = document.getElementById('convert');
const clearBtn = document.getElementById('clear');

const rateWrap = document.getElementById('rate');
const rateValue = document.getElementById('rateValue');
const resultWrap = document.getElementById('result');
const resultText = document.getElementById('resultText');
const resultValue = document.getElementById('resultValue');
const errorBox = document.getElementById('error');

// Common fiat currencies
const COMMON = ["USD","EUR","GBP","AED","JPY","AUD","CAD","CHF","CNY","HKD","SGD","PHP","INR","KRW","NZD","THB","TWD","SEK","NOK","DKK","ZAR","AED","SAR"];

function fillSelect(sel, list){
  sel.innerHTML = list.map(c => `<option value="${c}">${c}</option>`).join('');
}
fillSelect(fromEl, COMMON);
fillSelect(toEl, COMMON);

// Defaults
fromEl.value = "USD";
toEl.value   = "PHP";

// Format numbers
const fmt = (v, currency) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 6, style: 'currency', currency }).format(v);

async function convert(){
  errorBox.hidden = true;
  rateWrap.hidden = true;
  resultWrap.hidden = true;

  const amount = parseFloat(amountEl.value || "0");
  const from = fromEl.value;
  const to = toEl.value;
  if (!from || !to || !(amount >= 0)) return;

  convertBtn.disabled = true;
  convertBtn.textContent = 'Converting…';

  try {
  const apiKey = "d1e2faa1ad-c5344d7b7c-t1fgyw"; // put your real key here
  const url = `https://api.fastforex.io/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}&api_key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Bad response');
  const data = await res.json();

  // Validate shape
  if (!data || !data.result || !data.result[to]) throw new Error('Unexpected payload');

  const out = data.result[to];      // converted value
  const rate = out / amount;        // calculate rate from amount + converted value

  rateValue.textContent = `1 ${from} = ${rate.toFixed(6)} ${to}`;
  resultText.textContent = `${fmt(amount, from)} →`;
  resultValue.textContent = fmt(out, to);

  rateWrap.hidden = false;
  resultWrap.hidden = false;
} catch (e) {
  console.error(e);
  errorBox.hidden = false;
} finally {
  convertBtn.disabled = false;
  convertBtn.textContent = 'Convert';
}

}

// Swap currencies
swapBtn.addEventListener('click', () => {
  const f = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value = f;
  convert();
});

// Buttons
convertBtn.addEventListener('click', convert);
clearBtn.addEventListener('click', () => {
  amountEl.value = '';
  rateWrap.hidden = true;
  resultWrap.hidden = true;
  errorBox.hidden = true;
  amountEl.focus();
});

// Auto-convert on quick changes (debounced)
let t;
function debounceConvert(){
  clearTimeout(t);
  t = setTimeout(convert, 350);
}
amountEl.addEventListener('input', debounceConvert);
fromEl.addEventListener('change', convert);
toEl.addEventListener('change', convert);

// Initial run
convert();
