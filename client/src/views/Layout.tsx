import React from 'react';
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <Outlet />
    </div>
  );
};

export default Layout;