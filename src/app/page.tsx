'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormData {
  fullName: string;
  whatYouDo: string[];
  currentRole: string;
  experienceLevel: string;
  location: string;
  portfolioLink: string;
  hacaConnection: string;
}

interface SubmitResult {
  unique_id: string;
  full_name: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const WHAT_YOU_DO_OPTIONS = [
  'Graphic Design',
  'Brand Design',
  'Motion',
  'UI/UX',
  'Video Editing',
  'Illustration',
  '3D',
  'Photography / Content',
  'Other',
];

const CURRENT_ROLE_OPTIONS = [
  'Student',
  'Full-time Designer',
  'Freelancer',
  'Part-time',
  'Looking for work',
];

const EXPERIENCE_LEVEL_OPTIONS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Senior',
];

const TOTAL_STEPS = 3;

// ─── CheckIcon ───────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

// ─── ArrowIcon ───────────────────────────────────────────────────────────────
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13 8H3M7 12 3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── DopamineCard ────────────────────────────────────────────────────────────
function DopamineCard({ uniqueId, name, cardRef }: { uniqueId: string; name: string; cardRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="dopamine-card" ref={cardRef}>
      <Image
        src="/dopamine-bg.png"
        alt="Dopamine Background"
        fill
        className="dopamine-bg"
        style={{ objectFit: 'cover' }}
        priority
      />

      {/* Only the ID and Name — DOPAMINE and // are already in the background image */}
      <span className="dopamine-dynamic dopamine-dynamic-id">{uniqueId}</span>
      <span className="dopamine-dynamic dopamine-dynamic-name">{name.toUpperCase()}</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const cardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({
    fullName: '',
    whatYouDo: [],
    currentRole: '',
    experienceLevel: '',
    location: '',
    portfolioLink: '',
    hacaConnection: '',
  });

  // Countdown after submission
  useEffect(() => {
    if (!submitted) return;
    if (countdown <= 0) {
      window.location.href = 'https://chat.whatsapp.com/GPkhcQXyVMg6GOy4LBdwxX?mode=gi_t'; // replace with actual group link
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [submitted, countdown]);

  // ─── Validation ────────────────────────────────────────────────────────────
  function validateStep(s: number): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (s === 1) {
      if (!form.fullName.trim()) newErrors.fullName = 'Name is required';
      if (form.whatYouDo.length === 0) newErrors.whatYouDo = 'Select at least one';
    }
    if (s === 2) {
      if (!form.currentRole) newErrors.currentRole = 'Select your current role';
      if (!form.experienceLevel) newErrors.experienceLevel = 'Select your experience level';
      if (!form.location.trim()) newErrors.location = 'Location is required';
    }
    if (s === 3) {
      if (!form.hacaConnection.trim()) newErrors.hacaConnection = 'Please tell us about your connection';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function toggleChip(value: string) {
    setForm((prev) => ({
      ...prev,
      whatYouDo: prev.whatYouDo.includes(value)
        ? prev.whatYouDo.filter((v) => v !== value)
        : [...prev.whatYouDo, value],
    }));
    setErrors((e) => ({ ...e, whatYouDo: undefined }));
  }

  function handleNext() {
    if (validateStep(step)) setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => s - 1);
    setErrors({});
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.fullName,
          what_you_do: form.whatYouDo,
          current_role: form.currentRole,
          experience_level: form.experienceLevel,
          location: form.location,
          portfolio_link: form.portfolioLink || null,
          haca_connection: form.hacaConnection,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setResult({ unique_id: data.unique_id, full_name: form.fullName });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrors({ hacaConnection: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.querySelector('.dopamine-card');
          if (clonedCard) {
            clonedCard.style.transform = 'none';
            clonedCard.style.animation = 'none';
          }
        }
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `dopamine-id-${result?.unique_id?.replace('#', '')}.png`;
      a.href = url;
      a.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  }

  // ─── Progress ──────────────────────────────────────────────────────────────
  function ProgressBar() {
    return (
      <div className="progress-bar">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`progress-step ${i + 1 < step ? 'done' : i + 1 === step ? 'active' : ''}`}
          />
        ))}
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-grid" />
      <div className="bg-glow" />

      <main className="page">
        {/* Header */}
        <header className="header">
          <Image src="/logo.png" alt="HACA Design School" width={120} height={40} className="logo-img" style={{ objectFit: 'contain' }} />
          <span className="header-badge">Dopamine ✦</span>
        </header>

        {!submitted ? (
          <>
            {/* Hero */}
            <section className="hero">
              <p className="hero-eyebrow">HACA Design School</p>
              <h1 className="hero-title">
                Keep it<br /><span>DOPE.</span>
              </h1>
              <p className="hero-subtitle">
                Join an exclusive community of designers. Fill in your details and get your Dopamine ID.
              </p>
            </section>

            <ProgressBar />

            {/* Form Card */}
            <div className="form-card">

              {/* ── Step 1 ── */}
              {step === 1 && (
                <div>
                  <div className="step-header">
                    <span className="step-number">01 / 03</span>
                    <h2 className="step-title">Who are you?</h2>
                  </div>

                  {/* Full Name */}
                  <div className="field-group">
                    <label className="field-label" htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      className="field-input"
                      placeholder="Your name here..."
                      value={form.fullName}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, fullName: e.target.value }));
                        setErrors((er) => ({ ...er, fullName: undefined }));
                      }}
                    />
                    {errors.fullName && <p className="error-text">{errors.fullName}</p>}
                  </div>

                  {/* What you do */}
                  <div className="field-group">
                    <label className="field-label">What do you do? <span>select all that apply</span></label>
                    <div className="chips-grid">
                      {WHAT_YOU_DO_OPTIONS.map((opt) => (
                        <div
                          key={opt}
                          id={`chip-${opt.replace(/\W/g, '')}`}
                          className={`chip ${form.whatYouDo.includes(opt) ? 'selected' : ''}`}
                          onClick={() => toggleChip(opt)}
                          role="checkbox"
                          aria-checked={form.whatYouDo.includes(opt)}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === ' ' && toggleChip(opt)}
                        >
                          <span className="chip-check"><CheckIcon /></span>
                          <span className="chip-label">{opt}</span>
                        </div>
                      ))}
                    </div>
                    {errors.whatYouDo && <p className="error-text">{errors.whatYouDo}</p>}
                  </div>

                  <div className="form-nav">
                    <div />
                    <button id="btn-step1-next" className="btn-next" onClick={handleNext}>
                      Continue <ArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <div>
                  <div className="step-header">
                    <span className="step-number">02 / 03</span>
                    <h2 className="step-title">Your Profile</h2>
                  </div>

                  {/* Current Role */}
                  <div className="field-group">
                    <label className="field-label">Current Role</label>
                    <div className="radio-grid">
                      {CURRENT_ROLE_OPTIONS.map((opt) => (
                        <div
                          key={opt}
                          id={`role-${opt.replace(/\W/g, '')}`}
                          className={`radio-card ${form.currentRole === opt ? 'selected' : ''}`}
                          onClick={() => {
                            setForm((f) => ({ ...f, currentRole: opt }));
                            setErrors((er) => ({ ...er, currentRole: undefined }));
                          }}
                          role="radio"
                          aria-checked={form.currentRole === opt}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === ' ' && setForm((f) => ({ ...f, currentRole: opt }))}
                        >
                          <span className="radio-dot" />
                          <span className="radio-label">{opt}</span>
                        </div>
                      ))}
                    </div>
                    {errors.currentRole && <p className="error-text">{errors.currentRole}</p>}
                  </div>

                  {/* Experience */}
                  <div className="field-group">
                    <label className="field-label">Experience Level</label>
                    <div className="radio-grid">
                      {EXPERIENCE_LEVEL_OPTIONS.map((opt) => (
                        <div
                          key={opt}
                          id={`exp-${opt}`}
                          className={`radio-card ${form.experienceLevel === opt ? 'selected' : ''}`}
                          onClick={() => {
                            setForm((f) => ({ ...f, experienceLevel: opt }));
                            setErrors((er) => ({ ...er, experienceLevel: undefined }));
                          }}
                          role="radio"
                          aria-checked={form.experienceLevel === opt}
                          tabIndex={0}
                        >
                          <span className="radio-dot" />
                          <span className="radio-label">{opt}</span>
                        </div>
                      ))}
                    </div>
                    {errors.experienceLevel && <p className="error-text">{errors.experienceLevel}</p>}
                  </div>

                  {/* Location */}
                  <div className="field-group">
                    <label className="field-label" htmlFor="location">Location</label>
                    <input
                      id="location"
                      type="text"
                      className="field-input"
                      placeholder="City, State"
                      value={form.location}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, location: e.target.value }));
                        setErrors((er) => ({ ...er, location: undefined }));
                      }}
                    />
                    {errors.location && <p className="error-text">{errors.location}</p>}
                  </div>

                  {/* Portfolio */}
                  <div className="field-group">
                    <label className="field-label" htmlFor="portfolio">
                      Portfolio Link <span>optional</span>
                    </label>
                    <input
                      id="portfolio"
                      type="url"
                      className="field-input"
                      placeholder="https://your-portfolio.com"
                      value={form.portfolioLink}
                      onChange={(e) => setForm((f) => ({ ...f, portfolioLink: e.target.value }))}
                    />
                  </div>

                  <div className="form-nav">
                    <button className="btn-back" onClick={handleBack}>
                      <ArrowLeft /> Back
                    </button>
                    <button id="btn-step2-next" className="btn-next" onClick={handleNext}>
                      Continue <ArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3 ── */}
              {step === 3 && (
                <div>
                  <div className="step-header">
                    <span className="step-number">03 / 03</span>
                    <h2 className="step-title">Your Story</h2>
                  </div>

                  {/* HACA Connection */}
                  <div className="field-group">
                    <label className="field-label" htmlFor="hacaConnection">
                      Your connection with HACA Design School
                    </label>
                    <textarea
                      id="hacaConnection"
                      className="field-input"
                      placeholder="How did you hear about us? What made you join? Share your story..."
                      value={form.hacaConnection}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, hacaConnection: e.target.value }));
                        setErrors((er) => ({ ...er, hacaConnection: undefined }));
                      }}
                      rows={5}
                    />
                    {errors.hacaConnection && <p className="error-text">{errors.hacaConnection}</p>}
                  </div>

                  {/* Summary Preview */}
                  <div style={{
                    background: 'rgba(0,255,65,0.04)',
                    border: '1px solid rgba(0,255,65,0.1)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    marginBottom: 28,
                  }}>
                    <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
                      Your Info
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{form.fullName || '—'}</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>
                      {form.whatYouDo.join(' · ') || '—'}
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                      {[form.currentRole, form.experienceLevel, form.location].filter(Boolean).join(' · ')}
                    </p>
                  </div>

                  <div className="form-nav" style={{ flexDirection: 'column', gap: 12 }}>
                    <button
                      id="btn-submit"
                      className="btn-submit"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span style={{ display: 'inline-block', width: 16, height: 16, border: '2.5px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                          Generating your ID...
                        </>
                      ) : (
                        <>Get My Dopamine ID ✦</>
                      )}
                    </button>
                    <button className="btn-back" onClick={handleBack} style={{ width: '100%', justifyContent: 'center' }}>
                      <ArrowLeft /> Back
                    </button>
                  </div>
                </div>
              )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        ) : (
          /* ── Success / ID Card ── */
          <div className="id-view">
            <div className="id-success-msg">
              <h2>You&apos;re <span className="green">IN.</span></h2>
              <p>Your Dopamine ID is ready. Welcome to the crew.</p>
            </div>

            {result && (
              <div className="dopamine-card-wrapper">
                <DopamineCard
                  uniqueId={result.unique_id}
                  name={result.full_name}
                  cardRef={cardRef}
                />
              </div>
            )}

            <div className="card-actions">
              <button id="btn-download" className="btn-download" onClick={handleDownload}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M5 7l3 3 3-3M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download ID Card
              </button>
              <a
                id="btn-join-group"
                href="https://chat.whatsapp.com/GPkhcQXyVMg6GOy4LBdwxX?mode=gi_t"
                className="btn-join"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 1.41.37 2.73 1.01 3.87L0 16l4.24-1.1A7.97 7.97 0 008 16c4.42 0 8-3.58 8-8s-3.58-8-8-8zm0 14.67a6.65 6.65 0 01-3.39-.93l-.24-.14-2.52.65.67-2.45-.16-.25A6.67 6.67 0 118 14.67z" />
                </svg>
                Join the Group
              </a>
            </div>

            <div className="redirect-notice">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4.5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Auto-redirecting to the group in <span className="redirect-count">{countdown}s</span>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
