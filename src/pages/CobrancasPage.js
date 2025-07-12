import React, { useState, useEffect, useCallback } from 'react';
import CobrancaList from '../components/CobrancaList.js';
import CobrancaForm from '../components/CobrancaForm.js';
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
    const payload = { ...cobranca, clienteId: Number(cobranca.clienteId), valor: Number(cobranca.valor) };
    if (!cobranca.id) {
      payload.statusRemessa = 'pendente';
      delete payload.id;
    }
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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

  // --- FUNÇÕES DE REMESSA (CORRIGIDAS) ---

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

  const gerarTXT = async () => {
    if (!config || cobrancasFiltradas.length === 0) {
      alert("Não há dados de configuração ou cobranças pendentes para gerar a remessa.");
      return;
    }

    const novoNsaSequencial = config.ultimoNsaSequencial + 1;
    const confirmacao = window.confirm(`Confirmar a geração do arquivo com o novo NSA: ${novoNsaSequencial}?`);
    if (!confirmacao) return;

    // ... COLE A SUA LÓGICA COMPLETA E FUNCIONAL DE GERAR O ARQUIVO TXT AQUI ...
    // É importante que esta parte esteja completa.

    // Exemplo da parte final da função:
    try {
      // ... (montagem do arquivo)
      // const finalContent = ...
      // const blob = ...
      // link.click();

      const updatedConfigPayload = { ...config, ultimoNsaSequencial: novoNsaSequencial };
      const configUpdateUrl = `${API_CONFIG_URL}/${config.id}`;
      const updateResponse = await fetch(configUpdateUrl, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedConfigPayload)
      });
      if (!updateResponse.ok) throw new Error('Falha ao atualizar NSA.');

      setConfig(updatedConfigPayload);
      alert(`Arquivo de remessa com NSA ${novoNsaSequencial} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar/atualizar remessa:", error);
      alert(`ERRO: ${error.message}. Anote o NSA ${novoNsaSequencial}.`);
    }
  };

  // --- RENDERIZAÇÃO DO COMPONENTE ---
  return (
    <div>
      <h1>Gerenciamento de Cobranças</h1>
      <div className="action-bar">
        <div className="search-bar">
          <input type="text" placeholder="Filtrar por nome do cliente..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
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