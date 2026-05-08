import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { lightTheme, darkTheme } from './theme';
import ThemeToggleButton from './components/ThemeToggleButton';
import LandingPage from './pages/LandingPage';

const API_URL = process.env.REACT_APP_API_URL;

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [isDark, setIsDark] = useState(false);

  const fetchTodos = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!title) return;

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    setTitle('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTodos();
  };

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          padding: '2rem',
        }}
      >
        <ThemeToggleButton
          isDark={isDark}
          onToggle={() => setIsDark((prev) => !prev)}
        />

        <Typography variant="h4" gutterBottom>
          Todo App
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo"
            size="small"
            variant="outlined"
          />
          <Button variant="contained" onClick={addTodo}>
            Add
          </Button>
        </Box>

        <List disablePadding>
          {todos.map((todo) => (
            <ListItem
              key={todo._id}
              disableGutters
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => deleteTodo(todo._id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText primary={todo.title} />
            </ListItem>
          ))}
        </List>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<TodoApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;