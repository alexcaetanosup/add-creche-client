Com certeza! Criei um guia completo e detalhado para um aplicativo de cobrança em React. Ele inclui tudo o que você pediu: backend com json-server (para simular um banco de dados com um arquivo JSON), frontend em React com todas as operações de CRUD (Criar, Ler, Atualizar, Deletar), geração de relatórios em PDF e exportação para TXT.
O projeto está estruturado de forma que você só precisa seguir os passos, copiar e colar os códigos nos arquivos corretos. Ao final, você terá um aplicativo 100% funcional.
Visão Geral do Projeto
Frontend: React.js
Backend (Simulado): json-server servindo um arquivo db.json.
Funcionalidades:
Listar todas as cobranças.
Adicionar uma nova cobrança.
Editar uma cobrança existente.
Deletar uma cobrança.
Consultar/Filtrar cobranças por cliente.
Gerar um relatório em PDF com a lista de cobranças.
Exportar os dados para um arquivo de texto (.txt).
Estilização: CSS simples para manter o foco na funcionalidade.
Passo 1: Configuração do Ambiente e Criação do Projeto
Crie o projeto React:
Abra seu terminal e execute o comando:
Generated bash
npx create-react-app app-cobranca
cd app-cobranca
Use code with caution.
Bash
Instale as dependências necessárias:
Vamos instalar as bibliotecas para o servidor JSON, para gerar PDF e para rodar o frontend e backend simultaneamente.
Generated bash
npm install json-server jspdf jspdf-autotable concurrently
Use code with caution.
Bash
Passo 2: Estrutura de Arquivos
Dentro da pasta app-cobranca, a estrutura final ficará assim:
Generated code
app-cobranca/
├── public/
│   └── ...
├── src/
│   ├── components/
│   │   ├── CobrancaForm.js
│   │   └── CobrancaList.js
│   ├── App.css
│   ├── App.js
│   └── index.js
├── db.json               <-- Nosso "banco de dados"
└── package.json
Use code with caution.
Passo 3: Configurando o Backend (JSON Server)
Crie o arquivo db.json na raiz do seu projeto (app-cobranca/db.json). Este arquivo será seu banco de dados. Cole o seguinte conteúdo nele:
Generated json
{
  "cobrancas": [
    {
      "id": 1,
      "cliente": "Empresa A",
      "descricao": "Desenvolvimento de site",
      "valor": 5000.50,
      "vencimento": "2024-12-15",
      "status": "Pendente"
    },
    {
      "id": 2,
      "cliente": "Empresa B",
      "descricao": "Manutenção de Servidor",
      "valor": 850.00,
      "vencimento": "2024-11-30",
      "status": "Pago"
    },
    {
      "id": 3,
      "cliente": "Empresa C",
      "descricao": "Consultoria de SEO",
      "valor": 2500.00,
      "vencimento": "2024-12-05",
      "status": "Pendente"
    }
  ]
}
Use code with caution.
Json
Configure o package.json para rodar os servidores:
Abra o arquivo package.json e substitua a seção "scripts" pelo código abaixo. Isso nos permitirá iniciar o servidor da API e o aplicativo React com um único comando.
Generated json
"scripts": {
  "start": "concurrently \"npm run server\" \"npm run react-start\"",
  "react-start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
  "server": "json-server --watch db.json --port 3001"
},
Use code with caution.
Json
Passo 4: Codificação do Frontend (React)
Agora vamos criar os componentes e a lógica do aplicativo.
1. Estilização (src/App.css)
Substitua todo o conteúdo do arquivo src/App.css por este CSS para dar uma aparência limpa e organizada ao aplicativo.
Generated css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f4f7f6;
    margin: 0;
    padding: 20px;
    color: #333;
}

.App {
    max-width: 1000px;
    margin: 0 auto;
    background: #fff;
    padding: 20px 30px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1, h2 {
    color: #2c3e50;
    text-align: center;
}

/* --- Barra de Ações --- */
.action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
}

.search-bar {
    flex-grow: 1;
    margin-right: 10px;
}

