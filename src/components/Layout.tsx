import { FC } from 'react';

interface LayoutProps {
  readonly children: React.ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <header className="bg-white shadow-sm border-b border-gray-200 py-3 md:py-4">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          TODO PWA
        </h1>
      </div>
    </header>

    <main className="flex-1 py-4 sm:py-6 md:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">{children}</div>
    </main>

    <footer className="bg-white border-t border-gray-200 py-3 md:py-4">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-500">
        TODO PWA - Manage your tasks efficiently
      </div>
    </footer>
  </div>
);
