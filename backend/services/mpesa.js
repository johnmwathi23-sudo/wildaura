const axios = require('axios');

const CONSUMER_KEY = process.env.M_PESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.M_PESA_CONSUMER_SECRET;
const PASSKEY = process.env.M_PESA_PASSKEY;
const SHORTCODE = process.env.M_PESA_SHORTCODE || '174379';
const CALLBACK_URL = process.env.M_PESA_CALLBACK_URL || 'https://wild-aura-api.onrender.com/api/orders/mpesa/callback';

let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get(
    'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  accessToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return accessToken;
}

function getTimestamp() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}${h}${min}${s}`;
}

function getPassword() {
  const timestamp = getTimestamp();
  const str = `${SHORTCODE}${PASSKEY}${timestamp}`;
  return Buffer.from(str).toString('base64');
}

async function stkPush(phone, amount, orderId) {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = getPassword();
  const formattedPhone = phone.replace(/^0+/, '254').replace(/^\+?254/, '254');
  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: CALLBACK_URL,
    AccountReference: orderId.slice(-12),
    TransactionDesc: `Wild Aura Order ${orderId.slice(-8)}`
  };
  const res = await axios.post(
    'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

async function queryStatus(checkoutRequestId) {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = getPassword();
  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId
  };
  const res = await axios.post(
    'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

module.exports = { stkPush, queryStatus };
