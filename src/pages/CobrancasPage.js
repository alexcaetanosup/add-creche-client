import React, { useState, useEffect, useCallback } from "react";
import CobrancaList from "../components/cobrancalist/CobrancaList";
import CobrancaForm from "../components/cobrancaform/CobrancaForm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_COBRANCAS_URL = "http://localhost:3001/cobrancas";
const API_CLIENTES_URL = "http://localhost:3001/clientes";
const API_CONFIG_URL = "http://localhost:3001/config";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const CobrancasPage = () => {
  const [cobrancas, setCobrancas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [config, setConfig] = useState(null); // <-- NOVO ESTADO PARA A CONFIG
  const [cobrancaAtual, setCobrancaAtual] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedCobrancas, setSelectedCobrancas] = useState(new Set()); // <-- NOVO ESTADO

  const fetchData = useCallback(async () => {
    try {
      const [cobrancasRes, clientesRes, configRes] = await Promise.all([
        fetch(API_COBRANCAS_URL),
        fetch(API_CLIENTES_URL),
        fetch(API_CONFIG_URL), // <-- BUSCA A CONFIGURAÇÃO
      ]);
      const cobrancasData = await cobrancasRes.json();
      const clientesData = await clientesRes.json();
      const configData = await configRes.json(); // <-- ARMAZENA A CONFIGURAÇÃO
      setCobrancas(cobrancasData);
      setClientes(clientesData);
      if (configData && configData.length > 0) {
        setConfig(configData[0]);
      }
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
    if (!cobranca.clienteId || cobranca.clienteId === "") {
      console.error(
        "Tentativa de salvar cobrança sem clienteId. Operação cancelada.",
        cobranca
      );
      alert(
        "ERRO: A cobrança não pode ser salva sem um cliente. Por favor, tente novamente."
      );
      return; // Interrompe a execução da função
    }

    const method = cobranca.id ? "PUT" : "POST";
    const url = cobranca.id
      ? `${API_COBRANCAS_URL}/${cobranca.id}`
      : API_COBRANCAS_URL;

    // 2. Preparação do Payload: Garante que os tipos estão corretos
    const payload = {
      ...cobranca,
      clienteId: Number(cobranca.clienteId), // Converte para Número
      valor: Number(cobranca.valor), // Converte para Número
    };

    // Se for um novo registro, o 'id' pode ser undefined ou null. O json-server cria o id.
    // Se for uma edição, o 'id' já existe no payload.
    // if (!payload.id) {
    //     delete payload.id;
    // }

    if (!cobranca.id) {
      // Se for um novo registro, define o status da remessa como pendente
      payload.statusRemessa = "pendente";
      delete payload.id;
    }

    // 3. Log para Depuração: Vamos ver exatamente o que está sendo enviado
    console.log("Enviando para a API:", { url, method, payload });

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Salvo com sucesso!");
        fetchData();
        setIsFormVisible(false);
        setCobrancaAtual(null);
      } else {
        const errorText = await response.text();
        console.error(
          "Erro ao salvar cobrança. Status:",
          response.status,
          "Resposta do servidor:",
          errorText
        );
        alert("Ocorreu um erro no servidor ao salvar a cobrança.");
      }
    } catch (error) {
      console.error("Erro de rede ao salvar cobrança:", error);
      alert("Não foi possível conectar ao servidor para salvar a cobrança.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar esta cobrança?")) {
      try {
        await fetch(`${API_COBRANCAS_URL}/${id}`, { method: "DELETE" });
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

  // Em src/pages/CobrancasPage.js

  // Em src/pages/CobrancasPage.js

  const handleFinalizarRemessa = async () => {
    // A função getCobrancasParaProcessar() não existe no código fornecido,
    // então vamos usar cobrancasFiltradas que já contém as cobranças pendentes.
    const cobrancasParaFinalizar = cobrancasFiltradas;

    if (cobrancasParaFinalizar.length === 0) {
      alert("Não há cobranças pendentes para finalizar.");
      return;
    }

    // Determina o nome do arquivo do mês anterior
    const hoje = new Date();
    const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const ano = mesAnterior.getFullYear();
    const mes = String(mesAnterior.getMonth() + 1).padStart(2, '0');
    const nomeArquivo = `${ano}_${mes}`;

    const confirmacao = window.confirm(
      `Você confirma o arquivamento de ${cobrancasParaFinalizar.length} cobrança(s)?\n\n` +
      `Elas serão movidas do banco de dados principal para um arquivo de histórico chamado "remessa_${nomeArquivo}.json" e não poderão ser editadas por esta interface.`
    );

    if (confirmacao) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/arquivar-remessa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cobrancasParaArquivar: cobrancasParaFinalizar,
            mesAno: nomeArquivo
          }),
        });

        if (!response.ok) {
          // Se a resposta não for OK, lança um erro com a mensagem do servidor
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao arquivar a remessa.');
        }

        alert("Remessa finalizada e arquivada com sucesso!");
        fetchData(); // Recarrega os dados para atualizar a tela, que agora estará vazia.

      } catch (error) {
        console.error("Erro ao finalizar e arquivar remessa:", error);
        // Verifica se o erro foi por causa de um JSON inválido
        if (error instanceof SyntaxError) {
          alert("Ocorreu um erro de comunicação com o servidor. A resposta não era um JSON válido.");
        } else {
          alert(`Ocorreu um erro: ${error.message}`);
        }
      }
    }
  };

  const handleSelectCobranca = (cobrancaId) => {
    setSelectedCobrancas((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(cobrancaId)) {
        newSelected.delete(cobrancaId); // Desmarca se já estiver marcado
      } else {
        newSelected.add(cobrancaId); // Marca se não estiver marcado
      }
      return newSelected;
    });
  };

  // Dentro de src/pages/CobrancasPage.js

  const cobrancasFiltradas = cobrancas.filter(c => {
    // Primeira condição: a cobrança DEVE ser pendente de remessa.
    const remessaPendente = c.statusRemessa === 'pendente';
    if (!remessaPendente) {
      return false;
    }

    // Segunda condição: a cobrança DEVE ter um cliente associado.
    const cliente = clientes.find(cli => Number(cli.id) === Number(c.clienteId));
    if (!cliente) {
      return false;
    }

    // Se passou pelas condições acima, agora aplicamos o filtro de texto.
    // A cobrança será incluída se o filtro estiver vazio OU se o nome do cliente corresponder.
    const filtroAtivo = filtro.trim().toLowerCase();
    if (filtroAtivo === '') {
      return true; // Filtro vazio, inclui a cobrança
    } else {
      return cliente.nome.toLowerCase().includes(filtroAtivo); // Filtro ativo, verifica o nome
    }
  });

  // Sua função gerarPDF e gerarTXT podem ser copiadas para cá, com uma pequena modificação
  // Dentro de src/pages/CobrancasPage.js

  const gerarPDF = () => {
    const cobrancasParaGerar = getCobrancasParaProcessar();

    if (cobrancasParaGerar.length === 0) {
      alert("Não há cobranças selecionadas ou pendentes para gerar o PDF.");
      return;
    }

    const doc = new jsPDF();

    // 1. Título do Relatório
    doc.setFontSize(18);
    doc.text("Relatório de Cobranças", 14, 22);

    // 2. Preparar dados para a tabela
    const tableColumn = ["Cliente", "Descrição", "Valor", "Vencimento", "Status"];
    const tableRows = [];

    cobrancasParaGerar.forEach(cobranca => {
      const cliente = clientes.find(cli => Number(cli.id) === Number(cobranca.clienteId));
      const cobrancaData = [
        cliente ? cliente.nome : 'N/A',
        cobranca.descricao,
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cobranca.valor),
        new Date(cobranca.vencimento + 'T00:00:00').toLocaleDateString('pt-BR'),
        cobranca.status
      ];
      tableRows.push(cobrancaData);
    });

    // 3. Desenhar a tabela com ESTILOS DE COLUNA
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      // --- A MÁGICA ACONTECE AQUI ---
      columnStyles: {
        2: { halign: 'right' } // A coluna 'Valor' é a de índice 2 (0: Cliente, 1: Descrição, 2: Valor)
      }
    });

    // 4. Adicionar os Totais
    const totalCobrancas = cobrancasParaGerar.length;
    const valorTotal = cobrancasParaGerar.reduce((sum, c) => sum + c.valor, 0);
    const valorTotalFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal);

    const finalY = doc.lastAutoTable.finalY;

    doc.setFontSize(10);
    // Para alinhar o valor total à direita, precisamos saber a largura da página
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.text(`Total de Cobranças: ${totalCobrancas}`, 14, finalY + 10);
    // Usamos a opção de alinhamento do doc.text para o valor total
    doc.text(`Valor Total: ${valorTotalFormatado}`, pageWidth - 14, finalY + 10, { align: 'right' });


    // 5. Salvar o arquivo
    doc.save('relatorio_cobrancas.pdf');
  };

  // Dentro do componente CobrancasPage, antes da função gerarTXT

  const getCobrancasParaProcessar = () => {
    if (selectedCobrancas.size > 0) {
      // Se há itens selecionados, filtra a lista original de cobranças
      // Isso garante que peguemos todas as cobranças selecionadas, mesmo que não correspondam ao filtro de texto atual
      return cobrancas.filter(c => selectedCobrancas.has(c.id));
    }
    // Senão, usa a lista já filtrada da tela
    return cobrancasFiltradas;
  };

  // Dentro de src/pages/CobrancasPage.js

  const gerarTXT = async () => {
    const cobrancasParaGerar = getCobrancasParaProcessar();

    // --- VALIDAÇÃO INICIAL ---
    if (cobrancasParaGerar.length === 0) {
      alert("Não há cobranças selecionadas ou pendentes para gerar a remessa.");
      return;
    }
    if (!config || typeof config.ultimoNsaSequencial === 'undefined') {
      alert("Erro: Configurações do sistema (NSA) não carregadas. Tente recarregar a página.");
      return;
    }

    // --- GERENCIAMENTO DO NSA ---
    const novoNsaSequencial = config.ultimoNsaSequencial + 1;
    const parteFixa = config.parteFixaNsa || '04';
    const nsaCompleto = `${String(novoNsaSequencial).padStart(6, '0')}${parteFixa}`;

    const confirmacao = window.confirm(
      `Gerar remessa para ${cobrancasParaGerar.length} cobrança(s).\n` +
      `Remessa Anterior (NSA): ${config.ultimoNsaSequencial}\n` +
      `Nova Remessa (NSA): ${novoNsaSequencial}\n\n` +
      `Confirmar a geração do arquivo?`
    );

    if (!confirmacao) return;

    let finalContent = '';

    try {
      const formatText = (text = '', length) => String(text).substring(0, length).padEnd(length, ' ');
      const formatNumber = (num = 0, length) => String(num).replace(/[^0-9]/g, '').padStart(length, '0');

      const layout = {
        header: { TIPO_REGISTRO: 1, COD_SERVICO: 1, CONVENIO: 20, NOME_EMPRESA: 20, COD_BANCO: 3, NOME_BANCO: 20, DATA_GERACAO: 8, NSA: 8, VERSAO_LAYOUT: 59, ID_SISTEMA: 29 },
        detail: { TIPO_REGISTRO: 1, CODIGO_CLIENTE: 25, DADOS_BANCARIOS: 20, DATA_VENCIMENTO: 8, VALOR_DEBITO: 15, COD_MOEDA: 1, BRANCOS: 79, COD_OCORRENCIA: 1 },
        trailer: { TIPO_REGISTRO: 1, TOTAL_REGISTROS: 6, SOMA_VALORES: 18, BRANCOS: 125 }
      };

      const empresa = { codigoConvenio: '00330043002501218126', nome: 'CRECHE BERCARIO NANA', banco: '033', nomeBanco: 'BANCO SANTANDER' };
      const idSistema = 'G4DB160609';

      const buildLine = (type, data) => {
        let line = '';
        for (const field in layout[type]) {
          const size = layout[type][field];
          const value = data[field] || '';
          if (['CODIGO_CLIENTE', 'DADOS_BANCARIOS'].includes(field)) { line += formatText(value, size); }
          else if (typeof value === 'number' || !isNaN(value) && String(value).trim() !== '') { line += formatNumber(value, size); }
          else { line += formatText(value, size); }
        }
        return line;
      };

      const dataGeracao = new Date();
      const dataGeracaoFormatada = formatNumber(dataGeracao.getFullYear(), 4) + formatNumber(dataGeracao.getMonth() + 1, 2) + formatNumber(dataGeracao.getDate(), 2);

      const headerData = { TIPO_REGISTRO: 'A', COD_SERVICO: '1', CONVENIO: empresa.codigoConvenio, NOME_EMPRESA: empresa.nome, COD_BANCO: empresa.banco, NOME_BANCO: empresa.nomeBanco, DATA_GERACAO: dataGeracaoFormatada, NSA: nsaCompleto, VERSAO_LAYOUT: 'DEBITO AUTOMATICO', ID_SISTEMA: idSistema };
      const headerLine = buildLine('header', headerData);

      let detailLines = [];
      let totalValorCobrado = 0;

      cobrancasParaGerar.forEach((cobranca) => {
        const cliente = clientes.find(cli => Number(cli.id) === Number(cobranca.clienteId));
        if (!cliente) return;
        totalValorCobrado += cobranca.valor;
        const detailData = { TIPO_REGISTRO: 'E', CODIGO_CLIENTE: cliente.codigo, DADOS_BANCARIOS: cliente.contaCorrente, DATA_VENCIMENTO: cobranca.vencimento.replace(/-/g, ''), VALOR_DEBITO: cobranca.valor * 100, COD_MOEDA: '3', BRANCOS: '', COD_OCORRENCIA: '0' };
        detailLines.push(buildLine('detail', detailData));
      });

      const totalRegistros = cobrancasParaGerar.length + 2;
      const trailerData = { TIPO_REGISTRO: 'Z', TOTAL_REGISTROS: totalRegistros, SOMA_VALORES: totalValorCobrado * 100, BRANCOS: '' };
      const trailerLine = buildLine('trailer', trailerData);

      finalContent = [headerLine, ...detailLines, trailerLine].join('\n');

      const blob = new Blob([finalContent], { type: 'text/plain;charset=latin1' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `REMESSA_NSA_${novoNsaSequencial}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Arquivo TXT gerado e download iniciado.");

    } catch (error) {
      console.error("Erro CRÍTICO na montagem ou download do arquivo TXT:", error);
      alert("Falha ao gerar o arquivo TXT. A operação foi cancelada e o NSA não será atualizado.");
      return;
    }

    try {
      const updatedConfigPayload = { ...config, ultimoNsaSequencial: novoNsaSequencial };
      const configUpdateUrl = `${API_CONFIG_URL}/${config.id}`;

      const updateResponse = await fetch(configUpdateUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedConfigPayload) });

      if (!updateResponse.ok) {
        const errorBody = await updateResponse.text();
        throw new Error(`Falha ao atualizar NSA. Servidor respondeu com status ${updateResponse.status}: ${errorBody}`);
      }

      console.log("NSA atualizado com sucesso no servidor.");
      setConfig(updatedConfigPayload);
      alert(`Arquivo de remessa com NSA ${novoNsaSequencial} gerado com sucesso! O NSA foi atualizado.`);

    } catch (error) {
      console.error("Erro ao ATUALIZAR o NSA no servidor:", error);
      alert(`ERRO CRÍTICO: O arquivo TXT foi gerado, mas não foi possível salvar o novo NSA (${novoNsaSequencial}). Anote este número para evitar duplicidade!`);
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
            <button
              onClick={() => setIsFormVisible(true)}
              className="btn-primary"
            >
              Nova Cobrança
            </button>
          )}
          <button onClick={gerarPDF} className="btn-secondary">
            Gerar PDF
          </button>
          {/* Coloque o botão de Gerar TXT aqui */}
          <button onClick={gerarTXT} className="btn-tertiary">
            Gerar TXT
          </button>
          <button onClick={handleFinalizarRemessa} className="btn-archive">
            Limpar Remessa
          </button>
        </div>
      </div>

      {isFormVisible && (
        <CobrancaForm
          onSave={handleSave}
          cobrancaAtual={cobrancaAtual}
          clientes={clientes} // Passa a lista de clientes para o formulário
          onCancel={() => {
            setIsFormVisible(false);
            setCobrancaAtual(null);
          }}
        />
      )}

      <CobrancaList
        cobrancas={cobrancasFiltradas}
        clientes={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selectedCobrancas={selectedCobrancas} // <-- NOVA PROP
        onSelectCobranca={handleSelectCobranca} // <-- NOVA PROP
      />
    </div>
  );
};

export default CobrancasPage;