.search-bar input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.button-group {
    display: flex;
    gap: 10px;
}

button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.2s;
}

.btn-primary {
    background-color: #3498db;
    color: white;
}
.btn-primary:hover {
    background-color: #2980b9;
}

.btn-secondary {
    background-color: #2ecc71;
    color: white;
}
.btn-secondary:hover {
    background-color: #27ae60;
}

.btn-tertiary {
    background-color: #f39c12;
    color: white;
}
.btn-tertiary:hover {
    background-color: #e67e22;
}


/* --- Tabela --- */
.cobrancas-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.cobrancas-table th, .cobrancas-table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
}

.cobrancas-table th {
    background-color: #ecf0f1;
    color: #34495e;
}

.cobrancas-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.cobrancas-table tr:hover {
    background-color: #f1c40f30;
}

.status-pendente {
    background-color: #f39c12;
    color: white;
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.status-pago {
    background-color: #2ecc71;
    color: white;
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.action-buttons button {
    margin-right: 5px;
    padding: 5px 10px;
}

.btn-edit {
    background-color: #3498db;
    color: white;
}
.btn-delete {
    background-color: #e74c3c;
    color: white;
}

/* --- Formulário --- */
.form-container {
    background-color: #fafafa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #eee;
    margin-top: 20px;
}

.form-container h2 {
    margin-top: 0;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input, .form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box; /* Important */
}

.form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}
Use code with caution.
Css
2. Componente de Formulário (src/components/CobrancaForm.js)
Crie a pasta components dentro de src e, dentro dela, o arquivo CobrancaForm.js. Este componente será usado tanto para adicionar quanto para editar uma cobrança.
Generated javascript
import React, { useState, useEffect } from 'react';

const CobrancaForm = ({ onSave, cobrancaAtual, onCancel }) => {
    const [cobranca, setCobranca] = useState({
        cliente: '',
        descricao: '',
        valor: '',
        vencimento: '',
        status: 'Pendente'
    });

    useEffect(() => {
        if (cobrancaAtual) {
            setCobranca({
                ...cobrancaAtual,
                valor: cobrancaAtual.valor.toString(), // Garante que o valor seja string para o input
            });
        } else {
            // Limpa o formulário se não houver cobrança atual (modo de criação)
            setCobranca({ cliente: '', descricao: '', valor: '', vencimento: '', status: 'Pendente' });
        }
    }, [cobrancaAtual]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCobranca(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const cobrancaParaSalvar = {
            ...cobranca,
            valor: parseFloat(cobranca.valor) // Converte o valor para número antes de salvar
        };
        onSave(cobrancaParaSalvar);
        // Limpa o formulário após salvar
        setCobranca({ cliente: '', descricao: '', valor: '', vencimento: '', status: 'Pendente' });
    };

    return (
        <div className="form-container">
            <h2>{cobrancaAtual ? 'Editar Cobrança' : 'Adicionar Nova Cobrança'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Cliente</label>
                    <input
                        type="text"
                        name="cliente"
                        value={cobranca.cliente}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Descrição</label>
                    <input
                        type="text"
                        name="descricao"
                        value={cobranca.descricao}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Valor (R$)</label>
                    <input
                        type="number"
                        name="valor"
                        step="0.01"
                        value={cobranca.valor}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Data de Vencimento</label>
                    <input
                        type="date"
                        name="vencimento"
                        value={cobranca.vencimento}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={cobranca.status} onChange={handleChange}>
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-primary">
                        {cobrancaAtual ? 'Salvar Alterações' : 'Adicionar Cobrança'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CobrancaForm;
Use code with caution.
JavaScript
3. Componente da Lista (src/components/CobrancaList.js)
No mesmo diretório src/components, crie o arquivo CobrancaList.js. Este componente exibirá a tabela com as cobranças.
Generated javascript
import React from 'react';

const CobrancaList = ({ cobrancas, onEdit, onDelete }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <table className="cobrancas-table">
            <thead>
                <tr>
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
                    <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>Nenhuma cobrança encontrada.</td>
                    </tr>
                ) : (
                    cobrancas.map(cobranca => (
                        <tr key={cobranca.id}>
                            <td>{cobranca.cliente}</td>
                            <td>{cobranca.descricao}</td>
                            <td>{formatCurrency(cobranca.valor)}</td>
                            <td>{formatDate(cobranca.vencimento)}</td>
                            <td>
                                <span className={cobranca.status === 'Pendente' ? 'status-pendente' : 'status-pago'}>
                                    {cobranca.status}
                                </span>
                            </td>
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
Use code with caution.
JavaScript
4. Componente Principal (src/App.js)
Este é o coração do aplicativo. Ele vai gerenciar o estado, fazer as chamadas à API e juntar todos os componentes. Substitua o conteúdo de src/App.js por este:
Generated javascript
import React, { useState, useEffect, useCallback } from 'react';
import CobrancaList from './components/CobrancaList';
import CobrancaForm from './components/CobrancaForm';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './App.css';

const API_URL = 'http://localhost:3001/cobrancas';

function App() {
    const [cobrancas, setCobrancas] = useState([]);
    const [cobrancaAtual, setCobrancaAtual] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);

    const fetchCobrancas = useCallback(async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setCobrancas(data);
        } catch (error) {
            console.error("Erro ao buscar cobranças:", error);
        }
    }, []);

    useEffect(() => {
        fetchCobrancas();
    }, [fetchCobrancas]);

    const handleSave = async (cobranca) => {
        const method = cobranca.id ? 'PUT' : 'POST';
        const url = cobranca.id ? `${API_URL}/${cobranca.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cobranca),
            });

            if (response.ok) {
                fetchCobrancas(); // Recarrega a lista
                setCobrancaAtual(null); // Limpa o formulário de edição
                setIsFormVisible(false); // Esconde o formulário
            } else {
                console.error("Erro ao salvar cobrança.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar esta cobrança?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchCobrancas(); // Recarrega a lista
                } else {
                    console.error("Erro ao deletar cobrança.");
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
            }
        }
    };

    const handleEdit = (cobranca) => {
        setCobrancaAtual(cobranca);
        setIsFormVisible(true); // Mostra o formulário para edição
    };

    const handleCancel = () => {
        setCobrancaAtual(null);
        setIsFormVisible(false);
    };

    const handleShowForm = () => {
        setCobrancaAtual(null); // Garante que é um formulário de adição
        setIsFormVisible(true);
    };

    const gerarPDF = () => {
        const doc = new jsPDF();
        doc.text("Relatório de Cobranças", 14, 16);
        doc.autoTable({
            head: [['Cliente', 'Descrição', 'Valor', 'Vencimento', 'Status']],
            body: cobrancasFiltradas.map(c => [
                c.cliente,
                c.descricao,
                `R$ ${c.valor.toFixed(2)}`,
                new Date(c.vencimento + 'T00:00:00').toLocaleDateString('pt-BR'),
                c.status
            ]),
            startY: 20,
        });
        doc.save('relatorio_cobrancas.pdf');
    };

    const gerarTXT = () => {
        let content = "Relatório de Cobranças\n";
        content += "========================================\n\n";

        cobrancasFiltradas.forEach(c => {
            content += `Cliente: ${c.cliente}\n`;
            content += `Descrição: ${c.descricao}\n`;
            content += `Valor: R$ ${c.valor.toFixed(2)}\n`;
            content += `Vencimento: ${new Date(c.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}\n`;
            content += `Status: ${c.status}\n`;
            content += "----------------------------------------\n";
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'relatorio_cobrancas.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const cobrancasFiltradas = cobrancas.filter(c =>
        c.cliente.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="App">
            <h1>Sistema de Cobranças</h1>

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
                         <button onClick={handleShowForm} className="btn-primary">Nova Cobrança</button>
                    )}
                    <button onClick={gerarPDF} className="btn-secondary">Gerar PDF</button>
                    <button onClick={gerarTXT} className="btn-tertiary">Gerar TXT</button>
                </div>
            </div>

            {isFormVisible && (
                <CobrancaForm
                    onSave={handleSave}
                    cobrancaAtual={cobrancaAtual}
                    onCancel={handleCancel}
                />
            )}

            <CobrancaList
                cobrancas={cobrancasFiltradas}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}

export default App;
Use code with caution.
JavaScript
Passo 5: Como Executar o Aplicativo
Abra o terminal na pasta do projeto (app-cobranca).
Execute o comando de inicialização:
Generated bash
npm start
Use code with caution.
Bash
Este comando fará duas coisas simultaneamente (graças ao concurrently):
Iniciará o servidor da API na porta 3001 (http://localhost:3001/cobrancas).
Iniciará o aplicativo React na porta 3000 (http://localhost:3000).
Acesse o aplicativo abrindo http://localhost:3000 no seu navegador.
Você verá a lista de cobranças que definimos no db.json. Agora você pode:
Clicar em "Nova Cobrança" para abrir o formulário.
Preencher e adicionar uma nova cobrança.
Clicar em "Editar" em uma cobrança existente para alterar seus dados.
Clicar em "Deletar" para remover uma cobrança.
Usar o campo de busca para filtrar por cliente.
Clicar em "Gerar PDF" ou "Gerar TXT" para baixar os relatórios.
Modo de Implantação (Deployment)
Para um projeto real, você não usaria o json-server em produção. Aqui está uma visão geral de como seria a implantação:
Backend (API):
Você substituiria o json-server por uma API de verdade construída com Node.js (Express), Python (Django/Flask), etc.
Essa API se conectaria a um banco de dados real (PostgreSQL, MySQL, MongoDB).
Você faria o deploy dessa API em um serviço como Heroku, Vercel (com Serverless Functions), AWS, ou um servidor próprio.
Frontend (React):
Execute o comando npm run build no seu terminal.
Isso criará uma pasta build com os arquivos estáticos otimizados do seu aplicativo React.
Faça o upload do conteúdo da pasta build para um serviço de hospedagem de sites estáticos, como:
Vercel: Excelente para projetos React. Basta conectar seu repositório do GitHub.
Netlify: Similar ao Vercel, muito fácil de usar.
AWS S3: Para uma solução mais robusta e configurável.
GitHub Pages: Gratuito e bom para projetos simples.
Ao fazer o deploy, você precisaria atualizar a API_URL no App.js para apontar para o endereço da sua API em produção.
Este projeto fornecido é a base completa e funcional que você pediu, pronta para ser usada localmente e expandida para uma solução de produção.

-_________________________________________________________________________________________________________________

Excelente pedido! Integrar uma entidade de Cliente é o próximo passo lógico para tornar o aplicativo mais robusto e profissional. Isso transformará nosso sistema, que antes usava um simples campo de texto para o cliente, em um sistema relacional.
Vamos fazer uma reestruturação completa para acomodar essa nova funcionalidade de forma organizada.
Resumo da Transformação:
Backend (db.json): Adicionaremos uma nova tabela clientes e atualizaremos a tabela cobrancas para se relacionar com clientes através de um clienteId.
Estrutura de Pastas: Criaremos uma pasta pages para organizar melhor as telas de "Clientes" e "Cobranças".
CRUD de Clientes: Criaremos uma nova interface completa para Adicionar, Editar, Listar e Deletar clientes.
Integração: O formulário de "Cobranças" agora terá um menu suspenso (<select>) para escolher um cliente já cadastrado, em vez de um campo de texto.
Navegação: O App.js servirá como o ponto central com botões para navegar entre a tela de Clientes e a de Cobranças.
Passo 1: Atualizar o "Banco de Dados" (db.json)
Substitua todo o conteúdo do seu arquivo db.json por este. Note as mudanças:
Nova tabela "clientes".
A tabela "cobrancas" agora tem um campo "clienteId" em vez de "cliente".
Generated json
{
  "clientes": [
    {
      "id": 1,
      "nome": "Tech Solutions Ltda",
      "documento": "12.345.678/0001-99",
      "banco": "341 - Itaú Unibanco",
      "contaCorrente": "12345-6",
      "ativo": true
    },
    {
      "id": 2,
      "nome": "Inova Web Design",
      "documento": "98.765.432/0001-11",
      "banco": "237 - Bradesco",
      "contaCorrente": "9876-5",
      "ativo": true
    },
    {
      "id": 3,
      "nome": "Marketing Digital ABC",
      "documento": "11.222.333/0001-44",
      "banco": "001 - Banco do Brasil",
      "contaCorrente": "1122-3",
      "ativo": false
    }
  ],
  "cobrancas": [
    {
      "id": 1,
      "clienteId": 1,
      "descricao": "Desenvolvimento de site",
      "valor": 5000.50,
      "vencimento": "2024-12-15",
      "status": "Pendente"
    },
    {
      "id": 2,
      "clienteId": 2,
      "descricao": "Manutenção de Servidor",
      "valor": 850.00,
      "vencimento": "2024-11-30",
      "status": "Pago"
    },
    {
      "id": 3,
      "clienteId": 1,
      "descricao": "Consultoria de SEO",
      "valor": 2500.00,
      "vencimento": "2024-12-05",
      "status": "Pendente"
    }
  ]
}
Use code with caution.
Json
Nota sobre os campos:
O campo flag foi implementado como "ativo": true/false, que é uma prática comum para status.
O campo valor faz mais sentido na Cobrança, pois cada cobrança tem um valor diferente. Um cliente não tem um "valor" fixo. Por isso, ele permanece na entidade cobrancas.
conta corrente foi nomeado como contaCorrente para seguir a convenção camelCase do JavaScript.
Passo 2: Nova Estrutura de Arquivos
Para manter a organização, crie uma pasta pages dentro de src. Sua estrutura ficará assim:
Generated code
src/
├── components/
│   ├── CobrancaForm.js
│   ├── CobrancaList.js
│   ├── ClienteForm.js      <-- NOVO
│   └── ClienteList.js      <-- NOVO
├── pages/
│   ├── ClientesPage.js     <-- NOVO
│   └── CobrancasPage.js    <-- NOVO (antigo App.js)
├── App.css
├── App.js                  <-- Será simplificado para ser o navegador
└── index.js
Use code with caution.
Passo 3: Criar os Componentes para Clientes
A. src/components/ClienteForm.js (NOVO)
Este formulário permitirá criar e editar clientes.
Generated javascript
import React, { useState, useEffect } from 'react';

const ClienteForm = ({ onSave, clienteAtual, onCancel }) => {
    const [cliente, setCliente] = useState({
        nome: '',
        documento: '',
        banco: '',
        contaCorrente: '',
        ativo: true
    });

    useEffect(() => {
        if (clienteAtual) {
            setCliente(clienteAtual);
        } else {
            setCliente({ nome: '', documento: '', banco: '', contaCorrente: '', ativo: true });
        }
    }, [clienteAtual]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCliente(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(cliente);
        setCliente({ nome: '', documento: '', banco: '', contaCorrente: '', ativo: true });
    };

    return (
        <div className="form-container">
            <h2>{clienteAtual ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nome</label>
                    <input type="text" name="nome" value={cliente.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Documento (CPF/CNPJ)</label>
                    <input type="text" name="documento" value={cliente.documento} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Banco</label>
                    <input type="text" name="banco" value={cliente.banco} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Conta Corrente</label>
                    <input type="text" name="contaCorrente" value={cliente.contaCorrente} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select name="ativo" value={cliente.ativo} onChange={e => handleChange({ target: { name: 'ativo', value: e.target.value === 'true' } })}>
                        <option value={true}>Ativo</option>
                        <option value={false}>Inativo</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-primary">{clienteAtual ? 'Salvar Alterações' : 'Adicionar Cliente'}</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default ClienteForm;
Use code with caution.
JavaScript
B. src/components/ClienteList.js (NOVO)
Esta tabela listará todos os clientes cadastrados.
Generated javascript
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
Use code with caution.
JavaScript
Passo 4: Criar as Páginas de Gerenciamento
A. src/pages/ClientesPage.js (NOVO)
Esta página vai controlar toda a lógica do CRUD de Clientes.
Generated javascript
import React, { useState, useEffect } from 'react';
import ClienteList from '../components/ClienteList';
import ClienteForm from '../components/ClienteForm';

const API_URL = 'http://localhost:3001/clientes';

const ClientesPage = () => {
    const [clientes, setClientes] = useState([]);
    const [clienteAtual, setClienteAtual] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setClientes(data);
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
        }
    };

    const handleSave = async (cliente) => {
        const method = cliente.id ? 'PUT' : 'POST';
        const url = cliente.id ? `${API_URL}/${cliente.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente),
            });
            if (response.ok) {
                fetchClientes();
                setIsFormVisible(false);
                setClienteAtual(null);
            }
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este cliente? Isso pode afetar cobranças existentes.')) {
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                fetchClientes();
            } catch (error) {
                console.error("Erro ao deletar cliente:", error);
            }
        }
    };

    const handleEdit = (cliente) => {
        setClienteAtual(cliente);
        setIsFormVisible(true);
    };
    
    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div>
            <h1>Gerenciamento de Clientes</h1>
            <div className="action-bar">
                 <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Filtrar por nome do cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
                {!isFormVisible && (
                    <button onClick={() => setIsFormVisible(true)} className="btn-primary">Novo Cliente</button>
                )}
            </div>

            {isFormVisible && (
                <ClienteForm
                    onSave={handleSave}
                    clienteAtual={clienteAtual}
                    onCancel={() => { setIsFormVisible(false); setClienteAtual(null); }}
                />
            )}

            <ClienteList clientes={clientesFiltrados} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
};

export default ClientesPage;
Use code with caution.
JavaScript
B. src/pages/CobrancasPage.js (NOVO)
Este arquivo conterá a lógica da página de cobranças, que antes estava em App.js. Note que ele agora também busca os clientes para popular o menu suspenso.
Generated javascript
import React, { useState, useEffect, useCallback } from 'react';
import CobrancaList from '../components/CobrancaList';
import CobrancaForm from '../components/CobrancaForm';
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

    const handleSave = async (cobranca) => {
        const method = cobranca.id ? 'PUT' : 'POST';
        const url = cobranca.id ? `${API_COBRANCAS_URL}/${cobranca.id}` : API_COBRANCAS_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...cobranca, clienteId: parseInt(cobranca.clienteId) }),
            });
            if (response.ok) {
                fetchData();
                setIsFormVisible(false);
                setCobrancaAtual(null);
            }
        } catch (error) {
            console.error("Erro ao salvar cobrança:", error);
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

    const cobrancasFiltradas = cobrancas.filter(c => {
        const cliente = clientes.find(cli => cli.id === c.clienteId);
        return cliente && cliente.nome.toLowerCase().includes(filtro.toLowerCase());
    });

    // Sua função gerarPDF e gerarTXT podem ser copiadas para cá, com uma pequena modificação
    const gerarPDF = () => {
        const doc = new jsPDF();
        doc.text("Relatório de Cobranças", 14, 16);
        autoTable(doc, {
            head: [['Cliente', 'Descrição', 'Valor', 'Vencimento', 'Status']],
            body: cobrancasFiltradas.map(c => {
                const cliente = clientes.find(cli => cli.id === c.clienteId);
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
Use code with caution.
JavaScript
Passo 5: Atualizar os Componentes de Cobrança
Eles precisam ser adaptados para usar o clienteId.
A. src/components/CobrancaForm.js (MODIFICAR)
Substitua o conteúdo deste arquivo. O campo de texto do cliente virou um menu <select>.
Generated javascript
import React, { useState, useEffect } from 'react';

const CobrancaForm = ({ onSave, cobrancaAtual, onCancel, clientes }) => {
    const [cobranca, setCobranca] = useState({
        clienteId: '',
        descricao: '',
        valor: '',
        vencimento: '',
        status: 'Pendente'
    });

    useEffect(() => {
        if (cobrancaAtual) {
            setCobranca({
                ...cobrancaAtual,
                valor: cobrancaAtual.valor.toString(),
            });
        } else {
            setCobranca({ clienteId: clientes.length > 0 ? clientes[0].id : '', descricao: '', valor: '', vencimento: '', status: 'Pendente' });
        }
    }, [cobrancaAtual, clientes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCobranca(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...cobranca, valor: parseFloat(cobranca.valor) });
    };

    return (
        <div className="form-container">
            <h2>{cobrancaAtual ? 'Editar Cobrança' : 'Adicionar Nova Cobrança'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Cliente</label>
                    <select name="clienteId" value={cobranca.clienteId} onChange={handleChange} required>
                        <option value="" disabled>Selecione um cliente</option>
                        {clientes.filter(c => c.ativo).map(cliente => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                        ))}
                    </select>
                </div>
                {/* O resto do formulário permanece igual */}
                <div className="form-group">
                    <label>Descrição</label>
                    <input type="text" name="descricao" value={cobranca.descricao} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Valor (R$)</label>
                    <input type="number" name="valor" step="0.01" value={cobranca.valor} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Data de Vencimento</label>
                    <input type="date" name="vencimento" value={cobranca.vencimento} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={cobranca.status} onChange={handleChange}>
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
Use code with caution.
JavaScript
B. src/components/CobrancaList.js (MODIFICAR)
Substitua o conteúdo. A lista agora precisa receber clientes para encontrar o nome correspondente ao clienteId.
Generated javascript
import React from 'react';

const CobrancaList = ({ cobrancas, clientes, onEdit, onDelete }) => {
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');

    const getClienteName = (clienteId) => {
        const cliente = clientes.find(c => c.id === clienteId);
        return cliente ? cliente.nome : 'Cliente não encontrado';
    };

    return (
        <table className="cobrancas-table">
            <thead>
                <tr>
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
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhuma cobrança encontrada.</td></tr>
                ) : (
                    cobrancas.map(cobranca => (
                        <tr key={cobranca.id}>
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
Use code with caution.
JavaScript
Passo 6: Atualizar App.js para ser o Navegador Principal
Por fim, simplifique o App.js para que ele controle qual página (Clientes ou Cobranças) é exibida.
Substitua todo o conteúdo de src/App.js por este:
Generated javascript
import React, { useState } from 'react';
import ClientesPage from './pages/ClientesPage';
import CobrancasPage from './pages/CobrancasPage';
import './App.css';

function App() {
    const [view, setView] = useState('cobrancas'); // 'cobrancas' ou 'clientes'

    return (
        <div className="App">
            <nav className="main-nav">
                <button 
                    onClick={() => setView('cobrancas')} 
                    className={view === 'cobrancas' ? 'active' : ''}
                >
                    Gerenciar Cobranças
                </button>
                <button 
                    onClick={() => setView('clientes')} 
                    className={view === 'clientes' ? 'active' : ''}
                >
                    Gerenciar Clientes
                </button>
            </nav>
            <main>
                {view === 'cobrancas' ? <CobrancasPage /> : <ClientesPage />}
            </main>
        </div>
    );
}

export default App;
Use code with caution.
JavaScript
E adicione este pequeno CSS ao seu src/App.css para estilizar a navegação:
Generated css
/* Adicione no final do seu arquivo src/App.css */
.main-nav {
    display: flex;
    gap: 10px;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid #ecf0f1;
}

.main-nav button {
    background-color: #bdc3c7;
    color: #2c3e50;
    font-size: 16px;
}

.main-nav button.active {
    background-color: #3498db;
    color: white;
}
Use code with caution.
Css
Como Usar
Execute npm start.
Você verá a nova interface com dois botões no topo: "Gerenciar Cobranças" e "Gerenciar Clientes".
Primeiro, vá para "Gerenciar Clientes" para adicionar, editar ou visualizar os clientes.
Depois, vá para "Gerenciar Cobranças". Ao clicar em "Nova Cobrança", você verá um menu suspenso com os clientes ativos que você cadastrou.
Todo o resto da funcionalidade (filtros, PDF, TXT) continuará funcionando no contexto de cada página.
Você agora tem um aplicativo muito mais completo e bem estruturado