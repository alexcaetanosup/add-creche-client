import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Importa nosso cliente Supabase
import LoginPage from './pages/LoginPage.js';
import ClientesPage from './pages/ClientesPage.js';
import CobrancasPage from './pages/CobrancasPage.js';
import SobrePage from './pages/SobrePage.js';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('clientes');
    const [clienteParaCobranca, setClienteParaCobranca] = useState(null);

    // Verifica a sessão do usuário quando o app carrega
    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getSession();

        // Escuta por mudanças no estado de autenticação (login, logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );
        
        // Limpa o listener quando o componente desmonta
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };
    
    // Se ainda estiver verificando a sessão, mostra uma tela de carregamento
    if (loading) {
        return <div className="App"><h1>Carregando...</h1></div>;
    }

    // Se não houver usuário, mostra a página de login
    if (!user) {
        return <LoginPage supabase={supabase} onLogin={(user) => setUser(user)} />;
    }

    // Se houver um usuário, mostra o aplicativo principal
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
            <header className="main-header">
                <nav className="main-nav">
                    <button onClick={() => handleNavigate('clientes')} className={view === 'clientes' ? 'active' : ''}>Gerenciar Clientes</button>
                    <button onClick={() => handleNavigate('cobrancas')} className={view === 'cobrancas' ? 'active' : ''}>Gerenciar Cobranças</button>
                    <button onClick={() => handleNavigate('sobre')} className={view === 'sobre' ? 'active' : ''}>Sobre</button>
                </nav>
                <div className="user-info">
                    <span>Olá, {user.email}</span>
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


