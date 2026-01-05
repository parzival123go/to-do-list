const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.send('Hello, World!');
});

app.get('/todos', (req, res) => {

    const showpending = req.query.showpending

    fs.readFile('./store/todos.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading todos');
        }

        const todos = JSON.parse(data);

        if (showpending !== "1") {
            return res.json({todos : todos});
        }else{
            return res.json({todos : todos.filter(t => {return t.completed === false})});
        }
    })
        
});
  
app.put('/todos/:id/complete', (req, res) => {
    const id = req.params.id;

    const findTodoById = (todos, id) => {
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].id === parseInt(id)) {
                return i;
            }
        }
        return -1;
    }

    fs.readFile('./store/todos.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading todos');
        }


        let todos = JSON.parse(data);
        const todIndex = findTodoById(todos, id);

        if (todIndex === -1) {
            return res.status(404).send('Todo not found');
        }

        todos[todIndex].completed = true;

        fs.writeFile('./store/todos.json', JSON.stringify(todos), (err) => {
            if (err) {
                return res.status(500).send('Error updating todo');
            }   
            return res.json({'status': 'ok'});
        });
    });

});

app.post('/todo', express.json(), (req, res) => {
    if (!req.body.name) {
        return res.status(400).send('Name required');
    }

    fs.readFile('./store/todos.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading todos');
        }

        let todos = JSON.parse(data);
        const maxId = Math.max.apply(Math, todos.map(t => { return t.id}))

        todos.push({
            id: maxId + 1,
            task: req.body.name,
            completed: false
        });

        fs.writeFile('./store/todos.json', JSON.stringify(todos), (err) => {
            if (err) {
                return res.status(500).send('Error updating todo');
            }   
            return res.json({'status': 'ok'});
        });

    });

});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
