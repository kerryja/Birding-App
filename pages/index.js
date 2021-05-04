import Head from "next/head";
import useSWR from "swr";
import { useState, useEffect } from "react";
import { geolocationCall } from "../geolocation";

export default function Home() {
  const [geolocation, setGeolocation] = useState();

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error } = useSWR(() => {
    return `/api/birds/geolocation?geolocation=${geolocation.latitude}|${geolocation.longitude}`;
  }, fetcher);

  useEffect(async () => {
    setGeolocation(await geolocationCall());
  }, []);

  return (
    <>
      <Head>
        <title>Birding App</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.9.2/css/bulma.min.css"
          crossorigin="anonymous"
        ></link>
      </Head>
      <nav
        className="navbar is-fixed-top"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <a className="navbar-item" href="https://bulma.io">
            Birding App
          </a>

          <a
            role="button"
            className="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-end"></div>
        </div>
      </nav>

      <main className="container">
        <div className="title">Notable Birds Found Nearby</div>
        <div className="grid">
          {data &&
            data.data
              .filter((d) => !!d.imageSrc)
              .map((data) => (
                <div>
                  <div className="card">
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src={data.imageSrc} alt={data.name} />
                      </figure>
                    </div>
                    <div className="card-content">
                      <p className="title is-4">{data.name}</p>
                      <div className="content">
                        {data.location}
                        <br />
                        <time>
                          Found: {data.foundDate} at {data.foundTime}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </main>
    </>
  );
}
