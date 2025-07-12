import React, { useState, useEffect } from 'react';

const ClienteForm = ({ onSave, clienteAtual, onCancel }) => {
    const [cliente, setCliente] = useState({
        nome: '',
        documento: '',
        banco: '033',
        contaCorrente: '',
        ativo: true
    });

    useEffect(() => {
        if (clienteAtual) {
            setCliente(clienteAtual);
        } else {
            setCliente({ nome: '', documento: '', banco: '', contaCorrente: '', ativo: true });
        }
    }, [clienteAtual]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCliente(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(cliente);
        setCliente({ nome: '', documento: '', banco: '', contaCorrente: '', ativo: true });
    };

    return (
        <div className="form-container">
            <h2>{clienteAtual ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nome</label>
                    <input type="text" name="nome" value={cliente.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Código do Cliente (para remessa)</label>
                    <input type="text" name="codigo" value={cliente.codigo || ''} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Documento (CPF/CNPJ)</label>
                    <input type="text" name="documento" value={cliente.documento} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Banco</label>
                    <input type="text" name="banco" value={cliente.banco} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Conta Corrente</label>
                    <input type="text" name="contaCorrente" value={cliente.contaCorrente} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select name="ativo" value={cliente.ativo} onChange={e => handleChange({ target: { name: 'ativo', value: e.target.value === 'true' } })}>
                        <option value={true}>Ativo</option>
                        <option value={false}>Inativo</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-primary">{clienteAtual ? 'Salvar Alterações' : 'Adicionar Cliente'}</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default ClienteForm;