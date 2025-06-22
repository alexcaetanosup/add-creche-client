import React, { useState, useEffect, useCallback } from 'react';
import CobrancaList from '../components/cobrancalist/CobrancaList';
import CobrancaForm from '../components/cobrancaform/CobrancaForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_COBRANCAS_URL = 'http://localhost:3001/cobrancas';
const API_CLIENTES_URL = 'http://localhost:3001/clientes';

const CobrancasPage = () => {
    const [cobrancas, setCobrancas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [cobrancaAtual, setCobrancaAtual] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [cobrancasRes, clientesRes] = await Promise.all([
                fetch(API_COBRANCAS_URL),
                fetch(API_CLIENTES_URL)
            ]);
            const cobrancasData = await cobrancasRes.json();
            const clientesData = await clientesRes.json();
            setCobrancas(cobrancasData);
            setClientes(clientesData);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Em src/pages/CobrancasPage.js

    const handleSave = async (cobranca) => {
        // 1. Validação de Entrada: Se por algum motivo chegou uma cobrança sem clienteId, pare aqui.
        if (!cobranca.clienteId || cobranca.clienteId === '') {
            console.error("Tentativa de salvar cobrança sem clienteId. Operação cancelada.", cobranca);
            alert("ERRO: A cobrança não pode ser salva sem um cliente. Por favor, tente novamente.");
            return; // Interrompe a execução da função
        }

        const method = cobranca.id ? 'PUT' : 'POST';
        const url = cobranca.id ? `${API_COBRANCAS_URL}/${cobranca.id}` : API_COBRANCAS_URL;

        // 2. Preparação do Payload: Garante que os tipos estão corretos
        const payload = {
            ...cobranca,
            clienteId: Number(cobranca.clienteId), // Converte para Número
            valor: Number(cobranca.valor)          // Converte para Número
        };

        // Se for um novo registro, o 'id' pode ser undefined ou null. O json-server cria o id.
        // Se for uma edição, o 'id' já existe no payload.
        // if (!payload.id) {
        //     delete payload.id;
        // }

        if (!cobranca.id) {
            // Se for um novo registro, define o status da remessa como pendente
            payload.statusRemessa = 'pendente';
            delete payload.id;
        }

        // 3. Log para Depuração: Vamos ver exatamente o que está sendo enviado
        console.log("Enviando para a API:", { url, method, payload });

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                console.log("Salvo com sucesso!");
                fetchData();
                setIsFormVisible(false);
                setCobrancaAtual(null);
            } else {
                const errorText = await response.text();
                console.error("Erro ao salvar cobrança. Status:", response.status, "Resposta do servidor:", errorText);
                alert("Ocorreu um erro no servidor ao salvar a cobrança.");
            }
        } catch (error) {
            console.error("Erro de rede ao salvar cobrança:", error);
            alert("Não foi possível conectar ao servidor para salvar a cobrança.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar esta cobrança?')) {
            try {
                await fetch(`${API_COBRANCAS_URL}/${id}`, { method: 'DELETE' });
                fetchData();
            } catch (error) {
                console.error("Erro ao deletar cobrança:", error);
            }
        }
    };

    const handleEdit = (cobranca) => {
        setCobrancaAtual(cobranca);
        setIsFormVisible(true);
    };

    const handleFinalizarRemessa = async () => {
        if (cobrancasFiltradas.length === 0) {
            alert("Não há cobranças pendentes para finalizar.");
            return;
        }

        if (window.confirm(`Você confirma a finalização de ${cobrancasFiltradas.length} cobrança(s)? Elas não aparecerão mais na lista de remessas pendentes.`)) {
            // Cria um array de promessas, uma para cada requisição de atualização
            const updatePromises = cobrancasFiltradas.map(cobranca => {
                const updatedCobranca = { ...cobranca, statusRemessa: 'gerada' };
                return fetch(`${API_COBRANCAS_URL}/${cobranca.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedCobranca),
                });
            });

            try {
                // Espera todas as atualizações terminarem
                await Promise.all(updatePromises);
                alert("Remessa finalizada com sucesso! A lista foi limpa.");
                fetchData(); // Recarrega os dados para atualizar a tela
            } catch (error) {
                console.error("Erro ao finalizar remessa:", error);
                alert("Ocorreu um erro ao finalizar a remessa. Verifique o console.");
            }
        }
    };

    // Dentro de src/pages/CobrancasPage.js

    const cobrancasFiltradas = cobrancas.filter(c => {
        // Encontra o cliente correspondente
        const cliente = clientes.find(cli => Number(cli.id) === Number(c.clienteId));

        // CONDIÇÃO NOVA: A cobrança deve ser pendente de remessa
        const remessaPendente = c.statusRemessa === 'pendente';

        // Se o campo de filtro estiver vazio, mostra a cobrança se for pendente
        if (filtro.trim() === '') {
            return cliente && remessaPendente;
        }

        // Se o filtro não estiver vazio, verifica o nome do cliente E se a remessa é pendente
        return cliente && cliente.nome.toLowerCase().includes(filtro.toLowerCase()) && remessaPendente;
    });


    // Sua função gerarPDF e gerarTXT podem ser copiadas para cá, com uma pequena modificação
    const gerarPDF = () => {
        const doc = new jsPDF();
        doc.text("Relatório de Cobranças", 14, 16);
        autoTable(doc, {
            head: [['Cliente', 'Descrição', 'Valor', 'Vencimento', 'Status']],
            body: cobrancasFiltradas.map(c => {
                // const cliente = clientes.find(cli => cli.id === c.clienteId);
                const cliente = clientes.find(cli => Number(cli.id) === Number(c.clienteId));
                return [
                    cliente ? cliente.nome : 'N/A',
                    c.descricao,
                    `R$ ${c.valor.toFixed(2)}`,
                    new Date(c.vencimento + 'T00:00:00').toLocaleDateString('pt-BR'),
                    c.status
                ]
            }),
            startY: 20,
        });
        doc.save('relatorio_cobrancas.pdf');
    };

    // Copie sua função gerarTXT para cá também, fazendo a mesma adaptação para buscar o nome do cliente.

    // Dentro de src/pages/CobrancasPage.js

    const gerarTXT = async () => {
        // --- FUNÇÕES AUXILIARES DE FORMATAÇÃO ---
        const formatText = (text = '', length) => String(text).substring(0, length).padEnd(length, ' ');
        const formatNumber = (num = 0, length) => String(num).replace(/[^0-9]/g, '').padStart(length, '0');

        // --- DEFINIÇÃO PRECISA E FINAL DO LAYOUT (150 caracteres) ---
        const layout = {
            header: {
                TIPO_REGISTRO: 1, COD_SERVICO: 1, CONVENIO: 20, NOME_EMPRESA: 20,
                COD_BANCO: 3, NOME_BANCO: 20, DATA_GERACAO: 8, NSA: 8,
                VERSAO_LAYOUT: 40, ID_SISTEMA: 29
            },
            detail: {
                TIPO_REGISTRO: 1, CODIGO_CLIENTE: 25, DADOS_BANCARIOS: 18,
                DATA_VENCIMENTO: 8, VALOR_DEBITO: 15, COD_MOEDA: 2,
                BRANCOS: 79, COD_OCORRENCIA: 1
            },
            trailer: {
                TIPO_REGISTRO: 1, TOTAL_REGISTROS: 6, SOMA_VALORES: 18, BRANCOS: 125
            }
        };

        try {
            // --- DADOS FIXOS DA EMPRESA E ARQUIVO ---
            const empresa = {
                codigoConvenio: '00330043002501218126',
                nome: 'CRECHE BERCARIO NANA',
                banco: '033',
                nomeBanco: 'BANCO SANTANDER',
            };
            const nsa = '00077504';
            const idSistema = 'G4DB160609';

            // --- FUNÇÃO PARA MONTAR UMA LINHA COM PRECISÃO ---
            const buildLine = (type, data) => {
                let line = '';
                for (const field in layout[type]) {
                    const size = layout[type][field];
                    const value = data[field] || '';

                    // Regra de formatação corrigida e específica
                    if (['CODIGO_CLIENTE', 'DADOS_BANCARIOS'].includes(field)) {
                        // Estes campos são sempre texto, mesmo que contenham números
                        line += formatText(value, size);
                    } else if (typeof value === 'number' || !isNaN(value) && String(value).trim() !== '') {
                        // Formata como número se for um número ou uma string numérica
                        line += formatNumber(value, size);
                    } else {
                        // Formata como texto para todos os outros casos (ex: nome, brancos)
                        line += formatText(value, size);
                    }
                }
                return line;
            };

            // --- PREPARAR DADOS E MONTAR LINHAS ---
            const dataGeracao = new Date();
            const dataGeracaoFormatada = formatNumber(dataGeracao.getFullYear(), 4) +
                formatNumber(dataGeracao.getMonth() + 1, 2) +
                formatNumber(dataGeracao.getDate(), 2);

            // Header
            const headerData = {
                TIPO_REGISTRO: 'A', COD_SERVICO: '1', CONVENIO: empresa.codigoConvenio, NOME_EMPRESA: empresa.nome,
                COD_BANCO: empresa.banco, NOME_BANCO: empresa.nomeBanco, DATA_GERACAO: dataGeracaoFormatada, NSA: nsa,
                VERSAO_LAYOUT: 'DEBITO AUTOMATICO', ID_SISTEMA: idSistema
            };
            const headerLine = buildLine('header', headerData);

            // Details
            let detailLines = [];
            let totalValorCobrado = 0;

            cobrancasFiltradas.forEach((cobranca) => {
                // const cliente = clientes.find(cli => cli.id === cobranca.clienteId);
                const cliente = clientes.find(cli => Number(cli.id) === Number(cobranca.clienteId));
                
                if (!cliente) return;
                totalValorCobrado += cobranca.valor;

                const detailData = {
                    TIPO_REGISTRO: 'E',
                    CODIGO_CLIENTE: cliente.codigo,
                    DADOS_BANCARIOS: cliente.contaCorrente,
                    DATA_VENCIMENTO: cobranca.vencimento.replace(/-/g, ''),
                    VALOR_DEBITO: cobranca.valor * 100,
                    COD_MOEDA: '3',
                    BRANCOS: '',
                    COD_OCORRENCIA: '0' // Código de ocorrência padrão
                };
                detailLines.push(buildLine('detail', detailData));
            });

            // Trailer
            const totalRegistros = cobrancasFiltradas.length + 2; // Header + Details + Trailer

            const trailerData = {
                TIPO_REGISTRO: 'Z',
                TOTAL_REGISTROS: totalRegistros,
                SOMA_VALORES: totalValorCobrado * 100,
                BRANCOS: ''
            };
            const trailerLine = buildLine('trailer', trailerData);

            // --- JUNTAR TUDO E GERAR O ARQUIVO FINAL ---
            const finalContent = [headerLine, ...detailLines, trailerLine].join('\n');

            const blob = new Blob([finalContent], { type: 'text/plain;charset=latin1' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `DA${dataGeracaoFormatada}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Erro ao gerar arquivo de remessa:", error);
            alert("Ocorreu um erro ao gerar o arquivo. Verifique o console.");
        }
    };

    // ... (antes do return)

    return (
        <div>
            <h1>Gerenciamento de Cobranças</h1>
            <div className="action-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Filtrar por nome do cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
                <div className="button-group">
                    {!isFormVisible && (
                        <button onClick={() => setIsFormVisible(true)} className="btn-primary">Nova Cobrança</button>
                    )}
                    <button onClick={gerarPDF} className="btn-secondary">Gerar PDF</button>
                    {/* Coloque o botão de Gerar TXT aqui */}
                    <button onClick={gerarTXT} className="btn-tertiary">Gerar TXT</button>
                    <button onClick={handleFinalizarRemessa} className="btn-archive">Limpar Remessa</button>
                </div>

            </div>

            {isFormVisible && (
                <CobrancaForm
                    onSave={handleSave}
                    cobrancaAtual={cobrancaAtual}
                    clientes={clientes} // Passa a lista de clientes para o formulário
                    onCancel={() => { setIsFormVisible(false); setCobrancaAtual(null); }}
                />
            )}

            <CobrancaList
                cobrancas={cobrancasFiltradas}
                clientes={clientes} // Passa a lista de clientes para a tabela
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default CobrancasPage;