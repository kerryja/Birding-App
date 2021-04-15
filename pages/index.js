import Head from "next/head";
import useSWR from "swr";
import { useState, useEffect } from "react";
import { geolocationCall } from "../geolocation";

export default function Home() {
  const [geolocation, setGeolocation] = useState();

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error } = useSWR(() => {
    return `/api/birds?geolocation=${geolocation.latitude}|${geolocation.longitude}`;
  }, fetcher);

  useEffect(async () => {
    setGeolocation(await geolocationCall());
  }, []);

  return (
    <>
      <Head>
        <title>Birds</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.9.2/css/bulma.min.css"
          crossorigin="anonymous"
        ></link>
      </Head>

      <main className="container">
        <div className="grid">
          {data &&
            data.data.map((data) => (
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
                      <time>{data.foundDate}</time>
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
