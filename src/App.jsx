import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ArrowUpRight, ExternalLink, Linkedin, Mail, ChevronDown } from "lucide-react";

// ============================================================
// SOHUN SANKA — "THE THESIS"
// Direction: Academic Paper meets Pitch Deck
// One central argument, rigorously supported, visually bold
// ============================================================

const COLORS = {
  ink: "#0C0C0E",
  paper: "#F5F0EB",
  vermillion: "#E8432A",
  slate: "#6B6B6B",
  faint: "#E0DBD4",
  cream: "#FAF8F5",
};

// Intersection Observer hook for scroll-triggered animations
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || "0px" }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);
  return [ref, isInView];
}

// Animated counter
function Counter({ end, suffix = "", prefix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.5 });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Typewriter for the thesis statement
function Typewriter({ text, speed = 35, delay = 500 }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [ref, inView] = useInView({ threshold: 0.3 });
  useEffect(() => {
    if (!inView || started) return;
    setStarted(true);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [inView, started, text, speed, delay]);
  return (
    <span ref={ref}>
      {displayed}
      <span style={{
        display: "inline-block", width: 3, height: "1em",
        backgroundColor: COLORS.vermillion, marginLeft: 2,
        animation: "blink 1s step-end infinite", verticalAlign: "text-bottom"
      }} />
    </span>
  );
}

// Section reveal wrapper
function Reveal({ children, delay = 0, direction = "up", className = "" }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const transforms = {
    up: "translateY(60px)",
    left: "translateX(-60px)",
    right: "translateX(60px)",
    none: "translateY(0px)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate(0,0)" : transforms[direction],
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// NAVIGATION
// ============================================================
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "20px 40px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      backgroundColor: scrolled ? "rgba(245,240,235,0.9)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${COLORS.faint}` : "1px solid transparent",
      transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: 22, fontStyle: "italic",
        color: scrolled ? COLORS.ink : COLORS.paper,
        transition: "color 0.5s ease",
      }}>
        Sohun Sanka
      </div>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["Thesis", "Evidence", "Author"].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, fontWeight: 500, letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: scrolled ? COLORS.slate : "rgba(245,240,235,0.7)",
            textDecoration: "none",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={e => e.target.style.color = COLORS.vermillion}
          onMouseLeave={e => e.target.style.color = scrolled ? COLORS.slate : "rgba(245,240,235,0.7)"}
          >
            {item}
          </a>
        ))}
        <a href="https://meetings.hubspot.com/sohun-sanka/discoverycallwithreacher"
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, fontWeight: 600, letterSpacing: "0.03em",
            color: COLORS.cream,
            backgroundColor: COLORS.vermillion,
            padding: "10px 24px",
            borderRadius: 100,
            textDecoration: "none",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
          }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.boxShadow = "0 4px 20px rgba(232,67,42,0.3)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "none"; }}
        >
          Book a Call
        </a>
      </div>
    </nav>
  );
}

// ============================================================
// HERO — THE COVER PAGE
// ============================================================
function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
  }, []);

  return (
    <section
      onMouseMove={handleMouseMove}
      style={{
        minHeight: "100dvh",
        backgroundColor: COLORS.ink,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 40px 80px",
      }}
    >
      {/* Massive background glyph */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: `translate(calc(-50% + ${mousePos.x}px), calc(-50% + ${mousePos.y}px))`,
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: "min(70vw, 800px)",
        fontStyle: "italic",
        color: "transparent",
        WebkitTextStroke: `1px rgba(232,67,42,0.12)`,
        lineHeight: 0.85,
        userSelect: "none",
        transition: "transform 0.3s ease-out",
        pointerEvents: "none",
      }}>
        §
      </div>

      {/* Subtle grid pattern */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(245,240,235,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245,240,235,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        pointerEvents: "none",
      }} />

      {/* Section number */}
      <Reveal delay={0.1}>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 13,
          color: COLORS.vermillion, letterSpacing: "0.1em",
          marginBottom: 48,
        }}>
          THESIS — 2026
        </div>
      </Reveal>

      {/* Main headline */}
      <div style={{ maxWidth: 1100 }}>
        <Reveal delay={0.2}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(48px, 8vw, 112px)",
            fontWeight: 400,
            lineHeight: 0.95,
            color: COLORS.paper,
            margin: 0,
            letterSpacing: "-0.02em",
          }}>
            The next decade of
          </h1>
        </Reveal>
        <Reveal delay={0.35}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(48px, 8vw, 112px)",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 0.95,
            color: COLORS.vermillion,
            margin: "8px 0 0 0",
            letterSpacing: "-0.02em",
          }}>
            e-commerce
          </h1>
        </Reveal>
        <Reveal delay={0.5}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(48px, 8vw, 112px)",
            fontWeight: 400,
            lineHeight: 0.95,
            color: COLORS.paper,
            margin: "8px 0 0 0",
            letterSpacing: "-0.02em",
          }}>
            belongs to creators.
          </h1>
        </Reveal>
      </div>

      {/* Byline */}
      <Reveal delay={0.7}>
        <div style={{
          marginTop: 48, display: "flex",
          alignItems: "center", gap: 24,
        }}>
          <div style={{
            width: 1, height: 48,
            backgroundColor: "rgba(245,240,235,0.2)",
          }} />
          <div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 500,
              color: "rgba(245,240,235,0.6)",
              margin: 0,
            }}>
              Sohun Sanka — Head of GTM, Reacher (YC W24)
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "rgba(245,240,235,0.35)",
              margin: "4px 0 0 0",
            }}>
              On social commerce, creator distribution, and the systems behind scale.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Scroll indicator */}
      <Reveal delay={1}>
        <div style={{
          position: "absolute", bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          animation: "float 2s ease-in-out infinite",
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: "rgba(245,240,235,0.3)", letterSpacing: "0.15em",
          }}>SCROLL TO READ</span>
          <ChevronDown size={16} color="rgba(245,240,235,0.3)" />
        </div>
      </Reveal>
    </section>
  );
}

// ============================================================
// ABSTRACT — The core argument in one breath
// ============================================================
function Abstract() {
  return (
    <section id="thesis" style={{
      backgroundColor: COLORS.paper,
      padding: "160px 40px",
      position: "relative",
    }}>
      {/* Section marker */}
      <Reveal>
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 64,
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            color: COLORS.vermillion, letterSpacing: "0.12em",
          }}>01</span>
          <div style={{ width: 48, height: 1, backgroundColor: COLORS.vermillion }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: COLORS.slate, letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 500,
          }}>Abstract</span>
        </div>
      </Reveal>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Reveal delay={0.1}>
          <p style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.35,
            color: COLORS.ink,
            fontWeight: 400,
            margin: 0,
          }}>
            Most brands still treat TikTok Shop like a marketing channel.{" "}
            <span style={{ color: COLORS.slate }}>
              Run some ads, send some products to influencers, hope something goes viral.
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <p style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.35,
            color: COLORS.ink,
            fontWeight: 400,
            margin: "40px 0 0 0",
          }}>
            The brands scaling to{" "}
            <span style={{
              color: COLORS.vermillion,
              fontStyle: "italic",
            }}>six and seven figures monthly</span>{" "}
            understand something different: TikTok Shop is a{" "}
            <span style={{
              textDecoration: "underline",
              textDecorationColor: COLORS.vermillion,
              textUnderlineOffset: 6,
              textDecorationThickness: 2,
            }}>
              storefront
            </span>, creators are the{" "}
            <span style={{
              textDecoration: "underline",
              textDecorationColor: COLORS.vermillion,
              textUnderlineOffset: 6,
              textDecorationThickness: 2,
            }}>
              sales force
            </span>, and AI is what makes it{" "}
            <span style={{
              textDecoration: "underline",
              textDecorationColor: COLORS.vermillion,
              textUnderlineOffset: 6,
              textDecorationThickness: 2,
            }}>
              scale
            </span>.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 17, lineHeight: 1.7,
            color: COLORS.slate,
            margin: "48px 0 0 0",
            maxWidth: 680,
          }}>
            This is the thesis I've spent three years testing — across brands I've scaled, 
            tools I've helped build, and thousands of creator partnerships I've managed. 
            Below is the evidence.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// FINDINGS — The metrics that prove the thesis
// ============================================================
function Findings() {
  const findings = [
    { number: 100, suffix: "K+", label: "Monthly recurring revenue generated", detail: "for a health & wellness brand in under 90 days through affiliate optimization and AI automation" },
    { number: 19, suffix: "x", label: "Return on ad spend", detail: "achieved through scaled creator programs — everyday creators with data-driven scripts, not celebrity endorsements" },
    { number: 20, suffix: "M+", label: "GMV processed through Reacher", detail: "the YC-backed platform where I lead GTM — automating creator relationships for the world's largest brands" },
    { number: 1000, suffix: "+", label: "Creator partnerships orchestrated", detail: "proving that volume of authentic voices outperforms a handful of expensive influencers every time" },
  ];

  return (
    <section style={{
      backgroundColor: COLORS.ink,
      padding: "160px 40px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(245,240,235,0.04) 1px, transparent 0)`,
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      <Reveal>
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 80,
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            color: COLORS.vermillion, letterSpacing: "0.12em",
          }}>02</span>
          <div style={{ width: 48, height: 1, backgroundColor: COLORS.vermillion }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: "rgba(245,240,235,0.5)", letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 500,
          }}>Key Findings</span>
        </div>
      </Reveal>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 2,
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {findings.map((f, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <div style={{
              backgroundColor: "rgba(245,240,235,0.03)",
              borderRadius: 20,
              padding: "56px 48px",
              border: "1px solid rgba(245,240,235,0.06)",
              transition: "border-color 0.4s ease, background-color 0.4s ease",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(232,67,42,0.3)";
              e.currentTarget.style.backgroundColor = "rgba(245,240,235,0.05)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(245,240,235,0.06)";
              e.currentTarget.style.backgroundColor = "rgba(245,240,235,0.03)";
            }}
            >
              <div style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "clamp(56px, 6vw, 80px)",
                fontStyle: "italic",
                color: COLORS.vermillion,
                lineHeight: 1,
                marginBottom: 16,
              }}>
                <Counter end={f.number} suffix={f.suffix} prefix={f.number >= 20 ? "$" === f.label[0] ? "$" : "" : ""} />
                {f.suffix === "x" || f.suffix === "K+" || f.suffix === "M+" || f.suffix === "+" ? "" : ""}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16, fontWeight: 600,
                color: COLORS.paper,
                marginBottom: 12,
              }}>
                {f.label}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, lineHeight: 1.6,
                color: "rgba(245,240,235,0.45)",
              }}>
                {f.detail}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// EXHIBITS — Case studies as evidence
