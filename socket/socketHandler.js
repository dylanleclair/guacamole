"use strict";
exports.__esModule = true;
exports.createSocketHandler = void 0;
var emit_messages_1 = require("../lib/emit_messages");
// for some reason I can't get database going up in here. some weird conflict happens between packages.
var PROXY = "http://localhost:3000/";
/**
 * This stores match requests. I think later on, we can create different queues for different ELOs so that players are only matched up against those of similar skill levels.
 */
var match_requests = [];
/**
 * Used to act as a room number for players who have requested matches so matches need not be broadcast to all users waiting for a match.
 *
 * For example, if a user has joined a queue, they will be assigned a match number & their socket will join the room 'match-[matchnumber]'.
 * When they are paired with an opponent, their opponent will join this room & the server will send a MATCH_START notification to each player.
 */
var match_counter = 0;
function createSocketHandler(server) {
    return function socketHandler(io) {
        console.log("websocket client connected");
        io.on("disconnect", function () {
            for (var ri = 0; ri < match_requests.length; ri++) {
                if (match_requests[ri].socketID === io.id) {
                    match_requests.splice(ri, 1);
                }
            }
        });
        io.on("match_connect", function (msg) {
            // handle the event!
            // in this case, see if both players have joined.
            io.join(msg);
            server["in"](msg).emit("notif", "room notif");
        });
        io.on(emit_messages_1.WebsocketAction.MAKE_MOVE, function (msg) {
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
            // will literally receive the IUser document for the user containing all of their user info!!!
            // see models/User.ts or MongoDB browser packed with our Docker (localhost:8081) to see what info this has in it
            if (match_requests.length > 0) {
                var opponent_1 = match_requests.shift();
                console.log("MATCH REQUESTS", match_requests);
                io.join("match-".concat(opponent_1 === null || opponent_1 === void 0 ? void 0 : opponent_1.matchNumber));
                // make a new match via api
                fetch(PROXY + "api/match/pending", {
                    method: "POST",
                    body: JSON.stringify({
                        player1: opponent_1 === null || opponent_1 === void 0 ? void 0 : opponent_1.userID,
                        player2: userdata._id
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(function (inner) {
                    // should get the match id in response
                    if (inner.ok) {
                        // if the response is okay, then send the user the match id to wait / listen to
                        server["in"]("match-".concat(opponent_1 === null || opponent_1 === void 0 ? void 0 : opponent_1.matchNumber))
                            .emit(emit_messages_1.WebsocketAction.MATCH_START);
                    }
                    else {
                        //
                        console.log("Match creation failed !!");
                    }
                });
            }
            else {
                io.join("match-".concat(match_counter));
                match_requests.push({
                    userID: userdata._id,
                    elo: userdata.elo,
                    socketID: io.id,
                    matchNumber: match_counter
                });
                match_counter += 1;
                console.log(match_requests);
            }
        });
    };
}
exports.createSocketHandler = createSocketHandler;
