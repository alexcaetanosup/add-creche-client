# Sistema de Gestão de Cobranças - App Creche (Frontend)

Este é o frontend do Sistema de Gestão de Cobranças, desenvolvido com **React**. Ele fornece a interface do usuário para gerenciar clientes, lançar cobranças e gerar arquivos de remessa e retorno.

## ✨ Funcionalidades Principais

- **Gestão de Clientes:**
  - Cadastro, edição e exclusão de clientes.
  - Geração de código/matrícula sequencial automática para novos clientes.
- **Gestão de Cobranças:**
  - Lançamento de cobranças individuais a partir da tela de clientes.
  - Visualização de cobranças pendentes.
  - Seleção múltipla de cobranças para processamento.
- **Processamento de Remessa:**
  - Geração de arquivo de remessa (`.txt`) em formato posicional, pronto para ser enviado ao banco.
  - Geração de relatório em PDF das cobranças selecionadas.
  - Gerenciamento automático do Número Sequencial de Arquivo (NSA).
- **Processamento de Retorno:**
  - Upload de arquivo de retorno (`.ret`) do banco.
  - Conciliação automática, atualizando o status das cobranças para "Pago" ou "Rejeitado".
- **Histórico e Arquivamento:**
  - Após processar uma remessa, as cobranças são marcadas e saem da lista de pendentes.
  - O sistema gera um backup (`.json`) das remessas finalizadas, que pode ser consultado e baixado.
- **Autenticação:**
  - Sistema de login e senha para proteger o acesso aos dados.

## 🚀 Tecnologias Utilizadas

- **React.js:** Biblioteca principal para a construção da interface.
- **JavaScript (ES6+):** Linguagem de programação.
- **CSS3:** Para estilização dos componentes.
- **Bibliotecas:**
  - `jspdf` & `jspdf-autotable`: Para a geração de relatórios em PDF.

## ⚙️ Configuração do Ambiente de Desenvolvimento

Para rodar este projeto localmente, você precisará ter o [Node.js](https://nodejs.org/) (versão 18.x ou superior) instalado.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/alexcaetanosup/add-creche-client.git
    cd add-creche-client
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo chamado `.env.development` na raiz do projeto e adicione as seguintes variáveis (substitua pelos valores do seu projeto Supabase):
    ```
    REACT_APP_SUPABASE_URL=https://SEU_PROJETO_URL.supabase.co
    REACT_APP_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
    ```
    > **Nota:** A variável `REACT_APP_API_URL` não é necessária no arquivo `.env`, pois o código já tem um fallback para `http://localhost:3001` quando ela não está definida.

4.  **Inicie o Servidor de Backend:**
    Este projeto frontend precisa do backend (`add-creche-api`) para funcionar. Certifique-se de que o backend esteja rodando em outro terminal.

5.  **Inicie o Frontend:**
    ```bash
    npm start
    ```
    O aplicativo abrirá em `http://localhost:3000`.

## 📦 Deploy

Este projeto está configurado para deploy contínuo na plataforma **Render** como um **Static Site**. As variáveis de ambiente `REACT_APP_SUPABASE_URL` e `REACT_APP_API_URL` devem ser configuradas no dashboard da Render.

---
*Desenvolvido por Alex Caetano dos Santos.*
