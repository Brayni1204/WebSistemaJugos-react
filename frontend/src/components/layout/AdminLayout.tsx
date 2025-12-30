import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer'; // Import Footer

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {children}
      </main>
      <Footer /> {/* Render the Footer here */}
    </div>
  );
};

export default AdminLayout;