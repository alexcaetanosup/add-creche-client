import React, { useState, useEffect, useCallback } from 'react';
import CobrancaList from '../components/CobrancaList.js';
import CobrancaForm from '../components/CobrancaForm.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ArquivosRemessa from '../components/ArquivosRemessa.js';

// Configuração das URLs da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api/clientes`; // Para ClientesPage
// E para CobrancasPage
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
  const [selectedCobrancas, setSelectedCobrancas] = useState(new Set());

  // --- FUNÇÃO PARA BUSCAR DADOS INICIAIS ---
  const fetchData = useCallback(async () => {
    try {
      const [cobrancasRes, clientesRes, configRes] = await Promise.all([
        fetch(API_COBRANCAS_URL),
        fetch(API_CLIENTES_URL),
        fetch(API_CONFIG_URL),
        fetch(API_URL)
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

    // --- INÍCIO DA MUDANÇA ---

    // 1. Cria o payload base com os tipos de dados corretos.
    const payload = {
      ...cobranca,
      clienteId: Number(cobranca.clienteId),
      valor: Number(cobranca.valor)
    };

    // 2. Garante que o statusRemessa exista.
    // Se for uma nova cobrança, define como 'pendente'.
    // Se for uma edição, mantém o valor que já veio em 'cobranca'.
    if (!payload.statusRemessa) {
      payload.statusRemessa = 'pendente';
    }

    // 3. Remove o ID se for uma operação de POST (criação).
    if (!cobranca.id) {
      delete payload.id;
    }

    // --- FIM DA MUDANÇA ---

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Tenta ler o erro como JSON, se falhar, usa o texto.
        let errorMsg = 'Falha ao salvar cobrança.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }

      fetchData();
      setIsFormVisible(false);
      setCobrancaAtual(null);

    } catch (error) {
      console.error("Erro ao salvar cobrança:", error);
      alert(`Ocorreu um erro: ${error.message}`);
    }
  };

  const handleSelectCobranca = (cobrancaId) => {
    setSelectedCobrancas(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(cobrancaId)) {
        newSelected.delete(cobrancaId);
      } else {
        newSelected.add(cobrancaId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    // Se todos já estão selecionados, limpa a seleção.
    // Senão, seleciona todos da lista filtrada atual.
    if (selectedCobrancas.size === cobrancasFiltradas.length) {
      setSelectedCobrancas(new Set());
    } else {
      const allIds = new Set(cobrancasFiltradas.map(c => c.id));
      setSelectedCobrancas(allIds);
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

  // --- FUNÇÕES DE REMESSA (CORRIGIDAS) ---

  // Cole esta função completa dentro do seu componente CobrancasPage.js

  const handleFinalizarRemessa = async () => {
    // --- NOVA LÓGICA: PEGAR APENAS AS COBRANÇAS SELECIONADAS ---
    // Filtra a lista principal de cobranças para encontrar os objetos completos correspondentes aos IDs selecionados.
    const cobrancasParaFinalizar = cobrancas.filter(c => selectedCobrancas.has(c.id));

    // --- VALIDAÇÃO INICIAL ---
    if (cobrancasParaFinalizar.length === 0) {
      alert("Nenhuma cobrança selecionada para finalizar e arquivar.");
      return;
    }

    // --- CÁLCULO DO NOME DO ARQUIVO DE ARQUIVAMENTO ---
    const hoje = new Date();
    // Pega o mês atual para o nome do arquivo, pois a remessa é do mês corrente.
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ano = mesAtual.getFullYear();
    const mes = String(mesAtual.getMonth() + 1).padStart(2, '0');
    const nomeArquivo = `${ano}_${mes}`;

    // --- CONFIRMAÇÃO DO USUÁRIO ---
    const confirmacao = window.confirm(
      `Você confirma o arquivamento de ${cobrancasParaFinalizar.length} cobrança(s) selecionada(s)?\n\n` +
      `Elas serão removidas da lista de pendentes e salvas no histórico "remessa_${nomeArquivo}.json".`
    );

    if (confirmacao) {
      try {
        // --- REQUISIÇÃO PARA A API DE ARQUIVAMENTO ---
        const response = await fetch(`${API_BASE_URL}/api/arquivar-remessa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cobrancasParaArquivar: cobrancasParaFinalizar, // <-- USA A LISTA CORRETA
            mesAno: nomeArquivo
          }),
        });

        if (!response.ok) {
          // Tenta ler a mensagem de erro do servidor
          let errorMsg = 'Falha ao arquivar a remessa.';
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) {
            // A resposta de erro pode não ser JSON
          }
          throw new Error(errorMsg);
        }

        alert("Remessa finalizada e arquivada com sucesso!");

        // Limpa a seleção e recarrega os dados para atualizar a tela
        setSelectedCobrancas(new Set());
        fetchData();

      } catch (error) {
        console.error("Erro ao finalizar e arquivar remessa:", error);
        alert(`Ocorreu um erro: ${error.message}`);
      }
    }
  };
  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Cobranças Pendentes", 14, 16);
    autoTable(doc, {
      head: [['Cliente', 'Descrição', 'Valor', 'Vencimento', 'Status']],
      body: cobrancasFiltradas.map(c => {
        const cliente = clientes.find(cli => Number(cli.id) === Number(c.clienteId));
        return [
          cliente ? cliente.nome : 'N/A',
          c.descricao,
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valor),
          new Date(c.vencimento + 'T00:00:00').toLocaleDateString('pt-BR'),
          c.status
        ];
      }),
      startY: 20,
    });
    doc.save('relatorio_cobrancas.pdf');
  };

  // Cole esta função completa dentro do seu componente CobrancasPage.js

  const gerarTXT = async () => {
    // --- NOVA LÓGICA: PEGAR APENAS AS COBRANÇAS SELECIONADAS ---
    // Filtra a lista principal de cobranças para encontrar os objetos completos correspondentes aos IDs selecionados.
    const cobrancasParaProcessar = cobrancas.filter(c => selectedCobrancas.has(c.id));

    // --- VALIDAÇÃO INICIAL ---
    if (cobrancasParaProcessar.length === 0) {
      alert("Nenhuma cobrança selecionada para gerar a remessa.");
      return;
    }
    if (!config || typeof config.ultimoNsaSequencial === 'undefined') {
      alert("Erro: Configurações do sistema (NSA) não carregadas. Tente recarregar a página.");
      return;
    }

    // --- GERENCIAMENTO E CONFIRMAÇÃO DO NSA ---
    const novoNsaSequencial = config.ultimoNsaSequencial + 1;
    const confirmacao = window.confirm(
      `Será gerado um arquivo de remessa com ${cobrancasParaProcessar.length} cobrança(s) selecionada(s).\n` +
      `O novo NSA será: ${novoNsaSequencial}\n\n` +
      `Confirmar a geração?`
    );
    if (!confirmacao) return;

    // --- INÍCIO DA LÓGICA DE GERAÇÃO DO ARQUIVO ---
    let finalContent = '';
    try {
      // --- FUNÇÕES, LAYOUT E DADOS FIXOS ---
      const formatText = (text = '', length) => String(text).substring(0, length).padEnd(length, ' ');
      const formatNumber = (num = 0, length) => String(num).replace(/[^0-9]/g, '').padStart(length, '0');

      const layout = {
        header: {
          TIPO_REGISTRO: 1, COD_SERVICO: 1, CONVENIO: 20, NOME_EMPRESA: 20,
          COD_BANCO: 3, NOME_BANCO: 20, DATA_GERACAO: 8, NSA: 8,
          VERSAO_LAYOUT: 40, ID_SISTEMA: 29
        },
        detail: {
          TIPO_REGISTRO: 1, CODIGO_CLIENTE: 25, DADOS_BANCARIOS: 20,
          DATA_VENCIMENTO: 8, VALOR_DEBITO: 15, COD_MOEDA: 1,
          BRANCOS: 79, COD_OCORRENCIA: 1
        },
        trailer: {
          TIPO_REGISTRO: 1, TOTAL_REGISTROS: 6, SOMA_VALORES: 18, BRANCOS: 125
        }
      };

      const empresa = {
        codigoConvenio: '00330043002501218126',
        nome: 'CRECHE BERCARIO NANA',
        banco: '033',
        nomeBanco: 'BANCO SANTANDER',
      };
      const idSistema = 'G4DB160609';

      const buildLine = (type, data) => {
        let line = '';
        for (const field in layout[type]) {
          const size = layout[type][field];
          const value = data[field] || '';
          if (['CODIGO_CLIENTE', 'DADOS_BANCARIOS'].includes(field)) {
            line += formatText(value, size);
          } else if (typeof value === 'number' || !isNaN(value) && String(value).trim() !== '') {
            line += formatNumber(value, size);
          } else {
            line += formatText(value, size);
          }
        }
        return line;
      };

      const dataGeracao = new Date();
      const dataGeracaoFormatada = formatNumber(dataGeracao.getFullYear(), 4) +
        formatNumber(dataGeracao.getMonth() + 1, 2) +
        formatNumber(dataGeracao.getDate(), 2);

      const parteFixa = config.parteFixaNsa || '04';
      const nsaCompleto = `${String(novoNsaSequencial).padStart(6, '0')}${parteFixa}`;

      // Montar Header
      const headerData = {
        TIPO_REGISTRO: 'A', COD_SERVICO: '1', CONVENIO: empresa.codigoConvenio, NOME_EMPRESA: empresa.nome,
        COD_BANCO: empresa.banco, NOME_BANCO: empresa.nomeBanco, DATA_GERACAO: dataGeracaoFormatada, NSA: nsaCompleto,
        VERSAO_LAYOUT: 'DEBITO AUTOMATICO', ID_SISTEMA: idSistema
      };
      const headerLine = buildLine('header', headerData);

      // Montar Details (usando a lista de cobranças selecionadas)
      let detailLines = [];
      let totalValorCobrado = 0;

      cobrancasParaProcessar.forEach((cobranca) => {
        const cliente = clientes.find(cli => Number(cli.id) === Number(cobranca.clienteId));
        if (!cliente) return;
        totalValorCobrado += cobranca.valor;
        const detailData = {
          TIPO_REGISTRO: 'E', CODIGO_CLIENTE: cliente.codigo, DADOS_BANCARIOS: cliente.contaCorrente,
          DATA_VENCIMENTO: cobranca.vencimento.replace(/-/g, ''), VALOR_DEBITO: cobranca.valor * 100,
          COD_MOEDA: '3', BRANCOS: '', COD_OCORRENCIA: '0'
        };
        detailLines.push(buildLine('detail', detailData));
      });

      // Montar Trailer
      const totalRegistros = cobrancasParaProcessar.length + 2; // Usa o tamanho da lista selecionada
      const trailerData = {
        TIPO_REGISTRO: 'Z', TOTAL_REGISTROS: totalRegistros, SOMA_VALORES: totalValorCobrado * 100, BRANCOS: ''
      };
      const trailerLine = buildLine('trailer', trailerData);

      finalContent = [headerLine, ...detailLines, trailerLine].join('\n');

      // --- DOWNLOAD DO ARQUIVO ---
      const blob = new Blob([finalContent], { type: 'text/plain;charset=latin1' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `REMESSA_NSA_${novoNsaSequencial}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Erro na montagem do arquivo TXT:", error);
      alert("Falha ao montar o arquivo de remessa. A operação foi cancelada.");
      return;
    }

    // --- ATUALIZAÇÃO DO NSA (executa apenas se a geração acima for bem-sucedida) ---
    try {
      const updatedConfigPayload = { ...config, ultimoNsaSequencial: novoNsaSequencial };
      const configUpdateUrl = `${API_CONFIG_URL}/${config.id}`;
      const updateResponse = await fetch(configUpdateUrl, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedConfigPayload)
      });
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Falha ao atualizar NSA no servidor.');
      }
      setConfig(updatedConfigPayload);
      alert(`Arquivo de remessa com NSA ${novoNsaSequencial} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar NSA:", error);
      alert(`ERRO CRÍTICO: O arquivo TXT foi gerado, mas não foi possível salvar o novo NSA (${novoNsaSequencial}). Anote este número para controle manual!`);
    }
  };

  // --- RENDERIZAÇÃO DO COMPONENTE ---
  return (
    <div>
      <h1>Gerenciamento de Cobranças</h1>
      <div className="action-bar">
        <div className="search-bar">
          <input
            type="text"
            id="filtro-cobranca"
            name="filtro-cobranca"
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
        // Novas props adicionadas
        selectedCobrancas={selectedCobrancas}
        onSelectCobranca={handleSelectCobranca}
        onSelectAll={handleSelectAll}
        isAllSelected={cobrancasFiltradas.length > 0 && selectedCobrancas.size === cobrancasFiltradas.length}
      />
      <hr style={{ margin: '40px 0' }} />
      <ArquivosRemessa apiBaseUrl={API_BASE_URL} />
    </div>
  );
};

export default CobrancasPage;