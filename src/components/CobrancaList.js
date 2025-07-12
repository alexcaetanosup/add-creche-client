import React from 'react';

const CobrancaList = ({
    cobrancas,
    clientes,
    onEdit,
    onDelete,
    // Novas props para a seleção
    selectedCobrancas,
    onSelectCobranca,
    onSelectAll,
    isAllSelected
}) => {
    // ... (as funções formatCurrency, formatDate, getClienteName permanecem as mesmas) ...
    const formatCurrency = (value) => { /* ... */ };
    const formatDate = (dateString) => { /* ... */ };
    const getClienteName = (clienteId) => { /* ... */ };

    return (
        <table className="cobrancas-table">
            <thead>
                <tr>
                    <th>
                        <input
                            type="checkbox"
                            onChange={onSelectAll}
                            checked={isAllSelected}
                            title="Selecionar Todos"
                        />
                    </th>
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
                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Nenhuma cobrança pendente encontrada.</td></tr>
                ) : (
                    cobrancas.map(cobranca => (
                        <tr key={cobranca.id} className={selectedCobrancas.has(cobranca.id) ? 'row-selected' : ''}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedCobrancas.has(cobranca.id)}
                                    onChange={() => onSelectCobranca(cobranca.id)}
                                />
                            </td>
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
