# Caskaydia Chess: a live service chess game

![Cascadia logo](public/logo.svg)

A live service chess app with additional analysis and ai gameplay provided by stockfish.

## Getting started

1. install Docker (ideally with docker desktop since this includes docker compose)
2. install node
   - in project folder, run "npm install"
3. Setup your `.env` file
   - See [environment configuration](#setting-up-an-environment-file) for details
4. run the project `docker-compose up -d`
   - this will start the Docker multi-container
   - open up Docker Desktop.
   - once the guacamole container pops up in "Containers", the app is all ready to go!
   - you can go to http://localhost:3000 to see the default page
   - I've also written a page that has a preview of what the chess board might look like: http://localhost:3000/match


## Project Stack

| Name | Purpose | Link |
|------|---------|------|
| NextJS | Backend and frontend library based on react | [Website](https://nextjs.org/) |
|MongoDB| Database| [Website](https://www.mongodb.com/)|
|Mongoose| Database connection library | [Website](https://mongoosejs.com/) |
|NextAuth.js| Github auth for creating users | [Website](https://next-auth.js.org/) |
| SocketIo | Websocket implementation for real-time comunication between players | [Website](https://socket.io/) |
| ChessJS | Implementation of chess logic client-side | [Website](https://github.com/jhlywa/chess.js) | 

Additionally `engine-testing` is a microservice for doing analysis. It's an HTTP wrapper in python that wraps [stockfish](https://stockfishchess.org/) so that the main nextJS service can communicate with it.

## Setting up an environment file

A `.env` or `.env.local` file is a file that will contain configuration necessary for github auth (to login), stripe integration (to upgrade members), and the mongo DB configuration.

By the end it should look something like this:

`.env` or `.env.local` (in root directory)

```
GITHUB_ID=Your_ID
GITHUB_SECRET=Your_Secret


MONGODB_URI=mongodb://root:example@mongo:27017/myapp


STRIPE_SECRET_KEY=Your_Endpoint_Key
STRIPE_ENDPOINT_SECRET=Your_Endpoint_Secret
```


### Mongo DB config

The mongo DB config will always require the following line:

`MONGODB_URI=mongodb://root:example@mongo:27017/myapp`



### Setting up Stripe integration (locally):

- Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
- Login to the Stripe account being used and corresponding to your Stripe ENV variables using `stripe login` (note you may need to specify the path to the executable like `C:/path-to-executable/stripe.exe login` if your system can't recognize the stripe command)
- Run `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe`
- Now stripe will forward requests to our local webhook endpoint so that our backend can respond accordingly.
- Note that a stripe customer is created on creation of a new Cascadia user. Thus, old users that were not created under this integration should either be deleted or manually create a stripe customer and add the stripeCustomerId column for the Cascadia user.

### Setting up Github Auth

You need to register a github OAuth application in order to setup a user. To do this:

1. Have a github account & login
2. Go to [https://github.com/settings/applications/new](https://github.com/settings/applications/new) (*Settings --> Developer settings --> OAuth Apps --> New OAuth App*) to register a new app
3. All fields are arbitrary, except the authorization callback URL. It should be [http://localhost:3000/api/auth/callback/github](http://localhost:3000/api/auth/callback/github), and hit *Register application*
4. Copy your client ID and add it to your environment file `GITHUB_ID=Client_ID`
5. Click *Generate a new client secret* then copy it and add it to your environment file `GITHUB_SECRET=Client_Secret`

[Video Walkthrough for Github](https://youtu.be/e2EKSJkXkqQ?t=372) (6 mins 12 seconds in)


### Example PGN for testing analysis

```text
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2022.12.01"]
[Round "?"]
[White "Jimenez506"]
[Black "oolongmafia"]
[Result "0-1"]
[ECO "B10"]
[WhiteElo "886"]
[BlackElo "1021"]
[TimeControl "600"]
[EndTime "20:41:23 PST"]
[Termination "oolongmafia won by checkmate"]

1. e4 c6 2. Be2 d5 3. Bh5 g6 4. Bg4 dxe4 5. h3 Nf6 6. Nc3 Bxg4 7. hxg4 Bh6 8. d4
c5 9. Rxh6 cxd4 10. Nb5 O-O 11. Nxd4 Nc6 12. Nxc6 bxc6 13. Qxd8 Rfxd8 14. Be3
Nxg4 15. Rh4 Nxe3 16. fxe3 Rab8 17. Rxe4 Rxb2 18. Rxe7 Rxc2 19. Rxa7 Rxg2 20.
Rc1 Rxg1+ 21. Kf2 Rxc1 22. a4 Rc2+ 23. Kf3 c5 24. a5 Ra2 25. a6 c4 26. Rc7 Rxa6
27. Rxc4 Rf6+ 28. Ke2 g5 29. e4 Re8 30. Kd3 g4 31. e5 Rd8+ 32. Ke4 Rf1 33. Ke3
g3 34. Rg4+ Kf8 35. Rxg3 Re1+ 36. Kf4 Re8 37. Rh3 R8xe5 38. Rxh7 R5e4+ 39. Kf5
Re6 40. Kf4 Rf1+ 41. Kg5 Rg6+ 42. Kh5 Rh1# 0-1
```

### Working around stripe (manually make a user premium)

To make a member premium, you can directly access the database and modify your user.

Navigate to http://localhost:8081/db/test/users and select the document for the user you wish to promote to a premium membership.

Then, at the bottom of the document, add `premiumMember: true`. It should look like: 

```
{
    _id: ObjectId('63915c312383ef195637c898'),
    name: 'dylanleclair',
    email: 'dylan.leclair@icloud.com',
    image: 'https://avatars.githubusercontent.com/u/45674837?v=4',
    emailVerified: null,
    premiumMember: true
}
```

Now, any premium pages should be accessible *without having to install the Stripe CLI*. 

