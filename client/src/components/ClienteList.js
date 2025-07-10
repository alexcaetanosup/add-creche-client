import React from 'react';

const ClienteList = ({ clientes, onEdit, onDelete }) => {
    return (
        <table className="cobrancas-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Documento</th>
                    <th>Banco</th>
                    <th>Conta</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {clientes.length === 0 ? (
                    <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>Nenhum cliente encontrado.</td>
                    </tr>
                ) : (
                    clientes.map(cliente => (
                        <tr key={cliente.id}>
                            <td>{cliente.nome}</td>
                            <td>{cliente.documento}</td>
                            <td>{cliente.banco}</td>
                            <td>{cliente.contaCorrente}</td>
                            <td>
                                <span className={cliente.ativo ? 'status-pago' : 'status-pendente'}>
                                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="action-buttons">
                                <button onClick={() => onEdit(cliente)} className="btn-edit">Editar</button>
                                <button onClick={() => onDelete(cliente.id)} className="btn-delete">Deletar</button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default ClienteList;