
import Match, { type IMatch } from "../models/Match";
import { Server, Socket } from "socket.io";
import { ObjectId } from "mongodb";
import { Chess } from "chess.js";

let PROXY = "http://localhost:3000/"

export function createSocketHandler(server: Server) {
    return function socketHandler(io: Socket) {

        function disconnect() {
            console.log("client disconnected")
        }

        console.log("connection!! <3 pumpkin");
        io.on('disconnect', disconnect);

        io.on("match_connect", (msg) => {

            // handle the event!

            // in this case, see if both players have joined.
            console.log("joining room " + msg)
            io.join(msg);

            io.to(msg).emit("notif", "room notif");
        })

        io.on("notif", (msg) => {
            console.log(msg);
            console.log("hi");

            io.to(msg.game).emit("move", msg.move);

            console.log("wtf?");
            // load the database
            // we want to post the move to the database / next API
            fetch(PROXY + "api/match/", { method: "PATCH", body: JSON.stringify(msg) }).then((res) => {
                res.json().then((data) => {
                    console.log(data);
                })
            });

            // should probably wait until successful response from server before sending message back to user!


        })

    }
}