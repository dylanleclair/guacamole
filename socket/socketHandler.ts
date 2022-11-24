import Match, { type IMatch } from "../models/Match";
import { Server, Socket } from "socket.io";
import { ObjectId } from "mongodb";
import { Chess } from "chess.js";
import { WebsocketAction } from "../lib/emit_messages";
import { IUser } from "../models/User";

let PROXY = "http://localhost:3000/";

export function createSocketHandler(server: Server) {
  return function socketHandler(io: Socket) {
    function disconnect() {
      console.log("client disconnected");
    }

    console.log("connection!! <3 pumpkin");
    io.on("disconnect", disconnect);

    io.on("match_connect", (msg) => {
      // handle the event!

      // in this case, see if both players have joined.
      console.log("joining room " + msg);
      io.join(msg);

      io.to(msg).emit("notif", "room notif");
    });

    io.on("notif", (msg) => {
      console.log(msg);
      console.log("hi");

      io.to(msg.game).emit("move", msg.move);

      console.log("wtf?");
      // load the database
      // we want to post the move to the database / next API
      fetch(PROXY + "api/match/", {
        method: "PATCH",
        body: JSON.stringify(msg),
      }).then((res) => {
        res.json().then((data) => {
          console.log(data);
        });
      });

      // should probably wait until successful response from server before sending message back to user!
    });

    io.on(WebsocketAction.MATCH_REQUEST, (userdata) => {
      // what data do we need for this?

      console.log(`User ${userdata._id} requested a match.`);

      // lets just start with player id for now
      // post to /api/match with the player id.
      // it will randomly seed it as player1 or player2 & set other fields to defaults.

      // i feel like we don't need the whole wait state on the client.
      // they will join as soon as they receive api response
      // then can just fetch active match when match_start signal is sent!

      // basically: check pending matches
      // if there are any (suitable) matches open, the match document will be returned!
      fetch(PROXY + "api/match/pending", { method: "GET" }).then((res) => {
        // TODO body to help decide which match
        if (res.ok) {
          console.log("response okay");
          // a suitable match was found and returned!
          res.json().then((matchdata) => {
            console.log(matchdata);

            // tell api to add second user to the game
            fetch(PROXY + "api/match/pending", {
              method: "PATCH",
              body: JSON.stringify({
                match: matchdata._id,
                userId: userdata._id,
              }),
            }).then((inner) => {
              if (inner.ok) {
                // if this goes smoothly (it should!!!)
                console.log("GOOD YES HAPPY", matchdata._id);
                io.join(matchdata._id); // join the room
                server.sockets
                  .in(matchdata._id)
                  .emit(WebsocketAction.MATCH_START, "HELLO!"); // tell room (both players) to start game
              }
            });
          });
        } else {
          // player must wait for someone else to request a match
          console.log("original fetch failed lol :D");

          fetch(PROXY + "api/match/pending", {
            method: "POST",
            body: JSON.stringify(userdata._id),
          }).then((inner) => {
            // should get the match id in response
            console.log("MAKING A NEW PENDING MATCH!!!!");
            if (inner.ok) {
              // if the response is okay, then send the user the match id to wait / listen to
              inner.json().then((result) => {
                // io.to(io.id).emit(WebsocketAction.MATCH_WAIT, matchdata._id) // reply with the match id

                console.log("OKAY OKAY", result._id);
                console.log("OKAY OKAY2", result);
                io.join(result._id); // join the room and wait for match to start
              });
            }
          });
        }
      });
    });
  };
}
