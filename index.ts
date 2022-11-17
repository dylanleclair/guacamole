import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

import { Server } from "socket.io";

import { createSocketHandler } from './socket/socketHandler';

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)



const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {

    const httpServer = createServer((req, res) => {

        try {
            const parsedUrl = parse(req.url!, true)
            handle(req, res, parsedUrl)

        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })

    // create Socket.io server
    // unfortunately, you must reload the server every time you modify the socket io backend code :(
    const socketServer = new Server(httpServer);
    const socketHandler = createSocketHandler(socketServer);
    socketServer.on('connection', socketHandler)

    httpServer.listen(port, () => {
        console.error(`> Ready on http://${hostname}:${port} as ${dev ? 'development' : process.env.NODE_ENV}`)
    })


}).catch((err) => {
    console.error("Next.js server failed to start :(")
})

