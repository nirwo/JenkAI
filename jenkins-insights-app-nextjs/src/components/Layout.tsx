'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };
  
  return (
    <div className="d-flex">
      {/* Sidebar for desktop */}
      <div className="sidebar d-none d-md-block">
        <div className="sidebar-brand">
          Jenkins Insights
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link href="/" className={`nav-link ${isActive('/')}`}>
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/jobs" className={`nav-link ${isActive('/jobs')}`}>
              <i className="bi bi-list-check me-2"></i>
              Jobs
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/troubleshooting" className={`nav-link ${isActive('/troubleshooting')}`}>
              <i className="bi bi-tools me-2"></i>
              Troubleshooting
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/advanced-troubleshooting" className={`nav-link ${isActive('/advanced-troubleshooting')}`}>
              <i className="bi bi-wrench-adjustable me-2"></i>
              Advanced Troubleshooting
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/settings" className={`nav-link ${isActive('/settings')}`}>
              <i className="bi bi-gear me-2"></i>
              Settings
            </Link>
          </li>
        </ul>
      </div>
      
      {/* Main content */}
      <div className="content">
        {children}
      </div>
      
      {/* Bottom navigation for mobile */}
      <div className="mobile-nav d-md-none">
        <div className="container">
          <div className="row">
            <div className="col">
              <Link href="/" className={`nav-link ${isActive('/')}`}>
                <i className="bi bi-speedometer2 d-block"></i>
                Dashboard
              </Link>
            </div>
            <div className="col">
              <Link href="/jobs" className={`nav-link ${isActive('/jobs')}`}>
                <i className="bi bi-list-check d-block"></i>
                Jobs
              </Link>
            </div>
            <div className="col">
              <Link href="/troubleshooting" className={`nav-link ${isActive('/troubleshooting')}`}>
                <i className="bi bi-tools d-block"></i>
                Troubleshoot
              </Link>
            </div>
            <div className="col">
              <Link href="/settings" className={`nav-link ${isActive('/settings')}`}>
                <i className="bi bi-gear d-block"></i>
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
