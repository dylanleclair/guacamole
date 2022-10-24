"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var http_1 = require("http");
var url_1 = require("url");
var next_1 = __importDefault(require("next"));
var socket_io_1 = require("socket.io");
var socketHandler_1 = require("./socket/socketHandler");
var dev = process.env.NODE_ENV !== 'production';
var hostname = 'localhost';
var port = parseInt(process.env.PORT || '3000', 10);
var app = (0, next_1["default"])({ dev: dev, hostname: hostname, port: port });
var handle = app.getRequestHandler();
app.prepare().then(function () {
    var httpServer = (0, http_1.createServer)(function (req, res) {
        try {
            var parsedUrl = (0, url_1.parse)(req.url, true);
            handle(req, res, parsedUrl);
        }
        catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });
    // create Socket.io server
    // unfortunately, you must reload the server every time you modify the socket io backend code :(
    var socketServer = new socket_io_1.Server(httpServer);
    var socketHandler = (0, socketHandler_1.createSocketHandler)(socketServer);
    socketServer.on('connection', socketHandler);
    httpServer.listen(port, function () {
        console.error("> Ready on http://".concat(hostname, ":").concat(port, " as ").concat(dev ? 'development' : process.env.NODE_ENV));
    });
})["catch"](function (err) {
    console.error("Next.js server failed to start :(");
});
