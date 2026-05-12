import { Plus } from 'lucide-react'
import type { Tag } from './types'
import { SAMPLE_TAGS } from './types'

interface Props {
  tags?: Tag[]
}

export function TagList({ tags }: Props) {
  const displayTags = (tags && tags.length > 0) ? tags : SAMPLE_TAGS

  return (
    <div style={{
      flexShrink:  0,
      display:     'flex',
      alignItems:  'center',
      gap:         6,
      padding:     '8px 20px',
      background:  '#0B1220',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      overflowX:   'auto',
      scrollbarWidth: 'none',
    }}>
      <span style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap', flexShrink: 0 }}>
        Tags:
      </span>

      {displayTags.map(tag => (
        <span
          key={tag.id}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         4,
            padding:     '3px 10px',
            borderRadius: 20,
            fontSize:    11,
            fontWeight:  500,
            whiteSpace:  'nowrap',
            flexShrink:  0,
            cursor:      'pointer',
            transition:  'all 150ms',
            color:       tag.color,
            background:  `${tag.color}14`,
            border:      `1px solid ${tag.color}40`,
          }}
        >
          {tag.name}
        </span>
      ))}

      <button
        title="Adicionar tag"
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:          22, height: 22,
          borderRadius:   '50%',
          border:         '1px dashed rgba(212,175,55,0.35)',
          background:     'transparent',
          cursor:         'pointer',
          flexShrink:     0,
          transition:     'all 150ms',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background   = 'rgba(212,175,55,0.1)'
          e.currentTarget.style.borderColor  = '#D4AF37'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background  = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'
        }}
      >
        <Plus size={11} color="#D4AF37" />
      </button>
    </div>
  )
}
