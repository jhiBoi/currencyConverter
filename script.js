// DOM Elements
const amountEl    = document.getElementById('amount');
const fromEl      = document.getElementById('from');
const toEl        = document.getElementById('to');
const swapBtn     = document.getElementById('swap');
const convertBtn  = document.getElementById('convert');
const clearBtn    = document.getElementById('clear');

const rateWrap    = document.getElementById('rate');
const rateValue   = document.getElementById('rateValue');
const resultWrap  = document.getElementById('result');
const resultText  = document.getElementById('resultText');
const resultValue = document.getElementById('resultValue');
const errorBox    = document.getElementById('errorBox');

// Common fiat currencies
const COMMON = [
  "USD","EUR","GBP","AED","JPY","AUD","CAD","CHF","CNY","HKD","SGD",
  "PHP","INR","KRW","NZD","THB","TWD","SEK","NOK","DKK","ZAR","SAR"
];

// Fill select boxes
function fillSelect(sel, list){
  sel.innerHTML = list.map(c => `<option value="${c}">${c}</option>`).join('');
}

fillSelect(fromEl, COMMON);
fillSelect(toEl, COMMON);

// Defaults
fromEl.value = "USD";
toEl.value   = "PHP";

// Number formatter
const fmt = (v, currency) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 6,
    style: "currency",
    currency
  }).format(v);

// Error helpers
function showError(msg){
  errorBox.textContent = msg;
  errorBox.hidden = false;
  rateWrap.hidden = true;
  resultWrap.hidden = true;
}

function clearError(){
  errorBox.hidden = true;
}

// MAIN CONVERTER (ExchangeRate-API)
async function convert(){

  clearError();
  rateWrap.hidden = true;
  resultWrap.hidden = true;

  const amount = parseFloat(amountEl.value);
  const from = fromEl.value;
  const to   = toEl.value;

  if (!from || !to || isNaN(amount) || amount < 0){
    showError("Invalid amount or currency selection.");
    return;
  }

  convertBtn.disabled = true;
  convertBtn.textContent = "Converting…";

  try {
    const apiKey = "d5fa71a6f8719a051233d837"; // replace with your free key from https://www.exchangerate-api.com/

    // ExchangeRate-API endpoint for latest rates
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`;

    const res = await fetch(url);

    if (!res.ok) {
      showError("Network error while contacting ExchangeRate-API.");
      return;
    }

    const data = await res.json();

    if (data.result !== "success") {
      showError("API error: " + data['error-type']);
      return;
    }

    const out  = data.conversion_result;
    const rate = data.conversion_rate;

    // Update UI
    rateValue.textContent = `1 ${from} = ${rate.toFixed(6)} ${to}`;
    resultText.textContent = `${fmt(amount, from)} →`;
    resultValue.textContent = fmt(out, to);

    rateWrap.hidden = false;
    resultWrap.hidden = false;

  } catch (err){
    showError("Conversion failed: " + err.message);
  }

  convertBtn.disabled = false;
  convertBtn.textContent = "Convert";
}

// Swap button
swapBtn.addEventListener("click", () => {
  const temp = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value = temp;
  convert();
});

// Clear button
clearBtn.addEventListener("click", () => {
  amountEl.value = "";
  clearError();
  rateWrap.hidden = true;
  resultWrap.hidden = true;
  amountEl.focus();
});

// Auto convert (debounced)
let t;
function debounceConvert(){
  clearTimeout(t);
  t = setTimeout(convert, 300);
}

amountEl.addEventListener('input', debounceConvert);
fromEl.addEventListener('change', convert);
toEl.addEventListener('change', convert);

// Initial load
convert();
