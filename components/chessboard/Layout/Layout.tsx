import { css } from "@emotion/react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";


/**
 * The shared navbar / footer component rendered everywhere!
 */

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = (props: LayoutProps) => {
  const { data: session } = useSession();

  const signin = session ? (
    <ul className="dropdown-menu">
      <li>
        <Link href="/profile" passHref>
          <a className="dropdown-item">{session.user?.email}</a>
        </Link>
      </li>
      <li>
        <a className="dropdown-item" href="#" onClick={() => signOut()}>
          Sign Out
        </a>
      </li>
    </ul>
  ) : (
    <ul className="dropdown-menu">
      <li>
        <a className="dropdown-item" onClick={() => signIn()}>
          Sign Up
        </a>
      </li>
      <li>
        <a className="dropdown-item" onClick={() => signIn()}>
          Sign In
        </a>
      </li>
    </ul>
  );

  return (
    <div
      css={css`height: 96vh`}
      className="d-flex justify-content-between flex-col">
      <nav className="navbar fixed-top navbar-expand-lg bg-white">
        <div className="container-fluid">
          <Link href="/" passHref>
            <a className="navbar-brand">
              <img
                className="mt-1"
                src="/logo.svg"
                alt="Bootstrap"
                height="40px"
                width="auto"
              />
            </a>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  role="button"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Play
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link href="/match" passHref>
                      <a className="dropdown-item">Human</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/match/computer" passHref>
                      <a className="dropdown-item">Computer</a>
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <Link href="/puzzles" passHref>
                  <a className="nav-link">Puzzles</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/analyze/analysis" passHref>
                  <a className="nav-link">Analysis</a>
                </Link>
              </li>

              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Account
                </a>
                {signin}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {props.children && props.children}

      <div id="footer" css={css`height: 4vh;`} className="bg-light text-center d-flex justify-content-center align-items-center">
        Developed by the <a className="mx-2" href="https://github.com/dylanleclair/guacamole">Caskaydia Chess Team</a> © 2022
      </div>
    </div>
  );
};

export default Layout;
