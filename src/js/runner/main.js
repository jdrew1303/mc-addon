window.addEventListener('message', function(event) {
    event.source.postMessage({
        uuid: event.data.uuid,
        result: window.eval(event.data.code)
    }, event.origin);
});