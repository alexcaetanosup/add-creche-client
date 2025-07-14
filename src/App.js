// Substitua todo o conteúdo de src/App.js por este código
import React, { useState } from 'react';
import ClientesPage from './pages/ClientesPage.js';
import CobrancasPage from './pages/CobrancasPage.js';
import './App.css';

function App() {
  const [view, setView] = useState('clientes'); // A tela inicial agora é a de clientes
  const [clienteParaCobranca, setClienteParaCobranca] = useState(null);

  // Função que é chamada pela ClientesPage para trocar de tela
  const handleLancarCobrancaParaCliente = (cliente) => {
    setClienteParaCobranca(cliente); // Guarda o cliente que foi selecionado
    setView('cobrancas'); // Muda para a tela de cobranças
  };

  // Função para a navegação principal
  const handleNavigate = (targetView) => {
    setView(targetView);
    // Limpa o cliente pré-selecionado para não interferir
    setClienteParaCobranca(null);
  }

  return (
    <div className="App">
      <nav className="main-nav">
        <button
          onClick={() => handleNavigate('clientes')}
          className={view === 'clientes' ? 'active' : ''}
        >
          Gerenciar Clientes
        </button>
        <button
          onClick={() => handleNavigate('cobrancas')}
          className={view === 'cobrancas' ? 'active' : ''}
        >
          Gerenciar Cobranças
        </button>
      </nav>
      <main>
        {view === 'clientes' && <ClientesPage onLancarCobranca={handleLancarCobrancaParaCliente} />}
        {view === 'cobrancas' && <CobrancasPage clientePreSelecionado={clienteParaCobranca} />}
      </main>
    </div>
  );
}

export default App;



