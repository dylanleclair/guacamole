import NextAuth, { Session, User as NextUser } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongoDb";
import Stripe from "stripe";
import User from "../../../models/User";

export const authOptions = {
  // configure the auth providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  secret: process.env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async session({ session, user }: { session: Session; user: NextUser }) {
      session = {
        ...session,
        user: {
          id: user.id,
          ...session.user,
        },
      };
      return session;
    },
  },
  events: {
    createUser: async ({ user }: { user: NextUser }) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2022-11-15",
      });

      await stripe.customers
        .create({
          email: user.email!,
        })
        .then(async (customer) => {
          await User.updateOne(
            { _id: user.id },
            {
              stripeCustomerId: customer.id,
            }
          );
        });
    },
  },
};

export default NextAuth(authOptions);
