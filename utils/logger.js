import pino from 'pino';

const targets = [
    { target: 'pino/file', options: { destination: 1 } }, // stdout
];

if (process.env.LOGTAIL_SOURCE_TOKEN) {
    targets.push({
        target: '@logtail/pino',
        options: { sourceToken: process.env.LOGTAIL_SOURCE_TOKEN },
    });
}

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
}, pino.transport({ targets }));

export default logger;
