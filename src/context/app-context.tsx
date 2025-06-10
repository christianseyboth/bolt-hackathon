import { User } from "@supabase/supabase-js";

interface AppState {
    user: User | null;
    theme: 'light' | 'dark';
    isLoading: boolean;
}

interface AppActions {
    setUser: (user: User | null) => void;
    toggleTheme: () => void;
    setLoading: (loading: boolean) => void;
}

// Use useReducer for complex state management
