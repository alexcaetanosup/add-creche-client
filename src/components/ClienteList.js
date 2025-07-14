// Substitua todo o conteúdo de src/components/ClienteList.js por este código
import React from 'react';

const ClienteList = ({
    clientes = [],
    onEdit = () => { },
    onDelete = () => { },
    onLancarCobranca = () => { }
}) => {
    return (
        <table className="cobrancas-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Documento</th>
                    <th>Status</th>
                    <th style={{ width: '35%' }}>Ações</th>
                </tr>
            </thead>
            <tbody>
                {clientes.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>Nenhum cliente encontrado.</td></tr>
                ) : (
                    clientes.map(cliente => (
                        <tr key={cliente.id}>
                            <td>{cliente.codigo}</td>
                            <td>{cliente.nome}</td>
                            <td>{cliente.documento}</td>
                            <td>
                                <span className={cliente.ativo ? 'status-pago' : 'status-pendente'}>
                                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="action-buttons">
                                <button onClick={() => onLancarCobranca(cliente)} className="btn-lancar-cobranca">Lançar Valor</button>
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
