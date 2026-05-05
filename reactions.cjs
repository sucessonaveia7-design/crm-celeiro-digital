const fs = require('fs');
const content = fs.readFileSync('src/pages/MessagesPremium.tsx', 'utf8');
const lines = content.split('\n');

// Find the return block inside the message map
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (start < 0 && lines[i].includes('const isUser    = msg.senderId')) { start = i + 3; } // line after isCurrent
  if (start > 0 && lines[i].trim() === ')' && lines[i+1] && lines[i+1].trim() === '})}' ) { end = i; break; }
}
console.log('Replacing lines', start+1, 'to', end+1);

const newSection = `                  const msgReacts = msgReactions[msg.id] ?? []
                  const myReaction = msgReacts.find(r => r.userId === USUARIO_LOGADO)
                  const grouped = groupReactions(msgReacts)
                  const isHovered = hoverMsgId === msg.id || reactionMenuMsgId === msg.id
                  return (
                    <div
                      key={msg.id}
                      id={\`msg-\${msg.id}\`}
                      className={\`flex items-end gap-1.5 \${isUser ? 'justify-end' : 'justify-start'}\`}
                      style={{ animation: isLast ? 'messagePop 0.25s cubic-bezier(0.175,0.885,0.32,1.275) forwards' : 'none', position: 'relative' }}
                      onMouseEnter={() => setHoverMsgId(msg.id)}
                      onMouseLeave={() => { if (reactionMenuMsgId !== msg.id) setHoverMsgId(null) }}
                    >
                      {/* Reaction button — user messages (left of bubble) */}
                      {isUser && isHovered && (() => {
                        const menuOpen = reactionMenuMsgId === msg.id
                        return (
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <button type="button"
                              onClick={() => setReactionMenuMsgId(prev => prev === msg.id ? null : msg.id)}
                              title="Reagir"
                              style={{
                                width: 26, height: 26, borderRadius: '50%', border: '1px solid #334155',
                                background: '#0F172A', cursor: 'pointer', fontSize: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.35)', transition: 'border-color 0.12s',
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(234,179,8,0.50)'}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155'}
                            >😊</button>
                            {menuOpen && (
                              <div style={{
                                position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, zIndex: 60,
                                background: '#0F172A', border: '1px solid rgba(234,179,8,0.25)',
                                borderRadius: 40, padding: '6px 8px',
                                display: 'flex', gap: 2,
                                boxShadow: '0 4px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(234,179,8,0.08)',
                                animation: 'atalhoPopIn 0.18s cubic-bezier(0.16,1,0.3,1)',
                                whiteSpace: 'nowrap',
                              }}>
                                {QUICK_REACTIONS.map(em => {
                                  const active = myReaction?.emoji === em
                                  return (
                                    <button key={em} type="button" onClick={() => toggleReaction(msg.id, em)}
                                      style={{
                                        width: 38, height: 38, borderRadius: '50%', border: 'none',
                                        background: active ? 'rgba(234,179,8,0.20)' : 'transparent',
                                        cursor: 'pointer', fontSize: 22,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transform: active ? 'scale(1.15)' : 'scale(1)',
                                        transition: 'all 0.12s',
                                        outline: active ? '2px solid rgba(234,179,8,0.45)' : 'none',
                                        outlineOffset: 2,
                                      }}
                                      onMouseEnter={ev => { (ev.currentTarget as HTMLButtonElement).style.transform = 'scale(1.3)'; (ev.currentTarget as HTMLButtonElement).style.background = 'rgba(234,179,8,0.15)' }}
                                      onMouseLeave={ev => { (ev.currentTarget as HTMLButtonElement).style.transform = active ? 'scale(1.15)' : 'scale(1)'; (ev.currentTarget as HTMLButtonElement).style.background = active ? 'rgba(234,179,8,0.20)' : 'transparent' }}
                                    >{em}</button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      {/* Bubble + reactions column */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4, maxWidth: '72%' }}>
                        {msg.isFluxo ? (
                          /* ── Fluxo bubble ── */
                          <div style={{
                            background: 'linear-gradient(135deg, #1E293B 0%, #0F2236 100%)',
                            border: '1px solid rgba(234,179,8,0.35)',
                            borderRadius: '16px 16px 4px 16px',
                            padding: '10px 14px',
                            boxShadow: '0 3px 14px rgba(234,179,8,0.20)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.30)',
                                borderRadius: 999, padding: '2px 8px',
                                fontSize: 10, fontWeight: 700, color: '#EAB308', letterSpacing: '0.05em',
                              }}>
                                <Zap style={{ width: 10, height: 10 }} /> FLUXO
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#E2E8F0', wordBreak: 'break-word' }}>
                              {msg.text.replace('Fluxo enviado: ', '')}
                            </p>
                            <span style={{ display: 'block', marginTop: 5, fontSize: 10, color: '#475569', textAlign: 'right' }}>
                              {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <CheckCircle2 style={{ width: 10, height: 10, display: 'inline', verticalAlign: 'middle' }} />
                            </span>
                          </div>
                        ) : (
                          /* ── Normal bubble ── */
                          <div
                            className="px-[14px] py-[10px] text-[14px] leading-relaxed flex flex-col gap-[5px]"
                            style={{
                              background:   isUser ? '#EAB308' : '#1E293B',
                              color:        isUser ? '#0F172A' : '#FFFFFF',
                              borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              boxShadow: isCurrent
                                ? '0 0 0 2px #F59E0B, 0 4px 16px rgba(245,158,11,0.45)'
                                : isHit
                                  ? '0 0 0 2px rgba(234,179,8,0.50)'
                                  : isUser
                                    ? '0 3px 10px rgba(234,179,8,0.30)'
                                    : '0 3px 10px rgba(15,23,42,0.20)',
                              transition: 'box-shadow 0.15s',
                            }}
                          >
                            {msg.assinatura && (
                              <span style={{
                                display: 'block', fontSize: 10, fontWeight: 700, color: '#713F12',
                                letterSpacing: '0.02em', paddingBottom: 4,
                                borderBottom: '1px solid rgba(113,63,18,0.25)', marginBottom: 5,
                              }}>
                                {msg.assinatura} :
                              </span>
                            )}
                            {msg.audioUrl
                              ? <AudioBubble audioUrl={msg.audioUrl} duration={msg.audioDuration ?? 0} isUser={isUser} />
                              : msg.fileType === 'image' && msg.fileUrl
                                ? <img src={msg.fileUrl} alt={msg.fileName}
                                    style={{ maxWidth: 220, maxHeight: 180, borderRadius: 8, display: 'block' }} />
                                : msg.fileType === 'video' && msg.fileUrl
                                  ? <video src={msg.fileUrl} controls
                                      style={{ maxWidth: 220, borderRadius: 8, display: 'block' }} />
                                  : msg.fileName
                                    ? <FileBubble fileName={msg.fileName} fileSize={msg.fileSize ?? 0}
                                        fileType={msg.fileType ?? 'doc'} isUser={isUser} />
                                    : <span style={{ wordBreak: 'break-word' }}>{isHit ? highlightMsg(msg.text, msgSearchQuery.trim(), isCurrent) : msg.text}</span>
                            }
                            <span
                              className="flex items-center gap-1 self-end"
                              style={{ fontSize: 10, fontWeight: 500, opacity: 0.75, color: isUser ? '#713F12' : '#94A3B8' }}
                            >
                              {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isUser && <CheckCircle2 style={{ width: 11, height: 11 }} />}
                            </span>
                          </div>
                        )}

                        {/* ── Reactions display ── */}
                        {msgReacts.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {Object.entries(grouped).map(([em, count]) => {
                              const active = myReaction?.emoji === em
                              return (
                                <button key={em} type="button" onClick={() => toggleReaction(msg.id, em)}
                                  title={active ? 'Remover reação' : 'Reagir'}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '2px 8px 2px 5px', borderRadius: 999,
                                    border: \`1px solid \${active ? 'rgba(234,179,8,0.45)' : 'rgba(255,255,255,0.10)'}\`,
                                    background: active ? 'rgba(234,179,8,0.12)' : 'rgba(15,23,42,0.70)',
                                    cursor: 'pointer', transition: 'all 0.12s',
                                    backdropFilter: 'blur(4px)',
                                  }}
                                >
                                  <span style={{ fontSize: 16, lineHeight: 1 }}>{em}</span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#EAB308' : '#94A3B8', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Reaction button — contact messages (right of bubble) */}
                      {!isUser && isHovered && (() => {
                        const menuOpen = reactionMenuMsgId === msg.id
                        return (
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <button type="button"
                              onClick={() => setReactionMenuMsgId(prev => prev === msg.id ? null : msg.id)}
                              title="Reagir"
                              style={{
                                width: 26, height: 26, borderRadius: '50%', border: '1px solid #334155',
                                background: '#0F172A', cursor: 'pointer', fontSize: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.35)', transition: 'border-color 0.12s',
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(234,179,8,0.50)'}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155'}
                            >😊</button>
                            {menuOpen && (
                              <div style={{
                                position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, zIndex: 60,
                                background: '#0F172A', border: '1px solid rgba(234,179,8,0.25)',
                                borderRadius: 40, padding: '6px 8px',
                                display: 'flex', gap: 2,
                                boxShadow: '0 4px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(234,179,8,0.08)',
                                animation: 'atalhoPopIn 0.18s cubic-bezier(0.16,1,0.3,1)',
                                whiteSpace: 'nowrap',
                              }}>
                                {QUICK_REACTIONS.map(em => {
                                  const active = myReaction?.emoji === em
                                  return (
                                    <button key={em} type="button" onClick={() => toggleReaction(msg.id, em)}
                                      style={{
                                        width: 38, height: 38, borderRadius: '50%', border: 'none',
                                        background: active ? 'rgba(234,179,8,0.20)' : 'transparent',
                                        cursor: 'pointer', fontSize: 22,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transform: active ? 'scale(1.15)' : 'scale(1)',
                                        transition: 'all 0.12s',
                                        outline: active ? '2px solid rgba(234,179,8,0.45)' : 'none',
                                        outlineOffset: 2,
                                      }}
                                      onMouseEnter={ev => { (ev.currentTarget as HTMLButtonElement).style.transform = 'scale(1.3)'; (ev.currentTarget as HTMLButtonElement).style.background = 'rgba(234,179,8,0.15)' }}
                                      onMouseLeave={ev => { (ev.currentTarget as HTMLButtonElement).style.transform = active ? 'scale(1.15)' : 'scale(1)'; (ev.currentTarget as HTMLButtonElement).style.background = active ? 'rgba(234,179,8,0.20)' : 'transparent' }}
                                    >{em}</button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )`;

const newLines = [...lines.slice(0, start), ...newSection.split('\n'), ...lines.slice(end + 1)];
fs.writeFileSync('src/pages/MessagesPremium.tsx', newLines.join('\n'));
console.log('Done! Lines', start+1, 'to', end+1, 'replaced.');
