const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

function isSecureRequest(req) {
    if (req.secure) return true;
    const forwarded = req.headers['x-forwarded-proto'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim() === 'https';
    }
    return process.env.NODE_ENV === 'production';
}

function getCookieOptions(req) {
    return {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecureRequest(req),
        path: '/',
    };
}

function getClearCookieOptions(req) {
    const { maxAge, ...options } = getCookieOptions(req);
    return options;
}

module.exports = {
    COOKIE_NAME,
    getCookieOptions,
    getClearCookieOptions,
};
