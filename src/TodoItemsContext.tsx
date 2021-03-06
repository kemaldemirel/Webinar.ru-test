import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

export interface TodoItem {
  id: string;
  title: string;
  details?: string;
  done: boolean;
  todoEditValue: object;
}

interface TodoItemsState {
  todoItems: TodoItem[];
}

interface TodoItemsAction {
  type: 'loadState' | 'add' | 'delete' | 'toggleDone' | 'edit';
  data: any;
}

const TodoItemsContext = createContext<
  (TodoItemsState & { dispatch: (action: TodoItemsAction) => void }) | null
>(null);

const defaultState: TodoItemsState = { todoItems: [] };
const localStorageKey = 'todoListState';

export const TodoItemsContextProvider = ({ children }: { children?: ReactNode }) => {
  const [state, dispatch] = useReducer(todoItemsReducer, defaultState);

  useEffect(() => {
    window.addEventListener('storage', () => {
      const savedState = localStorage.getItem(localStorageKey);
      if (savedState) {
        dispatch({ type: 'loadState', data: JSON.parse(savedState) });
      }
    });
    const savedState = localStorage.getItem(localStorageKey);

    if (savedState) {
      try {
        dispatch({ type: 'loadState', data: JSON.parse(savedState) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [state]);

  return (
    <TodoItemsContext.Provider value={{ ...state, dispatch }}>{children}</TodoItemsContext.Provider>
  );
};

export const useTodoItems = () => {
  const todoItemsContext = useContext(TodoItemsContext);

  if (!todoItemsContext) {
    throw new Error('useTodoItems hook should only be used inside TodoItemsContextProvider');
  }

  return todoItemsContext;
};

function todoItemsReducer(state: TodoItemsState, action: TodoItemsAction): TodoItemsState {
  switch (action.type) {
    case 'loadState': {
      return action.data;
    }
    case 'add':
      return {
        ...state,
        todoItems: [{ id: generateId(), done: false, ...action.data.todoItem }, ...state.todoItems],
      };
    case 'delete':
      return {
        ...state,
        todoItems: state.todoItems.filter(({ id }) => id !== action.data.id),
      };
    case 'edit':
      const { title, details } = action.data.todoEditValue;
      const itemEdit = state.todoItems.find(({ id }) => id === action.data.id) as TodoItem;
      return {
        ...state,
        todoItems: [
          ...state.todoItems.filter(({ id }) => id !== action.data.id),
          { ...itemEdit, title: title, details: details },
        ],
      };
    case 'toggleDone':
      const itemIndex = state.todoItems.findIndex(({ id }) => id === action.data.id);
      const item = state.todoItems[itemIndex];

      return {
        ...state,
        todoItems: [
          ...state.todoItems.slice(0, itemIndex),
          { ...item, done: !item.done },
          ...state.todoItems.slice(itemIndex + 1),
        ],
      };
    default:
      throw new Error();
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e16).toString(36)}`;
}
