import { SessionProvider, signIn } from "next-auth/react";
import "styles/global.scss";
import "bootstrap-icons/font/bootstrap-icons.css";

import type { AppProps } from "next/app";

import Layout from "../components/chessboard/Layout/Layout";

import { useContext, useEffect } from "react";
import { UserInfoContext, UserInfoProvider } from "../context/UserInfo";
import Upgrade from "./upgrade";
import CircularLoader from "../components/CircularLoader";

// Use the <SessionProvider> to improve performance and allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.js");
  }, []);

  return (
    <SessionProvider
      // Provider options are not required but can be useful in situations where
      // you have a short session maxAge time. Shown here with default values.
      session={pageProps.session}
    >
      <UserInfoProvider>
        <Layout>
          {pageProps.protected ? (
            <ProtectedPage>
              {pageProps.premium ? (
                <PremiumPage>
                  <Component {...pageProps} />
                </PremiumPage>
              ) : (
                <Component {...pageProps} />
              )}
            </ProtectedPage>
          ) : (
            <Component {...pageProps} />
          )}
        </Layout>
      </UserInfoProvider>
    </SessionProvider>
  );
}

export interface PrivatePageProps {
  children: JSX.Element;
}

function PremiumPage({ children }: PrivatePageProps) {
  const userContext = useContext(UserInfoContext);

  if (!userContext.user?.premiumMember) {
    console.log("User must be a premium member to access this page");
    return <Upgrade />;
  }

  return children;
}

function ProtectedPage({ children }: PrivatePageProps) {
  const userContext = useContext(UserInfoContext);

  if (!userContext.user) {
    console.log("User must be authenticated to access this page");
    signIn();
    return <CircularLoader />;
  } else {
    return children;
  }
}
