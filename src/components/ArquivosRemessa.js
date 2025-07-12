import React, { useState, useEffect } from 'react';

const ArquivosRemessa = ({ apiBaseUrl }) => {
    const [arquivos, setArquivos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArquivos = async () => {
            setLoading(true); // Garante que o loading comece ao buscar
            try {
                const response = await fetch(`${apiBaseUrl}/api/listar-arquivos`);
                if (!response.ok) throw new Error('Falha ao buscar a lista de arquivos.');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setArquivos(data);
                } else {
                    setArquivos([]);
                }
            } catch (error) {
                console.error("Erro ao buscar lista de arquivos:", error);
                setArquivos([]);
            } finally {
                setLoading(false); // Para o loading no final, com sucesso ou erro
            }
        };
        fetchArquivos();
    }, [apiBaseUrl]);

    // ADICIONE ESTE BLOCO DE CÓDIGO AQUI
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
                                download
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