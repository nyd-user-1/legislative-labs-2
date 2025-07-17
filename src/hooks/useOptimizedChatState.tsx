
import { useReducer, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  excerpt: string;
}

interface ChatState {
  inputValue: string;
  isLoading: boolean;
  messages: ChatMessage[];
  citations: Citation[];
  sessionId: string | null;
  error: string | null;
}

type ChatAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_CITATION'; payload: Citation }
  | { type: 'SET_CITATIONS'; payload: Citation[] }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_CHAT' }
  | { type: 'RESET_STATE' };

const initialState: ChatState = {
  inputValue: '',
  isLoading: false,
  messages: [],
  citations: [],
  sessionId: null,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, inputValue: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload],
        error: null 
      };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_CITATION':
      return { 
        ...state, 
        citations: [...state.citations, action.payload] 
      };
    
    case 'SET_CITATIONS':
      return { ...state, citations: action.payload };
    
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_CHAT':
      return { 
        ...state, 
        messages: [], 
        citations: [], 
        inputValue: '',
        error: null 
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

export const useOptimizedChatState = () => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Memoized action creators to prevent unnecessary re-renders
  const actions = {
    setInputValue: useCallback((value: string) => {
      dispatch({ type: 'SET_INPUT', payload: value });
    }, []),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    addMessage: useCallback((message: ChatMessage) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    }, []),

    setMessages: useCallback((messages: ChatMessage[]) => {
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    }, []),

    addCitation: useCallback((citation: Citation) => {
      dispatch({ type: 'ADD_CITATION', payload: citation });
    }, []),

    setCitations: useCallback((citations: Citation[]) => {
      dispatch({ type: 'SET_CITATIONS', payload: citations });
    }, []),

    setSessionId: useCallback((sessionId: string) => {
      dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    clearChat: useCallback(() => {
      dispatch({ type: 'CLEAR_CHAT' });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, []),
  };

  return {
    ...state,
    actions,
  };
};
