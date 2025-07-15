import React, { useState, useEffect } from 'react';

const ClienteForm = ({ onSave, clienteAtual, onCancel }) => {
    const [cliente, setCliente] = useState({
        nome: '',
        documento: '',
        banco: '',
        contaCorrente: '',
        ativo: true
        // REMOVEMOS 'codigo' do estado inicial, pois será gerado pelo banco de dados.
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
        // Removemos 'codigo' do objeto enviado se for um novo cliente, para que o Supabase o gere.
        const clienteParaSalvar = { ...cliente };
        if (!clienteAtual) {
            delete clienteParaSalvar.codigo;
        }
        onSave(clienteParaSalvar);
    };

    return (
        <div className="form-container">
            <h2>{clienteAtual ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h2>
            <form onSubmit={handleSubmit}>

                {/* Exibe o Código apenas se estiver editando um cliente existente */}
                {clienteAtual && (
                    <div className="form-group">
                        <label htmlFor="codigo">Código / Matrícula</label>
                        <input
                            type="text"
                            id="codigo"
                            name="codigo"
                            value={cliente.codigo || ''}
                            readOnly // Impede a edição, pois é gerado pelo banco
                            disabled
                            style={{ backgroundColor: '#f0f0f0' }}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="nome">Nome</label>
                    <input type="text" id="nome" name="nome" value={cliente.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="documento">Documento (CPF/CNPJ)</label>
                    <input type="text" id="documento" name="documento" value={cliente.documento} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="banco">Banco</label>
                    <input type="text" id="banco" name="banco" value={cliente.banco} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="contaCorrente">Conta Corrente</label>
                    <input type="text" id="contaCorrente" name="contaCorrente" value={cliente.contaCorrente} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="ativo">Status</label>
                    <select id="ativo" name="ativo" value={cliente.ativo} onChange={e => handleChange({ target: { name: 'ativo', value: e.target.value === 'true' } })}>
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