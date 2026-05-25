import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import WestRoundedIcon from '@mui/icons-material/WestRounded';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import logo from '../assets/logo.png';
import { authApi, getAuthorizedConfig, todoApi } from '../lib/api';

const priorityOptions = ['low', 'medium', 'high'];

const createEmptyDraft = (status = 'todo', relatedTask = '') => ({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  status,
  relatedTask,
  comments: [],
  subtasks: [],
});

const richTextToolbarActions = [
  { command: 'bold', label: 'Bold', icon: <FormatBoldRoundedIcon fontSize="small" /> },
  { command: 'italic', label: 'Italic', icon: <FormatItalicRoundedIcon fontSize="small" /> },
  { command: 'underline', label: 'Underline', icon: <FormatUnderlinedRoundedIcon fontSize="small" /> },
  { command: 'insertUnorderedList', label: 'Bullet list', icon: <FormatListBulletedRoundedIcon fontSize="small" /> },
];

const absoluteTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const getPlainText = (value = '') =>
  value
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hasRichTextContent = (value = '') => Boolean(getPlainText(value) || value.match(/<img\b/i));

const formatRelativeTime = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);
  const elapsedSeconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds} sec ago`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} hr${elapsedHours === 1 ? '' : 's'} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);

  if (elapsedDays < 7) {
    return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`;
  }

  const elapsedWeeks = Math.floor(elapsedDays / 7);

  if (elapsedWeeks < 5) {
    return `${elapsedWeeks} week${elapsedWeeks === 1 ? '' : 's'} ago`;
  }

  return absoluteTimeFormatter.format(date);
};

const getCommentTimestampLabel = (comment) => {
  const updatedAt = comment.updatedAt || comment.createdAt;

  if (!updatedAt) {
    return '';
  }

  const elapsedDays = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  const relativeTime = formatRelativeTime(updatedAt);

  if (elapsedDays >= 30) {
    return absoluteTimeFormatter.format(new Date(updatedAt));
  }

  return comment.updatedAt && comment.updatedAt !== comment.createdAt
    ? `${relativeTime} · edited`
    : relativeTime;
};

const buildCommentDraft = (comment, userName) => ({
  _id: comment?._id,
  text: comment?.text || '',
  authorName: comment?.authorName || userName || 'You',
  authorInitial: comment?.authorInitial || (userName || 'You').charAt(0).toUpperCase(),
  createdAt: comment?.createdAt || new Date().toISOString(),
  updatedAt: comment?.updatedAt || comment?.createdAt || new Date().toISOString(),
});

const subtleActionButtonStyles = {
  width: 30,
  height: 30,
  border: '1px solid',
  borderColor: 'divider',
  color: 'text.secondary',
  bgcolor: 'background.paper',
  transition: 'all 180ms ease',
  '&:hover': {
    borderColor: 'primary.main',
    color: 'primary.main',
    bgcolor: 'action.hover',
  },
};

const getTodayIsoDate = () => new Date().toISOString().slice(0, 10);

const formatDateDisplay = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateValue));
};

const isDatePastDue = (dateValue) => {
  if (!dateValue) {
    return false;
  }

  const inputDate = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate < today;
};

const normalizeTaskForDraft = (task) => ({
  title: task.title || '',
  description: task.description || '',
  priority: task.priority || 'medium',
  dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
  status: task.status || 'todo',
  relatedTask: task.relatedTask?._id || task.relatedTask || '',
  comments: (task.comments || []).map((comment) => ({
    _id: comment._id,
    text: comment.text || '',
    authorName: comment.authorName || '',
    authorInitial: comment.authorInitial || '',
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt || comment.createdAt,
  })),
  subtasks: (task.subtasks || []).map((subtask) => ({
    title: subtask.title,
    completed: !!subtask.completed,
    createdAt: subtask.createdAt,
  })),
});

function RichTextField({
  label,
  value,
  onChange,
  minHeight = 120,
  placeholder,
  autoFocus = false,
  onKeyDown,
}) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  const syncEditor = () => {
    onChange(editorRef.current?.innerHTML || '');
  };

  const applyCommand = (command) => {
    editorRef.current?.focus();
    document.execCommand(command, false, null);
    syncEditor();
  };

  const handleImageSelection = (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      editorRef.current?.focus();
      document.execCommand('insertImage', false, reader.result);
      syncEditor();
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box>
      {label ? (
        <Typography sx={{ fontWeight: 700, mb: 1, color: 'text.secondary', fontSize: '0.88rem' }}>
          {label}
        </Typography>
      ) : null}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={0.5} sx={{ px: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
          {richTextToolbarActions.map((action) => (
            <IconButton
              key={action.command}
              size="small"
              onClick={() => applyCommand(action.command)}
              title={action.label}
            >
              {action.icon}
            </IconButton>
          ))}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageSelection}
          />
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            title="Add image"
          >
            <ImageRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncEditor}
          onKeyDown={onKeyDown}
          data-placeholder={placeholder}
          sx={{
            minHeight,
            px: 1.5,
            py: 1.25,
            outline: 'none',
            '&:empty:before': {
              content: 'attr(data-placeholder)',
              color: 'text.disabled',
            },
            '& img': {
              maxWidth: '100%',
              borderRadius: 2,
              display: 'block',
              my: 1,
            },
            '& ul': {
              pl: 3,
            },
            '& p': {
              my: 0,
            },
          }}
        />
      </Paper>
    </Box>
  );
}

