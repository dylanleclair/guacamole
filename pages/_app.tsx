import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import type { AppProps } from "next/app";

import Layout from "../components/chessboard/Layout/Layout";

import 'bootstrap/dist/css/bootstrap.css';
import { useEffect } from "react";

// Use the <SessionProvider> to improve performance and allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }: AppProps) {

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap");
  }, [])

  return (
    <SessionProvider
      // Provider options are not required but can be useful in situations where
      // you have a short session maxAge time. Shown here with default values.
      session={pageProps.session}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>

    </SessionProvider>
  );
}
