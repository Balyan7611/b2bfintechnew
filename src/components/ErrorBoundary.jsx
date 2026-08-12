import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: '24px',
          background: '#f8fafc', textAlign: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '40px 32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)', maxWidth: '480px', width: '100%'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#1e293b', margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 800 }}>
              Something went wrong
            </h2>
            <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '0.9rem' }}>
              Kuch technical problem aa gayi. Page refresh karein.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#1756AA', color: '#fff', border: 'none',
                padding: '12px 28px', borderRadius: '10px', fontSize: '0.95rem',
                fontWeight: 700, cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{
                marginTop: '20px', textAlign: 'left', fontSize: '0.72rem',
                color: '#ef4444', background: '#fef2f2', padding: '12px',
                borderRadius: '8px', overflow: 'auto', maxHeight: '160px'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
