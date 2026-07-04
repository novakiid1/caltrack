import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import logger from './utils/logger.js';

const mongodbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/caltrack";

async function main() {
    await mongoose.connect(mongodbUrl);
}

logger.info({
    processTz: process.env.TZ || null,
    resolvedSystemTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    nodeVersion: process.version,
}, 'server booting');

main().then(() => {
    logger.info('connected to db');
    app.listen(process.env.PORT || 8080, () => {
        logger.info({ port: process.env.PORT || 8080 }, 'server listening');
    });
}).catch((err) => {
    logger.error({ err: err.message }, 'db connection failed');
});
