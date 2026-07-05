export const requireAdmin = (req, res, next) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return res.status(503).send('Admin panel disabled: ADMIN_PASSWORD is not set');

    const auth = req.headers.authorization || '';
    const [scheme, encoded] = auth.split(' ');
    const password = scheme === 'Basic' && encoded
        ? Buffer.from(encoded, 'base64').toString().split(':')[1]
        : null;

    if (password !== expected) {
        res.set('WWW-Authenticate', 'Basic realm="admin"');
        return res.status(401).send('Authentication required');
    }
    next();
};
