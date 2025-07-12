import React, { useState, useEffect } from 'react';

// A URL base da API será passada como prop
const ArquivosRemessa = ({ apiBaseUrl }) => {
    const [arquivos, setArquivos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArquivos = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/listar-arquivos`);
                const data = await response.json();
                setArquivos(data);
            } catch (error) {
                console.error("Erro ao buscar lista de arquivos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArquivos();
    }, [apiBaseUrl]);

    if (loading) {
        return <p>Carregando lista de arquivos arquivados...</p>;
    }

    return (
        <div className="arquivos-container">
            <h2>Arquivos de Remessa Gerados</h2>
            {arquivos.length === 0 ? (
                <p>Nenhum arquivo de remessa foi arquivado ainda.</p>
            ) : (
                <ul>
                    {arquivos.map((nomeArquivo, index) => (
                        <li key={index}>
                            <span>{nomeArquivo}</span>
                            <a
                                href={`${apiBaseUrl}/api/download-arquivo/${nomeArquivo}`}
                                className="btn-download"
                                download // O atributo 'download' sugere ao navegador para baixar em vez de navegar
                            >
                                Baixar
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ArquivosRemessa;