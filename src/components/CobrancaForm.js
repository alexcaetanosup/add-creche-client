import React, { useState, useEffect, useCallback } from 'react';

const CobrancaForm = ({ onSave, cobrancaAtual, onCancel, clientes }) => {
    // Função para obter a data de hoje no formato AAAA-MM-DD
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês de 1-12
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Define o estado inicial de forma clara
    const getInitialState = useCallback(() => ({
        clienteId: '',
        descricao: 'Colaboração Espontânea',
        valor: '',
        vencimento: getTodayDate(),
        status: 'Pendente'
    }), []); // Note o , []); no final.

    const [cobranca, setCobranca] = useState(getInitialState());

    // Efeito para preencher o formulário para edição ou limpar para adição
    useEffect(() => {
        if (cobrancaAtual) {
            setCobranca({
                ...cobrancaAtual,
                // Garante que o clienteId e o valor sejam strings para os inputs
                clienteId: String(cobrancaAtual.clienteId || ''),
                valor: String(cobrancaAtual.valor || ''),
            });
        } else {
            setCobranca(getInitialState());
        }
    }, [cobrancaAtual, getInitialState]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCobranca(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validação extra: não permite submeter se o clienteId for vazio
        if (!cobranca.clienteId) {
            alert('Por favor, selecione um cliente.');
            return;
        }

        // Envia os dados para a função onSave
        onSave(cobranca);
    };

    // Em CobrancaForm.js
    return (
        <div className="form-container">
            <h2>{cobrancaAtual ? 'Editar Cobrança' : 'Adicionar Nova Cobrança'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="clienteId">Cliente</label>
                    <select id="clienteId" name="clienteId" value={cobranca.clienteId} onChange={handleChange} required>
                        <option value="" disabled>Selecione um cliente</option>
                        {clientes.filter(c => c.ativo).map(cliente => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                        ))}
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
                    <button type="submit" className="btn-primary">{cobrancaAtual ? 'Salvar Alterações' : 'Adicionar Cobrança'}</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CobrancaForm;




// import React, { useState, useEffect } from 'react';

// const CobrancaForm = ({ onSave, cobrancaAtual, onCancel, clientes }) => {
//     const [cobranca, setCobranca] = useState({
//         clienteId: '',
//         descricao: '',
//         valor: '',
//         vencimento: '',
//         status: 'Pendente'
//     });

//     useEffect(() => {
//         if (cobrancaAtual) {
//             setCobranca({
//                 ...cobrancaAtual,
//                 valor: cobrancaAtual.valor.toString(),
//             });
//         } else {
//             setCobranca({ clienteId: clientes.length > 0 ? clientes[0].id : '', descricao: '', valor: '', vencimento: '', status: 'Pendente' });
//         }
//     }, [cobrancaAtual, clientes]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setCobranca(prevState => ({ ...prevState, [name]: value }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onSave({ ...cobranca, valor: parseFloat(cobranca.valor) });
//     };

//     return (
//         <div className="form-container">
//             <h2>{cobrancaAtual ? 'Editar Cobrança' : 'Adicionar Nova Cobrança'}</h2>
//             <form onSubmit={handleSubmit}>

//                 <div className="form-group">
//                     <label>Cliente</label>
//                     <select name="clienteId" value={cobranca.clienteId} onChange={handleChange} required>
//                         <option value="" disabled>Selecione um cliente</option>
//                         {clientes.filter(c => c.ativo).map(cliente => (
//                             <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* O resto do formulário permanece igual */}
//                 <div className="form-group">
//                     <label>Descrição</label>
//                     <input type="text" name="descricao" value={cobranca.descricao} onChange={handleChange} required />
//                 </div>
//                 <div className="form-group">
//                     <label>Valor (R$)</label>
//                     <input type="number" name="valor" step="0.01" value={cobranca.valor} onChange={handleChange} required />
//                 </div>
//                 <div className="form-group">
//                     <label>Data de Vencimento</label>
//                     <input type="date" name="vencimento" value={cobranca.vencimento} onChange={handleChange} required />
//                 </div>
//                 <div className="form-group">
//                     <label>Status</label>
//                     <select name="status" value={cobranca.status} onChange={handleChange}>
//                         <option value="Pendente">Pendente</option>
//                         <option value="Pago">Pago</option>
//                     </select>
//                 </div>
//                 <div className="form-actions">
//                     <button type="submit" className="btn-primary">{cobrancaAtual ? 'Salvar Alterações' : 'Adicionar Cobrança'}</button>
//                     <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default CobrancaForm;





