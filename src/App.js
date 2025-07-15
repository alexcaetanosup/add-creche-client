import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Importa nosso cliente Supabase
import LoginPage from './pages/LoginPage.js';
import ClientesPage from './pages/ClientesPage.js';
import CobrancasPage from './pages/CobrancasPage.js';
import SobrePage from './pages/SobrePage.js';
import './App.css';

function App() {
  // --- ESTADOS GLOBAIS ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Controla a verificação inicial da sessão
  const [view, setView] = useState('clientes'); // Controla qual página é exibida
  const [clienteParaCobranca, setClienteParaCobranca] = useState(null);

  // --- EFEITO DE AUTENTICAÇÃO ---
  // Roda uma vez quando o aplicativo carrega para verificar se já existe uma sessão de usuário.
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // Escuta por mudanças no estado de autenticação (login, logout em outra aba, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        // Se o usuário deslogou, volta para a tela de clientes
        if (!session?.user) {
          setView('clientes');
        }
      }
    );

    // Limpa o "ouvinte" quando o componente é desmontado para evitar vazamento de memória
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- FUNÇÕES DE MANIPULAÇÃO ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // O listener acima cuidará de definir o 'user' como null
  };

  const handleLancarCobrancaParaCliente = (cliente) => {
    setClienteParaCobranca(cliente);
    setView('cobrancas');
  };

  const handleNavigate = (targetView) => {
    setView(targetView);
    setClienteParaCobranca(null);
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---

  // 1. Mostra "Carregando..." enquanto a sessão inicial está sendo verificada.
  if (loading) {
    return <div className="App"><h1>Carregando...</h1></div>;
  }

  // 2. Se não houver usuário logado, mostra a página de Login.
  if (!user) {
    // Passa o cliente supabase para o LoginPage poder usá-lo.
    return <LoginPage supabase={supabase} />;
  }

  // 3. Se houver um usuário logado, mostra o aplicativo principal.
  return (
    <div className="App">
      <header className="main-header">
        <nav className="main-nav">
          <button onClick={() => handleNavigate('clientes')} className={view === 'clientes' ? 'active' : ''}>Gerenciar Clientes</button>
          <button onClick={() => handleNavigate('cobrancas')} className={view === 'cobrancas' ? 'active' : ''}>Gerenciar Cobranças</button>
          <button onClick={() => handleNavigate('sobre')} className={view === 'sobre' ? 'active' : ''}>Sobre</button>
        </nav>
        <div className="user-info">
          <span id='ola'>Olá, {user.email}</span>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>
      <main>
        {view === 'clientes' && <ClientesPage onLancarCobranca={handleLancarCobrancaParaCliente} />}
        {view === 'cobrancas' && <CobrancasPage clientePreSelecionado={clienteParaCobranca} />}
        {view === 'sobre' && <SobrePage />}
      </main>
    </div>
  );
}

export default App;


