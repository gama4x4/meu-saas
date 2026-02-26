import React, { useState, useEffect } from 'react';

export default function Configuracoes() {
  const [tinyToken, setTinyToken] = useState('');
  const [isTokenSalvo, setIsTokenSalvo] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // 1. Quando a tela carregar, o sistema procura se já existe um token salvo
  useEffect(() => {
    const tokenSalvo = localStorage.getItem('tiny_token_saas');
    if (tokenSalvo) {
      setTinyToken(tokenSalvo);
      setIsTokenSalvo(true);
    }
  }, []);

  // 2. Função para salvar o token no navegador
  const salvarTokenTiny = () => {
    if (!tinyToken) {
      alert("Por favor, insira um token antes de salvar.");
      return;
    }
    
    localStorage.setItem('tiny_token_saas', tinyToken);
    setIsTokenSalvo(true);
    
    // Mostra uma mensagem de sucesso que some depois de 3 segundos
    setMensagem('Token salvo com sucesso no navegador!');
    setTimeout(() => {
      setMensagem('');
    }, 3000);
  };

  // 3. Função para remover o token
  const removerTokenTiny = () => {
    localStorage.removeItem('tiny_token_saas');
    setTinyToken('');
    setIsTokenSalvo(false);
    setMensagem('Token removido com sucesso!');
    setTimeout(() => {
      setMensagem('');
    }, 3000);
  };

  // Função para simular o redirecionamento OAuth 2.0 do Mercado Livre
  const conectarMercadoLivre = () => {
    const APP_ID = 'SEU_CLIENT_ID'; 
    const REDIRECT_URI = 'https://seusistema.com.br/retorno-ml';
    const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}`;
    window.location.href = authUrl;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h3 className="text-xl font-medium text-gray-900">Integrações de Contas</h3>
      
      {/* Card Mercado Livre */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-yellow-600">Mercado Livre</h4>
            <p className="text-sm text-gray-500 mt-1">Conecte sua conta para criar e gerenciar anúncios, mensagens e vendas.</p>
          </div>
          <button 
            onClick={conectarMercadoLivre}
            className="px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded hover:bg-yellow-500 transition"
          >
            Conectar Conta ML
          </button>
        </div>
      </div>

      {/* Card Tiny ERP */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h4 className="text-lg font-bold text-blue-600">Tiny ERP</h4>
          <p className="text-sm text-gray-500 mt-1">
            {isTokenSalvo ? "Seu token do Tiny está salvo e pronto para uso." : "Cole abaixo o Token da API gerado no painel do seu Tiny ERP."}
          </p>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={tinyToken}
            onChange={(e) => setTinyToken(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Cole o token da API do Tiny aqui..."
            disabled={isTokenSalvo}
          />
          {isTokenSalvo ? (
            <button 
              onClick={removerTokenTiny}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
            >
              Remover Token
            </button>
          ) : (
            <button 
              onClick={salvarTokenTiny}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              Salvar Token
            </button>
          )}
        </div>
        
        {/* Mensagem de sucesso/feedback */}
        {mensagem && (
          <p className="text-sm font-medium text-green-600 mt-3">{mensagem}</p>
        )}

        <p className="text-xs text-gray-400 mt-2">
          Vá em <i>Configurações &gt; E-commerce &gt; API</i> no seu Tiny para gerar este token.
        </p>
      </div>
    </div>
  );
}