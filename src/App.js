import React, { useState } from 'react';
import ClientesPage from './pages/ClientesPage';
import CobrancasPage from './pages/CobrancasPage';
import './App.css';

function App() {
  const [view, setView] = useState('cobrancas'); // 'cobrancas' ou 'clientes'

  return (
    <div className="App">
      <nav className="main-nav">
        <button
          onClick={() => setView('cobrancas')}
          className={view === 'cobrancas' ? 'active' : ''}
        >
          Gerenciar Cobranças
        </button>
        <button
          onClick={() => setView('clientes')}
          className={view === 'clientes' ? 'active' : ''}
        >
          Gerenciar Clientes
        </button>
      </nav>
      <main>
        {view === 'cobrancas' ? <CobrancasPage /> : <ClientesPage />}
      </main>
    </div>
  );
}

export default App;



