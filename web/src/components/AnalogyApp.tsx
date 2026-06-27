'use client'

import { useState, useEffect } from 'react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { analogySchema } from '@/app/api/chat/schema'

/* ─── Types ─────────────────────────────────────────────────── */

type Tab = 'find' | 'library'
type LibFilter = 'all' | 'pitch' | 'talk' | 'investor deck'
type ReflectStatus = 'landed' | 'confusing' | 'cut'

interface Analogy {
  id: number
  text: string
  tag: 'pitch' | 'talk' | 'investor deck'
  audience: string
  status: ReflectStatus
  uses: number
}

/* ─── Constants ──────────────────────────────────────────────── */

const SEED_LIB: Analogy[] = [
  { id: 1, text: 'Churn is a leaky bucket — pouring in more leads will never outrun the holes.', tag: 'pitch', audience: 'founders', status: 'landed', uses: 6 },
  { id: 2, text: "Payroll compliance is a building's fire code: invisible until the day it saves you.", tag: 'pitch', audience: 'executives', status: 'landed', uses: 4 },
  { id: 3, text: 'Our API is the plumbing — nobody admires it until it leaks.', tag: 'talk', audience: 'engineers', status: 'landed', uses: 3 },
  { id: 4, text: "Onboarding is a first date, not a wedding. Don't ask for everything up front.", tag: 'investor deck', audience: 'investors', status: 'confusing', uses: 2 },
  { id: 5, text: 'Switching vendors is repotting a plant — stressful for a week, then it grows.', tag: 'pitch', audience: 'executives', status: 'confusing', uses: 1 },
  { id: 6, text: 'Our caching layer is milk on the counter vs. milk in the fridge.', tag: 'talk', audience: 'engineers', status: 'cut', uses: 1 },
]

const AUD_OPTIONS = ['founders', 'investors', 'engineers', 'executives', 'general public'] as const
const GOAL_OPTIONS = ['simplify something complex', 'build trust', 'create urgency', 'reframe risk'] as const
const TONE_OPTIONS = ['reassure', 'excite', 'provoke', 'clarify'] as const
const FILTER_OPTIONS: LibFilter[] = ['all', 'pitch', 'talk', 'investor deck']

const STORAGE_KEY = 'analogy_api_key'

const STUB_RESULTS: StreamedAnalogy[] = [
  {
    text: "Product-market fit is like tuning a radio — you know you've got it when the static disappears and the signal comes through clean.",
    fit: 'Gives founders an intuitive feel for the qualitative shift, beyond just looking at retention metrics.',
  },
  {
    text: 'Our pricing is like a gym membership — you pay for access, not per rep, so power users are a bonus rather than a burden.',
    fit: 'Helps investors quickly grasp unit economics and why marginal cost stays flat as usage scales.',
  },
  {
    text: 'Technical debt is borrowed money. Fine in small amounts when the interest is manageable — but it compounds.',
    fit: 'Engineers and CTOs immediately understand the tradeoff between shipping speed and long-term maintainability.',
  },
]

const REFLECT_COLOR: Record<ReflectStatus, string> = {
  landed: '#1F8A4C',
  confusing: '#C77D11',
  cut: '#111111',
}

/* ─── Primitives ─────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'block',
      margin: '24px 0 11px',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '1.4px',
      textTransform: 'uppercase',
      color: '#9a9a9a',
    }}>
      {children}
    </span>
  )
}

function Chip({ label, selected, violet = false, onClick }: {
  label: string; selected: boolean; violet?: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', padding: '10px 16px',
      borderRadius: '999px',
      border: `1.5px solid ${selected ? (violet ? '#6D28D9' : '#111') : '#111'}`,
      background: selected ? (violet ? '#6D28D9' : '#111') : '#fff',
      color: selected ? '#fff' : '#0e0e0e',
      fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
      lineHeight: 1.1, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .14s ease',
    }}>
      {label}
    </button>
  )
}

function CTAButton({ children, onClick, marginTop = '28px' }: {
  children: React.ReactNode; onClick: () => void; marginTop?: string
}) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setPressed(true)} onMouseLeave={() => setPressed(false)}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)} onTouchEnd={() => setPressed(false)}
      style={{
        width: '100%', padding: '16px', borderRadius: '12px', background: '#111',
        color: '#fff', fontFamily: 'inherit', fontSize: '16px', fontWeight: 700,
        cursor: 'pointer', marginTop, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px', border: 'none',
        boxShadow: pressed ? '3px 3px 0 #6D28D9' : '5px 5px 0 #6D28D9',
        transform: pressed ? 'translate(2px, 2px)' : 'none',
        transition: 'all .12s ease', textTransform: 'lowercase',
      }}
    >
      {children}
    </button>
  )
}

function TextLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', color: '#6b6b6b', fontFamily: 'inherit',
      fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '15px',
      display: 'block', width: '100%', textAlign: 'center',
    }}>
      {children}
    </button>
  )
}

/* ─── Chrome ─────────────────────────────────────────────────── */

