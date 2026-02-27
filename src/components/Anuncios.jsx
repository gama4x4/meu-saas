import React, { useState, useMemo } from 'react';


export default function Anuncios() {
  const [syncProgress, setSyncProgress] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [logs, setLogs] = useState([{ id: 1, time: new Date().toLocaleTimeString(), message: 'Sistema iniciado. Aguardando comandos...', type: 'info' }]);
  
  // A lista inicial de produtos agora está vazia. Ela será preenchida pela sincronização.
  const [produtos, setProdutos] = useState([]);

  const addLog = (message, type = 'info') => {
    const newLog = { id: Date.now(), time: new Date().toLocaleTimeString(), message, type };
    setLogs((prevLogs) => [newLog, ...prevLogs]);
  };

const iniciarSincronizacao = async () => {
    if (syncProgress !== null) return;

    addLog('Conectando ao nosso servidor para buscar produtos no Tiny...', 'info');
    setSyncProgress(10);
    setProdutos([]); // Limpa a tabela

    try {
        const resposta = await fetch('http://localhost:3001/api/tiny-produtos', { method: 'POST' });
        const dados = await resposta.json();

        setSyncProgress(50);

        if (!resposta.ok) {
            // Se o nosso backend ou o Tiny deu erro, mostra no log
            addLog(`[ERRO] ${dados.erro || 'Falha ao buscar produtos.'}`, 'error');
            setSyncProgress(null);
            return;
        }

        // Transforma os dados do Tiny para o formato da nossa tabela
        const produtosFormatados = dados.map(item => ({
            id: item.produto.id,
            sku: item.produto.codigo,
            nome: item.produto.nome,
            estoque: parseFloat(item.produto.saldo),
            preco: parseFloat(item.produto.preco),
            statusML: 'Não Publicado' // Status padrão
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
  
  // (O resto das funções como `publicarNoML` continuam iguais)
  const publicarNoML = (produto) => {
    addLog(`Iniciando publicação do produto[${produto.sku}] no Mercado Livre...`, 'info');
    if (produto.estoque <= 0) {
      addLog(`[ERRO] Falha ao publicar ${produto.sku}: Estoque zerado.`, 'error');
      return;
    }
    addLog(`Enviando POST para https://api.mercadolibre.com/items com os dados de [${produto.sku}]...`, 'warning');
    setTimeout(() => {
      addLog(`[SUCESSO] Produto ${produto.sku} publicado! ID: MLB${Math.floor(Math.random() * 1000000000)}`, 'success');
      const novosProdutos = produtos.map(p => p.id === produto.id ? { ...p, statusML: 'Ativo' } : p);
      setProdutos(novosProdutos);
    }, 1000);
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
      {/* O resto do HTML (JSX) continua exatamente o mesmo da versão anterior */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-medium text-gray-900">Gerenciador de Anúncios</h3>
          <p className="text-sm text-gray-500 mb-4">Seu estoque Tiny espelhado e pronto para vender no Mercado Livre.</p>
          {syncProgress !== null && (
            <div className="w-full max-w-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-blue-700">Sincronizando em background...</span>
                <span className="text-xs font-medium text-blue-700">{syncProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${syncProgress}%` }}></div></div>
            </div>
          )}
        </div>
        <button 
          onClick={iniciarSincronizacao}
          disabled={syncProgress !== null}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
        >
          {syncProgress !== null ? 'Sincronizando...' : '🔄 Sincronizar com Tiny'}
        </button>
      </div>
      
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <input 
          type="text" 
          placeholder="Buscar por SKU ou Nome..." 
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full px-3 py-2 border rounded-md text-sm"
        />
        <select 
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="w-64 px-3 py-2 border rounded-md text-sm"
        >
          <option value="Todos">Todos os Status</option>
          <option value="Ativo">Ativos</option>
          <option value="Não Publicado">Não Publicados</option>
          <option value="Pausado">Pausados</option>
        </select>
      </div>
      
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status ML</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
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
                      <button onClick={() => publicarNoML(produto)} className="text-blue-600 hover:text-blue-900 font-bold">Publicar</button>
                    ) : (
                      <button className="text-gray-500 underline">Ver Anúncio</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                  {syncProgress !== null ? 'Carregando produtos...' : 'Nenhum produto encontrado. Clique em "Sincronizar com Tiny" para buscar.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* PAGINAÇÃO (igual) */}
      </div>
      
      <div className="bg-gray-900 rounded-lg shadow-inner overflow-hidden h-64 border flex flex-col">
        <div className="bg-gray-800 px-4 py-2 border-b flex justify-between items-center">
          <span className="text-xs font-bold text-gray-300 uppercase">Terminal de Eventos</span>
          <button onClick={() => setLogs([])} className="text-xs text-gray-500 hover:text-white">Limpar Logs</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-1">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <span className="text-gray-500">[{log.time}]</span>
              <span className={`${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400 font-bold' : log.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}