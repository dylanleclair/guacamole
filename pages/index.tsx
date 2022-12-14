import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import ChessBoard from "../components/chessboard/ChessBoard";

import { useSession, signIn, } from "next-auth/react";
import { Chess } from "chess.js";
import Link from "next/link";

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <div className={styles.container}>
      <Head>
        <title>Caskaydia Chess</title>
        <meta name="description" content="The world's favourite way to play chess on the web." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container">
        <section id="home-main" className={`flex-col flex-center`}>
          <img src="/logo.svg" className="" />

          <div className={`display-4 text-center w-100 mb-3`}>
            The world's favourite online chess arcade.
          </div>

          <ChessBoard
            board={new Chess()}
            isPlayerWhite={true}
            selection={""}
            setSelection={() => {}}
            perspective={"white"}
            makeAmove={() => {}}
          />

          <div className="row justify-content-center w-100">
            <div className="col-11">
              <div className="d-grid gap-3 w-100 my-3">
                <button
                  className="btn btn-lg btn-primary text-white"
                  type="button"
                  onClick={() => signIn()}
                >
                  Login
                </button>
                <button
                  className="btn btn-lg btn-primary text-white"
                  type="button"
                  onClick={() => signIn()}
                >
                  Signup
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="home-features " className="my-3 d-grid gap-3">
          <div className="row justify-content-center">
            <div className="col-10 bg-primary rounded-3 bg-light p-4">
              <div className="">
                <h2>Online Chess</h2>
                <p>Caskaydia is the place to play online chess! 
                Play for free against players according to your skill level! </p>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-10 bg-primary rounded-3 bg-light p-4">
              <div className="">
                <h2>Puzzles</h2>
                <p>We have a library of AI generated puzzles to develop and test your chess knowledge! </p>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-10 bg-primary rounded-3 bg-light p-4">
              <div className="">
                <h2>CPU Players</h2>
                <p>In your downtime, play against our computer players to help sharpen your skills without all the pressure!</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="row justify-content-center"></footer>
    </div>
  );
};

export default Home;
