"use strict";
exports.__esModule = true;
exports.createSocketHandler = void 0;
var PROXY = "http://localhost:3000/";
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
            console.log("wtf?");
            // load the database
            // we want to post the move to the database / next API
            fetch(PROXY + "api/match/", { method: "PATCH", body: JSON.stringify(msg) }).then(function (res) {
                res.json().then(function (data) {
                    console.log(data);
                });
            });
            // should probably wait until successful response from server before sending message back to user!
        });
    };
}
exports.createSocketHandler = createSocketHandler;
