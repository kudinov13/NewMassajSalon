const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.yandex.ru';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

const sendMail = async ({ to, subject, text, html }) => {
    if (!SMTP_USER || !SMTP_PASS) {
        console.warn('SMTP not configured, skipping email to', to);
        return;
    }
    await transporter.sendMail({
        from: `"КООСМО" <${SMTP_USER}>`,
        to,
        subject,
        text,
        html,
    });
};

const sendAdminNotification = async ({ subject, text, html }) => {
    if (!ADMIN_EMAIL) {
        console.warn('ADMIN_EMAIL not configured, skipping admin notification');
        return;
    }
    await sendMail({ to: ADMIN_EMAIL, subject, text, html });
};

module.exports = { sendMail, sendAdminNotification };
