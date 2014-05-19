angular.module('mc-addon.background', ['uuid4'])

.provider('runnerIframe', [function () {
    var elementId = 'runner';
    return {
        setIframeId: function (id) { elementId = id },
        $get: ['$document', function ($document) {
            return angular.element($document[0].getElementById(elementId));
        }]
    };
}])

.service('messageCache', [function () {
    var cache = {};
    this.put = function (msgId, d) { cache[msgId] = d };
    this.purge = function (msgId, result, error) {
        var deferred = cache[msgId];
        if (deferred) {
            delete cache[msgId];
            if (!error) {
                deferred.resolve(result);
            } else {
                deferred.reject(error);
            }
        }
    }
}])

.factory('messageHandler', ['messageCache', function (cache) {
    return function (event) {
        cache.purge(event.data.uuid, event.data.result, event.data.error);
    };
}])

.factory('eval', ['$q', 'uuid4', 'runnerIframe', 'messageCache',
    function ($q, uuid4, iframe, messageCache) {

    var prefix = "(function (input) {";
    var suffix = "});";

    return function (code, inputs) {
        var fn = prefix + code + suffix;
        var d = $q.defer();
        var msgId = uuid4.generate();
        var msg = {uuid: msgId, code: fn, inputs: inputs};
        messageCache.put(msgId, d);
        iframe[0].contentWindow.postMessage(msg, '*');
        return d.promise;
    };
}])

.run(['$window', 'messageHandler', function($window, messageHandler) {
    $window.addEventListener('message', messageHandler);
}]);