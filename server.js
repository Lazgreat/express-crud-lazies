const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para processar requisições com corpo JSON
app.use(express.json());

// Caminho para o nosso arquivo JSON de usuários
const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Função para ler os usuários do arquivo
const readUsers = () => {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler o arquivo de usuários:', error);
        return []; // Retorna um array vazio se houver erro
    }
};

// Função para escrever os usuários no arquivo
const writeUsers = (users) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Erro ao escrever no arquivo de usuários:', error);
    }
};

// ROTAS DO CRUD

// Rota 1: READ - Listar todos os usuários
app.get('/users', (req, res) => {
    const users = readUsers();
    res.json(users);
});

// Rota 2: READ - Obter um usuário por ID
app.get('/users/:id', (req, res) => {
    const users = readUsers();
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'Usuário não encontrado.' });
    }
});

// Rota 3: CREATE - Criar um novo usuário
app.post('/users', (req, res) => {
    const users = readUsers();
    const newUser = req.body;

    // Gerar um novo ID (usando um ID simples e incrementado)
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    newUser.id = newId;

    // Adicionar o novo usuário ao array
    users.push(newUser);

    // Salvar o array atualizado no arquivo
    writeUsers(users);

    res.status(201).json(newUser);
});

// Rota 4: UPDATE - Atualizar um usuário por ID
app.put('/users/:id', (req, res) => {
    const users = readUsers();
    const userId = parseInt(req.params.id);
    const updatedUser = req.body;

    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        // Atualizar o usuário mantendo o ID original
        users[userIndex] = { ...users[userIndex], ...updatedUser, id: userId };
        writeUsers(users);
        res.json(users[userIndex]);
    } else {
        res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
    }
});

// Rota 5: DELETE - Deletar um usuário por ID
app.delete('/users/:id', (req, res) => {
    const users = readUsers();
    const userId = parseInt(req.params.id);

    const initialLength = users.length;
    const filteredUsers = users.filter(u => u.id !== userId);

    if (filteredUsers.length < initialLength) {
        writeUsers(filteredUsers);
        res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    } else {
        res.status(404).json({ message: 'Usuário não encontrado para exclusão.' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});