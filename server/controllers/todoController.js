const Todo = require('../models/todo');

// GET all todos
exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id })
      .populate('relatedTask', 'title status')
      .populate('parentTask', 'title status')
      .sort({ updatedAt: -1 });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch todos' });
  }
};

// CREATE todo
exports.createTodo = async (req, res) => {
  try {
    const {
      title,
      description = '',
      priority = 'medium',
      dueDate = null,
      status = 'todo',
      relatedTask = null,
      parentTask = null,
      comments = [],
      subtasks = [],
    } = req.body;

    const newTodo = await Todo.create({
      user: req.user._id,
      title,
      description,
      priority,
      dueDate,
      status,
      relatedTask,
      parentTask,
      comments,
      subtasks,
    });

    const populatedTodo = await Todo.findById(newTodo._id).populate(
      'relatedTask',
      'title status'
    ).populate('parentTask', 'title status');

    res.status(201).json(populatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create todo' });
  }
};

// DELETE todo
exports.deleteTodo = async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete todo' });
  }
};

// UPDATE todo
exports.updateTodo = async (req, res) => {
  try {
    const updated = await Todo.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('relatedTask', 'title status')
      .populate('parentTask', 'title status');

    if (!updated) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update todo' });
  }
};