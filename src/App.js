import React, { useState } from 'react';
import ClientesPage from './pages/ClientesPage.js';
import CobrancasPage from './pages/CobrancasPage.js';
import SobrePage from './pages/SobrePage.js'; // <-- Importado
import './App.css';

function App() {
  const [view, setView] = useState('clientes'); // A tela inicial pode ser clientes
  const [clienteParaCobranca, setClienteParaCobranca] = useState(null);

  const handleLancarCobrancaParaCliente = (cliente) => {
    setClienteParaCobranca(cliente);
    setView('cobrancas');
  };

  const handleNavigate = (targetView) => {
    setView(targetView);
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
        {/* NOVO BOTÃO DE NAVEGAÇÃO */}
        <button
          onClick={() => handleNavigate('sobre')}
          className={view === 'sobre' ? 'active' : ''}
        >
          Sobre
        </button>
      </nav>
      <main>
        {/* LÓGICA DE RENDERIZAÇÃO ATUALIZADA */}
        {view === 'clientes' && <ClientesPage onLancarCobranca={handleLancarCobrancaParaCliente} />}
        {view === 'cobrancas' && <CobrancasPage clientePreSelecionado={clienteParaCobranca} />}
        {view === 'sobre' && <SobrePage />}
      </main>
    </div>
  );
}

export default App;


