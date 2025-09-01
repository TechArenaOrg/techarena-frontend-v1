'use client';

// Simple wrapper component - Apollo Client not needed since we're using mock data
export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}