'use client';

import { PortfolioProvider, usePortfolio } from '../context/PortfolioContext';
import FileUpload from '../components/FileUpload';
import Dashboard from '../components/Dashboard';

function PortfolioApp() {
  const { hasPortfolio } = usePortfolio();

  return (
    <main>
      {hasPortfolio ? <Dashboard /> : <FileUpload />}
    </main>
  );
}

export default function Home() {
  return (
    <PortfolioProvider>
      <PortfolioApp />
    </PortfolioProvider>
  );
}
