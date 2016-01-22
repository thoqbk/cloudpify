/**
 * Sample controller
 * @param {type} userService description
 */

module.exports = SampleController;

function SampleController(userService, $logger) {

    /**
     * 
     * @param {type} $input containing request data and sender info
     * @param {type} $response description
     * @returns {undefined}
     */
    this.hello = function ($input, $response) {
        var senderId = $input.getUserId();
        return userService.getById(senderId)
                .then(function (user) {
                    var message = "Receive message from " + senderId;
                    message += ". Hello " + user.username;
                    $response.echo({
                        id: $input.getId(),
                        stanza: "iq",
                        type: "result",
                        ns: "io:cloudchat:message:create",
                        body: message
                    });
                    $logger.debug("This is hello action!");
                });
    };

}