function JourneyPills({ tab, resultsActive }: { tab: Tab; resultsActive: boolean }) {
  const pill = (label: string, active: boolean) => (
    <span key={label} style={{
      display: 'inline-flex', alignItems: 'center', padding: '6px 13px',
      borderRadius: '999px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
      border: `1.5px solid ${active ? '#6D28D9' : '#E2E2E2'}`,
      background: active ? '#6D28D9' : '#fff',
      color: active ? '#fff' : '#9a9a9a',
    }}>
      {label}
    </span>
  )
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '4px 22px 8px', flexShrink: 0 }}>
      {pill('1 context', tab === 'find' && !resultsActive)}
      {pill('2 results', resultsActive)}
      {pill('3 library', tab === 'library')}
    </div>
  )
}

function BottomNav({ tab, onFind, onLib }: { tab: Tab; onFind: () => void; onLib: () => void }) {
  const navItem = (active: boolean, faint: boolean) => ({
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px',
    color: faint ? '#C2C2C2' : (active ? '#6D28D9' : '#6b6b6b'),
    fontSize: '11px', fontWeight: 600,
  })
  return (
    <div style={{ flexShrink: 0, borderTop: '1.5px solid #111', display: 'flex', padding: '11px 0 20px', background: '#fff' }}>
      <button onClick={onFind} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
        <span style={navItem(tab === 'find', false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
          </svg>
          find
        </span>
      </button>
      <button onClick={onLib} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
        <span style={navItem(tab === 'library', false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
            <path d="M6 3h12v18l-6-4-6 4z"/>
          </svg>
          library
        </span>
      </button>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <span style={navItem(false, true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <line x1="5" y1="20" x2="5" y2="13"/>
            <line x1="12" y1="20" x2="12" y2="7"/>
            <line x1="19" y1="20" x2="19" y2="11"/>
          </svg>
          insights
        </span>
      </div>
    </div>
  )
}

/* ─── Result card (Find results) ─────────────────────────────── */

function SkeletonCard() {
  return (
    <div style={{
      background: '#FAFAFA', border: '1.5px solid #E2E2E2', borderRadius: '12px',
      padding: '15px', marginBottom: '12px',
    }}>
      <div style={{ height: '15px', background: '#EBEBEB', borderRadius: '4px', marginBottom: '9px', width: '92%' }} />
      <div style={{ height: '15px', background: '#EBEBEB', borderRadius: '4px', marginBottom: '9px', width: '78%' }} />
      <div style={{ height: '15px', background: '#EBEBEB', borderRadius: '4px', width: '55%' }} />
    </div>
  )
}

function AnalogyResultCard({ text, fit, saved, onSave, onCopy }: {
  text: string; fit?: string; saved: boolean; onSave: () => void; onCopy: () => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #111', borderRadius: '12px',
      padding: '15px', marginBottom: '12px', boxShadow: '4px 4px 0 #111',
    }}>
      <p style={{ fontSize: '15.5px', lineHeight: 1.4, color: '#0e0e0e', margin: '0 0 10px', fontWeight: 500 }}>
        {text}
      </p>
      {fit && (
        <p style={{ fontSize: '12.5px', lineHeight: 1.4, color: '#6b6b6b', margin: '0 0 14px', fontStyle: 'italic' }}>
          {fit}
        </p>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleCopy} style={{
          flex: 1, padding: '8px 0', borderRadius: '8px',
          border: `1.5px solid ${copied ? '#1F8A4C' : '#E2E2E2'}`,
          background: copied ? '#1F8A4C' : '#fff',
          color: copied ? '#fff' : '#6b6b6b',
          fontFamily: 'inherit', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', transition: 'all .12s ease',
        }}>
          {copied ? 'copied ✓' : 'copy'}
        </button>
        <button onClick={onSave} style={{
          flex: 1, padding: '8px 0', borderRadius: '8px',
          border: `1.5px solid ${saved ? '#6D28D9' : '#111'}`,
          background: saved ? '#6D28D9' : '#111',
          color: '#fff',
          fontFamily: 'inherit', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', transition: 'all .12s ease',
        }}>
          {saved ? 'saved ✓' : 'save ↗'}
        </button>
      </div>
    </div>
  )
}

/* ─── API key banner ─────────────────────────────────────────── */

function ApiKeyBanner({ onGenerate }: { onGenerate: (key: string, remember: boolean) => void }) {
  const [keyInput, setKeyInput] = useState('')
  const [remember, setRemember] = useState(false)
  const canSubmit = keyInput.trim().length > 0

  return (
    <div style={{
      border: '1.5px solid #6D28D9', borderRadius: '12px',
      padding: '16px', marginBottom: '16px', background: '#F8F5FF',
    }}>
      <p style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
        textTransform: 'uppercase', color: '#6D28D9', margin: '0 0 6px',
      }}>
        example results
      </p>
      <p style={{ fontSize: '14px', fontWeight: 500, color: '#0e0e0e', margin: '0 0 13px', lineHeight: 1.4 }}>
        Enter your Anthropic API key to generate real analogies for your framing.
      </p>
      <input
        type="password"
        placeholder="sk-ant-..."
        value={keyInput}
        onChange={e => setKeyInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && canSubmit) onGenerate(keyInput.trim(), remember) }}
        style={{
          width: '100%', padding: '11px 13px', borderRadius: '9px',
          border: '1.5px solid #111', background: '#fff', color: '#0e0e0e',
          fontFamily: 'inherit', fontSize: '14px', outline: 'none',
          marginBottom: '10px', boxSizing: 'border-box',
        }}
      />
      <label style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', marginBottom: '13px' }}>
        <input
          type="checkbox"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
          style={{ width: '16px', height: '16px', accentColor: '#6D28D9', cursor: 'pointer', flexShrink: 0 }}
        />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0e0e0e' }}>remember this key</span>
      </label>
      <button
        onClick={() => canSubmit && onGenerate(keyInput.trim(), remember)}
        disabled={!canSubmit}
        style={{
          width: '100%', padding: '13px', borderRadius: '10px',
          background: canSubmit ? '#6D28D9' : '#E2E2E2',
          color: canSubmit ? '#fff' : '#9a9a9a',
          border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700,
          cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'all .12s ease',
          boxShadow: canSubmit ? '3px 3px 0 #111' : 'none',
        }}
      >
        generate real analogies ↗
      </button>
    </div>
  )
}

/* ─── Find tab ───────────────────────────────────────────────── */

const STEP_LABEL: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
  textTransform: 'uppercase', color: '#6D28D9', whiteSpace: 'nowrap', flexShrink: 0,
}

