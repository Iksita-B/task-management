const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo
} = require('../controllers/todoController');

router.use(authMiddleware);

router.get('/', getTodos);
router.post('/', createTodo);
router.delete('/:id', deleteTodo);
router.put('/:id', updateTodo);

module.exports = router;