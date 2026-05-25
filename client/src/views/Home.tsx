import React from 'react';
import Frame from "./HomePage/Frame";
import Header from "../components/Header";

function Home() {
  return (
    <div className="relative">
      {/* Mobile/tablet header with burger menu - visible below lg */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] bg-[#efdec5]">
        <Header />
      </div>
      {/* Spacer for fixed header on mobile */}
      <div className="lg:hidden h-[64px]" />
      <Frame />
    </div>
  );
}

export default Home;