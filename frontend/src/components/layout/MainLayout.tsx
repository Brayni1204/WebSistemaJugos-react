import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans antialiased">
      <Navbar />
      <main className="flex-grow bg-gray-100 pt-[90px]"> 
        {/* pt-[90px] to offset the fixed navbar height */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