function TaskDialog({
  open,
  isSaving,
  editingTask,
  currentUser,
  initialStatus,
  initialRelatedTask,
  boardColumns,
  todos,
  childTasks,
  onClose,
  onDelete,
  onCreateSubtask,
  onSave,
}) {
  const [taskDraft, setTaskDraft] = useState(createEmptyDraft());
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingCommentId, setEditingCommentId] = useState('');
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [commentMenuId, setCommentMenuId] = useState('');
  const [localError, setLocalError] = useState('');
  const [saveState, setSaveState] = useState('idle');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [pendingTitle, setPendingTitle] = useState('');
  const [pendingDescription, setPendingDescription] = useState('');
  const lastSavedSnapshotRef = useRef('');

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingTask) {
      const normalizedDraft = normalizeTaskForDraft(editingTask);
      setTaskDraft(normalizedDraft);
      lastSavedSnapshotRef.current = JSON.stringify(normalizedDraft);
    } else {
      const emptyDraft = createEmptyDraft(initialStatus, initialRelatedTask);
      setTaskDraft(emptyDraft);
      lastSavedSnapshotRef.current = JSON.stringify(emptyDraft);
    }

    setNewComment('');
    setNewSubtaskTitle('');
    setEditingCommentId('');
    setEditingCommentText('');
    setCommentMenuAnchor(null);
    setCommentMenuId('');
    setLocalError('');
    setSaveState('idle');
    setIsEditingTitle(!editingTask);
    setIsEditingDescription(!editingTask);
    setPendingTitle(editingTask?.title || 'Untitled task');
    setPendingDescription(editingTask?.description || 'Add a description');
  }, [editingTask, initialRelatedTask, initialStatus, open]);

  useEffect(() => {
    if (!open || !editingTask) {
      return undefined;
    }

    const nextSnapshot = JSON.stringify(taskDraft);

    if (nextSnapshot === lastSavedSnapshotRef.current || !taskDraft.title.trim()) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setSaveState('saving');
      const savedTask = await onSave({
        editingTaskId: editingTask._id,
        taskDraft,
        options: {
          closeOnSuccess: false,
          notifyOnSuccess: false,
        },
      });

      if (savedTask) {
        const savedDraft = normalizeTaskForDraft(savedTask);
        lastSavedSnapshotRef.current = JSON.stringify(savedDraft);
        setTaskDraft(savedDraft);
        setSaveState('saved');
      } else {
        setSaveState('error');
      }
    }, 550);

    return () => window.clearTimeout(timer);
  }, [editingTask, onSave, open, taskDraft]);

  const handleDraftChange = (field) => (event) => {
    const nextValue = event.target.value;
    setTaskDraft((currentDraft) => ({
      ...currentDraft,
      [field]: nextValue,
    }));

    if (localError && field === 'title' && nextValue.trim()) {
      setLocalError('');
    }

    if (editingTask) {
      setSaveState('idle');
    }
  };

  const commitInlineField = (field) => {
    if (field === 'title') {
      if (!pendingTitle.trim()) {
        setLocalError('Task title is required.');
        return;
      }

      setTaskDraft((currentDraft) => ({ ...currentDraft, title: pendingTitle.trim() }));
      setIsEditingTitle(false);
      setLocalError('');
    }

    if (field === 'description') {
      setTaskDraft((currentDraft) => ({ ...currentDraft, description: pendingDescription }));
      setIsEditingDescription(false);
    }

    if (editingTask) {
      setSaveState('idle');
    }
  };

  const cancelInlineField = (field) => {
    if (field === 'title') {
      setPendingTitle(taskDraft.title || '');
      setIsEditingTitle(false);
      setLocalError('');
    }

    if (field === 'description') {
      setPendingDescription(taskDraft.description || '');
      setIsEditingDescription(false);
    }
  };

  const addDraftComment = () => {
    if (!hasRichTextContent(newComment)) {
      return;
    }

    setTaskDraft((currentDraft) => ({
      ...currentDraft,
      comments: [
        ...currentDraft.comments,
        buildCommentDraft(
          {
            text: newComment,
          },
          currentUser?.name
        ),
      ],
    }));
    setNewComment('');
    setSaveState('idle');
  };

  const cancelNewComment = () => {
    setNewComment('');
  };

  const addDraftSubtaskToDraft = () => {
    if (!newSubtaskTitle.trim()) {
      return;
    }

    setTaskDraft((currentDraft) => ({
      ...currentDraft,
      subtasks: [
        ...currentDraft.subtasks,
        {
          title: newSubtaskTitle.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setNewSubtaskTitle('');
  };

  const cancelNewSubtask = () => {
    setNewSubtaskTitle('');
  };

  const handleDeleteComment = (commentId) => {
    setTaskDraft((currentDraft) => ({
      ...currentDraft,
      comments: currentDraft.comments.filter((comment) => (comment._id || comment.createdAt) !== commentId),
    }));
    setEditingCommentId('');
    setEditingCommentText('');
    setCommentMenuAnchor(null);
    setCommentMenuId('');
    setSaveState('idle');
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment._id || comment.createdAt);
    setEditingCommentText(comment.text || '');
    setCommentMenuAnchor(null);
    setCommentMenuId('');
  };

  const handleSaveEditedComment = () => {
    if (!hasRichTextContent(editingCommentText)) {
      return;
    }

    setTaskDraft((currentDraft) => ({
      ...currentDraft,
      comments: currentDraft.comments.map((comment) => {
        const commentId = comment._id || comment.createdAt;

        if (commentId !== editingCommentId) {
          return comment;
        }

        return {
          ...comment,
          text: editingCommentText,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    setEditingCommentId('');
    setEditingCommentText('');
    setSaveState('idle');
  };

  const handleAddCommentKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      addDraftComment();
    }
  };

  const handleSubtaskKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (editingTask) {
        handleCreateSubtaskClick();
        return;
      }

      addDraftSubtaskToDraft();
    }
  };

  const handleCreateSubtaskClick = () => {
    if (!newSubtaskTitle.trim()) {
      return;
    }

    if (!editingTask) {
      addDraftSubtaskToDraft();
      return;
    }

    onCreateSubtask({
      title: newSubtaskTitle,
      parentTask: editingTask,
      fallbackStatus: taskDraft.status,
    });
    setNewSubtaskTitle('');
  };

  const openCommentMenu = (event, commentId) => {
    setCommentMenuAnchor(event.currentTarget);
    setCommentMenuId(commentId);
  };

  const closeCommentMenu = () => {
    setCommentMenuAnchor(null);
    setCommentMenuId('');
  };

  const handleSave = () => {
    if (!taskDraft.title.trim()) {
      setLocalError('Task title is required.');
      return;
    }

    setLocalError('');
    onSave({
      editingTaskId: editingTask?._id || null,
      taskDraft,
      options: {
        closeOnSuccess: true,
        notifyOnSuccess: true,
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 7 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {editingTask ? 'Edit task' : 'Create task'}
          </Typography>
          {editingTask ? (
            <Typography sx={{ color: saveState === 'error' ? 'error.main' : 'text.secondary', fontSize: '0.84rem' }}>
              {saveState === 'saving'
                ? 'Saving changes...'
                : saveState === 'saved'
                  ? 'All changes saved'
                  : saveState === 'error'
                    ? 'Unable to auto-save changes'
                    : 'Changes save automatically'}
            </Typography>
          ) : null}
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 14, right: 14 }}
          aria-label="Close"
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {editingTask && !isEditingTitle ? (
            <Paper
              variant="outlined"
              onClick={() => setIsEditingTitle(true)}
              sx={{ p: 2.25, borderRadius: 3, cursor: 'pointer' }}
            >
              <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mb: 0.75 }}>Title</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.4px' }}>
                {taskDraft.title || 'Untitled task'}
              </Typography>
            </Paper>
          ) : (
            <Box sx={editingTask ? { p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' } : undefined}>
              <TextField
                label="Title"
                value={editingTask ? pendingTitle : taskDraft.title}
                onChange={(event) => {
                  if (editingTask) {
                    setPendingTitle(event.target.value);
                  } else {
                    handleDraftChange('title')(event);
                  }
                }}
                error={!!localError}
                helperText={localError}
                fullWidth
                autoFocus
              />
              {editingTask ? (
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                  <IconButton size="small" onClick={() => cancelInlineField('title')}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => commitInlineField('title')}>
                    <CheckRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : null}
            </Box>
          )}

          {editingTask && !isEditingDescription ? (
            <Paper
              variant="outlined"
              onClick={() => setIsEditingDescription(true)}
              sx={{ p: 2.25, borderRadius: 3, cursor: 'pointer' }}
            >
              <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mb: 0.75 }}>Description</Typography>
              {hasRichTextContent(taskDraft.description) ? (
                <Box
                  sx={{
                    color: 'text.primary',
                    '& img': { maxWidth: '100%', borderRadius: 2, display: 'block', my: 1 },
                    '& ul': { pl: 3 },
                    '& p': { my: 0 },
                  }}
                  dangerouslySetInnerHTML={{ __html: taskDraft.description || '' }}
                />
              ) : (
                <Typography sx={{ color: 'text.secondary' }}>Add a description</Typography>
              )}
            </Paper>
          ) : (
            <Box sx={editingTask ? { p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' } : undefined}>
              <RichTextField
                label="Description"
                value={editingTask ? pendingDescription : taskDraft.description}
                onChange={(nextValue) => {
                  if (editingTask) {
                    setPendingDescription(nextValue);
                  } else {
                    setTaskDraft((currentDraft) => ({ ...currentDraft, description: nextValue }));
                  }
                  if (editingTask) {
                    setSaveState('idle');
                  }
                }}
                minHeight={150}
                placeholder="Write a rich description, add bullets, and insert images."
              />
              {editingTask ? (
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                  <IconButton size="small" onClick={() => cancelInlineField('description')}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => commitInlineField('description')}>
                    <CheckRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : null}
            </Box>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                label="Priority"
                value={taskDraft.priority}
                onChange={handleDraftChange('priority')}
              >
                {priorityOptions.map((priority) => (
                  <MenuItem key={priority} value={priority} sx={{ textTransform: 'capitalize' }}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Due date"
              type="date"
              value={taskDraft.dueDate}
              onChange={handleDraftChange('dueDate')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: editingTask ? undefined : getTodayIsoDate() }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={taskDraft.status}
                onChange={handleDraftChange('status')}
              >
                {boardColumns.map((column) => (
                  <MenuItem key={column.key} value={column.key}>
                    {column.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="related-task-label">Related task</InputLabel>
              <Select
                labelId="related-task-label"
                label="Related task"
                value={taskDraft.relatedTask}
                onChange={handleDraftChange('relatedTask')}
              >
                <MenuItem value="">None</MenuItem>
                {todos
                  .filter((todo) => todo._id !== editingTask?._id)
                  .map((todo) => (
                    <MenuItem key={todo._id} value={todo._id}>
                      {todo.title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>

          <Divider />

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Comments</Typography>
            <RichTextField
              label="Add comment"
              value={newComment}
              onChange={setNewComment}
              minHeight={110}
              placeholder="Write a comment with formatting and images."
              onKeyDown={handleAddCommentKeyDown}
            />
            {hasRichTextContent(newComment) ? (
              <Stack direction="row" spacing={0.75} justifyContent="flex-end" sx={{ mt: 1.25 }}>
                <IconButton onClick={cancelNewComment} size="small" sx={subtleActionButtonStyles}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={addDraftComment} size="small" sx={subtleActionButtonStyles}>
                  <CheckRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : null}
            <List dense sx={{ px: 0 }}>
              {taskDraft.comments.map((comment, index) => {
                const commentId = comment._id || `${comment.createdAt}-${index}`;
                const isEditingComment = editingCommentId === commentId;

                return (
                  <ListItem
                    key={commentId}
                    disableGutters
                    sx={{ alignItems: 'flex-start', py: 1.25 }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                        {(comment.authorInitial || 'Y').toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75, width: '100%' }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                              {comment.authorName || currentUser?.name || 'You'}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                              {getCommentTimestampLabel(comment)}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            {isEditingComment ? (
                              <>
                                <IconButton size="small" onClick={handleSaveEditedComment}>
                                  <CheckRoundedIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingCommentId('');
                                    setEditingCommentText('');
                                  }}
                                >
                                  <CloseRoundedIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <IconButton size="small" onClick={(event) => openCommentMenu(event, commentId)}>
                                <MoreHorizRoundedIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        </Stack>
                        {isEditingComment ? (
                          <RichTextField
                            value={editingCommentText}
                            onChange={setEditingCommentText}
                            minHeight={96}
                            placeholder="Edit comment"
                          />
                        ) : (
                          <Box
                            sx={{
                              color: 'text.primary',
                              '& img': { maxWidth: '100%', borderRadius: 2, display: 'block', my: 1 },
                              '& ul': { pl: 3 },
                              '& p': { my: 0 },
                            }}
                            dangerouslySetInnerHTML={{ __html: comment.text || '' }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Subtasks</Typography>
            <TextField
              label="New subtask"
              value={newSubtaskTitle}
              onChange={(event) => setNewSubtaskTitle(event.target.value)}
              onKeyDown={handleSubtaskKeyDown}
              fullWidth
              helperText={editingTask ? 'Create a linked task card for this parent task.' : 'Create draft subtasks now and they will be created with the parent task.'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={handleCreateSubtaskClick}
                      disabled={!newSubtaskTitle.trim()}
                      color="primary"
                    >
                      <SendRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {newSubtaskTitle.trim() ? (
              <Stack direction="row" spacing={0.75} justifyContent="flex-end" sx={{ mt: 1.25 }}>
                <IconButton onClick={cancelNewSubtask} size="small" sx={subtleActionButtonStyles}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={handleCreateSubtaskClick} size="small" sx={subtleActionButtonStyles}>
                  <CheckRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : null}
            <List dense sx={{ px: 0 }}>
              {(editingTask ? childTasks : taskDraft.subtasks).map((subtask, index) => (
                <ListItem key={subtask._id || `${subtask.createdAt}-${index}`} disableGutters>
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: '100%' }}>
                    <CheckBoxOutlineBlankRoundedIcon sx={{ fontSize: 18, color: 'primary.main', strokeWidth: 1 }} />
                    <Typography sx={{ color: 'text.primary' }}>
                      {subtask.title}
                    </Typography>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        {editingTask ? (
          <Button
            onClick={() => onDelete(editingTask._id)}
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Delete
          </Button>
        ) : (
          <Stack direction="row" spacing={1.25} sx={{ ml: 'auto' }}>
            <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={isSaving} sx={{ textTransform: 'none', fontWeight: 700 }}>
              {isSaving ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Create task'}
            </Button>
          </Stack>
        )}
      </DialogActions>

      <Menu
        anchorEl={commentMenuAnchor}
        open={Boolean(commentMenuAnchor)}
        onClose={closeCommentMenu}
      >
        <MenuItem
          onClick={() => {
            const targetComment = taskDraft.comments.find(
              (comment, index) => (comment._id || `${comment.createdAt}-${index}`) === commentMenuId
            );
            if (targetComment) {
              startEditingComment(targetComment);
            }
          }}
        >
          <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteComment(commentMenuId)}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Dialog>
  );
}

function KanbanBoardPage({ isDark, onToggleTheme }) {
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [user, setUser] = useState(null);
  const [boardColumns, setBoardColumns] = useState([]);
  const [todos, setTodos] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: 'info', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropColumn, setActiveDropColumn] = useState('');
  const [newColumnLabel, setNewColumnLabel] = useState('');
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const [columnMenuKey, setColumnMenuKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskDialogDefaults, setTaskDialogDefaults] = useState({
    status: 'todo',
    relatedTask: '',
  });

  const firstName = useMemo(() => {
    const fullName = user?.name || '';
    return fullName.split(' ')[0] || 'there';
  }, [user]);

  const editingTask = useMemo(
    () => todos.find((todo) => todo._id === editingTaskId) || null,
    [editingTaskId, todos]
  );

  const childTasksByParentId = useMemo(() => {
    return todos.reduce((accumulator, todo) => {
      const parentId = todo.parentTask?._id || todo.parentTask;

      if (!parentId) {
        return accumulator;
      }

      accumulator[parentId] = [...(accumulator[parentId] || []), todo];
      return accumulator;
    }, {});
  }, [todos]);

  const tasksByColumn = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const visibleTodos = normalizedQuery
      ? todos.filter((todo) => {
          const commentText = (todo.comments || []).map((comment) => getPlainText(comment.text)).join(' ');
          const subtaskText = (todo.subtasks || []).map((subtask) => subtask.title).join(' ');
          const haystack = [
            todo.title,
            getPlainText(todo.description),
            todo.priority,
            todo.relatedTask?.title,
            todo.parentTask?.title,
            commentText,
            subtaskText,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return haystack.includes(normalizedQuery);
        })
      : todos;

    return boardColumns.reduce((accumulator, column) => {
      accumulator[column.key] = visibleTodos.filter((todo) => todo.status === column.key);
      return accumulator;
    }, {});
  }, [boardColumns, searchQuery, todos]);

  useEffect(() => {
    const token = getAuthorizedConfig().headers?.Authorization;

    if (!token) {
      navigate('/');
      return;
    }

    const loadBoard = async () => {
      try {
        const [userResponse, todosResponse] = await Promise.all([
          authApi.get('/me', getAuthorizedConfig()),
          todoApi.get('/', getAuthorizedConfig()),
        ]);

        setUser(userResponse.data.user);
        setBoardColumns(userResponse.data.user.boardColumns || []);
        setTodos(todosResponse.data || []);
      } catch (error) {
        localStorage.removeItem('lanzo-token');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadBoard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('lanzo-token');
    sessionStorage.removeItem('lanzo-signup-token');
    sessionStorage.removeItem('lanzo-signup-email');
    navigate('/');
  };

  const openCreateTaskDialog = (status = boardColumns[0]?.key || 'todo', relatedTask = '') => {
    setEditingTaskId(null);
    setTaskDialogDefaults({ status, relatedTask });
    setTaskDialogOpen(true);
  };

  const openEditTaskDialog = (task) => {
    setEditingTaskId(task._id);
    setTaskDialogOpen(true);
  };

  const closeTaskDialog = () => {
    setTaskDialogOpen(false);
    setEditingTaskId(null);
    setTaskDialogDefaults({
      status: boardColumns[0]?.key || 'todo',
      relatedTask: '',
    });
  };

  const upsertTodoInState = (nextTodo) => {
    setTodos((currentTodos) => {
      const existingIndex = currentTodos.findIndex((todo) => todo._id === nextTodo._id);

      if (existingIndex === -1) {
        return [nextTodo, ...currentTodos];
      }

      const nextTodos = [...currentTodos];
      nextTodos[existingIndex] = nextTodo;
      return nextTodos;
    });
  };

  const handleSaveTask = async ({ editingTaskId: nextEditingTaskId, taskDraft, options = {} }) => {
    const { closeOnSuccess = true, notifyOnSuccess = true } = options;
    setIsSaving(true);

    const payload = {
      title: taskDraft.title.trim(),
      description: taskDraft.description,
      priority: taskDraft.priority,
      dueDate: taskDraft.dueDate || null,
      status: taskDraft.status,
      relatedTask: taskDraft.relatedTask || null,
      comments: taskDraft.comments
        .filter((comment) => hasRichTextContent(comment.text))
        .map((comment) => ({
          _id: comment._id,
          text: comment.text,
          authorName: comment.authorName || user?.name || 'You',
          authorInitial: comment.authorInitial || (user?.name || 'Y').charAt(0).toUpperCase(),
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt || comment.createdAt,
        })),
      subtasks: taskDraft.subtasks.filter((subtask) => subtask.title.trim()),
    };

    try {
      const response = nextEditingTaskId
        ? await todoApi.put(`/${nextEditingTaskId}`, payload)
        : await todoApi.post('/', payload);

      if (!nextEditingTaskId && taskDraft.subtasks.length) {
        const createdSubtasks = await Promise.all(
          taskDraft.subtasks
            .filter((subtask) => subtask.title.trim())
            .map((subtask) =>
              todoApi.post('/', {
                title: subtask.title.trim(),
                description: '',
                priority: 'medium',
                status: taskDraft.status,
                parentTask: response.data._id,
                relatedTask: null,
                comments: [],
                subtasks: [],
              })
            )
        );

        createdSubtasks.forEach((subtaskResponse) => {
          upsertTodoInState(subtaskResponse.data);
        });
      }

      upsertTodoInState(response.data);

      if (notifyOnSuccess) {
        setStatusMessage({ type: 'success', message: nextEditingTaskId ? 'Task updated.' : 'Task created.' });
      }

      if (closeOnSuccess) {
        closeTaskDialog();
      }

      return response.data;
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Your session expired. Please log in again.'
        : error.response?.data?.message || 'Unable to save task right now.';

      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      setStatusMessage({ type: 'error', message });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await todoApi.delete(`/${taskId}`);
      setTodos((currentTodos) => currentTodos.filter((todo) => todo._id !== taskId));
      setStatusMessage({ type: 'success', message: 'Task deleted.' });
      if (editingTaskId === taskId) {
        closeTaskDialog();
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: 'Unable to delete task.' });
    }
  };

  const handleCreateSubtask = async ({ title, parentTask, fallbackStatus }) => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle || !parentTask?._id) {
      return;
    }

    try {
      const response = await todoApi.post('/', {
        title: normalizedTitle,
        description: '',
        priority: 'medium',
        status: fallbackStatus || parentTask.status || boardColumns[0]?.key || 'todo',
        parentTask: parentTask._id,
        relatedTask: null,
        comments: [],
        subtasks: [],
      });

      upsertTodoInState(response.data);
      setStatusMessage({ type: 'success', message: 'Subtask created as a linked task.' });
    } catch (error) {
      setStatusMessage({ type: 'error', message: 'Unable to create subtask right now.' });
    }
  };

  const handleCloseStatusMessage = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setStatusMessage({ type: 'info', message: '' });
  };

  const handleTaskDrop = async (columnKey) => {
    if (!draggedTaskId) {
      return;
    }

    const targetTask = todos.find((todo) => todo._id === draggedTaskId);

    if (!targetTask || targetTask.status === columnKey) {
      setDraggedTaskId(null);
      return;
    }

    const optimisticTask = { ...targetTask, status: columnKey };
    upsertTodoInState(optimisticTask);
    setDraggedTaskId(null);
    setActiveDropColumn('');

    try {
      const response = await todoApi.put(`/${targetTask._id}`, { status: columnKey });
      upsertTodoInState(response.data);
    } catch (error) {
      upsertTodoInState(targetTask);
      setStatusMessage({ type: 'error', message: 'Unable to move task.' });
    }
  };

  const handleTaskDragStart = (event, taskId) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropColumn('');
  };

  const handleColumnDragOver = (event, columnKey) => {
    event.preventDefault();
    if (activeDropColumn !== columnKey) {
      setActiveDropColumn(columnKey);
    }
  };

  const handleColumnDragLeave = (event, columnKey) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      if (activeDropColumn === columnKey) {
        setActiveDropColumn('');
      }
    }
  };

  const handleAddColumn = async () => {
    const label = newColumnLabel.trim();

    if (!label) {
      return;
    }

    try {
      const response = await authApi.post('/board-columns', { label });
      setBoardColumns(response.data.boardColumns || []);
      setNewColumnLabel('');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to add column.';
      setStatusMessage({ type: 'error', message });
    }
  };

  const openColumnMenu = (event, columnKey) => {
    event.stopPropagation();
    setColumnMenuAnchor(event.currentTarget);
    setColumnMenuKey(columnKey);
  };

  const closeColumnMenu = () => {
    setColumnMenuAnchor(null);
    setColumnMenuKey('');
  };

  const saveBoardColumns = async (nextBoardColumns) => {
    const previousColumns = boardColumns;
    setBoardColumns(nextBoardColumns);

    try {
      const response = await authApi.put('/board-columns', { boardColumns: nextBoardColumns });
      setBoardColumns(response.data.boardColumns || nextBoardColumns);
      return true;
    } catch (error) {
      setBoardColumns(previousColumns);
      setStatusMessage({ type: 'error', message: error.response?.data?.message || 'Unable to update columns.' });
      return false;
    }
  };

  const handleMoveColumn = async (columnKey, direction) => {
    const currentIndex = boardColumns.findIndex((column) => column.key === columnKey);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= boardColumns.length) {
      closeColumnMenu();
      return;
    }

    const nextColumns = [...boardColumns];
    const [movedColumn] = nextColumns.splice(currentIndex, 1);
    nextColumns.splice(targetIndex, 0, movedColumn);
    closeColumnMenu();
    await saveBoardColumns(nextColumns);
  };

  const handleDeleteColumn = async (columnKey) => {
    if (boardColumns.length <= 1) {
      setStatusMessage({ type: 'error', message: 'At least one column must remain.' });
      closeColumnMenu();
      return;
    }

    const currentIndex = boardColumns.findIndex((column) => column.key === columnKey);

    if (currentIndex === -1) {
      closeColumnMenu();
      return;
    }

    const fallbackColumn = boardColumns[currentIndex + 1] || boardColumns[currentIndex - 1];
    const previousColumns = boardColumns;
    const previousTodos = todos;
    const nextColumns = boardColumns.filter((column) => column.key !== columnKey);
    const nextTodos = todos.map((todo) => (todo.status === columnKey ? { ...todo, status: fallbackColumn.key } : todo));

    closeColumnMenu();
    setBoardColumns(nextColumns);
    setTodos(nextTodos);

    try {
      const tasksToMove = todos.filter((todo) => todo.status === columnKey);

      if (tasksToMove.length) {
        await Promise.all(
          tasksToMove.map((todo) => todoApi.put(`/${todo._id}`, { status: fallbackColumn.key }))
        );
      }

      const response = await authApi.put('/board-columns', { boardColumns: nextColumns });
      setBoardColumns(response.data.boardColumns || nextColumns);
      setStatusMessage({ type: 'success', message: 'Column deleted.' });
    } catch (error) {
      setBoardColumns(previousColumns);
      setTodos(previousTodos);
      setStatusMessage({ type: 'error', message: error.response?.data?.message || 'Unable to delete column.' });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        backgroundImage: isDark
          ? 'radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 35%)'
          : 'radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 35%)',
      }}
    >
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          px: { xs: 2.5, md: 4 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isDark ? 'rgba(11,18,32,0.84)' : 'rgba(248,250,252,0.86)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box component="img" src={logo} alt="Lanzo logo" sx={{ width: 36, height: 36 }} />
          <Box>
            <Typography sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.4px' }}>
              Lanzo
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
              Hi, {firstName}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => openCreateTaskDialog()}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 12px 24px rgba(37, 99, 235, 0.22)',
            }}
          >
            New task
          </Button>
          <IconButton
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            sx={{
              width: 42,
              height: 42,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {firstName.charAt(0).toUpperCase() || <AccountCircleRoundedIcon fontSize="small" />}
            </Avatar>
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3.5 }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.8px' }}>
              Your board
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 0.8 }}>
              Drag tasks between columns, track due dates, and keep related work together.
            </Typography>
          </Box>

          <TextField
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tasks"
            size="small"
            InputProps={{
              startAdornment: <SearchRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ width: '100%', maxWidth: 420 }}
          />
        </Stack>

        <Box
          sx={{
            overflowX: { xs: 'visible', md: 'auto' },
            overflowY: 'visible',
            pb: 2,
            mx: { xs: 0, md: -0.5 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flexWrap: 'nowrap',
              alignItems: 'stretch',
              gap: 2,
              width: { xs: '100%', md: 'max-content' },
              minWidth: { xs: '100%', md: '100%' },
              px: { xs: 0, md: 0.5 },
            }}
          >
          {boardColumns.map((column) => (
            <Paper
              key={column.key}
              elevation={0}
              onDragOver={(event) => handleColumnDragOver(event, column.key)}
              onDragLeave={(event) => handleColumnDragLeave(event, column.key)}
              onDrop={() => handleTaskDrop(column.key)}
              sx={{
                minHeight: 520,
                width: { xs: '100%', md: 320 },
                flexShrink: 0,
                p: 2,
                borderRadius: 5,
                bgcolor: isDark ? 'background.paper' : 'rgba(255,255,255,0.85)',
                border: '1px solid',
                borderColor: activeDropColumn === column.key ? 'primary.main' : 'divider',
                boxShadow: isDark
                  ? '0 18px 40px rgba(0,0,0,0.28)'
                  : '0 18px 40px rgba(15, 23, 42, 0.08)',
                transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
                ...(activeDropColumn === column.key
                  ? {
                      boxShadow: isDark
                        ? '0 18px 40px rgba(59,130,246,0.22)'
                        : '0 18px 40px rgba(37,99,235,0.16)',
                      transform: 'translateY(-2px)',
                    }
                  : null),
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{column.label}</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    {tasksByColumn[column.key]?.length || 0} tasks
                  </Typography>
                </Box>
                <IconButton size="small" onClick={(event) => openColumnMenu(event, column.key)}>
                  <MoreHorizRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack spacing={1.5}>
                {(tasksByColumn[column.key] || []).map((todo) => {
                  const linkedChildTasks = childTasksByParentId[todo._id] || [];
                  const isOverdue = isDatePastDue(todo.dueDate);

                  return (
                    <Paper
                      key={todo._id}
                      draggable
                      onDragStart={(event) => handleTaskDragStart(event, todo._id)}
                      onDragEnd={handleTaskDragEnd}
                      onClick={() => openEditTaskDialog(todo)}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        bgcolor: 'background.paper',
                        opacity: draggedTaskId === todo._id ? 0.68 : 1,
                        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: isDark
                            ? '0 18px 34px rgba(59,130,246,0.16)'
                            : '0 14px 28px rgba(15,23,42,0.12)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
                        <Box>
                          <Typography sx={{ fontWeight: 700, lineHeight: 1.35 }}>{todo.title}</Typography>
                          {hasRichTextContent(todo.description) ? (
                            <Typography
                              sx={{
                                color: 'text.secondary',
                                mt: 0.8,
                                fontSize: '0.92rem',
                                display: '-webkit-box',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                              }}
                            >
                              {getPlainText(todo.description)}
                            </Typography>
                          ) : null}
                        </Box>
                        <Chip
                          label={todo.priority}
                          size="small"
                          color={todo.priority === 'high' ? 'error' : todo.priority === 'medium' ? 'warning' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                        {todo.dueDate ? (
                          <Chip
                            label={
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                {isOverdue ? <WarningAmberRoundedIcon sx={{ fontSize: 16 }} /> : null}
                                <Box component="span">Due {formatDateDisplay(todo.dueDate)}</Box>
                              </Stack>
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              px: 0.75,
                              py: 0.3,
                              '& .MuiChip-label': {
                                display: 'flex',
                                alignItems: 'center',
                                py: 0.35,
                              },
                              ...(isOverdue
                                ? {
                                    color: 'error.main',
                                    borderColor: 'error.main',
                                  }
                                : null),
                            }}
                          />
                        ) : null}
                        {todo.relatedTask?.title ? (
                          <Chip
                            label={`Related: ${todo.relatedTask.title}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              px: 0.75,
                              py: 0.3,
                              '& .MuiChip-label': {
                                display: 'flex',
                                alignItems: 'center',
                                py: 0.35,
                              },
                            }}
                          />
                        ) : null}
                      </Stack>

                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.8, color: 'text.secondary' }}>
                        <Stack direction="row" spacing={0.6} alignItems="center">
                          <ChecklistRoundedIcon sx={{ fontSize: 17 }} />
                          <Typography sx={{ fontSize: '0.82rem' }}>
                            {linkedChildTasks.length} subtasks
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.6} alignItems="center">
                          <CommentRoundedIcon sx={{ fontSize: 17 }} />
                          <Typography sx={{ fontSize: '0.82rem' }}>
                            {todo.comments?.length || 0} comments
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          ))}

          <Paper
            elevation={0}
            sx={{
              minHeight: 520,
              width: { xs: '100%', md: 320 },
              flexShrink: 0,
              p: 2,
              borderRadius: 5,
              bgcolor: 'transparent',
              border: '2px dashed',
              borderColor: isDark ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 220, alignItems: 'center' }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: isDark ? 'rgba(59,130,246,0.14)' : 'rgba(37,99,235,0.1)',
                  color: 'primary.main',
                }}
              >
                <AddRoundedIcon />
              </Box>
              <Typography sx={{ fontWeight: 800 }}>Add column</Typography>
              <TextField
                value={newColumnLabel}
                onChange={(event) => setNewColumnLabel(event.target.value)}
                placeholder="Column name"
                size="small"
                fullWidth
              />
              <Button
                variant="text"
                onClick={handleAddColumn}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Add column
              </Button>
            </Stack>
          </Paper>
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 260,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <MenuItem disableRipple sx={{ py: 1.2 }}>
          <FormControlLabel
            control={<Switch checked={isDark} onChange={onToggleTheme} />}
            label={isDark ? 'Dark mode' : 'Light mode'}
            sx={{ width: '100%', m: 0, justifyContent: 'space-between' }}
            labelPlacement="start"
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.2, gap: 1 }}>
          <LogoutRoundedIcon fontSize="small" />
          Logout
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={closeColumnMenu}
      >
        <MenuItem
          onClick={() => handleMoveColumn(columnMenuKey, 'left')}
          disabled={boardColumns.findIndex((column) => column.key === columnMenuKey) <= 0}
        >
          <WestRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Move left
        </MenuItem>
        <MenuItem
          onClick={() => handleMoveColumn(columnMenuKey, 'right')}
          disabled={boardColumns.findIndex((column) => column.key === columnMenuKey) === boardColumns.length - 1}
        >
          <EastRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Move right
        </MenuItem>
        <MenuItem onClick={() => handleDeleteColumn(columnMenuKey)} sx={{ color: 'error.main' }}>
          <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Delete column
        </MenuItem>
      </Menu>

      <TaskDialog
        open={taskDialogOpen}
        isSaving={isSaving}
        editingTask={editingTask}
        currentUser={user}
        initialStatus={taskDialogDefaults.status}
        initialRelatedTask={taskDialogDefaults.relatedTask}
        boardColumns={boardColumns}
        todos={todos}
        childTasks={editingTask ? childTasksByParentId[editingTask._id] || [] : []}
        onClose={closeTaskDialog}
        onDelete={handleDeleteTask}
        onCreateSubtask={handleCreateSubtask}
        onSave={handleSaveTask}
      />

      <Snackbar
        open={!!statusMessage.message}
        autoHideDuration={4000}
        onClose={handleCloseStatusMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={statusMessage.type}
          onClose={handleCloseStatusMessage}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2.5, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)' }}
        >
          {statusMessage.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default KanbanBoardPage;