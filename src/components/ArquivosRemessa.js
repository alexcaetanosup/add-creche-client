import React, { useState, useEffect } from 'react';

// A URL base da API será passada como prop
const ArquivosRemessa = ({ apiBaseUrl }) => {
    const [arquivos, setArquivos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Em ArquivosRemessa.js

    useEffect(() => {
        const fetchArquivos = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/listar-arquivos`);

                // Verifica se a resposta da API foi bem-sucedida
                if (!response.ok) {
                    // Se não foi, lança um erro para ser pego pelo catch
                    throw new Error('Falha ao buscar a lista de arquivos.');
                }

                const data = await response.json();

                // Garante que estamos sempre salvando um array no estado
                if (Array.isArray(data)) {
                    setArquivos(data);
                } else {
                    setArquivos([]); // Se a resposta não for um array, define como array vazio
                }

            } catch (error) {
                console.error("Erro ao buscar lista de arquivos:", error);
                setArquivos([]); // Em caso de erro, garante que 'arquivos' seja um array vazio
            } finally {
                setLoading(false);
            }
        };

        fetchArquivos();
    }, [apiBaseUrl]);

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