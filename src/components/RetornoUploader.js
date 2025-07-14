import React, { useState } from 'react';

const RetornoUploader = ({ apiBaseUrl, onProcessado }) => {
    const [arquivo, setArquivo] = useState(null);
    const [processando, setProcessando] = useState(false);
    const [resultado, setResultado] = useState(null);

    const handleFileChange = (e) => {
        setArquivo(e.target.files[0]);
        setResultado(null); // Limpa resultado anterior
    };

    const handleUpload = async () => {
        if (!arquivo) {
            alert("Por favor, selecione um arquivo de retorno.");
            return;
        }

        setProcessando(true);
        setResultado(null);
        const formData = new FormData();
        formData.append('arquivoRetorno', arquivo);

        try {
            const response = await fetch(`${apiBaseUrl}/api/processar-retorno`, {
                method: 'POST',
                body: formData, // Não definimos Content-Type, o navegador faz isso por nós para multipart/form-data
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao processar o arquivo.');
            }

            setResultado(data);
            onProcessado(); // Chama a função do pai para recarregar os dados da página
        } catch (error) {
            console.error("Erro no upload do retorno:", error);
            setResultado({ success: false, message: error.message });
        } finally {
            setProcessando(false);
        }
    };

    return (
        <div className="retorno-uploader-container">
            <h2>Processar Arquivo de Retorno do Banco</h2>
            <div className="upload-controls">
                <input type="file" onChange={handleFileChange} accept=".txt,.ret" />
                <button onClick={handleUpload} disabled={!arquivo || processando} className="btn-primary">
                    {processando ? 'Processando...' : 'Processar Arquivo'}
                </button>
            </div>
            {resultado && (
                <div className={`resultado-processamento ${resultado.success ? 'success' : 'error'}`}>
                    <p>{resultado.message}</p>
                    {resultado.detalhes && (
                        <ul>
                            {Object.entries(resultado.detalhes).map(([key, value]) => (
                                <li key={key}>{key}: {value}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default RetornoUploader;