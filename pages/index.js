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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
          color: "white",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            width: "100%",
            marginBottom: "24px",
          }}
        >
          <Image
            src="/appreciated.png"
            alt="NO SLEEP NOV21"
            width={1200}
            height={1600}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              objectFit: "cover",
            }}
            priority
          />
        </div>

        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
          NO SLEEP NOV21
        </h1>
        <p style={{ fontSize: "16px", maxWidth: "480px", margin: "0 auto" }}>
          This event has ended. Ticket sales and the site are now closed.
        </p>
      </main>
    </>
  );
}
