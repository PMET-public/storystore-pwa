"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
require('dotenv').config();
var express_1 = __importDefault(require("express"));
var request_1 = __importDefault(require("request"));
var next_1 = __importDefault(require("next"));
var apollo_client_1 = require("./lib/apollo-client");
var dev = process.env.NODE_ENV !== 'production';
var app = next_1["default"]({ dev: dev });
var handle = app.getRequestHandler();
var port = process.env.PORT || 3000;
var url = "http://localhost:" + port;
app.prepare().then(function () {
    var server = express_1["default"]();
    /**
     * GraphQL Proxy
     */
    server.post('/graphql', function (req, res) {
        req.pipe(request_1["default"](apollo_client_1.uri)).pipe(res);
    });
    /**
     * Static Files
     */
    server.get('_next/*', function (req, res) {
        return handle(req, res);
    });
    /**
     * Magento Routes
     */
    server.get('*', function (req, res) {
        return app.render(req, res, '/_url-resolver', { url: req.url });
    });
    server.listen(port, function () {
        console.info('Server started...');
        // Launch in browser
        if (process.env.LAUNCH_IN_BROWSER) {
            var start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
            console.info("Launching " + url + "...");
            require('child_process').exec(start + ' ' + url);
        }
    });
});
