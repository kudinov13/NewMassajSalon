const crypto = require('crypto');

const PAY_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx';

const isTest = () => process.env.ROBOKASSA_TEST === '1';

const getCredentials = () => ({
    login: process.env.ROBOKASSA_LOGIN,
    pass1: isTest() ? process.env.ROBOKASSA_TEST_PASS1 : process.env.ROBOKASSA_PASS1,
    pass2: isTest() ? process.env.ROBOKASSA_TEST_PASS2 : process.env.ROBOKASSA_PASS2,
});

const md5hex = (s) => crypto.createHash('md5').update(s, 'utf8').digest('hex').toUpperCase();

// Shp_-параметры участвуют в подписи в алфавитном порядке после пароля
const shpSuffix = (params) => Object.keys(params)
    .filter((k) => k.toLowerCase().startsWith('shp_'))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}=${params[k]}`)
    .join(':');

// Фискальный чек (54-ФЗ). Включается через ROBOKASSA_RECEIPT=1
const buildReceipt = (items) => {
    if (process.env.ROBOKASSA_RECEIPT !== '1') return null;
    return {
        sno: process.env.ROBOKASSA_SNO || 'usn_income',
        items: items.map((i) => ({
            name: String(i.name).substring(0, 128),
            quantity: i.quantity,
            sum: Math.round(i.price * i.quantity * 100) / 100,
            payment_method: 'full_payment',
            payment_object: i.courseId ? 'service' : 'commodity',
            tax: process.env.ROBOKASSA_TAX || 'none',
        })),
    };
};

// items: [{name, price, quantity, courseId?}]
const buildPaymentUrl = ({ orderId, total, items, email, shp = {} }) => {
    const { login, pass1 } = getCredentials();
    if (!login || !pass1) throw new Error('Robokassa credentials are not configured');

    const outSum = Number(total).toFixed(2);
    const receipt = buildReceipt(items);
    const receiptEncoded = receipt ? encodeURIComponent(JSON.stringify(receipt)) : null;

    const sigParts = [login, outSum, String(orderId)];
    if (receiptEncoded) sigParts.push(receiptEncoded);
    sigParts.push(pass1);
    const shpStr = shpSuffix(shp);
    if (shpStr) sigParts.push(shpStr);

    const params = new URLSearchParams({
        MerchantLogin: login,
        OutSum: outSum,
        InvId: String(orderId),
        Description: `Оплата заказа №${orderId} на koosmo.ru`,
        SignatureValue: md5hex(sigParts.join(':')),
        Encoding: 'utf-8',
        Culture: 'ru',
    });
    if (email) params.set('Email', email);
    if (receiptEncoded) params.set('Receipt', receiptEncoded);
    for (const [k, v] of Object.entries(shp)) params.set(k, String(v));
    if (isTest()) params.set('IsTest', '1');

    return `${PAY_URL}?${params.toString()}`;
};

// Проверка подписи ResultURL (пароль #2) и SuccessURL (пароль #1)
const verifySignature = (params, password) => {
    const { OutSum, InvId, SignatureValue } = params;
    if (!OutSum || !InvId || !SignatureValue) return false;
    const shpStr = shpSuffix(params);
    const base = `${OutSum}:${InvId}:${password}${shpStr ? ':' + shpStr : ''}`;
    return md5hex(base) === String(SignatureValue).toUpperCase();
};

const verifyResultSignature = (params) => verifySignature(params, getCredentials().pass2);
const verifySuccessSignature = (params) => verifySignature(params, getCredentials().pass1);

module.exports = { buildPaymentUrl, verifyResultSignature, verifySuccessSignature, isTest };
