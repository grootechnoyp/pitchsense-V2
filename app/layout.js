import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "PitchSense — AI Sales Co-Pilot",
  description: "Real-time AI coaching during your sales calls. Live whispers, objection handling, and call scoring powered by Claude.",
  keywords: "sales AI, sales coaching, real-time sales, objection handling, AI sales co-pilot",
  openGraph: {
    title: "PitchSense — AI Sales Co-Pilot",
    description: "Close more deals with real-time AI coaching during every sales call.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
        </head>
        <body style={{ margin: 0, padding: 0, background: "#080b12", fontFamily: "'IBM Plex Mono', monospace" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
