/**
 * Database for storing user and message ...
 */

module.exports = {
    default: "mysql",
    connections: {
        mysql: {
            client: "mysql",
            connection: {
                host: "127.0.0.1",
                user: "your_database_user",
                password: "your_database_password",
                database: "your_database"
            }
        },
        pg: {
            client: 'pg',
            connection: process.env.PG_CONNECTION_STRING,
            searchPath: 'knex,public'
        },
        sqlite: {
            client: 'sqlite3',
            connection: {
                filename: "./mydb.sqlite"
            }
        }

    }
};