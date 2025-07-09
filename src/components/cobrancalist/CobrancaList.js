import React from 'react';

const CobrancaList = ({ cobrancas, clientes, onEdit, onDelete, selectedCobrancas, onSelectCobranca }) => {
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');

    const getClienteName = (clienteId) => {
        const cliente = clientes.find(c => Number(c.id) === Number(clienteId));
        return cliente ? cliente.nome : 'Cliente Desconhecido';
    };

    return (
        <table className="cobrancas-table">
            <thead>
                <tr>
                    <th>Sel.</th> {/* <-- NOVA COLUNA */}
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
                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Nenhuma cobrança encontrada.</td></tr>
                ) : (
                    cobrancas.map(cobranca => (
                        <tr key={cobranca.id} className={selectedCobrancas.has(cobranca.id) ? 'row-selected' : ''}>
                            <td> {/* <-- NOVA CÉLULA */}
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
                            <td><span className={cobranca.status === 'Pendente' ? 'status-pendente' : 'status-pago'}>{cobranca.status}</span></td>
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
