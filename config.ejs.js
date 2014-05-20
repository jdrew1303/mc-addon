angular.module('mc-addon.config', [])

.constant('CONFIG', {
    VERSION: '<%= data.pkg.version %>',
    HTTP_API_ROOT: '<%= data.env.HTTP_API_ROOT %>',
    WS_API_ROOT: '<%= data.env.WS_API_ROOT %>'
});