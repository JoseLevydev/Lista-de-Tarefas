import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';  // Use a versão com Promise
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'task_manager'
};
// Cria uma conexão com suporte a Promise
const pool = mysql.createPool(connectionConfig);

// Rota para adicionar uma nova tarefa
app.post('/tasks_', async (req: Request, res: Response) => {
    const { text, imageUrl } = req.body;

    if (!text || !imageUrl) {
        console.error('Dados inválidos recebidos:', req.body);
        return res.status(400).json({ error: 'Texto e URL da imagem são obrigatórios' });
    }

    try {
        const [result] = await pool.query('INSERT INTO tasks_ (text, imageUrl) VALUES (?, ?)', [text, imageUrl]);
        const insertId = (result as mysql.OkPacket).insertId;
        console.log(`Nova tarefa adicionada com ID: ${insertId}`);
        const newTask = { id: insertId, text, imageUrl };
        res.status(201).json(newTask);
    } catch (err) {
        console.error('Erro ao adicionar tarefa:', err);
        res.status(500).json({ error: 'Erro ao adicionar tarefa', details: (err as Error).message });
    }
});


// Rota para obter todas as tarefas
app.get('/tasks_', async (req: Request, res: Response) => {
    try {
        const [results] = await pool.query('SELECT * FROM tasks_');
        res.json(results);
    } catch (err) {
        console.error('Erro ao obter tarefas:', err);
        res.status(500).json({ error: 'Erro ao obter tarefas', details: (err as Error).message });
    }
});

// Rota para atualizar uma tarefa existente
app.put('/tasks_/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text, imageUrl } = req.body;

    if (!text || !imageUrl) {
        return res.status(400).json({ error: 'Texto e URL da imagem são obrigatórios' });
    }

    try {
        const [result] = await pool.query('UPDATE tasks_ SET text = ?, imageUrl = ? WHERE id = ?', [text, imageUrl, id]);

        const affectedRows = (result as mysql.OkPacket).affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        const updatedTask = { id, text, imageUrl };
        res.json(updatedTask);
    } catch (err) {
        console.error('Erro ao atualizar tarefa:', err);
        res.status(500).json({ error: 'Erro ao atualizar tarefa', details: (err as Error).message });
    }
});

// Rota para excluir uma tarefa existente
app.delete('/tasks_/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM tasks_ WHERE id = ?', [id]);

        const affectedRows = (result as mysql.OkPacket).affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.status(204).send();  // 204 No Content para indicar sucesso sem corpo de resposta
    } catch (err) {
        console.error('Erro ao excluir tarefa:', err);
        res.status(500).json({ error: 'Erro ao excluir tarefa', details: (err as Error).message });
    }
});

// Rota para a raiz (opcional)
app.get('/', (req: Request, res: Response) => {
    res.send('Servidor está funcionando');
});

app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
});
