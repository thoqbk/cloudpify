/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, June 15, 2015
 */

module.exports = {
    name: "Cloudpify",
    debug: false,
    https: {
        enable: false
                /**
                 * Add property key and cert before enable https
                 */
    },
    //Its value will be set when run cloudchat
    //Depend on input argument, applicationMode could be full, app or service
    applicationMode: null,
    host: "0.0.0.0",
    port: 5102,
    //When start cloudchat with option "mode=service", cloudchat will use service port
    //to serve all its services (ex: message-service, user-service)
    servicePort: 6102, //if server run in service mode, this service-port will be used instead of port
    remoteService: {
        host: "localhost", //CloudServiceClient will use this config to open connection to remote service server
        port: 6102,
        names: ["userService"]
    },
    //check online status of users
    session: {
        checker: {
            period: 5000, //ms
            timeout: 20000
        }
    },
    nodeId: (new Date()).getTime(),
    client: {
        cacheInterval: 30, //second
        clearClientCacheIfNodeIdChanges: true
    },
    database: require("./database.js"),
    channelAuthentication: {
        enable: false,
        jwt: {
            secretKey: "!!!hellovietnam!!!",
            algorithm: "HS256",
            expiresIn: "10s"
        }
    },
    log: require("./log.js")
};