/**
 * Database for storing user and message ...
 */

module.exports = {
    default: "inmemory", //inmemory: use default user-service and message-service
    connections: {
        inmemory: {
        },
        mysql: {
            host: "localhost",
            port: 3306,
            database: "cloudpify",
            username: "root",
            password: "root",
            connectTimeout: 10000,
            acquireTimeout: 10000,
            //pool configuration:
            queueLimit: 10,
            connectionLimit: 10
        }
    }
};