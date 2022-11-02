"use strict";
exports.__esModule = true;
exports.createSocketHandler = void 0;
function createSocketHandler(server) {
    return function socketHandler(io) {
        function disconnect() {
            console.log("client disconnected");
        }
        console.log("connection!! <3 pumpkin");
        io.on('disconnect', disconnect);
        io.on("match_connect", function (msg) {
            // handle the event!
            // in this case, see if both players have joined.
            console.log("joining room " + msg);
            io.join(msg);
            io.to(msg).emit("notif", "room notif");
        });
        io.on("notif", function (msg) {
            console.log(msg);
            console.log("hi");
            io.to(msg.game).emit("move", msg.move);
        });
    };
}
exports.createSocketHandler = createSocketHandler;
