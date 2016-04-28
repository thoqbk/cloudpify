/**
 * Log4js configuration
 */
module.exports = {
    appenders: [
        {
            type: "console",
            layout: {
                type: "pattern",
                pattern: "%r: %m"
            },
            category: "app",
            level: "DEBUG"
        },
        {
            type: "file",
            layout: {
                type: "pattern",
                pattern: "%r: %m"
            },
            filename: "storage/logs/cloudpify.log",
            category: "production-app",
            maxLogSize: 10240,
            backups: 10,
            level: "INFO"
        }
    ],
    replaceConsole: false
};


