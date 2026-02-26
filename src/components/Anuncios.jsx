import React, { useState, useMemo } from 'react';

export default function Anuncios() {
  const [syncProgress, setSyncProgress] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [logs, setLogs] = useState([{ id: 1, time: new Date().toLocaleTimeString(), message: 'Sistema iniciado. Aguardando comandos...', type: 'info' }]);
  
  const [produtos, setProdutos] = useState([]);

  const addLog = (message, type = 'info') => {
    const newLog = { id: Date.now(), time: new Date().toLocaleTimeString(), message, type };
    setLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const iniciarSincronizacao = async () => {
    // ... sua função de sincronização continua perfeita, sem alterações ...
    if (syncProgress !== null) return;
    addLog('Conectando ao nosso servidor para buscar produtos no Tiny...', 'info');
    setSyncProgress(10);
    setProdutos([]);
    try {
        const resposta = await fetch('http://localhost:3001/api/tiny-produtos', { method: 'POST' });
        const dados = await resposta.json();
        setSyncProgress(50);
        if (!resposta.ok) {
            addLog(`[ERRO] ${dados.erro || 'Falha ao buscar produtos.'}`, 'error');
            setSyncProgress(null);
            return;
        }
        const produtosFormatados = dados.map(item => ({
            id: item.produto.id,
            sku: item.produto.codigo,
            nome: item.produto.nome,
            estoque: parseFloat(item.produto.saldo),
            preco: parseFloat(item.produto.preco),
            statusML: 'Não Publicado',
            mlb_id: null, // <-- NOVO CAMPO para guardar o ID do anúncio
            isPublishing: false // <-- NOVO CAMPO para feedback visual no botão
        }));
        addLog(`[SUCESSO] ${produtosFormatados.length} produtos recebidos do Tiny!`, 'success');
        setProdutos(produtosFormatados);
        setSyncProgress(100);
        setTimeout(() => setSyncProgress(null), 1500);
    } catch (error) {
        addLog(`[ERRO GRAVE] Não foi possível conectar ao nosso servidor backend. Ele está rodando?`, 'error');
        setSyncProgress(null);
    }
  };
  
  // NOVA VERSÃO da função de publicar
  const publicarNoML = async (produto) => {
    addLog(`Iniciando publicação do produto [${produto.sku}] no Mercado Livre...`, 'info');

    // Desabilita o botão para evitar cliques duplos
    setProdutos(produtos.map(p => p.id === produto.id ? { ...p, isPublishing: true } : p));

    try {
        // 1. A chamada agora é para a SUA API
        const resposta = await fetch('http://localhost:3001/api/publicar-ml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ // 2. Enviamos os dados do produto para o backend
                title: produto.nome,
                sku: produto.sku,
                price: produto.preco,
                quantity: produto.estoque
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            // Se o backend ou o ML deu erro, mostra no log
            addLog(`[ERRO] Falha ao publicar ${produto.sku}: ${dados.erro || 'Erro desconhecido.'}`, 'error');
            setProdutos(produtos.map(p => p.id === produto.id ? { ...p, isPublishing: false } : p));
            return;
        }
        
        // 3. Sucesso! O backend retornou o ID do anúncio.
        addLog(`[SUCESSO] Produto ${produto.sku} publicado! ID: ${dados.id_anuncio_ml}`, 'success');
        
        // 4. Atualizamos o estado do produto na tabela
        const novosProdutos = produtos.map(p => 
            p.id === produto.id ? { ...p, statusML: 'Ativo', mlb_id: dados.id_anuncio_ml, isPublishing: false } : p
        );
        setProdutos(novosProdutos);

    } catch (error) {
        addLog(`[ERRO GRAVE] Não foi possível conectar ao nosso backend para publicar.`, 'error');
        setProdutos(produtos.map(p => p.id === produto.id ? { ...p, isPublishing: false } : p));
    }
  };

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(produto => {
      const matchSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          produto.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'Todos' || produto.statusML === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [produtos, searchTerm, statusFilter]);

  const totalPages = Math.ceil(produtosFiltrados.length / itemsPerPage);
  const currentItems = produtosFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* ... o início do seu JSX continua igual ... */}
      
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y">
          {/* ... seu thead continua igual ... */}
          <tbody className="bg-white divide-y">
            {currentItems.length > 0 ? (
              currentItems.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{produto.sku}</td>
                  <td className="px-6 py-4 text-sm">{produto.nome}</td>
                  <td className="px-6 py-4 text-sm">{produto.estoque} un</td>
                  <td className="px-6 py-4 text-sm">R$ {produto.preco.toFixed(2).replace('.', ',')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${produto.statusML === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{produto.statusML}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    {produto.statusML === 'Não Publicado' ? (
                      <button 
                        onClick={() => publicarNoML(produto)} 
                        disabled={produto.isPublishing} // Botão desabilitado enquanto publica
                        className="text-blue-600 hover:text-blue-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                          {produto.isPublishing ? 'Publicando...' : 'Publicar'}
                      </button>
                    ) : (
                      // Ação "Ver Anúncio" agora funciona!
                      <a 
                        href={`https://produto.mercadolivre.com.br/${produto.mlb_id.replace('MLB', 'MLB-')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-500 underline hover:text-blue-600">
                          Ver Anúncio
                      </a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
             // ... seu estado de tabela vazia continua igual ...
            )}
          </tbody>
        </table>
      </div>
      
      {/* ... o resto do seu JSX (Paginação e Terminal) continua igual ... */}
    </div>
  );
}