import { useSession } from "next-auth/react";
import { useEffect, createContext, useState } from "react";
import { IUser } from "../models/User";
import { request } from "../utils/networkingutils";

export interface UserInfoProviderProps {
  children: React.ReactNode;
}

// can use IUser instead if certain no requirements outside schema would need to be included in context
export interface UserInfo {
  user?: IUser;
}

export const UserInfoContext = createContext<UserInfo | null>(null);

export function UserInfoProvider(props: UserInfoProviderProps) {
  const { data: session } = useSession();
  const [user, setUser] = useState<IUser>();

  useEffect(() => {
    if (session && !user) {
      request<IUser>("/api/user").then((result) => {
        if (result) {
          console.log("user fetch result: ", result);
          setUser(result as IUser);
        } else {
          throw Error("User does not exist?");
        }
      });
    }
  }, [session]);

  return (
    <UserInfoContext.Provider value={{ user }}>
      {props.children}
    </UserInfoContext.Provider>
  );
}
