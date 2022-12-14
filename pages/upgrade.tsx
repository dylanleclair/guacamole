import type { NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import CircularLoader from "../components/CircularLoader";

const Upgrade: NextPage = () => {
  const router = useRouter();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const goToCheckout = async () => {
    setIsCheckoutLoading(true);
    const res = await fetch(`/api/stripe/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { redirectUrl } = await res.json();
    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      setIsCheckoutLoading(false);
      console.log("Error creating checkout session");
    }
  };

  return isCheckoutLoading ? (
    <CircularLoader />
  ) : (
    <div className="container text-center p-4">
      <div className="row">
        <div className="col">
          <h1 className="mb-4">Become a Member</h1>
          <img src="/diamond.png" className="img-fluid" />
          <div className="W-100">
            <button
              className="btn btn-lg btn-primary text-white fw-bold w-75 mt-4 mb-2"
              type="button"
              onClick={goToCheckout}
            >
              Upgrade for $5.00/mo
            </button>
          </div>
          <h5 className="fw-semibold mt-5 mb-5 lh-lg">
            Learn more about our premium tiers, with more features unlocked to
            help you improve faster!
          </h5>
          <div className="row justify-content-center mb-4">
            <div className="col-10">
              <div className="bg-primary rounded-4 bg-light p-4 mb-4">
                <h2 className="fw-bold">AI Powered Game Review</h2>
                <p>
                  Improve your chess skills with the power of AI!
                </p>
              </div>
              <div className="bg-primary rounded-4 bg-light p-4 mb-4">
                <h2 className="fw-bold">Unlimited Puzzles</h2>
                <p>
                  Play as many of our AI-generated chess puzzles as you like!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {
      protected: true,
    },
  };
}

export default Upgrade;
