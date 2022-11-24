import { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

type LayoutProps = {
  children?: React.ReactNode;
};

const Layout: NextPage = (props: LayoutProps) => {
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
        <a className="dropdown-item" href="#" onClick={() => signIn()}>
          Sign Up
        </a>
      </li>
      <li>
        <a className="dropdown-item" href="#" onClick={() => signIn()}>
          Sign In
        </a>
      </li>
    </ul>
  );

  return (
    <div>
      <nav className="navbar fixed-top navbar-expand-lg bg-white">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img
              className="mt-1"
              src="/logo.svg"
              alt="Bootstrap"
              height="40px"
              width="auto"
            />
          </a>
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
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Play
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="#">
                      Human
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Computer
                    </a>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Puzzles
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Analysis
                </a>
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
    </div>
  );
};

export default Layout;
