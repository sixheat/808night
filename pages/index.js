import Head from "next/head";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>NO SLEEP NOV21</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
        />
        <meta
          name="description"
          content="NO SLEEP NOV21 event has ended."
        />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
          padding: 0,
          margin: 0,
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
          }}
        >
          <Image
            src="/appreciated.png"
            alt="NO SLEEP NOV21"
            fill
            sizes="100vw"
            style={{
              objectFit: "contain", // keep full image visible without cropping
              objectPosition: "center",
              backgroundColor: "black",
            }}
            priority
          />
        </div>
      </main>
    </>
  );
}
