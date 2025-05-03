// pages/_app.tsx
import '../styles/globals.css'; // If you have global styles
import Navbar from '../components/Navbar'; // Import Navbar

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Navbar /> {/* Navbar will be displayed across all pages */}
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
