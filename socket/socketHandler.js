"use strict";
exports.__esModule = true;
exports.createSocketHandler = void 0;
var emit_messages_1 = require("../lib/emit_messages");
var PROXY = "http://localhost:3000/";
function createSocketHandler(server) {
    return function socketHandler(io) {
        function disconnect() {
            console.log("client disconnected");
        }
        console.log("websocket client connected");
        io.on("disconnect", disconnect);
        io.on("match_connect", function (msg) {
            // handle the event!
            // in this case, see if both players have joined.
            io.join(msg);
            // io.to(msg).emit("notif", "room notif");
            server["in"](msg).emit("notif", "room notif");
        });
        io.on("notif", function (msg) {
            // io.to(msg.game).emit("move", msg.move);
            // load the database
            // we want to post the move to the database / next API
            fetch(PROXY + "api/match/", {
                method: "PATCH",
                body: JSON.stringify(msg)
            }).then(function (res) {
                if (res.ok) {
                    // if move was successful, send it to all players in the game.
                    server["in"](msg.game).emit("move", msg.move);
                }
                else {
                    // otherwise, do nothing???
                }
                res.json().then(function (data) {
                    console.log(data);
                });
            });
            // should probably wait until successful response from server before sending message back to user!
        });
        io.on(emit_messages_1.WebsocketAction.MATCH_REQUEST, function (userdata) {
            // i feel like we don't need the whole wait state on the client.
            // they will join as soon as they receive api response
            // then can just fetch active match when match_start signal is sent!
            // basically: check pending matches
            // if there are any (suitable) matches open, the match document will be returned!
            fetch(PROXY + "api/match/pending", { method: "GET" }).then(function (res) {
                // TODO body to help decide which match
                if (res.ok) {
                    // a suitable match was found and returned!
                    res.json().then(function (matchdata) {
                        // tell api to add second user to the game
                        fetch(PROXY + "api/match/pending", {
                            method: "PATCH",
                            body: JSON.stringify({
                                match: matchdata._id,
                                userId: userdata._id
                            })
                        }).then(function (inner) {
                            if (inner.ok) {
                                // if this goes smoothly (it should!!!)
                                io.join(matchdata._id); // join the room
                                // tell all players in that match that the game has started (so they can start to play!)
                                server.sockets["in"](matchdata._id)
                                    .emit(emit_messages_1.WebsocketAction.MATCH_START, "HELLO!"); // tell room (both players) to start game
                            }
                        });
                    });
                }
                else {
                    // player must wait for someone else to request a match
                    fetch(PROXY + "api/match/pending", {
                        method: "POST",
                        body: JSON.stringify(userdata._id)
                    }).then(function (inner) {
                        // should get the match id in response
                        if (inner.ok) {
                            // if the response is okay, then send the user the match id to wait / listen to
                            inner.json().then(function (result) {
                                io.join(result._id); // join the room and wait for match to start
                            });
                        }
                    });
                }
            });
        });
    };
}
exports.createSocketHandler = createSocketHandler;
