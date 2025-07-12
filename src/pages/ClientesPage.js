import React, { useState, useEffect, useCallback } from 'react';
import ClienteList from '../components/ClienteList.js';
import ClienteForm from '../components/ClienteForm.js';

// Configuração da URL da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api/clientes`;

const ClientesPage = () => {
    // --- ESTADOS DO COMPONENTE ---
    const [clientes, setClientes] = useState([]);
    const [clienteAtual, setClienteAtual] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [isLoading, setIsLoading] = useState(true); // <-- NOVO ESTADO

    // --- FUNÇÃO PARA BUSCAR DADOS (ROBUSTA) ---
    const fetchClientes = useCallback(async () => {
        setIsLoading(true); // Inicia o carregamento
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Falha na API: ${response.statusText}`);
            }
            const data = await response.json();
            setClientes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
            alert(`Não foi possível carregar os clientes. Verifique se o servidor backend está rodando. Erro: ${error.message}`);
            setClientes([]); // Garante que clientes seja um array vazio em caso de erro
        } finally {
            setIsLoading(false); // Termina o carregamento
        }
    }, []);

    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    // --- FUNÇÕES DE CRUD (sem alterações na lógica interna) ---
    const handleSave = async (cliente) => {
        const method = cliente.id ? 'PUT' : 'POST';
        const url = cliente.id ? `${API_URL}/${cliente.id}` : API_URL;
        try {
            const response = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cliente),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao salvar cliente.');
            }
            fetchClientes();
            setIsFormVisible(false);
            setClienteAtual(null);
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert(`Ocorreu um erro: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao deletar cliente.');
                fetchClientes();
            } catch (error) {
                console.error("Erro ao deletar cliente:", error);
                alert(`Ocorreu um erro: ${error.message}`);
            }
        }
    };

    const handleEdit = (cliente) => {
        setClienteAtual(cliente);
        setIsFormVisible(true);
    };

    // --- LÓGICA DE FILTRAGEM ---
    const clientesFiltrados = clientes.filter(c =>
        c.nome && c.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    // --- RENDERIZAÇÃO CONDICIONAL PRINCIPAL ---
    if (isLoading) {
        return (
            <div className="App">
                <h1>Gerenciamento de Clientes</h1>
                <p>Carregando clientes...</p>
            </div>
        );
    }

    // --- RENDERIZAÇÃO DO COMPONENTE ---
    return (
        <div>
            <h1>Gerenciamento de Clientes</h1>
            <div className="action-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        id="filtro-cliente"
                        name="filtro-cliente"
                        placeholder="Filtrar por nome do cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
                {!isFormVisible && (
                    <button onClick={() => { setIsFormVisible(true); setClienteAtual(null); }} className="btn-primary">Novo Cliente</button>
                )}
            </div>

            {isFormVisible && (
                <ClienteForm
                    onSave={handleSave}
                    clienteAtual={clienteAtual}
                    onCancel={() => { setIsFormVisible(false); setClienteAtual(null); }}
                />
            )}

            <ClienteList clientes={clientesFiltrados} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
};

export default ClientesPage;