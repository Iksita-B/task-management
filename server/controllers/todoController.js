const Todo = require('../models/todo');

// GET all todos
exports.getTodos = async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
};

// CREATE todo
exports.createTodo = async (req, res) => {
  const { title } = req.body;
  const newTodo = new Todo({ title });
  await newTodo.save();
  res.json(newTodo);
};

// DELETE todo
exports.deleteTodo = async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

// UPDATE todo
exports.updateTodo = async (req, res) => {
  const updated = await Todo.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};