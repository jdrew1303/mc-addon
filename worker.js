onmessage = function (event) {
    var code = event.data.code;
    var inputs = event.data.inputs;
    var msgId = event.data.uuid;

    var parseError = null;
    var results = null;
    var errors = {};

    var fn;

    try {
        fn = eval(code)
    } catch (e) {
        parseError = e.message;
        postMessage({
            parseError: parseError,
            errors: errors,
            results: results,
            uuid: msgId
        });
        return;
    }

    results = [];
    inputs.forEach(function (input, idx) {
        var r = null;
        try {
            r = fn.apply(input, []);
        } catch (e) {
            errors[idx] = e.message;
        }
        results.push(r);
    });
    postMessage({
        parseError: parseError,
        errors: errors,
        results: results,
        uuid: msgId
    });
};
