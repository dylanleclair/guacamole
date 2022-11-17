import { connect, connection } from "mongoose";

// const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/";
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://root:example@mongo:27017/test?authSource=admin";

if (!MONGODB_URL) {
  throw new Error("Please define the MONGODB_URL in the environment file.");
}

console.log(MONGODB_URL);

export default (() => {
  if (connection.readyState >= 1) return;

  connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((conn) =>
      console.log(`Database [${conn.connection.host}] is connected`)
    )
    .catch(console.error);
})();

// /**
//  * Global is used here to maintain a cached connection across hot reloads
//  * in development. This prevents connections growing exponentially
//  * during API Route usage.
//  */
// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function dbConnect() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     };

//     cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
//       return mongoose;
//     });
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default dbConnect;
