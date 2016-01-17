/**
 * Sample controller
 * @param {type} userService description
 * @param {type} $response 
 */

module.exports = SampleController;

function SampleController(userService, $response) {

    /**
     * 
     * @param {type} $input containing request data and sender info
     * @returns {undefined}
     */
    this.hello = function ($input) {
        var senderId = $input.getUserId();
        userService.getById(senderId)
                .then(function (user) {
                    var message = "Receive message from " + senderId;
                    message += ". Hello " + user.username;
                    $response.echo($input.getChannel(), {
                        id: $input.getId(),
                        stanza: "iq",
                        type: "result",
                        ns: "io:cloudchat:message:create",
                        body: message
                    });
                });
    };

}