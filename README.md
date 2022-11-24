# guacamole

SENG 513 group project (codename guacamole)

## how to get started

1. install Docker
2. install node
   - in project folder, run "npm install"
3. run the project `docker-compose up -d`
   - this will start the Docker multi-container
   - open up Docker Desktop.
   - once the guacamole container pops up in "Containers", the app is all ready to go!
   - you can go to http://localhost:3000 to see the default page
   - I've also written a page that has a preview of what the chess board might look like: http://localhost:3000/match

next-auth is working, but you must add your own secret for next-auth in a .env.local file. for example mine is:

```
GITHUB_ID=<secret>
GITHUB_SECRET=<secret>

MONGODB_URI=mongodb://root:example@mongo:27017/myapp
```

## from next.js readme

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction)

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Project specific stuff

Chess library we can build off of: https://github.com/jhlywa/chess.js/blob/master/README.md

## Other parts of the project:

- Data: [MongoDB](https://www.mongodb.com/docs/manual/installation/#std-label-tutorial-installation) (database engine) & [Mongoose](https://mongoosejs.com/docs/guide.html) (to provide access to DB)
- Auth: [NextAuth.js](https://next-auth.js.org/)
  - good resource: https://www.youtube.com/watch?v=e2EKSJkXkqQ
- API: built into Next!
- realtime communication: socket.io

## other docker commands

$ docker-compose build (1) : Build multi-container image
$ docker image ls : projectDirectoryName-imageName
$ docker-compose up -d (2) : Start multi-container
$ docker-compose logs -f : See all (both) container's logs together
$ docker logs -f next-app_next : See only 'next-app_next' container's logs

$ docker-compose ps -a : show process/containers running by docker-compose
$ docker ps -a : show all process
$ docker down : stop multi-container

$ docker-compose up -d --build : rebuild containers (if you change config, youll want to run this)
