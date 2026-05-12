import { useState } from 'react'
import { Search, SlidersHorizontal, MessageSquarePlus } from 'lucide-react'
import { ConversationList } from './ConversationList'
import { FilterBar } from './FilterBar'
import type { ChatState } from './useChatState'
import type { ChatTab } from './types'

const TABS: { key: ChatTab; label: string }[] = [
  { key: 'atendendo',  label: 'Atendendo'  },
  { key: 'aguardando', label: 'Aguardando' },
  { key: 'resolvidos', label: 'Resolvidos' },
]

interface Props {
  state: ChatState
}

export function ChatSidebar({ state }: Props) {
  const {
    tab, setTab, search, setSearch,
    showFilters, setShowFilters,
    filteredList, activeId, counts,
    openConversation,
  } = state

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  function toggleFilter(value: string) {
    setActiveFilters(prev =>
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    )
  }

  return (
    <div style={{
      width:        320,
      flexShrink:   0,
      display:      'flex',
      flexDirection: 'column',
      background:   '#080E1A',
      borderRight:  '1px solid rgba(255,255,255,0.06)',
      overflow:     'hidden',
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        height:      60,
        flexShrink:  0,
        display:     'flex',
        alignItems:  'center',
        justifyContent: 'space-between',
        padding:     '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width:          34, height: 34,
            borderRadius:   10,
            background:     'rgba(212,175,55,0.12)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#F5F7FA', letterSpacing: '-0.01em' }}>
            Conversas
          </span>
        </div>

        <button
          title="Nova conversa"
          style={{
            width:          32, height: 32,
            borderRadius:   8,
            border:         '1px solid rgba(212,175,55,0.3)',
            background:     'rgba(212,175,55,0.08)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            cursor:         'pointer',
            transition:     'all 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.18)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.08)')}
        >
          <MessageSquarePlus size={14} color="#D4AF37" />
        </button>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div style={{
        display:      'flex',
        flexShrink:   0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {TABS.map(t => {
          const isActive = tab === t.key
          const count    = counts[t.key]
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex:           1,
                height:         42,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            5,
                border:         'none',
                cursor:         'pointer',
                fontSize:       12,
                fontWeight:     isActive ? 600 : 400,
                color:          isActive ? '#D4AF37' : '#64748B',
                background:     'transparent',
                borderBottom:   isActive ? '2px solid #D4AF37' : '2px solid transparent',
                transition:     'all 150ms',
              }}
            >
              {t.label}
              {count > 0 && (
                <span style={{
                  minWidth:       16, height: 16,
                  borderRadius:   8,
                  background:     isActive ? '#D4AF37' : 'rgba(100,116,139,0.3)',
                  color:          isActive ? '#060B14' : '#94A3B8',
                  fontSize:       9,
                  fontWeight:     700,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  padding:        '0 4px',
                }}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Search + Filter ─────────────────────────────────────── */}
      <div style={{
        padding:     '10px 12px',
        flexShrink:  0,
        display:     'flex',
        gap:         8,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{
          flex:       1,
          position:   'relative',
          display:    'flex',
          alignItems: 'center',
        }}>
          <Search
            size={13}
            color="#64748B"
            style={{ position: 'absolute', left: 10, pointerEvents: 'none' }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Encontre conversas"
            style={{
              width:           '100%',
              height:          34,
              paddingLeft:     30,
              paddingRight:    10,
              borderRadius:    9,
              border:          '1px solid rgba(255,255,255,0.08)',
              background:      'rgba(255,255,255,0.04)',
              color:           '#F5F7FA',
              fontSize:        12,
              outline:         'none',
            }}
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          title="Filtros"
          style={{
            width:          34, height: 34,
            borderRadius:   9,
            border:         `1px solid ${showFilters || activeFilters.length > 0 ? '#D4AF37' : 'rgba(255,255,255,0.08)'}`,
            background:     showFilters || activeFilters.length > 0 ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            cursor:         'pointer',
            flexShrink:     0,
            transition:     'all 150ms',
            position:       'relative',
          }}
        >
          <SlidersHorizontal size={13} color={showFilters || activeFilters.length > 0 ? '#D4AF37' : '#64748B'} />
          {activeFilters.length > 0 && (
            <span style={{
              position:       'absolute',
              top:            -3, right: -3,
              width:          14, height: 14,
              borderRadius:   7,
              background:     '#D4AF37',
              color:          '#060B14',
              fontSize:       8,
              fontWeight:     700,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}>
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      {showFilters && (
        <FilterBar
          active={activeFilters}
          onToggle={toggleFilter}
          onClear={() => setActiveFilters([])}
        />
      )}

      {/* ── Conversation List ───────────────────────────────────── */}
      <ConversationList
        conversations={filteredList}
        activeId={activeId}
        onSelect={openConversation}
      />
    </div>
  )
}
