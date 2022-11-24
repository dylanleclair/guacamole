import { Chess } from "chess.js";
import type { NextPage } from "next";
import ChessBoard from "../components/chessboard/ChessBoard";
import Link from "next/link";

const Profile: NextPage = () => {
  return (
    <div className="container text-center p-4">
      <div className="row">
        <div className="col">
          <h1 className="mb-4">Your Profile</h1>
          <img src="/profile-avatar.png" className="img-fluid mb-5" />
          <h5 className="text-start fw-semibold">User tier:</h5>
          <h3 className="fw-semibold mt-4">Basic Membership</h3>
          <Link href="/upgrade" passHref>
            <button
              className="btn btn-lg btn-primary text-white fw-bold w-50 mt-3"
              type="button"
            >
              Upgrade
            </button>
          </Link>
          <h5 className="text-start fw-semibold mt-5">Your username:</h5>
          <input
            type="text"
            className="form-control mt-3"
            placeholder="Username"
          />
          <h5 className="text-start fw-semibold mt-5 mb-4">
            Your board colors:
          </h5>
          <h6 className="text-start">Light:</h6>
          <input
            type="text"
            className="form-control mt-3"
            placeholder="#FFFFFF"
          />
          <h6 className="text-start mt-4">Dark:</h6>
          <input
            type="text"
            className="form-control mt-3 mb-5"
            placeholder="#023020"
          />
          <ChessBoard
            board={new Chess()}
            isPlayerWhite={true}
            colorScheme={{ light: "white", dark: "#023020" }}
            selection={""}
            setSelection={() => {}}
            perspective={"white"}
            makeAmove={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
