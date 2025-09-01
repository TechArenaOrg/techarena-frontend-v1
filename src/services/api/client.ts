// Mock API client for development
// This replaces Apollo Client since we're using mock data instead of GraphQL

export interface MockClient {
  query: (options: any) => Promise<any>;
  mutate: (options: any) => Promise<any>;
}

// Simple mock client that matches Apollo Client interface
export const apolloClient: MockClient = {
  async query(options: any) {
    // Return mock data based on query
    console.log('Mock query:', options);
    return { data: {} };
  },
  
  async mutate(options: any) {
    // Return mock mutation result
    console.log('Mock mutation:', options);
    return { data: {} };
  },
};

// Helper functions for compatibility
export const clearCache = () => {
  console.log('Mock: Cache cleared');
};

export const refetchQueries = () => {
  console.log('Mock: Queries refetched');
};