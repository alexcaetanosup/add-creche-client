import json
import os
from datetime import datetime
from fpdf import FPDF

class SistemaFinanceiro:
    def __init__(self):
        self.clientes = []
        self.cobrancas = []
        self.carregar_dados()

    # Métodos principais
    def carregar_dados(self):
        """Carrega dados de arquivos JSON se existirem"""
        try:
            with open('clientes.json', 'r') as f:
                self.clientes = json.load(f)
        except FileNotFoundError:
            self.clientes = []
        
        try:
            with open('cobrancas.json', 'r') as f:
                self.cobrancas = json.load(f)
        except FileNotFoundError:
            self.cobrancas = []

    def salvar_dados(self):
        """Salva dados em arquivos JSON"""
        with open('clientes.json', 'w') as f:
            json.dump(self.clientes, f, indent=4)
        
        with open('cobrancas.json', 'w') as f:
            json.dump(self.cobrancas, f, indent=4)

    # Gerenciamento de Clientes
    def adicionar_cliente(self, nome, email, telefone):
        """Adiciona um novo cliente ao sistema"""
        cliente = {
            'id': len(self.clientes) + 1,
            'nome': nome,
            'email': email,
            'telefone': telefone,
            'data_cadastro': datetime.now().strftime('%d/%m/%Y %H:%M:%S')
        }
        self.clientes.append(cliente)
        self.salvar_dados()
        return cliente

    def listar_clientes(self):
        """Retorna lista de todos os clientes"""
        return self.clientes

    def buscar_cliente(self, id_cliente):
        """Busca cliente por ID"""
        for cliente in self.clientes:
            if cliente['id'] == id_cliente:
                return cliente
        return None

    # Gerenciamento de Cobranças
    def criar_cobranca(self, id_cliente, valor, descricao, vencimento):
        """Cria uma nova cobrança para um cliente"""
        cobranca = {
            'id': len(self.cobrancas) + 1,
            'id_cliente': id_cliente,
            'valor': float(valor),
            'descricao': descricao,
            'vencimento': vencimento,
            'data_criacao': datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
            'pago': False
        }
        self.cobrancas.append(cobranca)
        self.salvar_dados()
        return cobranca

    def registrar_pagamento(self, id_cobranca):
        """Registra um pagamento para uma cobrança"""
        for cobranca in self.cobrancas:
            if cobranca['id'] == id_cobranca:
                cobranca['pago'] = True
                cobranca['data_pagamento'] = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
                self.salvar_dados()
                return cobranca
        return None

    def listar_cobrancas_cliente(self, id_cliente):
        """Lista todas as cobranças de um cliente"""
        return [c for c in self.cobrancas if c['id_cliente'] == id_cliente]

    def listar_cobrancas_vencidas(self):
        """Lista cobranças não pagas e vencidas"""
        hoje = datetime.now().strftime('%d/%m/%Y')
        return [c for c in self.cobrancas if not c['pago'] and c['vencimento'] < hoje]

    # Relatórios
    def relatorio_clientes(self, formato='txt'):
        """Gera relatório de clientes"""
        if formato == 'txt':
            return self._gerar_relatorio_clientes_txt()
        elif formato == 'pdf':
            return self._gerar_relatorio_clientes_pdf()
        else:
            raise ValueError("Formato inválido. Use 'txt' ou 'pdf'.")

    def relatorio_cobrancas(self, formato='txt'):
        """Gera relatório de cobranças"""
        if formato == 'txt':
            return self._gerar_relatorio_cobrancas_txt()
        elif formato == 'pdf':
            return self._gerar_relatorio_cobrancas_pdf()
        else:
            raise ValueError("Formato inválido. Use 'txt' ou 'pdf'.")

    def relatorio_financeiro(self, formato='txt'):
        """Gera relatório financeiro consolidado"""
        if formato == 'txt':
            return self._gerar_relatorio_financeiro_txt()
        elif formato == 'pdf':
            return self._gerar_relatorio_financeiro_pdf()
        else:
            raise ValueError("Formato inválido. Use 'txt' ou 'pdf'.")

    # Métodos privados para geração de relatórios TXT
    def _gerar_relatorio_clientes_txt(self):
        """Gera relatório de clientes em TXT"""
        filename = f"relatorio_clientes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(filename, 'w') as f:
            f.write("RELATÓRIO DE CLIENTES\n")
            f.write(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
            f.write("="*50 + "\n")
            f.write(f"{'ID':<5} | {'Nome':<30} | {'Email':<30} | {'Telefone':<15}\n")
            f.write("-"*80 + "\n")
            
            for cliente in self.clientes:
                f.write(f"{cliente['id']:<5} | {cliente['nome']:<30} | {cliente['email']:<30} | {cliente['telefone']:<15}\n")
        
        return filename

    def _gerar_relatorio_cobrancas_txt(self):
        """Gera relatório de cobranças em TXT"""
        filename = f"relatorio_cobrancas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(filename, 'w') as f:
            f.write("RELATÓRIO DE COBRANÇAS\n")
            f.write(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
            f.write("="*50 + "\n")
            f.write(f"{'ID':<5} | {'Cliente':<20} | {'Valor':<10} | {'Vencimento':<12} | {'Status':<10}\n")
            f.write("-"*80 + "\n")
            
            for cobranca in self.cobrancas:
                cliente = self.buscar_cliente(cobranca['id_cliente'])
                nome_cliente = cliente['nome'] if cliente else "Cliente não encontrado"
                status = "Pago" if cobranca['pago'] else "Pendente"
                f.write(f"{cobranca['id']:<5} | {nome_cliente:<20} | R${cobranca['valor']:<9.2f} | {cobranca['vencimento']:<12} | {status:<10}\n")
        
        return filename

    def _gerar_relatorio_financeiro_txt(self):
        """Gera relatório financeiro em TXT"""
        filename = f"relatorio_financeiro_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        total_pendente = sum(c['valor'] for c in self.cobrancas if not c['pago'])
        total_recebido = sum(c['valor'] for c in self.cobrancas if c['pago'])
        
        with open(filename, 'w') as f:
            f.write("RELATÓRIO FINANCEIRO\n")
            f.write(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
            f.write("="*50 + "\n")
            f.write(f"Total de Clientes: {len(self.clientes)}\n")
            f.write(f"Total de Cobranças: {len(self.cobrancas)}\n")
            f.write(f"Valor Pendente: R$ {total_pendente:.2f}\n")
            f.write(f"Valor Recebido: R$ {total_recebido:.2f}\n")
            f.write("="*50 + "\n")
            f.write("Cobranças Vencidas:\n")
            
            vencidas = self.listar_cobrancas_vencidas()
            for cobranca in vencidas:
                cliente = self.buscar_cliente(cobranca['id_cliente'])
                nome_cliente = cliente['nome'] if cliente else "Cliente não encontrado"
                f.write(f"- {nome_cliente}: R$ {cobranca['valor']:.2f} (Vencimento: {cobranca['vencimento']})\n")
        
        return filename

    # Métodos privados para geração de relatórios PDF
    def _gerar_relatorio_clientes_pdf(self):
        """Gera relatório de clientes em PDF"""
        filename = f"relatorio_clientes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Título
        pdf.cell(200, 10, txt="RELATÓRIO DE CLIENTES", ln=1, align='C')
        pdf.cell(200, 10, txt=f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", ln=1, align='C')
        pdf.ln(10)
        
        # Cabeçalho
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(10, 10, "ID", 1, 0, 'C')
        pdf.cell(60, 10, "Nome", 1, 0, 'C')
        pdf.cell(70, 10, "Email", 1, 0, 'C')
        pdf.cell(50, 10, "Telefone", 1, 1, 'C')
        pdf.set_font("Arial", size=10)
        
        # Dados
        for cliente in self.clientes:
            pdf.cell(10, 10, str(cliente['id']), 1, 0, 'C')
            pdf.cell(60, 10, cliente['nome'], 1, 0)
            pdf.cell(70, 10, cliente['email'], 1, 0)
            pdf.cell(50, 10, cliente['telefone'], 1, 1)
        
        pdf.output(filename)
        return filename

    def _gerar_relatorio_cobrancas_pdf(self):
        """Gera relatório de cobranças em PDF"""
        filename = f"relatorio_cobrancas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Título
        pdf.cell(200, 10, txt="RELATÓRIO DE COBRANÇAS", ln=1, align='C')
        pdf.cell(200, 10, txt=f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", ln=1, align='C')
        pdf.ln(10)
        
        # Cabeçalho
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(10, 10, "ID", 1, 0, 'C')
        pdf.cell(50, 10, "Cliente", 1, 0, 'C')
        pdf.cell(30, 10, "Valor", 1, 0, 'C')
        pdf.cell(30, 10, "Vencimento", 1, 0, 'C')
        pdf.cell(30, 10, "Status", 1, 1, 'C')
        pdf.set_font("Arial", size=10)
        
        # Dados
        for cobranca in self.cobrancas:
            cliente = self.buscar_cliente(cobranca['id_cliente'])
            nome_cliente = cliente['nome'][:20] + "..." if cliente and len(cliente['nome']) > 20 else cliente['nome'] if cliente else "N/E"
            status = "Pago" if cobranca['pago'] else "Pendente"
            
            pdf.cell(10, 10, str(cobranca['id']), 1, 0, 'C')
            pdf.cell(50, 10, nome_cliente, 1, 0)
            pdf.cell(30, 10, f"R$ {cobranca['valor']:.2f}", 1, 0, 'R')
            pdf.cell(30, 10, cobranca['vencimento'], 1, 0, 'C')
            pdf.cell(30, 10, status, 1, 1, 'C')
        
        pdf.output(filename)
        return filename

    def _gerar_relatorio_financeiro_pdf(self):
        """Gera relatório financeiro em PDF"""
        filename = f"relatorio_financeiro_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        total_pendente = sum(c['valor'] for c in self.cobrancas if not c['pago'])
        total_recebido = sum(c['valor'] for c in self.cobrancas if c['pago'])
        vencidas = self.listar_cobrancas_vencidas()
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Título
        pdf.cell(200, 10, txt="RELATÓRIO FINANCEIRO", ln=1, align='C')
        pdf.cell(200, 10, txt=f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", ln=1, align='C')
        pdf.ln(10)
        
        # Resumo
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt="Resumo Financeiro", ln=1)
        pdf.set_font("Arial", size=12)
        
        pdf.cell(100, 10, txt=f"Total de Clientes: {len(self.clientes)}", ln=1)
        pdf.cell(100, 10, txt=f"Total de Cobranças: {len(self.cobrancas)}", ln=1)
        pdf.cell(100, 10, txt=f"Valor Pendente: R$ {total_pendente:.2f}", ln=1)
        pdf.cell(100, 10, txt=f"Valor Recebido: R$ {total_recebido:.2f}", ln=1)
        pdf.ln(10)
        
        # Cobranças vencidas
        if vencidas:
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(200, 10, txt="Cobranças Vencidas", ln=1)
            pdf.set_font("Arial", size=10)
            
            for cobranca in vencidas:
                cliente = self.buscar_cliente(cobranca['id_cliente'])
                nome_cliente = cliente['nome'] if cliente else "Cliente não encontrado"
                pdf.cell(200, 10, txt=f"- {nome_cliente}: R$ {cobranca['valor']:.2f} (Vencimento: {cobranca['vencimento']})", ln=1)
        else:
            pdf.cell(200, 10, txt="Nenhuma cobrança vencida", ln=1)
        
        pdf.output(filename)
        return filename