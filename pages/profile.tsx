import { Chess } from "chess.js";
import type { NextPage } from "next";
import ChessBoard from "../components/chessboard/ChessBoard";
import Link from "next/link";
import { useContext } from "react";
import { UserInfoContext } from "../context/UserInfo";
import CircularLoader from "../components/CircularLoader";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  name: string;
  boardLightColor?: string;
  boardDarkColor?: string;
};

const Profile: NextPage = () => {
  const userInfo = useContext(UserInfoContext);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  //TODO implement saving
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);
  console.log(userInfo?.user);

  if (!userInfo?.user) return <CircularLoader />;
  let lightColor = userInfo.user.boardLightColor ?? "white";
  let darkColor = userInfo.user.boardDarkColor ?? "#FCA311";
  return (
    <div className="container text-center p-4">
      <div className="row mb-5">
        <div className="col">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 className="mb-4">Your Profile</h1>
            <img src="/profile-avatar.png" className="img-fluid mb-5" />
            <h5 className="text-start fw-semibold">User tier:</h5>
            <h3 className="fw-semibold mt-4">
              {userInfo.user.premiumMember
                ? "Premium Membership"
                : "Basic Membership"}
            </h3>
            {!userInfo.user.premiumMember && (
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
              defaultValue={userInfo.user.name}
              {...register("name", { required: true })}
              type="text"
              className="form-control mt-3"
            />
            {errors.name && <span>This field is required</span>}
            <h5 className="text-start fw-semibold mt-5">Your elo:</h5>
            <h6 className="text-start mt-4">
              {userInfo.user.elo ?? "Unranked"}
            </h6>
            <h5 className="text-start fw-semibold mt-5 mb-4">
              Your board colors:
            </h5>
            <h6 className="text-start">Light:</h6>
            <input
              defaultValue={lightColor}
              {...register("boardLightColor")}
              type="text"
              className="form-control mt-3"
              placeholder={lightColor}
            />
            <h6 className="text-start mt-4">Dark:</h6>
            <input
              defaultValue={darkColor}
              {...register("boardDarkColor")}
              type="text"
              className="form-control mt-3 mb-5"
              placeholder={darkColor}
            />
            <ChessBoard
              board={new Chess()}
              isPlayerWhite={true}
              colorScheme={{
                light: !watch("boardLightColor")
                  ? userInfo.user.boardLightColor
                  : watch("boardLightColor"),
                dark: !watch("boardDarkColor")
                  ? userInfo.user.boardDarkColor
                  : watch("boardDarkColor"),
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

export default Profile;
