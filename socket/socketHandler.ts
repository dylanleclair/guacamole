import { match } from "assert";
import { Server, Socket } from "socket.io";

export function createSocketHandler(server: Server) {
    return function socketHandler(io: Socket) {

        io.join("6355e10a9efe7f3ce4f1fbea")

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

            io.to("6355e10a9efe7f3ce4f1fbea").emit("notif", "room notif");
        })

        io.on("notif", (msg) => {
            console.log(msg);
            console.log("hi");
            io.to(msg.game).emit("move", msg.move);
        })

    }
}