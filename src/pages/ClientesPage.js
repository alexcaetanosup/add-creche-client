// Substitua todo o conteúdo de src/pages/ClientesPage.js por este código
import React, { useState, useEffect, useCallback } from 'react';
import ClienteList from '../components/ClienteList.js';
import ClienteForm from '../components/ClienteForm.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api/clientes`;

const ClientesPage = ({ onLancarCobranca }) => {
    const [clientes, setClientes] = useState([]);
    const [clienteAtual, setClienteAtual] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchClientes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Falha na API: ${response.statusText}`);
            const data = await response.json();
            setClientes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
            setClientes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    const handleSave = async (cliente) => {
        const method = cliente.id ? 'PUT' : 'POST';
        const url = cliente.id ? `${API_URL}/${cliente.id}` : API_URL;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cliente) });
            if (!response.ok) throw new Error('Falha ao salvar cliente.');
            fetchClientes();
            setIsFormVisible(false);
            setClienteAtual(null);
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert(`Ocorreu um erro: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza?')) {
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

    const clientesFiltrados = clientes.filter(c =>
        c.nome && c.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    if (isLoading) return <p>Carregando clientes...</p>;

    return (
        <div>
            <h1>Aplicatico de Cobrança</h1>
            <h2>Gerenciamento de Clientes</h2>
            <div className="action-bar">
                <div className="search-bar">
                    <input
                        type="text" id="filtro-cliente" name="filtro-cliente"
                        placeholder="Filtrar por nome do cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
                <div className="button-group">
                    {!isFormVisible && (
                        <button onClick={() => { setIsFormVisible(true); setClienteAtual(null); }} className="btn-primary">Novo Cliente</button>
                    )}
                </div>
            </div>

            {isFormVisible && (
                <ClienteForm
                    onSave={handleSave}
                    clienteAtual={clienteAtual}
                    onCancel={() => { setIsFormVisible(false); setClienteAtual(null); }}
                />
            )}

            <ClienteList
                clientes={clientesFiltrados}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLancarCobranca={onLancarCobranca}
            />
        </div>
    );
};

export default ClientesPage;