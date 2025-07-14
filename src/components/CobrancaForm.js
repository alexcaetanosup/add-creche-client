import React, { useState, useEffect, useCallback } from 'react';

const CobrancaForm = ({
    onSave,
    onCancel,
    clientes = [],
    cobrancaAtual,
    clientePreSelecionado
}) => {

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    // Usamos useCallback para que a função não seja recriada em toda renderização.
    // Ela depende de 'clientePreSelecionado' para definir o estado inicial corretamente.
    const getInitialState = useCallback(() => ({
        clienteId: clientePreSelecionado ? clientePreSelecionado.id : '',
        descricao: 'Colaboração Espontânea',
        valor: '',
        vencimento: getTodayDate(),
        status: 'Pendente',
        statusRemessa: 'pendente' // Garante que o campo sempre exista
    }), [clientePreSelecionado]);

    const [cobranca, setCobranca] = useState(getInitialState());

    // Este useEffect agora lida com as mudanças nas props de forma limpa.
    useEffect(() => {
        if (cobrancaAtual) {
            // Modo de Edição: preenche com os dados da cobrança existente.
            setCobranca({
                ...cobrancaAtual,
                clienteId: String(cobrancaAtual.clienteId || ''),
                valor: String(cobrancaAtual.valor || ''),
            });
        } else {
            // Modo de Criação: reseta para o estado inicial (que já sabe sobre o cliente pré-selecionado).
            setCobranca(getInitialState());
        }
    }, [cobrancaAtual, clientePreSelecionado, getInitialState]); // Adiciona getInitialState ao array de dependências.

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
            <h2>{cobrancaAtual ? 'Editar Cobrança' : (clientePreSelecionado ? `Nova Cobrança para ${clientePreSelecionado.nome}` : 'Adicionar Nova Cobrança')}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="clienteId">Cliente</label>
                    <select
                        id="clienteId"
                        name="clienteId"
                        value={cobranca.clienteId}
                        onChange={handleChange}
                        required
                        disabled={!!clientePreSelecionado || !!cobrancaAtual} // Desabilita na pré-seleção E na edição
                    >
                        {clientePreSelecionado ? (
                            <option value={clientePreSelecionado.id}>{clientePreSelecionado.nome}</option>
                        ) : cobrancaAtual ? (
                            // Na edição, encontra o cliente para mostrar o nome
                            <option value={cobrancaAtual.clienteId}>
                                {clientes.find(c => c.id === cobrancaAtual.clienteId)?.nome || 'Carregando...'}
                            </option>
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





