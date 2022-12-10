import { Chess } from "chess.js";
import type { NextPage } from "next";
import ChessBoard from "../components/chessboard/ChessBoard";
import Link from "next/link";
import { useContext, useState } from "react";
import { UserInfoContext } from "../context/UserInfo";
import CircularLoader from "../components/CircularLoader";
import { useForm, SubmitHandler } from "react-hook-form";
import { IUser } from "../models/User";
import { putJSON } from "../utils/networkingutils";
import { SketchPicker } from "react-color";

type Inputs = {
  name: string;
};

const Profile: NextPage = () => {
  const { user, setUser } = useContext(UserInfoContext)!;
  const [boardLightColor, setBoardLightColor] = useState(
    user?.boardLightColor ?? "white"
  );
  const [boardDarkColor, setBoardDarkColor] = useState(
    user?.boardDarkColor ?? "#FCA311"
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const updatedProfile = { boardLightColor, boardDarkColor, ...data };
    putJSON("/api/user", updatedProfile).then((response) => {
      if (response.ok) {
        let userData = updatedProfile as IUser;
        setUser(Object.assign({}, user, userData));
      } else {
        console.log(response.json);
        throw Error("User could not be updated");
      }
    });
  };

  const handleLightColorChange = (color: any) => {
    setBoardLightColor(color.hex);
  };

  const handleDarkColorChange = (color: any) => {
    setBoardDarkColor(color.hex);
  };

  if (!user) return <CircularLoader />;
  return (
    <div className="container text-center p-4">
      <div className="row mb-5">
        <div className="col">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 className="mb-4">Your Profile</h1>
            <img src={user.image} className="img-fluid mb-5" />
            <h5 className="text-start fw-semibold">User tier:</h5>
            <h3 className="fw-semibold mt-4">
              {user.premiumMember ? "Premium Membership" : "Basic Membership"}
            </h3>
            {!user.premiumMember && (
              <Link href="/upgrade" passHref>
                <button
                  className="btn btn-lg btn-primary text-white fw-bold w-50 mt-3"
                  type="button"
                >
                  Upgrade
                </button>
              </Link>
            )}
            <h5 className="text-start fw-semibold mt-5">Your username:</h5>
            <input
              defaultValue={user.name}
              {...register("name", { required: true })}
              type="text"
              className="form-control mt-3"
            />
            {errors.name && <span>This field is required</span>}
            <h5 className="text-start fw-semibold mt-5">Your elo:</h5>
            <h6 className="text-start mt-4">{user.elo ?? "Unranked"}</h6>
            <h5 className="text-start fw-semibold mt-5 mb-4">
              Your board colors:
            </h5>
            <div className="row mb-5">
              <div className="col d-flex flex-col align-items-center">
                <h6 className="text-start">Light:</h6>
                <SketchPicker
                  width="70%"
                  disableAlpha={true}
                  presetColors={[
                    "white",
                    "yellow",
                    "orange",
                    "lightblue",
                    "lightgreen",
                    "lightpink",
                  ]}
                  className="mt-3"
                  color={boardLightColor}
                  onChangeComplete={handleLightColorChange}
                />
              </div>
              <div className="col d-flex flex-col align-items-center">
                <h6 className="text-start">Dark:</h6>
                <SketchPicker
                  width="70%"
                  disableAlpha={true}
                  presetColors={[
                    "#FCA311",
                    "purple",
                    "blue",
                    "brown",
                    "darkgreen",
                    "red",
                  ]}
                  className="mt-3"
                  color={boardDarkColor}
                  onChangeComplete={handleDarkColorChange}
                />
              </div>
            </div>
            <ChessBoard
              board={new Chess()}
              isPlayerWhite={true}
              colorScheme={{
                light: boardLightColor,
                dark: boardDarkColor,
              }}
              selection={""}
              setSelection={() => {}}
              perspective={"white"}
              makeAmove={() => {}}
            />
            <button
              className="btn btn-lg btn-primary text-white fw-bold w-25 mt-5"
              type="submit"
            >
              Save
            </button>
          </form>
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

export default Profile;
