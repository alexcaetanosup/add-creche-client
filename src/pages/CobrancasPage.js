import React, { useState, useEffect, useCallback } from 'react';
import CobrancaList from '../components/CobrancaList';
import CobrancaForm from '../components/CobrancaForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configuração das URLs da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_CLIENTES_URL = `${API_BASE_URL}/api/clientes`;
const API_COBRANCAS_URL = `${API_BASE_URL}/api/cobrancas`;
const API_CONFIG_URL = `${API_BASE_URL}/api/config`;


const CobrancasPage = () => {
  // --- ESTADOS DO COMPONENTE ---
  const [cobrancas, setCobrancas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [config, setConfig] = useState(null);
  const [cobrancaAtual, setCobrancaAtual] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  // --- FUNÇÃO PARA BUSCAR DADOS INICIAIS ---
  const fetchData = useCallback(async () => {
    try {
      const [cobrancasRes, clientesRes, configRes] = await Promise.all([
        fetch(API_COBRANCAS_URL),
        fetch(API_CLIENTES_URL),
        fetch(API_CONFIG_URL)
      ]);
      const cobrancasData = await cobrancasRes.json();
      const clientesData = await clientesRes.json();
      const configData = await configRes.json();
      setCobrancas(cobrancasData);
      setClientes(clientesData);
      setConfig(configData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LÓGICA DE FILTRAGEM (CORRIGIDA) ---
  const cobrancasFiltradas = cobrancas.filter(c => {
    const remessaPendente = c.statusRemessa === 'pendente';
    if (!remessaPendente) return false;

    const cliente = clientes.find(cli => Number(cli.id) === Number(c.clienteId));
    if (!cliente) return false;

    const filtroAtivo = filtro.trim().toLowerCase();
    return filtroAtivo === '' || cliente.nome.toLowerCase().includes(filtroAtivo);
  });

  // --- FUNÇÕES DE CRUD (handleSave, handleDelete, etc.) ---

  const handleSave = async (cobranca) => {
    if (!cobranca.clienteId) {
      alert("ERRO: Por favor, selecione um cliente.");
      return;
    }

    const method = cobranca.id ? 'PUT' : 'POST';
    const url = cobranca.id ? `${API_COBRANCAS_URL}/${cobranca.id}` : API_COBRANCAS_URL;

    const payload = {
      ...cobranca,
      clienteId: Number(cobranca.clienteId),
      valor: Number(cobranca.valor)
    };

    if (!cobranca.id) {
      payload.statusRemessa = 'pendente';
      delete payload.id;
    }

    try {
      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Falha ao salvar cobrança.');
      fetchData();
      setIsFormVisible(false);
      setCobrancaAtual(null);
    } catch (error) {
      console.error("Erro ao salvar cobrança:", error);
      alert(error.message);
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

  // --- FUNÇÕES DE REMESSA ---

  const handleFinalizarRemessa = async () => {
    if (cobrancasFiltradas.length === 0) {
      alert("Não há cobranças pendentes para finalizar.");
      return;
    }
    const hoje = new Date();
    const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const nomeArquivo = `${mesAnterior.getFullYear()}_${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`;

    if (window.confirm(`Confirma o arquivamento de ${cobrancasFiltradas.length} cobrança(s) para "remessa_${nomeArquivo}.json"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/arquivar-remessa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cobrancasParaArquivar: cobrancasFiltradas, mesAno: nomeArquivo }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao arquivar a remessa.');
        }
        alert("Remessa finalizada e arquivada com sucesso!");
        fetchData();
      } catch (error) {
        console.error("Erro ao finalizar e arquivar remessa:", error);
        alert(`Ocorreu um erro: ${error.message}`);
      }
    }
  };

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

  // --- RENDERIZAÇÃO DO COMPONENTE ---
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
          <button onClick={gerarTXT} className="btn-tertiary">Gerar TXT</button>
          <button onClick={handleFinalizarRemessa} className="btn-archive">Finalizar Remessa</button>
        </div>
      </div>
      {isFormVisible && (
        <CobrancaForm
          onSave={handleSave}
          cobrancaAtual={cobrancaAtual}
          clientes={clientes}
          onCancel={() => { setIsFormVisible(false); setCobrancaAtual(null); }}
        />
      )}
      <CobrancaList
        cobrancas={cobrancasFiltradas}
        clientes={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CobrancasPage;
