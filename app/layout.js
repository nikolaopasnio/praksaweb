import "./globals.css";

export const metadata = {
  title: "QUANTUM NETWORK | Ultimate Minecraft Server",
  description: "Quantum Network is the ultimate Minecraft server featuring Survival, Skyblock, and Chaos Lifesteal. Multilingual support. Join thousands of players today!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        {children}
        <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
      </body>
    </html>
  );
}
