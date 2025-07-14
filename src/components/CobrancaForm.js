import React, { useState, useEffect } from 'react';

const CobrancaForm = ({
    onSave,
    onCancel,
    clientes = [],
    cobrancaAtual,
    clientePreSelecionado // Nova prop
}) => {

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const getInitialState = () => ({
        // Se houver um cliente pré-selecionado, use o ID dele.
        clienteId: clientePreSelecionado ? clientePreSelecionado.id : '',
        descricao: 'Colaboração Espontânea',
        valor: '',
        vencimento: getTodayDate(),
        status: 'Pendente'
    });

    const [cobranca, setCobranca] = useState(getInitialState());

    useEffect(() => {
        // Lógica para edição de uma cobrança existente
        if (cobrancaAtual) {
            setCobranca({
                ...cobrancaAtual,
                clienteId: String(cobrancaAtual.clienteId || ''),
                valor: String(cobrancaAtual.valor || ''),
            });
        }
        // Lógica para nova cobrança (com ou sem cliente pré-selecionado)
        else {
            setCobranca(getInitialState());
        }
    }, [cobrancaAtual, clientePreSelecionado]); // Adiciona clientePreSelecionado como dependência

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCobranca(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(cobranca);
    };

    return (
        <div className="form-container">
            <h2>{cobrancaAtual ? 'Editar Cobrança' : 'Adicionar Nova Cobrança'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="clienteId">Cliente</label>
                    <select
                        id="clienteId"
                        name="clienteId"
                        value={cobranca.clienteId}
                        onChange={handleChange}
                        required
                        disabled={!!clientePreSelecionado} // Desabilita o campo se um cliente foi pré-selecionado
                    >
                        {/* Se um cliente foi pré-selecionado, mostra apenas ele */}
                        {clientePreSelecionado ? (
                            <option value={clientePreSelecionado.id}>{clientePreSelecionado.nome}</option>
                        ) : (
                            <>
                                <option value="" disabled>Selecione um cliente</option>
                                {clientes.filter(c => c.ativo).map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                                ))}
                            </>
                        )}
                    </select>
                </div>

                {/* O resto do formulário permanece igual */}
                <div className="form-group">
                    <label htmlFor="descricao">Descrição</label>
                    <input type="text" id="descricao" name="descricao" value={cobranca.descricao} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="valor">Valor (R$)</label>
                    <input type="number" id="valor" name="valor" step="0.01" value={cobranca.valor} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="vencimento">Data de Vencimento</label>
                    <input type="date" id="vencimento" name="vencimento" value={cobranca.vencimento} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={cobranca.status} onChange={handleChange}>
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-primary">Salvar Cobrança</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CobrancaForm;





