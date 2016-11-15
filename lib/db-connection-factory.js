/**
 * Copyright (C) 2016, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * April 29, 2016
 * 
 */

var knex = require("knex");

var _ = require("underscore");

module.exports = DbConnectionFactory;

function DbConnectionFactory($config, $logger) {

    var dbConnections = {};//name --> connection

    this.get = function (connectionName) {
        var stdConnectionName = connectionName != null ? connectionName : $config.database.default;
        var connectionConfig = $config.database.connections[stdConnectionName];
        if (connectionConfig == null) {
            throw new Error("Invalid connection name: " + connectionName);
        }
        //ELSE:
        return new Promise(function (resolve, reject) {
            if(dbConnections[stdConnectionName] != null) {
              resolve(dbConnections[stdConnectionName]);
              return;
            }
            //ELSE:
            var connection = knex(connectionConfig);
            connection.raw("SELECT 1;")
                    .then(function (resp) {
                        dbConnections[stdConnectionName] = connection;
                        resolve(connection);
                    })
                    .catch(function (error) {
                        $logger.error("Couldn't open connection to the database, connection name: " + stdConnectionName + "; Reason: " + error.stack);
                        reject(error);
                    });
        });
    };
}


