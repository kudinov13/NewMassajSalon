const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { createOrderFromCart, getOrder, markOrderPaid } = require('../db/orders');
const { verifyResultSignature, verifySuccessSignature } = require('../utils/robokassa');
const { orderPaymentUrl } = require('../utils/orderPaymentUrl');
const { sendMail, sendAdminNotification } = require('../utils/mailer');

const paymentRouter = express.Router();

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    req.userId = userId;
    next();
};

// POST /create — оформить заказ из корзины и получить ссылку на оплату
paymentRouter.post('/create', requireAuth, async (req, res) => {
    try {
        const order = await createOrderFromCart(req.userId);
        if (!order) return res.status(400).json({ message: 'Корзина пуста' });
        const paymentUrl = await orderPaymentUrl({ id: order.orderId, total: order.total, userId: req.userId });
        res.json({ orderId: order.orderId, total: order.total, paymentUrl });
    } catch (e) {
        console.error('payment/create error:', e);
        res.status(500).json({ message: 'Не удалось создать платёж' });
    }
});

// GET /link/:orderId — повторная ссылка на оплату для заказа в статусе pending
paymentRouter.get('/link/:orderId', requireAuth, async (req, res) => {
    try {
        const order = await getOrder(parseInt(req.params.orderId, 10));
        if (!order || order.userId !== req.userId) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }
        if (order.status === 'paid') {
            return res.status(400).json({ message: 'Заказ уже оплачен' });
        }
        const paymentUrl = await orderPaymentUrl(order);
        res.json({ paymentUrl });
    } catch (e) {
        console.error('payment/link error:', e);
        res.status(500).json({ message: 'Не удалось создать ссылку на оплату' });
    }
});

const notifyPaid = async (order) => {
    const user = await getUserById(order.userId);
    const itemsText = order.items.map((i) => `  - ${i.name} x${i.quantity} = ${i.price * i.quantity} руб.`).join('\n');
    const itemsHtml = order.items.map((i) => `<li>${i.name} x${i.quantity} = ${i.price * i.quantity} руб.</li>`).join('');
    try {
        await sendAdminNotification({
            subject: `Оплачен заказ №${order.id} на koosmo.ru`,
            text: `Заказ №${order.id} оплачен на сумму ${order.total} руб.\nПокупатель: ${user?.fullName || user?.login || order.userId} (${user?.email || 'email не указан'}, ${user?.phone || 'телефон не указан'})\n\nСостав заказа:\n${itemsText}`,
            html: `<p>Заказ <b>№${order.id}</b> оплачен на сумму <b>${order.total} руб.</b></p>
<p>Покупатель: ${user?.fullName || user?.login || order.userId} (${user?.email || 'email не указан'}, ${user?.phone || 'телефон не указан'})</p>
<ul>${itemsHtml}</ul>`,
        });
    } catch (e) {
        console.error('Failed to send admin payment notification:', e);
    }
    if (user?.email) {
        try {
            await sendMail({
                to: user.email,
                subject: `Заказ №${order.id} оплачен — Коосмо`,
                text: `Спасибо за покупку! Ваш заказ №${order.id} на сумму ${order.total} руб. оплачен.\n\nСостав заказа:\n${itemsText}\n\nСтатус заказа можно посмотреть в личном кабинете: https://koosmo.ru/purchase-history`,
                html: `<p>Спасибо за покупку! Ваш заказ <b>№${order.id}</b> на сумму <b>${order.total} руб.</b> оплачен.</p>
<ul>${itemsHtml}</ul>
<p>Статус заказа можно посмотреть в <a href="https://koosmo.ru/purchase-history">личном кабинете</a>.</p>`,
            });
        } catch (e) {
            console.error('Failed to send customer payment notification:', e);
        }
    }
};

// ResultURL от Робокассы — подтверждение оплаты (POST или GET, настраивается в кабинете)
const resultHandler = async (req, res) => {
    const params = { ...req.query, ...req.body };
    const { OutSum, InvId } = params;
    console.log('Robokassa result:', JSON.stringify(params));

    if (!verifyResultSignature(params)) {
        console.error(`Robokassa result: bad signature for InvId=${InvId}`);
        return res.status(400).send('bad sign');
    }

    const orderId = parseInt(InvId, 10);
    const order = await getOrder(orderId);
    if (!order) {
        console.error(`Robokassa result: order ${orderId} not found`);
        return res.status(404).send('order not found');
    }
    if (Math.abs(parseFloat(OutSum) - order.total) > 0.01) {
        console.error(`Robokassa result: amount mismatch for order ${orderId}: ${OutSum} != ${order.total}`);
        return res.status(400).send('amount mismatch');
    }

    const paidOrder = await markOrderPaid(orderId);
    if (paidOrder?.justPaid) {
        notifyPaid(paidOrder).catch((e) => console.error('payment notify error:', e));
    }
    res.send(`OK${InvId}`);
};

paymentRouter.post('/result', resultHandler);
paymentRouter.get('/result', resultHandler);

// SuccessURL — пользователь вернулся после оплаты
paymentRouter.get('/success', (req, res) => {
    const params = req.query;
    const { InvId } = params;
    if (verifySuccessSignature(params)) {
        return res.redirect(`/payment-success?order=${InvId || ''}`);
    }
    console.error('Robokassa success: bad signature', JSON.stringify(params));
    res.redirect('/payment-fail');
});

// FailURL — оплата не прошла
paymentRouter.get('/fail', (req, res) => {
    const { InvId } = req.query;
    res.redirect(`/payment-fail?order=${InvId || ''}`);
});

module.exports = paymentRouter;
