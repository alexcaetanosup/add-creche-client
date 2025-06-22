# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


________________________________________________________________________________________________________________________________________________

Com certeza! Esse formato é um arquivo de remessa, muito comum para Débito Automático em bancos. Ele é um arquivo posicional, onde cada caractere em cada linha tem um significado específico.
Criar um arquivo desses requer muita atenção aos detalhes: tamanho dos campos, alinhamento (numérico à direita com zeros à esquerda, alfanumérico à esquerda com espaços à direita) e formatação de datas e valores.
Vamos construir a função gerarTXT para gerar um arquivo de remessa simplificado, baseado no layout que você mostrou. Vamos assumir um layout padrão de 150 caracteres por linha, que é comum em muitos bancos.
1. Decodificando o Layout
Analisando o seu exemplo, podemos deduzir a estrutura:
Registro Header (Tipo A): A primeira linha, que contém informações gerais sobre o arquivo.
Registros de Detalhe (Tipo E): As linhas do meio, uma para cada cobrança/cliente.
Registro Trailler (Tipo Z): A última linha, que contém totais e informações de fechamento.
2. Funções Auxiliares Essenciais
Para trabalhar com layouts posicionais, precisamos de funções robustas para formatar e preencher os campos.
formatText(texto, tamanho): Para campos de texto. Trunca ou preenche com espaços à direita.
formatNumber(numero, tamanho): Para campos numéricos. Formata e preenche com zeros à esquerda.
3. Implementação em CobrancasPage.js
Vamos substituir completamente a função gerarTXT em src/pages/CobrancasPage.js por esta nova versão, que é especializada em criar arquivos de remessa.
Copie e cole este código inteiro para substituir a função gerarTXT existente:
Generated javascript
// Dentro de src/pages/CobrancasPage.js

