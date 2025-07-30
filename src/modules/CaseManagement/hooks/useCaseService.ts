// Mock useCaseService until proper implementation
export const useCaseService = () => {
  console.log('useCaseService: called - mock implementation');
  return {
    cases: [],
    loading: false,
    error: null,
    createCase: () => Promise.resolve(null),
    updateCase: () => Promise.resolve(null),
    deleteCase: () => Promise.resolve(),
    refetch: () => Promise.resolve()
  };
};