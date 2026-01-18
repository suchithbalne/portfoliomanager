import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: "Portfolio Manager - AI-Powered Investment Analysis",
  description: "Analyze your investment portfolio with advanced analytics and AI-powered recommendations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div style={{ paddingTop: '80px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
