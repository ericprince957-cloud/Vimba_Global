import { useState, useEffect, useRef, useCallback } from 'react';

// CONFIG - Change details in one place
const CONFIG = {
  businessName: "Vimba Global Rental and Event Planners",
  phoneDisplay: "+234 906 744 8146",
  phoneTel: "+2349067448146",
  whatsappNumber: "2349067448146",
  instagramUrl: "",
  facebookUrl: ""
};

const RENTAL_ITEMS = [
  { id: 'chairs', name: 'Chairs', desc: 'Seating for every guest count.' },
  { id: 'tables', name: 'Tables', desc: 'Round, rectangular and banquet styles.' },
  { id: 'canopies', name: 'Canopies and tents', desc: 'Cover for outdoor and indoor venues.' },
  { id: 'decor', name: 'Event decor', desc: 'Styling to match your theme.' },
  { id: 'sound', name: 'Sound system', desc: 'Speakers, microphones and DJ setup.' },
  { id: 'lighting', name: 'Lighting', desc: 'Ambient and stage lighting.' },
];

const EVENT_TYPES = ['Wedding', 'Engagement', 'Birthday', 'Corporate event', 'Naming ceremony', 'Other'];

function getTodayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function App() {
  const [showBanner, setShowBanner] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [dateCheck, setDateCheck] = useState('');
  const [dateMsg, setDateMsg] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [shareMsg, setShareMsg] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formEvent, setFormEvent] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formGuests, setFormGuests] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const lightboxRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDateCheck = () => {
    if (!dateCheck) {
      setDateMsg('Please pick a date first.');
      return;
    }
    setDateMsg('');
    const msg = `Hello, I'd like to ask if ${formatDate(dateCheck)} is available for an event. Please let me know.`;
    window.open(buildWhatsAppUrl(msg), '_blank');
  };

  const openLightbox = (idx: number, e: React.MouseEvent) => {
    triggerRef.current = e.currentTarget as HTMLButtonElement;
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const dialog = lightboxRef.current;
    if (!dialog) return;
    if (lightboxOpen && !dialog.open) {
      dialog.showModal();
    } else if (!lightboxOpen && dialog.open) {
      dialog.close();
      triggerRef.current?.focus();
    }
  }, [lightboxOpen]);

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const prevImage = () => setLightboxIdx(i => (i - 1 + 6) % 6);
  const nextImage = () => setLightboxIdx(i => (i + 1) % 6);

  const handleLightboxKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: CONFIG.businessName,
          text: 'Event planning and rentals in Aba.',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMsg('Link copied');
        setTimeout(() => setShareMsg(''), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareMsg('Link copied');
        setTimeout(() => setShareMsg(''), 2500);
      } catch {
        setShareMsg('Could not copy link');
        setTimeout(() => setShareMsg(''), 2500);
      }
    }
  };

  const submitQuote = useCallback(() => {
    const errors: string[] = [];
    if (!formName.trim()) errors.push('Please enter your name.');
    if (!formEvent) errors.push('Please choose an event type.');
    setFormErrors(errors);
    setFormSuccess('');
    if (errors.length > 0) return;

    const lines: string[] = ['Hello, I\'d like a quote.'];
    lines.push(`Name: ${formName.trim()}`);
    lines.push(`Event: ${formEvent}`);
    if (formDate) lines.push(`Date: ${formatDate(formDate)}`);
    if (formArea.trim()) lines.push(`Area: ${formArea.trim()}`);
    if (formGuests) lines.push(`Guests: ${formGuests}`);
    const itemNames = selectedItems.map(id => RENTAL_ITEMS.find(r => r.id === id)?.name).filter(Boolean);
    if (itemNames.length) lines.push(`Items: ${itemNames.join(', ')}`);
    if (formNotes.trim()) lines.push(`Notes: ${formNotes.trim()}`);

    const msg = lines.join('\n');
    setFormSuccess('Opening WhatsApp…');
    setTimeout(() => setFormSuccess(''), 3000);
    window.open(buildWhatsAppUrl(msg), '_blank');
  }, [formName, formEvent, formDate, formArea, formGuests, formNotes, selectedItems]);

  const scrollToQuote = () => {
    const el = document.getElementById('quote');
    if (el) {
      const offset = 70;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top banner */}
      {showBanner && (
        <div className="top-banner" role="banner">
          <p>Design preview. Vimba's own photos, services and details replace the sample content.</p>
          <button onClick={() => setShowBanner(false)} aria-label="Close banner" className="banner-close">×</button>
        </div>
      )}

      {/* Sticky header */}
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="logo" aria-label="Vimba Global — home">Vimba Global</a>
        <div className="header-actions">
          <a href={`tel:${CONFIG.phoneTel}`} className="header-call" aria-label="Call us">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </a>
          <button onClick={scrollToQuote} className="btn btn-sm btn-primary">Get a quote</button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero" aria-label="Introduction">
          <div className="hero-content">
            <span className="hero-badge">Open 24 hours, every day</span>
            <h1>Your event, planned and set up from start to finish.</h1>
            <p className="hero-sub">Event planning and rentals in Aba. Tell us your date and what you need, and we'll reply on WhatsApp.</p>
            <div className="hero-buttons">
              <a href={buildWhatsAppUrl("Hello, I'd like a quote for an event.")} target="_blank" rel="noopener" className="btn btn-primary btn-lg">Get a quote on WhatsApp</a>
              <a href={`tel:${CONFIG.phoneTel}`} className="btn btn-secondary btn-lg">Call us</a>
            </div>
          </div>
        </section>

        {/* Date check */}
        <section className="date-check" aria-label="Check date availability">
          <div className="container">
            <label htmlFor="date-input" className="date-label">Planning a date? Ask if it is free.</label>
            <div className="date-row">
              <input type="date" id="date-input" min={getTodayStr()} value={dateCheck} onChange={e => { setDateCheck(e.target.value); setDateMsg(''); }} />
              <button onClick={handleDateCheck} className="btn btn-primary btn-sm">Ask on WhatsApp</button>
            </div>
            {dateMsg && <p className="date-msg" role="alert">{dateMsg}</p>}
            <p className="date-note">We'll confirm on WhatsApp.</p>
          </div>
        </section>

        {/* What we do */}
        <section className="section" aria-label="What we do">
          <div className="container">
            <h2>What we do</h2>
            <div className="two-col">
              <div>
                <h3>Event planning</h3>
                <p>We handle the coordination and setup so you can focus on your guests.</p>
              </div>
              <div>
                <h3>Rentals</h3>
                <p>Chairs, tables, canopies, decor, sound and lighting — available on their own or as part of a full plan.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Rental items */}
        <section className="section section-alt" aria-label="Rental items">
          <div className="container">
            <h2>Rental items</h2>
            <p className="section-note">Sample list. Final items and details from Vimba.</p>
            <ul className="rental-list">
              {RENTAL_ITEMS.map(item => (
                <li key={item.id} className="rental-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.desc}</span>
                  </div>
                  <button
                    className={`btn btn-toggle ${selectedItems.includes(item.id) ? 'active' : ''}`}
                    aria-pressed={selectedItems.includes(item.id)}
                    onClick={() => toggleItem(item.id)}
                  >
                    {selectedItems.includes(item.id) ? '✓ Added' : 'Add to quote'}
                  </button>
                </li>
              ))}
            </ul>
            {selectedItems.length > 0 && (
              <p className="quote-counter">
                <a href="#quote" onClick={e => { e.preventDefault(); scrollToQuote(); }}>
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} in your quote →
                </a>
              </p>
            )}
          </div>
        </section>

        {/* Events we handle */}
        <section className="section" aria-label="Events we handle">
          <div className="container">
            <h2>Events we handle</h2>
            <p className="section-note">Sample list. Final items and details from Vimba.</p>
            <div className="event-tags">
              {['Weddings', 'Engagements', 'Birthdays', 'Corporate events', 'Naming ceremonies'].map(e => (
                <span key={e} className="tag">{e}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Quote builder */}
        <section className="section section-alt" id="quote" aria-label="Get a quote">
          <div className="container">
            <h2>Get a quote in one message</h2>
            <form onSubmit={e => { e.preventDefault(); submitQuote(); }} className="quote-form" noValidate>
              <div className="form-group">
                <label htmlFor="q-name">Your name *</label>
                <input type="text" id="q-name" required value={formName} onChange={e => setFormName(e.target.value)} autoComplete="name" />
              </div>
              <div className="form-group">
                <label htmlFor="q-event">Event type *</label>
                <select id="q-event" required value={formEvent} onChange={e => setFormEvent(e.target.value)}>
                  <option value="">Choose one…</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="q-date">Event date</label>
                  <input type="date" id="q-date" min={getTodayStr()} value={formDate} onChange={e => setFormDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="q-area">Event area or venue</label>
                  <input type="text" id="q-area" value={formArea} onChange={e => setFormArea(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="q-guests">Estimated number of guests</label>
                <input type="number" id="q-guests" min="1" value={formGuests} onChange={e => setFormGuests(e.target.value)} />
              </div>
              <fieldset className="form-group">
                <legend>Items needed</legend>
                <div className="checkbox-grid">
                  {RENTAL_ITEMS.map(item => (
                    <label key={item.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="form-group">
                <label htmlFor="q-notes">Notes</label>
                <textarea id="q-notes" rows={3} value={formNotes} onChange={e => setFormNotes(e.target.value)}></textarea>
              </div>
              {formErrors.length > 0 && (
                <div className="form-errors" role="alert" aria-live="polite">
                  {formErrors.map((err, i) => <p key={i}>{err}</p>)}
                </div>
              )}
              {formSuccess && <p className="form-success" role="status" aria-live="polite">{formSuccess}</p>}
              <button type="submit" className="btn btn-primary btn-lg btn-full">Send on WhatsApp</button>
              <p className="privacy-note">This opens WhatsApp with your message. Nothing is stored on this page.</p>
              <noscript>
                <p><a href={`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent("Hello, I'd like a quote.")}`} target="_blank" rel="noopener">Message us on WhatsApp for a quote</a></p>
              </noscript>
            </form>
          </div>
        </section>

        {/* How it works */}
        <section className="section" aria-label="How it works">
          <div className="container">
            <h2>How it works</h2>
            <ol className="steps">
              <li>
                <span className="step-num">1</span>
                <p>Tell us your date, venue and what you need.</p>
              </li>
              <li>
                <span className="step-num">2</span>
                <p>Get a quote on WhatsApp and agree the plan.</p>
              </li>
              <li>
                <span className="step-num">3</span>
                <p>We set up, so you can enjoy the day.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* Gallery */}
        <section className="section section-alt" aria-label="Gallery">
          <div className="container">
            <h2>Gallery</h2>
            <div className="gallery-strip">
              {[0,1,2,3,4,5].map(i => (
                <button
                  key={i}
                  className="gallery-slot"
                  onClick={(e) => openLightbox(i, e)}
                  aria-label={`View event photo ${i + 1}`}
                >
                  <div className="gallery-placeholder">
                    <span>Photo goes here</span>
                  </div>
                  <span className="gallery-caption">Event photo</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" aria-label="Frequently asked questions">
          <div className="container">
            <h2>Questions</h2>
            <div className="faq-list">
              <details>
                <summary>How early should I contact you?</summary>
                <p>As early as you can. Message your date and we'll confirm what's possible.</p>
              </details>
              <details>
                <summary>Can I rent items without full event planning?</summary>
                <p>Message us the items you need and we'll tell you what's possible.</p>
              </details>
              <details>
                <summary>Do you work outside Aba?</summary>
                <p>Message us your venue and we'll confirm.</p>
              </details>
              <details>
                <summary>How do I get a price?</summary>
                <p>Send your date, venue and what you need on WhatsApp and we'll send a quote.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="section section-alt" aria-label="Contact">
          <div className="container">
            <h2>Contact us</h2>
            <div className="contact-grid">
              <div>
                <p><strong>Address</strong><br/>7 Ohazu St, Umu Mba, Aba 400001, Abia State, Nigeria</p>
                <p><strong>Hours</strong><br/>Open 24 hours, every day</p>
                <p><strong>Phone</strong><br/><a href={`tel:${CONFIG.phoneTel}`}>{CONFIG.phoneDisplay}</a></p>
              </div>
              <div className="contact-actions">
                <a href={buildWhatsAppUrl("Hello, I'd like a quote.")} target="_blank" rel="noopener" className="btn btn-primary">Message on WhatsApp</a>
                <a href={`tel:${CONFIG.phoneTel}`} className="btn btn-secondary">Call us</a>
                <a href="https://www.google.com/maps/search/?api=1&query=Vimba+Global+Rental+and+Event+Planners+7+Ohazu+St+Umu+Mba+Aba" target="_blank" rel="noopener" className="btn btn-outline">Open in Google Maps</a>
                <button onClick={handleShare} className="btn btn-outline">Share this page</button>
                {shareMsg && <p className="share-msg" role="status">{shareMsg}</p>}
                <div className="social-icons">
                  {CONFIG.instagramUrl && (
                    <a href={CONFIG.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                  )}
                  {CONFIG.facebookUrl && (
                    <a href={CONFIG.facebookUrl} target="_blank" rel="noopener" aria-label="Facebook">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <p>© Vimba Global Rental and Event Planners</p>
      </footer>

      {/* Sticky bottom bar (mobile) */}
      <div className="bottom-bar">
        <a href={`tel:${CONFIG.phoneTel}`} className="btn btn-outline btn-bottom">Call</a>
        <a href={buildWhatsAppUrl("Hello, I'd like a quote.")} target="_blank" rel="noopener" className="btn btn-primary btn-bottom">WhatsApp</a>
      </div>

      {/* Lightbox */}
      <dialog
        ref={lightboxRef}
        className="lightbox"
        onClose={closeLightbox}
        onKeyDown={handleLightboxKey}
      >
        <div
          className="lightbox-inner"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button onClick={closeLightbox} className="lightbox-close" aria-label="Close">×</button>
          <button onClick={prevImage} className="lightbox-prev" aria-label="Previous image">‹</button>
          <div className="lightbox-content">
            <div className="lightbox-placeholder">
              <span>Photo of an event set up by Vimba goes here</span>
            </div>
            <p className="lightbox-counter">{lightboxIdx + 1} / 6</p>
          </div>
          <button onClick={nextImage} className="lightbox-next" aria-label="Next image">›</button>
        </div>
      </dialog>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": CONFIG.businessName,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "7 Ohazu St, Umu Mba",
              "addressLocality": "Aba",
              "addressRegion": "Abia State",
              "postalCode": "400001",
              "addressCountry": "NG"
            },
            "telephone": CONFIG.phoneDisplay,
            "openingHoursSpecification": [
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday", "opens": "00:00", "closes": "23:59" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Tuesday", "opens": "00:00", "closes": "23:59" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Wednesday", "opens": "00:00", "closes": "23:59" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday", "opens": "00:00", "closes": "23:59" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "00:00", "closes": "23:59" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "00:00", "closes": "23:59" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "00:00", "closes": "23:59" }
            ]
          })
        }}
      />
    </>
  );
}