// ============================================================
function Exhibit({ number, title, hypothesis, method, result, resultMetrics }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderTop: `1px solid ${COLORS.faint}`,
          padding: "64px 0",
          display: "grid",
          gridTemplateColumns: "120px 1fr 320px",
          gap: 48,
          alignItems: "start",
          cursor: "default",
        }}
      >
        {/* Exhibit number */}
        <div>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: COLORS.slate, letterSpacing: "0.12em",
          }}>EXHIBIT</span>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 64, fontStyle: "italic",
            color: hovered ? COLORS.vermillion : COLORS.faint,
            lineHeight: 1, marginTop: 4,
            transition: "color 0.4s ease",
          }}>
            {number}
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 32, fontWeight: 400,
            color: COLORS.ink,
            margin: "0 0 24px 0",
            lineHeight: 1.2,
          }}>
            {title}
          </h3>
          <div style={{ marginBottom: 20 }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11,
              fontWeight: 600, color: COLORS.vermillion,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>Hypothesis</span>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 15,
              lineHeight: 1.6, color: COLORS.ink, margin: "6px 0 0 0",
              fontStyle: "italic",
            }}>"{hypothesis}"</p>
          </div>
          <div>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11,
              fontWeight: 600, color: COLORS.slate,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>Method</span>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 15,
              lineHeight: 1.6, color: COLORS.slate, margin: "6px 0 0 0",
            }}>{method}</p>
          </div>
        </div>

        {/* Result card */}
        <div style={{
          backgroundColor: hovered ? COLORS.ink : COLORS.cream,
          borderRadius: 16,
          padding: "32px 28px",
          transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: hovered ? COLORS.vermillion : COLORS.slate,
            letterSpacing: "0.12em",
            transition: "color 0.5s ease",
          }}>RESULT</span>
          <div style={{ marginTop: 16 }}>
            {resultMetrics.map((m, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "baseline",
                padding: "10px 0",
                borderBottom: i < resultMetrics.length - 1
                  ? `1px solid ${hovered ? "rgba(245,240,235,0.1)" : COLORS.faint}`
                  : "none",
                transition: "border-color 0.5s ease",
              }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  color: hovered ? "rgba(245,240,235,0.5)" : COLORS.slate,
                  transition: "color 0.5s ease",
                }}>{m.label}</span>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 16,
                  fontWeight: 600,
                  color: hovered ? COLORS.vermillion : COLORS.ink,
                  transition: "color 0.5s ease",
                }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Exhibits() {
  const exhibits = [
    {
      number: "A",
      title: "From $5K to $100K MRR — Rebuilding a Health Brand's Entire Affiliate Engine",
      hypothesis: "If we systematize creator outreach and layer AI automation on the workflow, the affiliate channel will outperform paid media within one quarter.",
      method: "Audited My Magic Healer's existing creator program, identified outreach bottlenecks, rebuilt their targeting and messaging strategy, then automated the pipeline with AI tools to maintain scale without additional headcount.",
      resultMetrics: [
        { label: "Starting MRR", value: "$5K" },
        { label: "Ending MRR", value: "$100K" },
        { label: "Timeline", value: "90 days" },
        { label: "Ad Spend", value: "Minimal" },
      ],
    },
    {
      number: "B",
      title: "19x ROAS — Proving That Everyday Creators Outperform Influencers",
      hypothesis: "A thousand everyday creators with data-driven scripts will generate more revenue than a handful of expensive influencers.",
      method: "Led TikTok Shop growth for a Sports & Outdoor brand. Recruited creators at scale, generated trend-derived content briefs, and optimized commission structures to incentivize high-performing affiliates.",
      resultMetrics: [
        { label: "ROAS", value: "19x" },
        { label: "MRR Growth", value: "6-fig/3mo" },
        { label: "Amazon Lift", value: "10x search" },
        { label: "Creator Model", value: "Volume" },
      ],
    },
    {
      number: "C",
      title: "Reacher — Leading GTM for the Category-Defining Platform",
      hypothesis: "Position on outcomes, not features. Let the product's intelligence sell through the user's results.",
      method: "Joined Reacher (YC W24) to lead go-to-market. Built the growth motion around demonstrable brand outcomes — hours saved, GMV driven, creators activated — rather than feature comparisons.",
      resultMetrics: [
        { label: "GMV Processed", value: "$20M+" },
        { label: "Time Saved", value: "150+ hrs/wk" },
        { label: "Status", value: "TikTok Partner" },
        { label: "Investors", value: "Y Combinator" },
      ],
    },
  ];

  return (
    <section id="evidence" style={{
      backgroundColor: COLORS.paper,
      padding: "160px 40px",
    }}>
      <Reveal>
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 80,
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            color: COLORS.vermillion, letterSpacing: "0.12em",
          }}>03</span>
          <div style={{ width: 48, height: 1, backgroundColor: COLORS.vermillion }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: COLORS.slate, letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 500,
          }}>Exhibits</span>
        </div>
      </Reveal>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {exhibits.map((ex, i) => (
          <Exhibit key={i} {...ex} />
        ))}
      </div>
    </section>
  );
}

