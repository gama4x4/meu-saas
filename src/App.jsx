import React, { useState } from 'react';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import Configuracoes from './components/Configuracoes';
import Anuncios from './components/Anuncios';

function App() {
  // Controle se o usuário está logado ou não
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Controle de qual tela está aberta no menu lateral
  const [activePage, setActivePage] = useState('home');

  // Se não estiver logado, mostra a tela de Login
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  // Se estiver logado, mostra o Layout com o menu lateral
  return (
    <DashboardLayout activePage={activePage} setActivePage={setActivePage}>
      
      {/* Aqui controlamos o que aparece no centro da tela */}
      {activePage === 'home' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bem-vindo ao MeuSaaS Hub!</h2>
          <p className="text-gray-600 mt-2">Use o menu lateral para navegar.</p>
        </div>
      )}
      
      {activePage === 'anuncios' && <Anuncios />}

      {activePage === 'configuracoes' && <Configuracoes />}

    </DashboardLayout>
  );
}

export default App;
