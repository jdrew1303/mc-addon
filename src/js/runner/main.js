window.addEventListener('message', function(event) {
    var error = null;
    var results = null;
    try {
        var fn = eval(event.data.code); /* jshint ignore:line */
        results = _.map(event.data.inputs, function (input) {
            return fn.apply(input, []);
        });
    } catch (e) {
        error = e.message;
    }
    var response = {
        result: results,
        uuid: event.data.uuid,
        error: error
    };
    event.source.postMessage(response, event.origin);
});