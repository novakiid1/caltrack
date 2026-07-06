import logger from '../utils/logger.js';

export const requireAdmin = (req, res, next) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
        logger.error('admin panel access blocked: ADMIN_PASSWORD is not set');
        return res.status(503).send('Admin panel disabled: ADMIN_PASSWORD is not set');
    }

    const auth = req.headers.authorization || '';
    const [scheme, encoded] = auth.split(' ');
    const password = scheme === 'Basic' && encoded
        ? Buffer.from(encoded, 'base64').toString().split(':')[1]
        : null;

    if (password !== expected) {
        logger.warn({ ip: req.ip, path: req.originalUrl }, 'admin panel authentication failed');
        res.set('WWW-Authenticate', 'Basic realm="admin"');
        return res.status(401).send('Authentication required');
    }
    next();
};
