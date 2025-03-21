'use client';

import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { JenkinsProvider } from '@/lib/jenkins-context';
import '@/app/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Jenkins Insights App</title>
        <meta name="description" content="A webapp for Jenkins CI/CD insights and troubleshooting" />
      </head>
      <body>
        <JenkinsProvider>
          {children}
        </JenkinsProvider>
      </body>
    </html>
  );
}
