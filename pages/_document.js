// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Base App verification meta */}
        <meta name="base:app_id" content="69386589e5852f4b20f35a77" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}