import type { NextPage } from "next";
import Head from "next/head";

import { useState } from "react";
import Analysis from "../../components/Analysis/Analysis";
import { getJSON } from "../../utils/networkingutils";
import { useRouter } from "next/router";
import { IMatch } from "../../models/Match";
import CircularLoader from "../../components/CircularLoader";
import MatchHistory from "../../components/MatchHistory/MatchHistory";

const Home: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [match, setMatch] = useState<IMatch>();
  const [isLoaded, setLoaded] = useState<boolean>(false);

  if (!isLoaded) {
    try {
      setLoaded(true);
      getJSON(`/api/match/${id}`).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            // save the data as match data!
            setMatch(data as IMatch);

          });
        }
      });
    } catch (err) {
      console.log("match id does not exist in database.");
    }
  }

  // check if the user is signed in. if they are, show them the matchmaking component
  return (
    <div className="">
      <div className="">
      <Head>
          <title>Post Game Analysis</title>
          <meta name="description" content="Analyze a previously played game on Caskaydia Chess." />
          <link rel="icon" href="/favicon.ico" />
        </Head>


        <main className="container d-flex flex-col justify-content-center align-items-center">
          <h1 className="display-2">Post Game Analysis</h1>

          <div className="text-center">
            <p>
              Revisit a game you've played and see what Stockfish thinks of your
              play!
            </p>
          </div>

          <div className="w-100 card my-3">
            <div className="card-body d-flex flex-col justify-content-center align-items-center">
              {match && <Analysis match_pgn={match.pgn} canReset={false} />}
              {!match && <CircularLoader />}
              {match === undefined && (
                <div>
                  An internal server error occured: specific match with ID: {id}{" "}
                  could not be fetched from server.
                </div>
              )}
            </div>
          </div>
          
          <MatchHistory/>

        </main>
      </div>
    </div>
  );
};

/**
 * Protect this path the same way we protect other pages. Cannot use getStaticProps, since analysis by game ID cannot be statically compiled (relies on live database).
 * @returns correct props to lock out users that are not premium.
 */
export async function getServerSideProps() {
  return {
    props: {
      protected: true,
      premium: true,
    },
  };
}

export default Home;
