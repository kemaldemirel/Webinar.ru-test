import React from 'react';
import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import { motion } from 'framer-motion';
import { TodoItem, useTodoItems } from './TodoItemsContext';

const spring = {
  type: 'spring',
  damping: 25,
  stiffness: 120,
  duration: 0.25,
};

const useTodoItemListStyles = makeStyles({
  root: {
    listStyle: 'none',
    padding: 0,
  },
});

export const TodoItemsList = function () {
  const { todoItems } = useTodoItems();

  const classes = useTodoItemListStyles();

  const sortedItems = todoItems.slice().sort((a, b) => {
    if (a.done && !b.done) {
      return 1;
    }

    if (!a.done && b.done) {
      return -1;
    }

    return 0;
  });

  return (
    <ul className={classes.root}>
      {sortedItems.map((item) => (
        <motion.li key={item.id} transition={spring} layout={true}>
          <TodoItemCard item={item} />
        </motion.li>
      ))}
    </ul>
  );
};

const useTodoItemCardStyles = makeStyles({
  root: {
    marginTop: 24,
    marginBottom: 24,
  },
  doneRoot: {
    textDecoration: 'line-through',
    color: '#888888',
  },
});

export const TodoItemCard = function ({ item }: { item: TodoItem }) {
  const [isEditable, setEditable] = React.useState(false);
  const { control, handleSubmit } = useForm();

  const classes = useTodoItemCardStyles();
  const { dispatch } = useTodoItems();

  const handleDelete = useCallback(
    () => dispatch({ type: 'delete', data: { id: item.id } }),
    [item.id, dispatch],
  );

  const handleToggleDone = useCallback(
    () =>
      dispatch({
        type: 'toggleDone',
        data: { id: item.id },
      }),
    [item.id, dispatch],
  );

  const onSubmitEdit = (formData: object) => {
    dispatch({ type: 'edit', data: { id: item.id, todoEditValue: formData } });
    setEditable(false);
  };

  return (
    <Card
      className={classnames(classes.root, {
        [classes.doneRoot]: item.done,
      })}>
      <CardHeader
        action={
          <>
            {isEditable ? (
              <IconButton aria-label="change" onClick={handleSubmit(onSubmitEdit)}>
                <DoneIcon />
              </IconButton>
            ) : (
              <IconButton aria-label="change" onClick={() => setEditable(!isEditable)}>
                <EditIcon />
              </IconButton>
            )}

            <IconButton aria-label="delete" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </>
        }
        title={
          isEditable ? (
            <form onSubmit={handleSubmit(onSubmitEdit)}>
              <Controller
                name="title"
                control={control}
                defaultValue={item.title}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    size="small"
                    {...field}
                    label={'Заголовок задачи'}
                    fullWidth={true}
                    className={classes.root}
                  />
                )}
              />
              <Controller
                name="details"
                control={control}
                defaultValue={item.details}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    size="small"
                    {...field}
                    label={'Детали задачи'}
                    fullWidth={true}
                    multiline={true}
                    className={classes.root}
                  />
                )}
              />
            </form>
          ) : (
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.done}
                  onChange={handleToggleDone}
                  name={`checked-${item.id}`}
                  color="primary"
                />
              }
              label={item.title}
            />
          )
        }
      />
      {item.details && !isEditable ? (
        <CardContent>
          <Typography variant="body2" component="p">
            {item.details}
          </Typography>
        </CardContent>
      ) : null}
    </Card>
  );
};
