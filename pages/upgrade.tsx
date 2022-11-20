import type { NextPage } from "next";

const Upgrade: NextPage = () => {
  return (
    <div className="container text-center p-4">
      <div className="row">
        <div className="col">
          <h1 className="mb-4">Become a Member</h1>
          <img src="/diamond.png" className="img-fluid" />
          <div className="W-100">
            <button
              className="btn btn-lg btn-primary text-white fw-bold w-75 mt-4 mb-2"
              type="button"
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
                  A very appealing and interesting description to make sure they
                  want to pay us $5!
                </p>
              </div>
              <div className="bg-primary rounded-4 bg-light p-4 mb-4">
                <h2 className="fw-bold">Unlimited Online Chess Games</h2>
                <p>
                  A very appealing and interesting description to make sure they
                  want to pay us $5!
                </p>
              </div>

              <div className="bg-primary rounded-4 bg-light p-4 mb-4">
                <h2 className="fw-bold">Unlimited Puzzles</h2>
                <p>
                  A very appealing and interesting description to make sure they
                  want to pay us $5!
                </p>
              </div>
              <div className="bg-primary rounded-4 bg-light p-4">
                <h2 className="fw-bold">Adjustable Bot Difficulty</h2>
                <p>
                  A very appealing and interesting description to make sure they
                  want to pay us $5!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
