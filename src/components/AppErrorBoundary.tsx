import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Wheat } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error:    Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary] Unhandled error:', error)
    console.error('[AppErrorBoundary] Component stack:', info.componentStack)
  }

  handleRetry = () => this.setState({ hasError: false, error: null })

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback)  return this.props.fallback

    return (
      <div
        style={{
          minHeight:      '100vh',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'linear-gradient(180deg, #020617 0%, #03132a 100%)',
          color:          '#F5F7FA',
          padding:        '2rem',
          textAlign:      'center',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              background:     'rgba(255,215,0,0.1)',
              padding:        10,
              borderRadius:   12,
              border:         '1px solid rgba(255,215,0,0.2)',
            }}
          >
            <Wheat color="#eab308" size={28} strokeWidth={1.5} />
          </div>
          <span
            style={{
              fontSize:   28,
              color:      '#fff',
              fontFamily: "'Great Vibes', cursive",
              lineHeight: 1,
            }}
          >
            Celeiro Digital
          </span>
        </div>

        <div
          style={{
            fontSize:   40,
            marginBottom: 16,
            filter:     'drop-shadow(0 0 12px rgba(255,100,100,0.4))',
          }}
        >
          ⚠️
        </div>

        <h1
          style={{
            fontSize:     22,
            fontWeight:   800,
            marginBottom: 8,
            letterSpacing: '-0.5px',
          }}
        >
          Algo deu errado
        </h1>

        <p
          style={{
            color:     '#64748B',
            fontSize:  14,
            maxWidth:  380,
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          {this.state.error?.message ?? 'Erro inesperado na aplicação.'}
        </p>

        <button
          onClick={this.handleRetry}
          style={{
            background:   'linear-gradient(135deg, #FFD700, #E6B800)',
            color:        '#020617',
            border:       'none',
            borderRadius: 12,
            padding:      '11px 32px',
            fontWeight:   700,
            fontSize:     14,
            cursor:       'pointer',
            letterSpacing: '0.3px',
          }}
        >
          Tentar novamente
        </button>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop:    12,
            background:   'transparent',
            color:        '#64748B',
            border:       '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding:      '10px 28px',
            fontWeight:   600,
            fontSize:     13,
            cursor:       'pointer',
          }}
        >
          Recarregar página
        </button>
      </div>
    )
  }
}
