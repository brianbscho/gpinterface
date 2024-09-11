import Script from "next/script";

export default function Head() {
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      ></Script>
      <Script id={process.env.NEXT_PUBLIC_GA_ID}>
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
      </Script>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
      ></Script>
      <Script id={process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}>
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
