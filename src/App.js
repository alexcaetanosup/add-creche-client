import React from 'react';
import './App.css';

function App() {
  // Pega os valores das variáveis de ambiente
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'monospace', lineHeight: '1.6' }}>
      <h1>Modo de Depuração de Variáveis de Ambiente</h1>

      <div style={{ border: '2px solid #ccc', padding: '15px', marginTop: '20px' }}>
        <h2>Verificando <code>process.env</code>:</h2>

        <div>
          <strong>REACT_APP_SUPABASE_URL:</strong>
          <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', color: supabaseUrl ? 'green' : 'red' }}>
            {supabaseUrl || 'NÃO DEFINIDA OU VAZIA'}
          </pre>
        </div>

        <div style={{ marginTop: '20px' }}>
          <strong>REACT_APP_SUPABASE_ANON_KEY:</strong>
          <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', color: supabaseAnonKey ? 'green' : 'red' }}>
            {supabaseAnonKey ? `DEFINIDA (comprimento: ${supabaseAnonKey.length})` : 'NÃO DEFINIDA OU VAZIA'}
          </pre>
          <small>(A chave não é mostrada por segurança, apenas sua presença e comprimento)</small>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Instruções:</h3>
        <ol>
          <li>Se ambos os campos estiverem em <strong><span style={{ color: 'green' }}>VERDE</span></strong> e mostrando 'DEFINIDA', o problema está em outro lugar (provavelmente no `supabaseClient.js`).</li>
          <li>Se um ou ambos os campos estiverem em <strong><span style={{ color: 'red' }}>VERMELHO</span></strong> e mostrando 'NÃO DEFINIDA', isso <strong>prova</strong> que a Render não está injetando as variáveis no processo de build.</li>
          <li>Se esse for o caso, a causa é 100% um erro de digitação no nome da variável (Key) no dashboard da Render.</li>
        </ol>
      </div>
    </div>
  );
}

export default App;


