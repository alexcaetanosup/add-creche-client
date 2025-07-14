import React from 'react';
import './SobrePage.css'; // Vamos criar este arquivo de CSS para estilizar

const SobrePage = () => {
    return (
        <div className="sobre-container">
            <h1>Sobre o Sistema de Cobranças</h1>
            <p className="sobre-descricao">
                Este sistema foi desenvolvido para simplificar e automatizar o processo de
                gerenciamento de cobranças, geração de remessas e conciliação bancária.
            </p>

            <div className="contato-info">
                <h2>Informações de Contato e Suporte</h2>
                <div className="info-item">
                    <strong>Desenvolvedor:</strong>
                    <span>Alex Caetano dos Santos</span>
                </div>
                <div className="info-item">
                    <strong>E-mail:</strong>
                    <span><a href="mailto: alexcaetanosuporte@gmail.com">alexcaetanosuporte@gmail.com</a></span>
                </div>
                <div className="info-item">
                    <strong>Celular/WhatsApp:</strong>
                    <span><a href="https://wa.me/5511999999999" target="_blank" rel=" noopener noreferrer">(15) 99696-5727</a></span>
                </div>
                <div className="info-item">
                    <strong>Endereço:</strong>
                    <span>Av Gisele Constantino, 430 - Bloco D - Apto 63 - Pq Bela Vista</span>

                </div>
                <div className="info-item">
                    <strong>Conplemento:</strong>
                    <span>Votorantim - SP - CEP 18110-650</span>
                </div>
            </div>

            <div className="info-versao">
                <p>Versão do Aplicativo: 1.0.0</p>
            </div>
        </div>
    );
};

export default SobrePage;