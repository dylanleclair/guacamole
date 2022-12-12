import { useSession } from "next-auth/react";
import { useEffect, createContext, useState } from "react";
import CircularLoader from "../components/CircularLoader";
import { IUser } from "../models/User";
import { request } from "../utils/networkingutils";

export interface UserInfoProviderProps {
  children: React.ReactNode;
}

export interface UserInfo {
  user?: IUser;
  setUser(user: IUser): void;
}

export const UserInfoContext = createContext<UserInfo>({ setUser: () => {} });

export function UserInfoProvider(props: UserInfoProviderProps) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<IUser>();

  useEffect(() => {
    if (session && !user) {
      request<IUser>("/api/user").then((result) => {
        if (result) {
          setUser(result as IUser);
        } else {
          throw Error("User does not exist?");
        }
      });
    }
  }, [session]);

  const setUserCallback = (user: IUser) => setUser(user);

  if (status === "loading" || (session && !user)) return <CircularLoader />;
  return (
    <UserInfoContext.Provider value={{ user: user, setUser: setUserCallback }}>
      {props.children}
    </UserInfoContext.Provider>
  );
}
