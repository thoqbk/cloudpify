/* 
 * This class for serving all remote services. The remote service request
 * will be fired from CloudServiceClient
 */


var Promise = require("bluebird");

var serviceDefinitionService = null;

module.exports = function ($resolve, $construct, $logger, $event) {

    serviceDefinitionService = $construct(require("./service/service-definition-service.js"));

    return initializeHttpServer($resolve, $logger, $event);
};


function initializeHttpServer($resolve, $logger, $event) {
    $event.listen("invoke.cloud-service", function (request, response) {
        var body = "";
        request.on("data", function (data) {
            body += data;
        });
        request.on("end", function () {
            processRemoteRequest($resolve, $logger, body, response);
        });
    });

}

function processRemoteRequest($resolve, $logger, body, res) {
    $logger.debug("Begin processing request: " + body);
    var requestInJson = null;
    var response = {
    };
    try {
        requestInJson = JSON.parse(body);
    } catch (error) {
        var errorMessage = "Receive invalid data request: " + body;
        $logger.debug(errorMessage);
        response.type = "error";
        response.body = errorMessage;

        res.end(JSON.stringify(response));
        return;
    }
    //ELSE:
    response.action = requestInJson.action;

    var regex = /cloudchat\:cloud-service\:([^\:]+)\:([^\:]+)/;
    var matches = regex.exec(requestInJson.action);
    var serviceName = matches != null ? matches[1] : null;
    var methodName = matches != null ? matches[2] : null;

    //invoke method:
    var service = $resolve(serviceName, function (serviceName) {
        if (serviceName == "serviceDefinitionService") {
            return serviceDefinitionService;
        } else {
            return null;
        }
    });
    var methodFx = (service != null) ? service[methodName] : null;
    if (service == null || methodFx == null) {
        response.type = "error";
        if (service == null) {
            response.body = "Service not found: " + serviceName;
        } else {
            response.body = "Service " + serviceName + " does not contain method: " + methodName;
        }
        //send response
        res.end(JSON.stringify(response));
    } else {
        //invoke service
        var serviceResult = methodFx.apply(service, requestInJson.body);
        Promise.resolve(serviceResult)
                .then(function (result) {
                    response.type = "result";
                    response.body = result;
                    //send response
                    res.end(JSON.stringify(response));
                })
                .catch(function (error) {
                    response.type = "error";
                    response.body = error;
                    //send response
                    res.end(JSON.stringify(response));
                });
    }
}

