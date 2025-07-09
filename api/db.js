const fs = require('fs');
const path = require('path');

// Caminho para o arquivo db.json. Em Vercel, o único lugar onde podemos escrever
// de forma persistente entre chamadas é a pasta /tmp.
const dbPath = path.resolve('/tmp', 'db.json');

// Função para garantir que o db.json exista na pasta /tmp
const ensureDbExists = () => {
  if (!fs.existsSync(dbPath)) {
    // Se não existir, copie o nosso arquivo de exemplo para lá
    const exampleDbPath = path.resolve(process.cwd(), 'db.example.json');
    fs.copyFileSync(exampleDbPath, dbPath);
  }
};

export default function handler(req, res) {
  ensureDbExists();

  let data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const { entity, id } = req.query; // Pega 'clientes' ou 'cobrancas' e o ID da URL

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    if (id) {
      const item = data[entity]?.find(item => String(item.id) === String(id));
      return item ? res.status(200).json(item) : res.status(404).json({ message: 'Not Found' });
    }
    return res.status(200).json(data[entity] || []);
  }

  if (req.method === 'POST') {
    const newItem = { ...req.body, id: Date.now() }; // ID simples baseado em timestamp
    data[entity] = [...(data[entity] || []), newItem];
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return res.status(201).json(newItem);
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ message: 'ID is required' });
    let itemUpdated = false;
    data[entity] = data[entity]?.map(item => {
      if (String(item.id) === String(id)) {
        itemUpdated = true;
        return { ...item, ...req.body };
      }
      return item;
    });
    if (itemUpdated) {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      return res.status(200).json({ ...req.body });
    }
    return res.status(404).json({ message: 'Not Found' });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ message: 'ID is required' });
    const initialLength = data[entity]?.length || 0;
    data[entity] = data[entity]?.filter(item => String(item.id) !== String(id));
    if (data[entity].length < initialLength) {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      return res.status(204).end();
    }
    return res.status(404).json({ message: 'Not Found' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}