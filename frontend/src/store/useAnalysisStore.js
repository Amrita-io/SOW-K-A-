import { create } from 'zustand';

const useAnalysisStore = create((set) => ({
  results: null,
  isLoading: false,
  error: null,
  currentAgent: '',
  completedAgents: [],
  
  setResults: (results) => set({ results, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setCurrentAgent: (agent) => set({ currentAgent: agent }),
  addCompletedAgent: (agent) => set((s) => ({
    completedAgents: [...s.completedAgents, agent],
  })),
  resetCompletedAgents: () => set({ completedAgents: [], currentAgent: '' }),
  
  reset: () => set({
    results: null,
    isLoading: false,
    error: null,
    currentAgent: '',
    completedAgents: [],
  }),
}));

export default useAnalysisStore;
