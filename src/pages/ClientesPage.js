import React, { useState, useEffect } from 'react';
import ClienteList from '../components/ClienteList';
import ClienteForm from '../components/ClienteForm';

const API_URL = 'http://localhost:3001/clientes';

const ClientesPage = () => {
    const [clientes, setClientes] = useState([]);
    const [clienteAtual, setClienteAtual] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setClientes(data);
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
        }
    };

    const handleSave = async (cliente) => {
        const method = cliente.id ? 'PUT' : 'POST';
        const url = cliente.id ? `${API_URL}/${cliente.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente),
            });
            if (response.ok) {
                fetchClientes();
                setIsFormVisible(false);
                setClienteAtual(null);
            }
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este cliente? Isso pode afetar cobranças existentes.')) {
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                fetchClientes();
            } catch (error) {
                console.error("Erro ao deletar cliente:", error);
            }
        }
    };

    const handleEdit = (cliente) => {
        setClienteAtual(cliente);
        setIsFormVisible(true);
    };

    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div>
            <h1>Gerenciamento de Clientes</h1>
            <div className="action-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Filtrar por nome do cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
                {!isFormVisible && (
                    <button onClick={() => setIsFormVisible(true)} className="btn-primary">Novo Cliente</button>
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