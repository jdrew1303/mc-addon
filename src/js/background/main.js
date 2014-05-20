angular.module('mc-addon.background', ['mc-addon.config'])

.factory('worker', ['$window', 'messageHandler', function ($window, messageHandler) {
    var worker = new $window.Worker('worker.js');
    worker.onmessage = messageHandler;
    return worker;
}])

.service('messageCache', [function () {
    var cache = {};
    this.put = function (msgId, d) { cache[msgId] = d; };
    this.purge = function (msgId, data) {
        var deferred = cache[msgId];
        if (deferred) {
            delete cache[msgId];
            deferred.resolve(data);
        }
    };
}])

.factory('messageHandler', ['messageCache', function (cache) {
    return function (event) {
        cache.purge(event.data.uuid, event.data);
    };
}])

.factory('runTask', ['$q', 'worker', 'messageCache',
    function ($q, worker, messageCache) {

    var prefix = "(function (input) {";
    var suffix = "});";

    return function (msgId, code, inputs) {
        var fn = prefix + code + suffix;
        var d = $q.defer();
        var msg = {uuid: msgId, code: fn, inputs: inputs};
        messageCache.put(msgId, d);
        worker.postMessage(msg);
        return d.promise;
    };
}])

.run(['$window', 'CONFIG', 'runTask', function ($window, CONFIG, runTask) {
    var socketOpen = false;
    var socket = new WebSocket(CONFIG.WS_API_ROOT + "/tasks");
    var heartbeat = function () {
        if (socketOpen) {
            socket.send(JSON.stringify({}));
            $window.setTimeout(heartbeat, 5000);
        }
    };

    socket.onopen = function (event) {
        socketOpen = true;
        heartbeat();
    };

    socket.onclose = function (event) {
        socketOpen = false;
    };

    socket.onmessage = function (event) {
        var msg = JSON.parse(event.data);
        var task = msg.task;
        var code = msg.code;
        var inputs = msg.inputs;
        runTask(task, code, inputs).then(function (res) {
            var r = JSON.stringify({
                parseError: res.parseError,
                errors: res.errors,
                result: res.results,
                task: res.uuid
            });
            socket.send(r);
        });
    };


}]);