const gerarTXT = () => {
    // --- FUNÇÕES AUXILIARES PARA LAYOUT POSICIONAL ---

    /**
     * Formata um campo de texto (alfanumérico).
     * @param {string} text O texto a ser formatado.
     * @param {number} length O tamanho final do campo.
     * @returns {string} O texto formatado com espaços à direita.
     */
    const formatText = (text = '', length) => {
        return String(text).substring(0, length).padEnd(length, ' ');
    };

    /**
     * Formata um campo numérico.
     * @param {number|string} num O número a ser formatado.
     * @param {number} length O tamanho final do campo.
     * @returns {string} O número formatado com zeros à esquerda.
     */
    const formatNumber = (num = 0, length) => {
        return String(num).replace(/[^0-9]/g, '').padStart(length, '0');
    };

    // --- DADOS FIXOS DA EMPRESA (Exemplo) ---
    // Em um app real, esses dados viriam de uma configuração ou banco de dados.
    const empresa = {
        codigoConvenio: '00330043002501218',
        nome: 'CRECHE BERCARIO NANA',
        banco: '033', // Código do Banco Santander
        nomeBanco: 'BANCO SANTANDER',
    };

    let content = '';

    // --- REGISTRO HEADER (TIPO A) ---
    const dataGeracao = new Date();
    const dataGeracaoFormatada = 
        formatNumber(dataGeracao.getFullYear(), 4) +
        formatNumber(dataGeracao.getMonth() + 1, 2) +
        formatNumber(dataGeracao.getDate(), 2);
    
    let header = '';
    header += 'A'; // Tipo de Registro
    header += '1'; // Tipo de Serviço (1 = Débito Automático)
    header += formatText(empresa.codigoConvenio, 20);
    header += formatText(empresa.nome, 20);
    header += formatText(empresa.banco, 3);
    header += formatText(empresa.nomeBanco, 20);
    header += dataGeracaoFormatada; // YYYYMMDD
    header += formatNumber(1, 8); // Número sequencial do arquivo
    header += formatText('DEBITO AUTOMATICO', 47); // Uso da empresa
    header += formatText('', 29); // Brancos
    content += header + '\n';


    // --- REGISTROS DE DETALHE (TIPO E) ---
    let totalValorCobrado = 0;
    cobrancasFiltradas.forEach((cobranca, index) => {
        const cliente = clientes.find(cli => cli.id === cobranca.clienteId);
        if (!cliente) return; // Pula cobrança se o cliente não for encontrado

        // Formatação de data e valor
        const vencimento = new Date(cobranca.vencimento + 'T00:00:00');
        const dataVencimentoFormatada = 
            formatNumber(vencimento.getFullYear(), 4) +
            formatNumber(vencimento.getMonth() + 1, 2) +
            formatNumber(vencimento.getDate(), 2);
        
        const valorFormatado = formatNumber(cobranca.valor * 100, 15); // Valor em centavos
        totalValorCobrado += cobranca.valor;

        let detalhe = '';
        detalhe += 'E'; // Tipo de Registro
        detalhe += formatText(cliente.documento, 25); // Identificação do cliente na empresa
        detalhe += formatText(cliente.banco, 4); // Código do banco do cliente
        detalhe += formatText(cliente.contaCorrente, 20); // Conta do cliente
        detalhe += dataVencimentoFormatada; // Data de vencimento
        detalhe += valorFormatado; // Valor do débito
        detalhe += formatText('', 74); // Brancos
        detalhe += formatNumber(index + 1, 6); // Número sequencial do registro no arquivo

        content += detalhe.substring(0, 150).padEnd(150, ' ') + '\n';
    });

    // --- REGISTRO TRAILLER (TIPO Z) ---
    const totalRegistros = cobrancasFiltradas.length + 2; // Detalhes + Header + Trailler
    const somaValoresFormatada = formatNumber(totalValorCobrado * 100, 18);

    let trailler = '';
    trailler += 'Z'; // Tipo de Registro
    trailler += formatNumber(totalRegistros, 6);
    trailler += somaValoresFormatada;
    trailler += formatText('', 125); // Brancos
    content += trailler + '\n';

    // --- GERAÇÃO E DOWNLOAD DO ARQUIVO ---
    const blob = new Blob([content], { type: 'text/plain;charset=latin1' }); // Use latin1 para compatibilidade
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `REMESSA_${dataGeracaoFormatada}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
Use code with caution.
JavaScript
4. Entendendo o Código
Funções Auxiliares formatText e formatNumber: São o coração da solução. Elas garantem que cada campo tenha exatamente o tamanho correto, preenchendo com espaços ou zeros conforme a necessidade.
Dados da Empresa: Criei um objeto empresa com dados fixos. Em um sistema real, você buscaria essas informações de um local de configuração.
Registro Header (Tipo A): Montamos a primeira linha do arquivo, campo por campo, usando as funções auxiliares. Note a formatação da data de geração.
Registros de Detalhe (Tipo E):
Iteramos sobre as cobrancasFiltradas (as que estão visíveis na tela).
Para cada cobrança, encontramos o cliente correspondente para pegar dados como documento e conta.
Formatação de Valor: O valor é multiplicado por 100 para ser representado em centavos (ex: R$ 150,00 vira 15000), uma prática padrão em arquivos de remessa.
Formatação de Data: A data de vencimento é formatada como AAAAMMDD.
Montamos a linha de detalhe concatenando cada campo formatado.
Registro Trailler (Tipo Z):
Calculamos o número total de registros no arquivo (todas as cobranças + header + trailler).
Somamos o valor total de todas as cobranças.
Montamos a última linha com esses totais.
Geração do Arquivo:
charset=latin1: É importante usar um charset como latin1 (ou windows-1252) em vez de utf-8, pois sistemas bancários legados podem não interpretar corretamente caracteres especiais do utf-8.
O nome do arquivo é dinâmico, incluindo a data de geração.
5. Como Usar
Substitua a função gerarTXT em src/pages/CobrancasPage.js pelo código acima.
Garanta que seus clientes cadastrados tenham dados nos campos "Documento", "Banco" e "Conta Corrente", pois a função agora depende deles.
Execute o aplicativo e vá para a página de Cobranças.
Clique no botão "Gerar TXT".
Um arquivo chamado REMESSA_AAAAMMDD.txt será baixado, com o layout posicional exato que você precisa.
Este código é um ponto de partida robusto. Você pode facilmente adaptá-lo se o layout do seu banco for ligeiramente diferente, apenas ajustando os tamanhos dos campos nas chamadas das funções formatText e formatNumber.