const SCREEN_TITLE: React.CSSProperties = {
  fontSize: '30px', fontWeight: 700, letterSpacing: '-0.9px',
  color: '#0e0e0e', margin: 0, whiteSpace: 'nowrap',
}

type StreamedAnalogy = { text?: string; fit?: string }

interface FindTabProps {
  step: 1 | 2
  topic: string; audience: string; goal: string; tone: string; searched: boolean
  results: (StreamedAnalogy | undefined)[]; isLoading: boolean; error: Error | undefined
  savedResultIds: Set<number>
  showStub: boolean
  onTopic: (v: string) => void; onAudience: (v: string) => void
  onGoal: (v: string) => void; onTone: (v: string) => void
  onNext: () => void; onBack: () => void; onSearch: () => void
  onSaveResult: (idx: number) => void; onSaveAll: () => void
  onGenerateWithKey: (key: string, remember: boolean) => void
  onClearKey: () => void
}

function FindTab({
  step, topic, audience, goal, tone, searched,
  results, isLoading, error,
  savedResultIds, showStub,
  onTopic, onAudience, onGoal, onTone, onNext, onBack, onSearch, onSaveResult, onSaveAll,
  onGenerateWithKey, onClearKey,
}: FindTabProps) {
  const displayResults: StreamedAnalogy[] = showStub ? STUB_RESULTS : results.filter((r): r is StreamedAnalogy => !!r?.text)
  if (step === 1) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px', gap: '12px' }}>
          <h2 style={SCREEN_TITLE}>find an analogy</h2>
          <span style={STEP_LABEL}>step 1 / 2</span>
        </div>

        <SectionLabel>what are you explaining?</SectionLabel>
        <textarea
          placeholder="e.g. why payroll compliance matters for small businesses"
          value={topic}
          onChange={e => onTopic(e.target.value)}
          style={{
            width: '100%', minHeight: '94px', padding: '14px', borderRadius: '12px',
            border: '1.5px solid #111', background: '#FAFAFA', color: '#0e0e0e',
            fontFamily: 'inherit', fontSize: '15px', lineHeight: 1.4, resize: 'none', outline: 'none',
          }}
        />

        <SectionLabel>your audience</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
          {AUD_OPTIONS.map(opt => (
            <Chip key={opt} label={opt} selected={audience === opt} onClick={() => onAudience(opt)} />
          ))}
        </div>

        <SectionLabel>goal of the analogy</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
          {GOAL_OPTIONS.map(opt => (
            <Chip key={opt} label={opt} selected={goal === opt} violet onClick={() => onGoal(opt)} />
          ))}
        </div>

        <CTAButton onClick={onNext}>
          frame the moment <span style={{ fontSize: '18px', lineHeight: 1 }}>↗</span>
        </CTAButton>
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px', gap: '12px' }}>
        <h2 style={SCREEN_TITLE}>frame the moment</h2>
        <span style={STEP_LABEL}>step 2 / 2</span>
      </div>

      <div style={{
        background: '#F3EEFC', border: '1.5px solid #E0D4F7', borderRadius: '10px',
        padding: '11px 14px', marginTop: '8px', color: '#5B21B6', fontWeight: 600, fontSize: '13.5px',
      }}>
        for {audience}&nbsp;&nbsp;·&nbsp;&nbsp;to {goal}
      </div>

      <SectionLabel>emotional register</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
        {TONE_OPTIONS.map(opt => (
          <Chip key={opt} label={opt} selected={tone === opt} onClick={() => onTone(opt)} />
        ))}
      </div>

      {!searched ? (
        <>
          <CTAButton onClick={onSearch}>
            find analogies <span style={{ fontSize: '18px', lineHeight: 1 }}>↗</span>
          </CTAButton>
          <TextLink onClick={onBack}>← back to context</TextLink>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '28px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#6D28D9' }}>
              {isLoading
                ? `⟳ generating${displayResults.length > 0 ? ` · ${displayResults.length} so far` : '...'}`
                : error
                  ? '⚠ something went wrong'
                  : showStub
                    ? '↓ example results'
                    : `✓ ${displayResults.length} analogies`
              }
            </span>
            {!isLoading && !error && !showStub && displayResults.length > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#9a9a9a' }}>
                tap to save
              </span>
            )}
          </div>

          {error && (
            <div style={{
              marginTop: '14px', padding: '13px 15px', borderRadius: '10px',
              background: '#FFF5F5', border: '1.5px solid #FFCDD2', color: '#C62828',
              fontSize: '13.5px', fontWeight: 500,
            }}>
              Something went wrong. Check your API key and try again.{' '}
              <button onClick={onClearKey} style={{
                background: 'none', border: 'none', color: '#C62828', fontFamily: 'inherit',
                fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', padding: 0,
                textDecoration: 'underline',
              }}>
                update key
              </button>
            </div>
          )}

          <div style={{ marginTop: '14px' }}>
            {showStub && <ApiKeyBanner onGenerate={onGenerateWithKey} />}
            {displayResults.map((result, i) => (
              <AnalogyResultCard
                key={i}
                text={result.text!}
                fit={result.fit}
                saved={savedResultIds.has(i)}
                onSave={() => onSaveResult(i)}
                onCopy={() => navigator.clipboard.writeText(result.text!)}
              />
            ))}
            {isLoading && <SkeletonCard />}
          </div>

          {!isLoading && !error && !showStub && displayResults.length > 0 && (
            <>
              <CTAButton onClick={onSaveAll} marginTop='20px'>
                save all to library <span style={{ fontSize: '18px', lineHeight: 1 }}>↗</span>
              </CTAButton>
              <TextLink onClick={onBack}>← reframe</TextLink>
            </>
          )}
          {!isLoading && showStub && (
            <TextLink onClick={onBack}>← reframe</TextLink>
          )}
          {isLoading && (
            <TextLink onClick={onBack}>← cancel</TextLink>
          )}
          {error && (
            <CTAButton onClick={onSearch} marginTop='16px'>
              try again <span style={{ fontSize: '18px', lineHeight: 1 }}>↗</span>
            </CTAButton>
          )}
        </>
      )}
    </>
  )
}

