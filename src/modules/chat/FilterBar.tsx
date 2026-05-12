import { X } from 'lucide-react'

const FILTER_OPTIONS = [
  { label: 'Não lidas',  value: 'unread'   },
  { label: 'Membro',     value: 'membro'   },
  { label: 'Visitante',  value: 'visitante' },
  { label: 'Pastoral',   value: 'pastoral'  },
]

interface Props {
  active:   string[]
  onToggle: (value: string) => void
  onClear:  () => void
}

export function FilterBar({ active, onToggle, onClear }: Props) {
  return (
    <div style={{
      padding:        '8px 12px',
      borderBottom:   '1px solid rgba(255,255,255,0.06)',
      display:        'flex',
      alignItems:     'center',
      gap:            6,
      flexWrap:       'wrap',
    }}>
      {FILTER_OPTIONS.map(opt => {
        const isActive = active.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            style={{
              padding:         '3px 10px',
              borderRadius:    20,
              fontSize:        11,
              fontWeight:      500,
              cursor:          'pointer',
              transition:      'all 150ms',
              border:          `1px solid ${isActive ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`,
              background:      isActive ? 'rgba(212,175,55,0.15)' : 'transparent',
              color:           isActive ? '#D4AF37' : '#94A3B8',
            }}
          >
            {opt.label}
          </button>
        )
      })}
      {active.length > 0 && (
        <button
          onClick={onClear}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            3,
            padding:        '3px 8px',
            borderRadius:   20,
            fontSize:       11,
            cursor:         'pointer',
            border:         '1px solid rgba(239,68,68,0.4)',
            background:     'rgba(239,68,68,0.08)',
            color:          '#EF4444',
          }}
        >
          <X size={10} />
          Limpar
        </button>
      )}
    </div>
  )
}
