# Caskaydia Chess: a live service chess game

![Cascadia logo](public/logo.svg)

A live service chess app with additional analysis and ai gameplay provided by stockfish.

## Getting started

1. Install Docker (ideally with docker desktop since this includes docker compose)
   - if you're on Windows, you **must** clone the project to the WSL filesystem (not on Windows) for the project to perform normally (otherwise, Windows will slow down everything trying to convert between Linux and Windows files and many http requests will time out (causing our app not to work).
      - this is a time consuming process, so if you'd like just ask us for a more detailed live demo and we'd be happy to show it off!  
      - to do this, install the [Ubuntu version of WSL through the Microsoft Store](https://apps.microsoft.com/store/detail/ubuntu-on-windows/9NBLGGH4MSV6?hl=en-ca&gl=ca)
      - while you're on the Microsoft Store, install [Windows Terminal](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701?hl=en-ca&gl=ca)
      - once this is done, you can follow [this guide](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers) to get a feel for Docker and how to use it with Windows. You don't need to follow all the way through, but **notice the tutorial project is cloned into the WSL filesystem**. You'll need to do the same with our project. 
      - in Windows Terminal, open an Ubuntu terminal (click on the drop down arrow next to the new tab button and select Ubuntu)
      - [install node/npm for WSL](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl)
      - clone this git repository into the Ubuntu/WSL filesystem
      - `cd` into the repository folder. now proceed with the instructions listed below
2. Install node
   - in the project/repo's root folder, run "npm install"
3. Setup your `.env.local` file
   - If you are the TA grading this project, we have submitted an example `.env.local` file with our source code (and you should be able to skip the environment configuration listed below.)
   - See [environment configuration](#setting-up-an-environment-file) for details
4. Run the project `docker-compose up -d`
   - this will start the Docker multi-container
   - open up Docker Desktop.
   - once the guacamole container pops up in "Containers", the app is all ready to go!
      - all of the containers should show up as green, indicating that they are running smoothly.
   - you can go to http://localhost:3000 to see the homepage!
4. Setup puzzles (see: [setting up puzzles](#setting-up-puzzles))

For some reason on Windows, the first call to any endpoint/page is usually processed really slowly. You just need to be patient and wait until the server responds. Refresh the page if an error occurs (usually a timeout). 

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

*This can be skipped with a workaround if you are short on time! See [Working around stripe](#working-around-stripe)*.

- Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
- Login to the Stripe account being used and corresponding to your Stripe ENV variables using `stripe login` (note you may need to specify the path to the executable like `C:/path-to-executable/stripe.exe login` if your system can't recognize the stripe command)
- Run `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe`
- Now stripe will forward requests to our local webhook endpoint so that our backend can respond accordingly.
- Note that a stripe customer is created on creation of a new Cascadia user. Thus, old users that were not created under this integration should either be deleted or manually create a stripe customer and add the stripeCustomerId column for the Cascadia user.

### Working around Stripe

Skip adding the Stripe environment variables to .env.local. Do the rest of this after you run the project for the first time.

To make a member premium, you can directly access the database and modify your user.

Navigate to http://localhost:8081/db/test/users and select the document for the user you wish to promote to a premium membership.

Then, at the bottom of the document, add `premiumMember: true`. It should look something like: 

```json
{
    _id: ObjectId('63915c312383ef195637c898'),
    name: 'dylanleclair',
    email: 'dylan.leclair@icloud.com',
    image: 'https://avatars.githubusercontent.com/u/45674837?v=4',
    emailVerified: null,
    premiumMember: true
}
```

Now, any premium pages should be accessible *without having to install the Stripe CLI* / set up Stripe environment variables. 

### Setting up Github Auth

You need to register a github OAuth application in order to setup a user. To do this:

1. Have a github account & login
2. Go to [https://github.com/settings/applications/new](https://github.com/settings/applications/new) (*Settings --> Developer settings --> OAuth Apps --> New OAuth App*) to register a new app
3. All fields are arbitrary, except the authorization callback URL. It should be [http://localhost:3000/api/auth/callback/github](http://localhost:3000/api/auth/callback/github), and hit *Register application*
4. Copy your client ID and add it to your environment file `GITHUB_ID=Client_ID`
5. Click *Generate a new client secret* then copy it and add it to your environment file `GITHUB_SECRET=Client_Secret`

[Video Walkthrough for Github](https://youtu.be/e2EKSJkXkqQ?t=372) (6 mins 12 seconds in)

## Using our project

### Setting up Puzzles (required for /puzzles to work)

The project container needs to be running (ie: http://localhost:3000 should load something) when you run these commands.

The easy way: 
* Run `./post_puzzles.sh` from the project's root directory. (if on Windows, just run the commands listed in the file)
   * `cd engine-testing`
   * `pip3 install requests`
   * `python3 post-puzzles.py`
* Go to http://localhost:8081/db/test/puzzles and see that there are 183 documents (the delete button says how many there are).

The hard way (don't do this if you value your time. generates them via stockfish using a script we wrote):

* While the website and database (both part of our docker-compose) are active, run [puzzler.py](engine-testing/puzzler.py):

   * Install the dependencies
      - install python3
      - install the project specific dependencies: `pip3 install -r requirements.txt`
      - run puzzler.py: `python3 puzzler.py`
      - wait 5-10 minutes as it generates some puzzles and posts them to our database for you


To test our live chess games (http://localhost:3000/match), you'll need two GitHub accounts - one for each player in a live chess match. Most features are usable with just one, though. A good way to get this going is to have a private browser window logged into a second account (otherwise your session will persist across tabs).

Please see our project report and video for a detailed guide of all the different components and how to use them. You can also just explore your way around our website with the navbar, too. 

### Example PGN for testing game analysis

When you get to the analysis board, you might want to test out our feature for pasted PGNs. Here's a game I played that you can paste in and analyze:

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



