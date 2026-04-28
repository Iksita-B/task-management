import { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');

  // Fetch todos
  const fetchTodos = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add todo
  const addTodo = async () => {
    if (!title) return;

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });

    setTitle('');
    fetchTodos();
  };

  // Delete todo
  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    fetchTodos();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Todo App</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter todo"
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            {todo.title}
            <button onClick={() => deleteTodo(todo._id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;