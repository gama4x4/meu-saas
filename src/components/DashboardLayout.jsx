import React from 'react';

export default function DashboardLayout({ children, setActivePage, activePage }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (Menu Lateral) */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <h1 className="text-xl font-bold">MeuSaaS Hub</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActivePage('home')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-md ${activePage === 'home' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            Início
          </button>
          <button 
            onClick={() => setActivePage('anuncios')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-md ${activePage === 'anuncios' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            Anúncios ML
          </button>
          <button 
            onClick={() => setActivePage('configuracoes')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-md ${activePage === 'configuracoes' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            Configurações
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button className="w-full text-left text-sm text-gray-400 hover:text-white">
            Sair
          </button>
        </div>
      </div>

      {/* Área de Conteúdo (onde as telas abrem) */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white shadow-sm flex items-center px-8">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">{activePage}</h2>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}