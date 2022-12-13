# Cascadia

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