// ============================================================
// METHODOLOGY — How he thinks (The Philosophy Section)
// ============================================================
function Methodology() {
  const principles = [
    {
      number: "I",
      title: "Creator marketing is not influencer marketing.",
      body: "Influencer marketing is a media buy. Creator marketing is distributed sales. The first is about reach. The second is about revenue. I build for the second."
    },
    {
      number: "II",
      title: "Don't chase virality. Engineer repeatability.",
      body: "The brands winning on TikTok Shop aren't lucky. They've systematized trend analysis, content briefs, and creator outreach into a repeatable engine that produces results weekly — not once a quarter."
    },
    {
      number: "III",
      title: "AI doesn't replace the strategist. It gives the strategist a thousand hands.",
      body: "I've watched brands try to 'automate' creator marketing by removing the human. It doesn't work. The best results come from human strategy amplified by AI execution — the right message, to the right creator, at the right time, at impossible scale."
    },
  ];

  return (
    <section style={{
      backgroundColor: COLORS.ink,
      padding: "160px 40px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Giant background quotation mark */}
      <div style={{
        position: "absolute",
        top: -80, right: -40,
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: "min(50vw, 600px)",
        color: "rgba(232,67,42,0.05)",
        lineHeight: 1,
        pointerEvents: "none",
        userSelect: "none",
      }}>"</div>

      <Reveal>
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 80,
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            color: COLORS.vermillion, letterSpacing: "0.12em",
          }}>04</span>
          <div style={{ width: 48, height: 1, backgroundColor: COLORS.vermillion }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: "rgba(245,240,235,0.5)", letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 500,
          }}>Methodology</span>
        </div>
      </Reveal>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {principles.map((p, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div style={{
              marginBottom: i < principles.length - 1 ? 80 : 0,
              paddingLeft: 48,
              borderLeft: `2px solid ${COLORS.vermillion}`,
            }}>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12,
                color: COLORS.vermillion, letterSpacing: "0.12em",
              }}>PRINCIPLE {p.number}</span>
              <h3 style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "clamp(24px, 3.5vw, 36px)",
                fontWeight: 400, fontStyle: "italic",
                color: COLORS.paper,
                margin: "16px 0",
                lineHeight: 1.3,
              }}>
                {p.title}
              </h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16, lineHeight: 1.7,
                color: "rgba(245,240,235,0.55)",
                margin: 0,
              }}>
                {p.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// LIVE FEED — Thought leadership as living signal
// ============================================================
function LiveFeed() {
  const items = [
    { date: "APR 2025", type: "PODCAST", title: "TikTok Hacks to Skyrocket Your Amazon & TikTok Sales Overnight", source: "Ecomm Breakthrough", url: "https://ecommbreakthrough.com/tiktok-hacks-to-skyrocket-your-amazon-tiktok-sales-overnight/" },
    { date: "2025", type: "PODCAST", title: "The Evolution of Creator Marketing on TikTok Shop", source: "The Social Commerce Collective", url: "#" },
    { date: "ONGOING", type: "LINKEDIN", title: "Weekly operator insights on TikTok Shop growth, affiliate strategy, and creator economics", source: "500+ network", url: "https://www.linkedin.com/in/sohun-sanka/" },
    { date: "ONGOING", type: "ADVISORY", title: "Strategic workshops & audits for brands and agencies optimizing creator programs", source: "By inquiry", url: "https://meetings.hubspot.com/sohun-sanka/discoverycallwithreacher" },
  ];

  const typeColors = {
    PODCAST: COLORS.vermillion,
    LINKEDIN: "#0A66C2",
    ADVISORY: "#16A34A",
  };

  return (
    <section style={{
      backgroundColor: COLORS.paper,
      padding: "160px 40px",
    }}>
      <Reveal>
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 80,
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            color: COLORS.vermillion, letterSpacing: "0.12em",
          }}>05</span>
          <div style={{ width: 48, height: 1, backgroundColor: COLORS.vermillion }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: COLORS.slate, letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 500,
          }}>Signal Feed</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: "#16A34A",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              color: COLORS.slate,
            }}>ACTIVE</span>
          </div>
        </div>
      </Reveal>

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "grid",
                gridTemplateColumns: "100px auto 1fr auto",
                gap: 24,
                alignItems: "center",
                padding: "24px 16px",
                borderBottom: `1px solid ${COLORS.faint}`,
                textDecoration: "none",
                transition: "background-color 0.3s ease",
                borderRadius: 8,
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.cream}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12,
                color: COLORS.slate,
              }}>{item.date}</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 10,
                fontWeight: 700, letterSpacing: "0.08em",
                color: typeColors[item.type],
                backgroundColor: `${typeColors[item.type]}12`,
                padding: "4px 10px",
                borderRadius: 100,
              }}>{item.type}</span>
              <div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 15,
                  fontWeight: 500, color: COLORS.ink,
                }}>{item.title}</div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  color: COLORS.slate, marginTop: 2,
                }}>{item.source}</div>
              </div>
              <ArrowUpRight size={16} color={COLORS.slate} />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// AUTHOR — Not a bio. A dossier.
