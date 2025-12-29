import React, {useState, useEffect, useCallback, useMemo} from 'react';
import CobrancaList from '../components/CobrancaList.js';
import CobrancaForm from '../components/CobrancaForm.js';
// import ArquivosRemessa from '../components/ArquivosRemessa.js'; // Removido por não ser utilizado
import RetornoUploader from '../components/RetornoUploader.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configuração das URLs da API
// Corrigido para a porta 3001, conforme os erros de log
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_CLIENTES_URL = `${API_BASE_URL}/api/clientes`;
const API_COBRANCAS_URL = `${API_BASE_URL}/api/cobrancas`;
const API_CONFIG_URL = `${API_BASE_URL}/api/config`;

const CobrancasPage = ({clientePreSelecionado}) => {
  // --- ESTADOS DO COMPONENTE ---
  const [cobrancas, setCobrancas] = useState ([]);
  const [clientes, setClientes] = useState ([]);
  const [config, setConfig] = useState (null);
  const [cobrancaAtual, setCobrancaAtual] = useState (null);
  const [filtro, setFiltro] = useState ('');
  const [isFormVisible, setIsFormVisible] = useState (false);
  const [isLoading, setIsLoading] = useState (true);
  const [selectedCobrancas, setSelectedCobrancas] = useState (new Set ());

  // --- FUNÇÃO PARA BUSCAR DADOS INICIAIS ---
  const fetchData = useCallback (async () => {
    setIsLoading (true);
    try {
      const responses = await Promise.all ([
        fetch (API_COBRANCAS_URL),
        fetch (API_CLIENTES_URL),
        fetch (API_CONFIG_URL),
      ]);
      // A linha 43 (onde o erro 500 aparecia) estava dentro do loop de verificação .ok
      for (const res of responses) {
        // Se a resposta for 500, o código aqui lança o erro, mas o .json() não é chamado
        if (!res.ok)
          throw new Error (
            `Falha na API: ${res.url} respondeu com status ${res.status}`
          );
      }

      const [cobrancasData, clientesData, configData] = await Promise.all (
        responses.map (r => r.json ())
      );

      setCobrancas (Array.isArray (cobrancasData) ? cobrancasData : []);
      setClientes (Array.isArray (clientesData) ? clientesData : []);
      setConfig (configData || null);
    } catch (error) {
      console.error ('Erro ao buscar dados:', error);
      alert (
        `Não foi possível carregar os dados. Verifique se o servidor backend está rodando e as tabelas do DB estão corretas. Erro: ${error.message}`
      );
      setCobrancas ([]);
      setClientes ([]);
      setConfig (null);
    } finally {
      setIsLoading (false);
    }
  }, []);

  useEffect (
    () => {
      fetchData ();
    },
    [fetchData]
  );

  // Efeito para abrir o formulário se um cliente foi pré-selecionado
  useEffect (
    () => {
      if (clientePreSelecionado) {
        setIsFormVisible (true);
        setCobrancaAtual (null);
      }
    },
    [clientePreSelecionado]
  );

  // --- LÓGICA DE FILTRAGEM COM useMemo ---
  const cobrancasFiltradas = useMemo (
    () => {
      if (!Array.isArray (clientes) || !Array.isArray (cobrancas)) return [];
      return cobrancas.filter (c => {
        // A condição principal agora é: nsa_remessa deve ser nulo
        if (c.nsa_remessa !== null) return false;

        const cliente = clientes.find (
          cli => Number (cli.id) === Number (c.clienteId)
        );
        if (!cliente) return false;

        const filtroAtivo = filtro.trim ().toLowerCase ();
        return (
          filtroAtivo === '' ||
          cliente.nome.toLowerCase ().includes (filtroAtivo)
        );
      });
    },
    [cobrancas, clientes, filtro]
  );

  // --- FUNÇÕES DE SELEÇÃO ---
  const handleSelectCobranca = cobrancaId => {
    setSelectedCobrancas (prev => {
      const newSelected = new Set (prev);
      if (newSelected.has (cobrancaId)) newSelected.delete (cobrancaId);
      else newSelected.add (cobrancaId);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (
      cobrancasFiltradas.length > 0 &&
      selectedCobrancas.size === cobrancasFiltradas.length
    ) {
      setSelectedCobrancas (new Set ());
    } else {
      setSelectedCobrancas (new Set (cobrancasFiltradas.map (c => c.id)));
    }
  };

  // --- FUNÇÕES DE CRUD ---
  const handleSave = async cobranca => {
    if (!cobranca.clienteId) {
      alert ('ERRO: Por favor, selecione um cliente.');
      return;
    }
    const method = cobranca.id ? 'PUT' : 'POST';
    const url = cobranca.id
      ? `${API_COBRANCAS_URL}/${cobranca.id}`
      : API_COBRANCAS_URL;

    const payload = {
      ...cobranca,
      clienteId: Number (cobranca.clienteId),
      valor: Number (cobranca.valor),
    };
    // Garante que o campo nsa_remessa seja nulo para novas cobranças
    if (!cobranca.id) {
      payload.nsa_remessa = null;
    }
    delete payload.id; // Remove o ID para POST, ou usa o ID já existente para PUT no payload

    try {
      const response = await fetch (url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify (payload),
      });
      if (!response.ok) {
        // Tenta ler o JSON de erro do backend para uma mensagem mais informativa
        try {
          const errorData = await response.json ();
          throw new Error (
            errorData.detail ||
              errorData.message ||
              `Falha ao salvar cobrança (Status: ${response.status}).`
          );
        } catch (e) {
          // Se falhar ao ler JSON, é um erro de servidor puro (500)
          throw new Error (
            `Falha ao salvar cobrança (Status: ${response.status}). Verifique os logs do Backend.`
          );
        }
      }
      fetchData ();
      setIsFormVisible (false);
      setCobrancaAtual (null);
    } catch (error) {
      console.error ('Erro ao salvar cobrança:', error);
      alert (`Ocorreu um erro: ${error.message}`);
    }
  };

  const handleDelete = async id => {
    if (
      window.confirm (
        'Tem certeza que deseja deletar esta cobrança permanentemente?'
      )
    ) {
      try {
        const response = await fetch (`${API_COBRANCAS_URL}/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error ('Falha ao deletar cobrança.');
        fetchData ();
      } catch (error) {
        console.error ('Erro ao deletar cobrança:', error);
        alert (`Ocorreu um erro: ${error.message}`);
      }
    }
  };

  const handleEdit = cobranca => {
    setCobrancaAtual (cobranca);
    setIsFormVisible (true);
  };

  // --- FUNÇÕES DE GERAÇÃO DE RELATÓRIOS E REMESSA ---
  const gerarPDF = () => {
    const cobrancasParaProcessar = cobrancas.filter (c =>
      selectedCobrancas.has (c.id)
    );
    if (cobrancasParaProcessar.length === 0) {
      alert ('Nenhuma cobrança selecionada para gerar o PDF.');
      return;
    }
    const doc = new jsPDF ();
    doc.text ('Relatório de Cobranças Selecionadas', 14, 16);
    autoTable (doc, {
      head: [['Cliente', 'Descrição', 'Valor', 'Vencimento', 'Status']],
      body: cobrancasParaProcessar.map (c => {
        const cliente = clientes.find (
          cli => Number (cli.id) === Number (c.clienteId)
        );
        return [
          cliente ? cliente.nome : 'N/A',
          c.descricao,
          new Intl.NumberFormat ('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format (c.valor),
          new Date (c.vencimento + 'T00:00:00').toLocaleDateString ('pt-BR'),
          c.status,
        ];
      }),
      startY: 20,
    });
    doc.save ('relatorio_cobrancas.pdf');
  };

  const gerarTXT = async () => {
    const cobrancasParaProcessar = cobrancas.filter (c =>
      selectedCobrancas.has (c.id)
    );
    if (cobrancasParaProcessar.length === 0) {
      alert ('Nenhuma cobrança selecionada para gerar a remessa.');
      return;
    }
    // O erro 404/500 foi corrigido no Backend para garantir que 'config' existe
    if (!config || typeof config.ultimoNsaSequencial === 'undefined') {
      alert (
        'Erro: Configurações do sistema (NSA) não carregadas corretamente.'
      );
      return;
    }

    const novoNsaSequencial = config.ultimoNsaSequencial + 1;
    const confirmacao = window.confirm (
      `Gerar remessa com ${cobrancasParaProcessar.length} cobrança(s)?\n` +
        `Novo NSA: ${novoNsaSequencial}\n\n` +
        `Após a geração, estas cobranças serão marcadas como processadas.`
    );
    if (!confirmacao) return;

    // Etapa 1: Geração do Arquivo .TXT (Lógica mantida, pois está correta)
    try {
      const formatText = (text = '', length) =>
        String (text).substring (0, length).padEnd (length, ' ');
      const formatNumber = (num = 0, length) =>
        String (num).replace (/[^0-9]/g, '').padStart (length, '0');
      const layout = {
        header: {
          TIPO_REGISTRO: 1,
          COD_SERVICO: 1,
          CONVENIO: 20,
          NOME_EMPRESA: 20,
          COD_BANCO: 3,
          NOME_BANCO: 20,
          DATA_GERACAO: 8,
          NSA: 8,
          VERSAO_LAYOUT: 59,
          ID_SISTEMA: 29,
        },
        detail: {
          TIPO_REGISTRO: 1,
          CODIGO_CLIENTE: 25,
          DADOS_BANCARIOS: 20,
          DATA_VENCIMENTO: 8,
          VALOR_DEBITO: 15,
          COD_MOEDA: 1,
          BRANCOS: 79,
          COD_OCORRENCIA: 1,
        },
        trailer: {
          TIPO_REGISTRO: 1,
          TOTAL_REGISTROS: 6,
          SOMA_VALORES: 18,
          BRANCOS: 125,
        },
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
          if (['CODIGO_CLIENTE', 'DADOS_BANCARIOS'].includes (field))
            line += formatText (value, size);
          else if (
            typeof value === 'number' ||
            (!isNaN (value) && String (value).trim () !== '')
          )
            line += formatNumber (value, size);
          else line += formatText (value, size);
        }
        return line;
      };

      const dataGeracao = new Date ();
      const dataGeracaoFormatada =
        formatNumber (dataGeracao.getFullYear (), 4) +
        formatNumber (dataGeracao.getMonth () + 1, 2) +
        formatNumber (dataGeracao.getDate (), 2);
      const parteFixa = config.parteFixaNsa || '04';
      const nsaCompleto = `${String (novoNsaSequencial).padStart (6, '0')}${parteFixa}`;

      const headerData = {
        TIPO_REGISTRO: 'A',
        COD_SERVICO: '1',
        CONVENIO: empresa.codigoConvenio,
        NOME_EMPRESA: empresa.nome,
        COD_BANCO: empresa.banco,
        NOME_BANCO: empresa.nomeBanco,
        DATA_GERACAO: dataGeracaoFormatada,
        NSA: nsaCompleto,
        VERSAO_LAYOUT: 'DEBITO AUTOMATICO',
        ID_SISTEMA: idSistema,
      };
      const headerLine = buildLine ('header', headerData);

      let detailLines = [];
      let totalValorCobrado = 0;
      cobrancasParaProcessar.forEach (cobranca => {
        const cliente = clientes.find (
          cli => Number (cli.id) === Number (cobranca.clienteId)
        );
        if (!cliente) return;
        totalValorCobrado += cobranca.valor;
        const detailData = {
          TIPO_REGISTRO: 'E',
          CODIGO_CLIENTE: cliente.codigo,
          DADOS_BANCARIOS: cliente.contaCorrente,
          DATA_VENCIMENTO: cobranca.vencimento.replace (/-/g, ''),
          VALOR_DEBITO: cobranca.valor * 100,
          COD_MOEDA: '3',
          BRANCOS: '',
          COD_OCORRENCIA: '0',
        };
        detailLines.push (buildLine ('detail', detailData));
      });

      const totalRegistros = cobrancasParaProcessar.length + 2;
      const trailerData = {
        TIPO_REGISTRO: 'Z',
        TOTAL_REGISTROS: totalRegistros,
        SOMA_VALORES: totalValorCobrado * 100,
        BRANCOS: '',
      };
      const trailerLine = buildLine ('trailer', trailerData);

      const finalContent = [headerLine, ...detailLines, trailerLine].join (
        '\n'
      );

      const blob = new Blob ([finalContent], {
        type: 'text/plain;charset=latin1',
      });
      const link = document.createElement ('a');
      link.href = URL.createObjectURL (blob);
      link.download = `REMESSA_NSA_${novoNsaSequencial}.REM`;
      document.body.appendChild (link);
      link.click ();
      document.body.removeChild (link);
    } catch (error) {
      console.error ('Erro na montagem do arquivo REM:', error);
      alert ('Falha ao montar o arquivo de remessa. A operação foi cancelada.');
      return;
    }

    // Etapa 2: Marcar cobranças e atualizar NSA (Lógica mantida)
    try {
      const idsParaMarcar = cobrancasParaProcessar.map (c => c.id);
      const marcarResponse = await fetch (
        `${API_BASE_URL}/api/marcar-remessa`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify ({
            idsParaMarcar,
            nsaDaRemessa: novoNsaSequencial,
          }),
        }
      );
      if (!marcarResponse.ok) {
        const errorData = await marcarResponse.json ();
        throw new Error (
          errorData.detail || 'Falha ao marcar as cobranças como processadas.'
        );
      }

      const updatedConfigPayload = {
        ...config,
        ultimoNsaSequencial: novoNsaSequencial,
      };
      const configUpdateUrl = `${API_CONFIG_URL}/${config.id}`;
      const updateNsaResponse = await fetch (configUpdateUrl, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify (updatedConfigPayload),
      });
      if (!updateNsaResponse.ok) {
        const errorData = await updateNsaResponse.json ();
        throw new Error (
          errorData.detail || 'Falha ao atualizar o NSA no servidor.'
        );
      }

      alert (
        `Remessa (NSA ${novoNsaSequencial}) gerada e cobranças marcadas com sucesso!`
      );
      setSelectedCobrancas (new Set ());
      fetchData ();
    } catch (error) {
      console.error ('Erro na etapa de pós-geração:', error);
      alert (
        `ERRO CRÍTICO: O arquivo TXT foi gerado, mas ocorreu um erro ao atualizar os dados no servidor (${error.message}). Anote o NSA ${novoNsaSequencial} e verifique os dados manualmente.`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="App">
        <h1>Gerenciamento de Cobranças</h1>
        <p>Carregando dados do sistema...</p>
      </div>
    );
  }

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
            onChange={e => setFiltro (e.target.value)}
          />
        </div>
        <div className="button-group">
          {!isFormVisible &&
            <button
              onClick={() => {
                setIsFormVisible (true);
                setCobrancaAtual (null);
              }}
              className="btn-primary"
            >
              Nova Cobrança
            </button>}
          <button onClick={gerarPDF} className="btn-secondary">
            Gerar PDF
          </button>
          <button onClick={gerarTXT} className="btn-tertiary">
            Gerar TXT e Marcar
          </button>
        </div>
      </div>

      {isFormVisible &&
        <CobrancaForm
          onSave={handleSave}
          cobrancaAtual={cobrancaAtual}
          clientes={clientes}
          clientePreSelecionado={clientePreSelecionado}
          onCancel={() => {
            setIsFormVisible (false);
            setCobrancaAtual (null);
          }}
        />}

      <CobrancaList
        cobrancas={cobrancasFiltradas}
        clientes={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selectedCobrancas={selectedCobrancas}
        onSelectCobranca={handleSelectCobranca}
        onSelectAll={handleSelectAll}
        isAllSelected={
          cobrancasFiltradas.length > 0 &&
            selectedCobrancas.size === cobrancasFiltradas.length
        }
      />

      <hr style={{margin: '40px 0'}} />
      <RetornoUploader apiBaseUrl={API_BASE_URL} onProcessado={fetchData} />
    </div>
  );
};

export default CobrancasPage;