/* ─── Library tab ────────────────────────────────────────────── */

function AnalogyCard({ analogy, onReflect }: { analogy: Analogy; onReflect: (s: ReflectStatus) => void }) {
  const statuses: ReflectStatus[] = ['landed', 'confusing', 'cut']
  return (
    <div style={{
      background: '#fff', border: '1.5px solid #111', borderRadius: '12px',
      padding: '15px', marginBottom: '14px', boxShadow: '4px 4px 0 #111',
    }}>
      <p style={{ fontSize: '15.5px', lineHeight: 1.4, color: '#0e0e0e', margin: '0 0 13px', fontWeight: 500 }}>
        {analogy.text}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '12px', color: '#6b6b6b' }}>
        <span style={{
          padding: '3px 9px', border: '1.5px solid #111', borderRadius: '999px',
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px',
          textTransform: 'uppercase', color: '#111', background: '#fff',
        }}>
          {analogy.tag}
        </span>
        <span>{analogy.audience}</span>
        <span style={{ color: '#C9C9C9' }}>|</span>
        <span>used {analogy.uses}×</span>
      </div>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#9a9a9a', marginBottom: '8px' }}>
        did it land?
      </div>
      <div style={{ display: 'flex', gap: '7px' }}>
        {statuses.map(st => {
          const active = analogy.status === st
          const c = REFLECT_COLOR[st]
          return (
            <button key={st} onClick={() => onReflect(st)} style={{
              flex: 1, padding: '8px 0', borderRadius: '8px',
              border: `1.5px solid ${active ? c : '#E2E2E2'}`,
              background: active ? c : '#fff',
              color: active ? '#fff' : '#9a9a9a',
              fontFamily: 'inherit', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', textTransform: 'capitalize', transition: 'all .12s ease',
            }}>
              {st}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LibraryTab({ lib, libFilter, importOpen, onFilterChange, onToggleImport, onReflect }: {
  lib: Analogy[]; libFilter: LibFilter; importOpen: boolean
  onFilterChange: (f: LibFilter) => void; onToggleImport: () => void
  onReflect: (id: number, status: ReflectStatus) => void
}) {
  const landedCount = lib.filter(a => a.status === 'landed').length
  const filtered = lib.filter(a => libFilter === 'all' || a.tag === libFilter)

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
        <h2 style={SCREEN_TITLE}>library</h2>
        <span style={STEP_LABEL}>{lib.length} saved · {landedCount} landed</span>
      </div>

      {!importOpen ? (
        <div onClick={onToggleImport} style={{
          border: '1.5px dashed #111', borderRadius: '12px', padding: '14px 15px',
          margin: '18px 0 6px', display: 'flex', alignItems: 'center',
          gap: '11px', cursor: 'pointer', background: '#FAFAFA',
        }}>
          <span style={{ fontSize: '17px', lineHeight: 1 }}>↓</span>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0e0e0e' }}>import analogies from a recent pitch</span>
        </div>
      ) : (
        <div style={{
          border: '1.5px solid #111', borderRadius: '12px', padding: '14px',
          margin: '18px 0 6px', background: '#fff', boxShadow: '4px 4px 0 #6D28D9',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#9a9a9a', marginBottom: '9px' }}>
            paste a pitch · we extract the metaphors
          </div>
          <textarea
            placeholder="Paste a transcript or pitch deck text…"
            style={{
              width: '100%', minHeight: '72px', padding: '12px', borderRadius: '9px',
              border: '1.5px solid #E2E2E2', background: '#FAFAFA', color: '#0e0e0e',
              fontFamily: 'inherit', fontSize: '14px', lineHeight: 1.4, resize: 'none', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button onClick={onToggleImport} style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #111',
              background: '#111', color: '#fff', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
            }}>extract analogies</button>
            <button onClick={onToggleImport} style={{
              padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #E2E2E2',
              background: '#fff', color: '#6b6b6b', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            }}>cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px', margin: '14px 0 4px' }}>
        {FILTER_OPTIONS.map(opt => (
          <Chip key={opt} label={opt} selected={libFilter === opt} onClick={() => onFilterChange(opt)} />
        ))}
      </div>

      <div style={{ marginTop: '16px' }}>
        {filtered.map(analogy => (
          <AnalogyCard key={analogy.id} analogy={analogy} onReflect={(s) => onReflect(analogy.id, s)} />
        ))}
      </div>
    </>
  )
}

/* ─── Root ───────────────────────────────────────────────────── */

let nextId = SEED_LIB.length + 1

export default function AnalogyApp() {
  const [tab, setTab] = useState<Tab>('find')
  const [step, setStep] = useState<1 | 2>(1)
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('founders')
  const [goal, setGoal] = useState('simplify something complex')
  const [tone, setTone] = useState('reassure')
  const [searched, setSearched] = useState(false)
  const [savedResultIds, setSavedResultIds] = useState<Set<number>>(new Set())
  const [libFilter, setLibFilter] = useState<LibFilter>('all')
  const [importOpen, setImportOpen] = useState(false)
  const [lib, setLib] = useState<Analogy[]>(SEED_LIB)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    if (saved) setApiKey(saved)
  }, [])

  const { object, submit, isLoading, error, stop } = useObject({
    api: '/api/chat',
    schema: analogySchema,
  })

  const results: (StreamedAnalogy | undefined)[] = object?.analogies ?? []
  const showStub = searched && !apiKey && !isLoading

  function handleSearch() {
    setSearched(true)
    if (apiKey) submit({ topic, audience, goal, tone, apiKey })
  }

  function handleGenerateWithKey(key: string, remember: boolean) {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, key)
    } else {
      sessionStorage.setItem(STORAGE_KEY, key)
    }
    setApiKey(key)
    submit({ topic, audience, goal, tone, apiKey: key })
  }

  function handleClearKey() {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    setApiKey('')
  }

  function saveResult(idx: number) {
    if (savedResultIds.has(idx)) return
    const result = results[idx]
    if (!result?.text) return
    setSavedResultIds(prev => new Set(prev).add(idx))
    setLib(prev => [...prev, {
      id: nextId++,
      text: result.text!,
      tag: 'pitch',
      audience,
      status: 'landed',
      uses: 0,
    }])
  }

  function saveAll() {
    results.forEach((_, i) => saveResult(i))
    setTab('library')
  }

  function handleBack() {
    stop()
    setStep(1)
    setSearched(false)
    setSavedResultIds(new Set())
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#e7e5df', fontFamily: 'var(--font-space-grotesk), sans-serif',
    }}>
      <div className="phone-card" style={{
        width: '100%', maxWidth: '392px', height: '100dvh', maxHeight: '812px',
        display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden',
      }}>
        <JourneyPills tab={tab} resultsActive={tab === 'find' && searched} />

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 24px' }}>
          {tab === 'find' ? (
            <FindTab
              step={step} topic={topic} audience={audience} goal={goal}
              tone={tone} searched={searched}
              results={results} isLoading={isLoading} error={error}
              savedResultIds={savedResultIds} showStub={showStub}
              onTopic={setTopic} onAudience={setAudience} onGoal={setGoal} onTone={setTone}
              onNext={() => setStep(2)} onBack={handleBack}
              onSearch={handleSearch}
              onSaveResult={saveResult} onSaveAll={saveAll}
              onGenerateWithKey={handleGenerateWithKey}
              onClearKey={handleClearKey}
            />
          ) : (
            <LibraryTab
              lib={lib} libFilter={libFilter} importOpen={importOpen}
              onFilterChange={setLibFilter}
              onToggleImport={() => setImportOpen(o => !o)}
              onReflect={(id, status) => setLib(prev => prev.map(a => a.id === id ? { ...a, status } : a))}
            />
          )}
        </div>

        <BottomNav tab={tab} onFind={() => setTab('find')} onLib={() => setTab('library')} />
      </div>
    </div>
  )
}
