import React from 'react';

const CobrancaList = ({ cobrancas, clientes, onEdit, onDelete }) => {
    // Função auxiliar para formatar a moeda
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Função auxiliar para formatar a data
    const formatDate = (dateString) => {
        if (!dateString) return '--/--/----';
        // Adiciona 'T00:00:00' para evitar problemas de fuso horário
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    };

    // Função para obter o nome do cliente a partir do ID
    const getClienteName = (clienteId) => {
        if (!clientes || clientes.length === 0 || !clienteId) {
            return 'Cliente Desconhecido';
        }
        const cliente = clientes.find(c => Number(c.id) === Number(clienteId));
        return cliente ? cliente.nome : 'Cliente Desconhecido';
    };

    return (
        <table className="cobrancas-table">
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {cobrancas.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhuma cobrança pendente encontrada.</td></tr>
                ) : (
                    cobrancas.map(cobranca => (
                        <tr key={cobranca.id}>
                            <td>{getClienteName(cobranca.clienteId)}</td>
                            <td>{cobranca.descricao}</td>
                            <td>{formatCurrency(cobranca.valor)}</td>
                            <td>{formatDate(cobranca.vencimento)}</td>
                            <td>
                                <span className={cobranca.status === 'Pendente' ? 'status-pendente' : 'status-pago'}>
                                    {cobranca.status}
                                </span>
                            </td>
                            <td className="action-buttons">
                                <button onClick={() => onEdit(cobranca)} className="btn-edit">Editar</button>
                                <button onClick={() => onDelete(cobranca.id)} className="btn-delete">Deletar</button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default CobrancaList;
