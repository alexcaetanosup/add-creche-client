const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Conecte-se ao Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ROTAS DA API ---

// Exemplo: GET todos os clientes
app.get('/api/clientes', async (req, res) => {
    const { data, error } = await supabase.from('clientes').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// Exemplo: POST um novo cliente
app.post('/api/clientes', async (req, res) => {
    const { data, error } = await supabase.from('clientes').insert([req.body]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// ... Você precisará criar rotas para TODAS as suas operações (GET, POST, PUT, DELETE para clientes, cobranças, config) ...

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});