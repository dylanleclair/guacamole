import type { NextPage } from "next";
import Head from "next/head";

import { useState } from "react";

import Analysis from "../../components/Analysis/Analysis";
import MatchHistory from "../../components/MatchHistory/MatchHistory";

/**
 * fetchPGN() 
 * @returns dummy placeholder pgn
 */
function fetchPGN() {
  return "1. e3 c5 2. Nf3 Nc6 3. Bb5 Qc7 4. Bxc6 Qxc6 5. Nc3";
}

const Home: NextPage = () => {

  const [pgn, setPGN] = useState<string>("");

  /**
   * Event handler to update the PGN when it's pasted / typed in. 
   * @param e 
   */
  function handlePGNChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setPGN(e.currentTarget.value);
  }

  return (
    <div className="row">
      <div className="col-12">

        <Head>
          <title>Analyze A Game</title>
          <meta name="description" content="Analyze a chess game by pasting in your PGN." />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="container d-flex flex-col justify-content-center align-items-center">

          <h1 className="display-2">Analysis</h1>

          <div className="text-center">
            <p>
              Paste in the PGN from one of your games and go over the moves you
              played!
            </p>
          </div>

          <div className="w-100 card my-3">
            <div className="card-body d-flex flex-col justify-content-center align-items-center">
              <label htmlFor="PGN-input" className="form-label">
                Paste your game PGN here...
              </label>
              <div className="input-group">
                <textarea
                  id="PGN-input"
                  className="form-control"
                  placeholder={fetchPGN()}
                  value={pgn}
                  aria-label="PGN"
                  onChange={handlePGNChange}
                ></textarea>
              </div>

              <Analysis match_pgn={pgn} canReset={true} />
            </div>
          </div>

          <MatchHistory />
        </main>

      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {
      protected: true,
      premium: true,
    },
  };
}

export default Home;
