import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import Stripe from "stripe";
import User from "../../../models/User";
import { authOptions } from "../auth/[...nextauth]";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2022-11-15",
  });

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({
      error: {
        code: "no-access",
        message: "You are not signed in.",
      },
    });
  }

  const checkoutSession = async () => {
    const user = await User.findOne({ _id: session.user.id });
    return await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: user["stripeCustomerId"],
      line_items: [
        {
          price: "price_1MDeM4CuDA0kgBaoAcji6grF",
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:3000/upgrade?cancelledPayment=true",
      subscription_data: {
        metadata: {
          payingUserId: session.user.id,
        },
      },
    });
  };
  const checkoutSessionResult = await checkoutSession();
  if (!checkoutSessionResult.url) {
    return res.status(500).json({
      cpde: "stripe-error",
      error: "Could not create checkout session",
    });
  }

  // Return the newly-created checkoutSession URL and let the frontend render it
  return res.status(200).json({ redirectUrl: checkoutSessionResult.url });
};