// ============================================================
function Author() {
  const timeline = [
    { period: "NOW", role: "Head of GTM", org: "Reacher (YC W24)", color: COLORS.vermillion },
    { period: "2024", role: "Director, Sales & Product Ops", org: "Euka AI", color: COLORS.ink },
    { period: "2023–24", role: "TikTok Shop Lead → Marketing Ops", org: "VENDO", color: COLORS.ink },
    { period: "2022", role: "Performance Media Analyst", org: "Stealth Venture Labs", color: COLORS.ink },
  ];

  return (
    <section id="author" style={{
      backgroundColor: COLORS.cream,
      padding: "160px 40px",
    }}>
      <Reveal>
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 80,
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            color: COLORS.vermillion, letterSpacing: "0.12em",
          }}>06</span>
          <div style={{ width: 48, height: 1, backgroundColor: COLORS.vermillion }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: COLORS.slate, letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 500,
          }}>The Author</span>
        </div>
      </Reveal>

      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
      }}>
        {/* Left — Identity */}
        <div>
          <Reveal>
            <div style={{
              width: 120, height: 120,
              borderRadius: 24,
              backgroundColor: COLORS.ink,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 32,
            }}>
              <span style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 48, fontStyle: "italic",
                color: COLORS.vermillion,
              }}>S</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 40, fontWeight: 400,
              color: COLORS.ink,
              margin: "0 0 8px 0",
            }}>Sohun Sanka</h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16, color: COLORS.slate,
              margin: "0 0 32px 0",
            }}>
              San Francisco Bay Area · Brandeis University, BBA
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16, lineHeight: 1.7,
              color: COLORS.ink,
              margin: 0,
            }}>
              I've spent my career in the trenches of digital commerce — from media buying at agencies 
              to standing up TikTok Shop verticals from scratch to leading GTM at the platform that 
              automates creator marketing for the world's largest brands.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16, lineHeight: 1.7,
              color: COLORS.slate,
              margin: "16px 0 0 0",
            }}>
              I got here by being the person who could look at a brand's affiliate program and 
              identify exactly where the bottleneck was — then build the system to fix it.
            </p>
          </Reveal>
        </div>

        {/* Right — Timeline */}
        <div>
          <Reveal delay={0.1}>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              color: COLORS.slate, letterSpacing: "0.12em",
            }}>CAREER TRAJECTORY</span>
          </Reveal>

          <div style={{ marginTop: 32 }}>
            {timeline.map((t, i) => (
              <Reveal key={i} delay={0.15 + i * 0.08}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  gap: 24,
                  padding: "20px 0",
                  borderBottom: `1px solid ${COLORS.faint}`,
                  alignItems: "start",
                }}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 13,
                    color: t.color, fontWeight: t.period === "NOW" ? 700 : 400,
                  }}>{t.period}</span>
                  <div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 15,
                      fontWeight: 600, color: COLORS.ink,
                    }}>{t.role}</div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                      color: COLORS.slate, marginTop: 2,
                    }}>{t.org}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Specializations */}
          <Reveal delay={0.5}>
            <div style={{ marginTop: 40 }}>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 11,
                color: COLORS.slate, letterSpacing: "0.12em",
              }}>SPECIALIZATIONS</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                {["TikTok Shop Growth", "Creator Marketing", "Affiliate Automation", "AI/GTM Strategy", "Social Commerce", "UGC Systems"].map(tag => (
                  <span key={tag} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                    fontWeight: 500,
                    color: COLORS.ink,
                    backgroundColor: COLORS.paper,
                    padding: "6px 14px",
                    borderRadius: 100,
                    border: `1px solid ${COLORS.faint}`,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CONCLUSION / CTA — The invitation
// ============================================================
function Conclusion() {
  return (
    <section style={{
      backgroundColor: COLORS.ink,
      padding: "200px 40px",
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
    }}>
      {/* Radial glow */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(232,67,42,0.08) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <Reveal>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 12,
          color: COLORS.vermillion, letterSpacing: "0.12em",
        }}>CONCLUSION</span>
      </Reveal>

      <Reveal delay={0.15}>
        <h2 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "clamp(36px, 5vw, 64px)",
          fontWeight: 400,
          color: COLORS.paper,
          margin: "32px auto 0",
          maxWidth: 700,
          lineHeight: 1.15,
        }}>
          If you're serious about <br/>
          <span style={{ fontStyle: "italic", color: COLORS.vermillion }}>
            TikTok Shop,
          </span><br/>
          let's talk systems.
        </h2>
      </Reveal>

      <Reveal delay={0.3}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 17, lineHeight: 1.7,
          color: "rgba(245,240,235,0.5)",
          maxWidth: 500, margin: "32px auto 0",
        }}>
          Whether you're scaling an affiliate program, building a creator strategy 
          from zero, or evaluating the AI tooling layer — I'm always open to a 
          good growth conversation.
        </p>
      </Reveal>

      <Reveal delay={0.45}>
        <div style={{
          display: "flex", gap: 16,
          justifyContent: "center",
          marginTop: 48,
        }}>
          <a
            href="https://meetings.hubspot.com/sohun-sanka/discoverycallwithreacher"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 600,
              color: COLORS.ink,
              backgroundColor: COLORS.vermillion,
              padding: "16px 36px",
              borderRadius: 100,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={e => {
              e.target.style.transform = "scale(1.03)";
              e.target.style.boxShadow = "0 8px 32px rgba(232,67,42,0.35)";
            }}
            onMouseLeave={e => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            Book a Discovery Call <ArrowRight size={16} />
          </a>
          <a
            href="https://www.linkedin.com/in/sohun-sanka/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 500,
              color: COLORS.paper,
              backgroundColor: "transparent",
              padding: "16px 36px",
              borderRadius: 100,
              textDecoration: "none",
              border: "1px solid rgba(245,240,235,0.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "border-color 0.3s ease, background-color 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(245,240,235,0.5)";
              e.currentTarget.style.backgroundColor = "rgba(245,240,235,0.05)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(245,240,235,0.2)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Linkedin size={16} /> LinkedIn
          </a>
        </div>
      </Reveal>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer style={{
      backgroundColor: COLORS.ink,
      borderTop: "1px solid rgba(245,240,235,0.08)",
      padding: "40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: 12,
        color: "rgba(245,240,235,0.25)",
      }}>
        © 2026 Sohun Sanka
      </span>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          backgroundColor: "#16A34A",
          animation: "pulse 2s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          color: "rgba(245,240,235,0.35)",
        }}>SYSTEM OPERATIONAL</span>
      </div>
    </footer>
  );
}

// ============================================================
// GLOBAL STYLES
// ============================================================
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      html { scroll-behavior: smooth; }
      
      body {
        background-color: ${COLORS.paper};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      ::selection {
        background-color: ${COLORS.vermillion};
        color: ${COLORS.paper};
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.5); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(8px); }
      }

      /* Noise overlay */
      body::after {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.025;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      }

      /* Responsive */
      @media (max-width: 900px) {
        section { padding-left: 24px !important; padding-right: 24px !important; }
        nav { padding: 16px 24px !important; }
      }
      
      @media (max-width: 768px) {
        nav > div:last-child > a:not(:last-child) { display: none; }
      }
    `}</style>
  );
}

// ============================================================
// APP
// ============================================================
export default function SohunSankaThesis() {
  return (
    <>
      <GlobalStyles />
      <Nav />
      <Hero />
      <Abstract />
      <Findings />
      <Exhibits />
      <Methodology />
      <LiveFeed />
      <Author />
      <Conclusion />
      <Footer />
    </>
  );
}
