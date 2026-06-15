import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-primary overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-primary">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
