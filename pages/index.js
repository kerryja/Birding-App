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
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Found On</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.data.map((data) => (
                <tr>
                  <td>{data.name}</td>
                  <td>{data.foundDate}</td>
                  <td>{data.location}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
