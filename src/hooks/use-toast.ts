// Simple toast hook for development
export interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

export function useToast() {
  const toast = (props: Toast) => {
    // Simple console log for now - can be replaced with actual toast implementation
    console.log('Toast:', props);
    if (typeof window !== 'undefined') {
      // Show browser alert as fallback
      alert(`${props.title || 'Notification'}: ${props.description || ''}`);
    }
  };

  return { toast };
}