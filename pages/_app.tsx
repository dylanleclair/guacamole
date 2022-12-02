import { SessionProvider } from "next-auth/react";
import "styles/global.scss";
import "bootstrap-icons/font/bootstrap-icons.css";

import type { AppProps } from "next/app";

import Layout from "../components/chessboard/Layout/Layout";

import { useEffect } from "react";
import { UserInfoProvider } from "../context/UserInfo";

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
          <Component {...pageProps} />
        </Layout>
      </UserInfoProvider>
    </SessionProvider>
  );
}
