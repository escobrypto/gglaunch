import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Zap, Shield, ArrowUpRight, Plus, Wallet, Check, X, Search, Activity, Layers, ChevronRight, Copy, ExternalLink, AlertCircle, ArrowRight, AlertTriangle } from 'lucide-react';

// ============================================================================
// SEED DATA
// ============================================================================

// Hand-curated headline tokens (graduated, the demos point at these)
const HERO_TOKENS = [
  { id: 'wif2', symbol: 'WIF2', name: 'dogwifhat 2.0', creator: '7xK4...3mQ', mcap: 8420000, price: 0.00842, change24h: 142.3, volume24h: 2840000, holders: 8421, graduated: true, lpLocked: 412, feesAccrued: 18420, sealedAt: '2 days ago', progress: 100, image: '🐕', desc: 'The chad has returned. Permanent liquidity, zero rug risk.' },
  { id: 'pepe3', symbol: 'PEPE3', name: 'PEPE Reborn', creator: 'B9k4...zQp', mcap: 4210000, price: 0.0042, change24h: 87.4, volume24h: 1240000, holders: 4892, graduated: true, lpLocked: 218, feesAccrued: 9120, sealedAt: '5 hours ago', progress: 100, image: '🐸', desc: 'Frog season is back.' },
  { id: 'gigachad', symbol: 'CHAD', name: 'GigaChad', creator: '4Hp2...7Lm', mcap: 1840000, price: 0.00184, change24h: 43.2, volume24h: 821000, holders: 2104, graduated: true, lpLocked: 92, feesAccrued: 3240, sealedAt: '1 day ago', progress: 100, image: '💪', desc: 'For the absolute units.' },
];

// Procedural token generator — names + emojis pulled from a real memecoin lexicon
const NAME_PARTS = {
  prefix: ['Mega', 'Giga', 'Ultra', 'Hyper', 'Turbo', 'Chad', 'Based', 'Sigma', 'Alpha', 'Wojak', 'Anon', 'Degen', 'Floki', 'Bonk', 'Bork', 'Pepe', 'Doge', 'Shib', 'Cat', 'Frog', 'Moon', 'Sun', 'Rocket', 'Diamond', 'Gold', 'Holy', 'Sacred', 'Cosmic', 'Quantum'],
  noun: ['Coin', 'Inu', 'Cat', 'Frog', 'Doge', 'Pump', 'Bag', 'King', 'Lord', 'God', 'Wizard', 'Apex', 'Bro', 'Anon', 'Vault', 'Chad', 'Banana', 'Mango', 'Grape', 'Cult', 'Tribe', 'Squad', 'Gang', 'Family'],
  number: ['', '', '', '2', '3', '69', '420', '42', '7', 'X', 'Pro', 'Plus', 'Max'],
};
const TICKERS = ['MOG','TURBO','WAGMI','BONK','POPCAT','MEW','BOME','MYRO','SLERF','WEN','GIGA','HARRY','ANALOS','BANANA','MAGA','GME','RETARDIO','NPC','PNUT','GOAT','LUCE','SPX','FARTCOIN','MOODENG','KEKIUS','GRIFFAIN','AI16Z','VIRTUAL','TAI','ARC','BUTTHOLE','MEMES','RFK','TRUMP','VINE','TIBBIR','UFD','SWARMS','ZEREBRO','COOKIE','DOLAN','FWOG','GOAT2','HEGE','HOSICO','HOUSE','JEO','LIBRA','LOWQ','MICHI','MOTHER','NUB','PCHAIN','PNUT2','PONKE','PUPPETS','ROCKY','SAGE','SAMO','SANIC','SCAM','SHILL','SIGMA2','SLOTH','SNEK','SOLID','SOMA','SUSHI','TAIKI','TANK','TINY','TOOLS','TYBG','VINE2','WAFFLES','WALL','WATER','WEED','WORM','XYZ','YOLO','ZOOMER'];
const EMOJI_POOL = ['🐕','🐸','🦍','🐱','🌙','🔥','💎','🚀','🗿','⚡','👑','🦁','🐺','🦄','🐢','🐰','🦊','🐯','🦅','🐉','🌈','💫','⭐','🎯','💪','🍌','🥭','🍇','🍑','🌶️','🦴','🤡','👹','👺','💀','👽','🤖','🎲','🎰','💰','🪙','📈','🎪','🌊','🍕','🍔','🍩','☄️','🌋','🏔️','🦴','🧠','🦷','👁️','✨','🪞','🔮'];
const DESCRIPTIONS = ['Built by anons, for anons.', 'No team. No allocation. No rug.', 'Ship it.', 'For the people.', 'The future is here.', 'Number go up.', 'Decentralized memetics.', 'Powered by vibes.', 'Forever, on-chain.', 'This one stays.', 'For the absolute units.', 'Wagmi.', 'It is what it is.', 'Truly unstoppable.', 'Liquidity that stays.', 'No more rugs.', 'Beyond the curve.', 'Holy grail of memes.', 'In math we trust.'];

function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function generateTokens(count) {
  const tokens = [...HERO_TOKENS];
  const usedTickers = new Set(HERO_TOKENS.map(t => t.symbol));
  const r = rng(42);
  
  for (let i = 0; i < count; i++) {
    let symbol;
    if (r() > 0.5 && i < TICKERS.length) {
      symbol = TICKERS[Math.floor(r() * TICKERS.length)];
    } else {
      const p = NAME_PARTS.prefix[Math.floor(r() * NAME_PARTS.prefix.length)];
      const n = NAME_PARTS.noun[Math.floor(r() * NAME_PARTS.noun.length)];
      symbol = (p.slice(0, 4) + n.slice(0, 4)).toUpperCase();
    }
    if (usedTickers.has(symbol)) symbol += Math.floor(r() * 99);
    usedTickers.add(symbol);
    
    // Long-tail mcap distribution: most tokens are small (on curve), a few are big (graduated)
    const tier = r();
    let mcap, graduated, progress, lpLocked, feesAccrued;
    if (tier > 0.85) {
      // graduated, mid-cap
      graduated = true;
      mcap = 100000 + r() * 2000000;
      progress = 100;
      lpLocked = mcap / 18000;
      feesAccrued = lpLocked * (50 + r() * 200);
    } else if (tier > 0.5) {
      // active on curve, decent progress
      graduated = false;
      progress = Math.floor(15 + r() * 75);
      mcap = (progress / 100) * 69000 + r() * 5000;
      lpLocked = 0;
      feesAccrued = 0;
    } else {
      // baby curve, just launched
      graduated = false;
      progress = Math.floor(1 + r() * 25);
      mcap = (progress / 100) * 69000 + r() * 800;
      lpLocked = 0;
      feesAccrued = 0;
    }
    
    const price = mcap / 1_000_000_000;
    const change24h = graduated ? -50 + r() * 200 : -30 + r() * 400;
    const volume24h = mcap * (0.05 + r() * 0.6);
    const holders = Math.floor(graduated ? 100 + r() * 8000 : 5 + r() * 800);
    
    const sealedHours = graduated ? Math.floor(r() * 168) : null;
    const sealedAt = sealedHours === null ? null :
      sealedHours < 1 ? 'just now' :
      sealedHours < 24 ? `${sealedHours}h ago` :
      `${Math.floor(sealedHours / 24)}d ago`;
    
    const launchedMin = Math.floor(r() * (graduated ? 10080 : 1440));
    const launched = launchedMin < 60 ? `${launchedMin}m ago` :
      launchedMin < 1440 ? `${Math.floor(launchedMin / 60)}h ago` :
      `${Math.floor(launchedMin / 1440)}d ago`;
    
    const namePrefix = NAME_PARTS.prefix[Math.floor(r() * NAME_PARTS.prefix.length)];
    const nameNoun = NAME_PARTS.noun[Math.floor(r() * NAME_PARTS.noun.length)];
    const nameNum = NAME_PARTS.number[Math.floor(r() * NAME_PARTS.number.length)];
    const name = `${namePrefix} ${nameNoun}${nameNum ? ' ' + nameNum : ''}`;
    
    const creator = (Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6) + 'qx').slice(0, 4) + '...' + (Math.random().toString(36).slice(2, 6)).slice(0, 3);
    
    tokens.push({
      id: symbol.toLowerCase() + '_' + i,
      symbol,
      name,
      creator,
      mcap,
      price,
      change24h,
      volume24h,
      holders,
      graduated,
      lpLocked,
      feesAccrued,
      sealedAt,
      launched,
      progress,
      image: EMOJI_POOL[Math.floor(r() * EMOJI_POOL.length)],
      desc: DESCRIPTIONS[Math.floor(r() * DESCRIPTIONS.length)],
    });
  }
  return tokens;
}

const SEED_TOKENS = generateTokens(82);

// ============================================================================
// HELPERS
// ============================================================================

const fmt = (n, dec = 2) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(dec) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(dec) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(dec) + 'K';
  if (Math.abs(n) < 0.01 && n !== 0) return n.toFixed(6);
  return n.toFixed(dec);
};
const fmtPrice = (n) => {
  if (n < 0.0001) return n.toFixed(8);
  if (n < 0.01) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2);
};
const genSeries = (seed, points = 60, base = 1, vol = 0.05, trend = 0.001) => {
  const arr = []; let v = base; let s = seed;
  for (let i = 0; i < points; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = (s / 233280) - 0.5;
    v = Math.max(v * (1 + r * vol + trend), 0.0000001);
    arr.push({ t: i, v });
  }
  return arr;
};

// ============================================================================
// VAULT PRIMITIVE — the signature visual element
// ============================================================================

// Hexagonal vault container, multiple sizes & states
function Vault({ size = 64, state = 'sealed', fillPct = 100, glow = true, animate = true, label = null, scanline = false, breathe = false, flash = false }) {
  const id = useMemo(() => 'v' + Math.random().toString(36).slice(2, 8), []);
  const w = size, h = size * 1.08;
  const cx = w / 2, cy = h / 2;
  const r = size * 0.46;
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const ptStr = pts.map(p => p.join(',')).join(' ');
  const innerPtStr = pts.map(p => [cx + (p[0]-cx)*0.82, cy + (p[1]-cy)*0.82].join(',')).join(' ');
  const color = state === 'sealed' ? '#6ba3ff' : state === 'sealing' ? '#9f7aea' : '#fbbf24';
  
  // Wave animation phase
  const [wavePhase, setWavePhase] = useState(0);
  const [breathePulse, setBreathePulse] = useState(0);
  
  useEffect(() => {
    if (!animate) return;
    let raf;
    let start = performance.now();
    const tick = (now) => {
      const t = (now - start) / 1000;
      setWavePhase(t);
      if (breathe) setBreathePulse(Math.sin(t * 1.2) * 1.5);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, breathe]);
  
  const effFill = Math.max(0, Math.min(100, fillPct + breathePulse));
  const fillTop = h - (h * 0.7) * (effFill / 100);
  
  // Build wavy fill path
  const waveAmp = size * 0.012;
  const waveSegments = 12;
  let wavePath = `M 0 ${h} L 0 ${fillTop}`;
  for (let i = 0; i <= waveSegments; i++) {
    const x = (w / waveSegments) * i;
    const y = fillTop + Math.sin(wavePhase * 2 + (i / waveSegments) * Math.PI * 3) * waveAmp;
    wavePath += ` L ${x} ${y}`;
  }
  wavePath += ` L ${w} ${h} Z`;
  
  // Surface highlight line (slightly above the wave)
  let surfacePath = '';
  for (let i = 0; i <= waveSegments; i++) {
    const x = (w / waveSegments) * i;
    const y = fillTop + Math.sin(wavePhase * 2 + (i / waveSegments) * Math.PI * 3) * waveAmp;
    surfacePath += (i === 0 ? 'M ' : ' L ') + `${x} ${y}`;
  }
  
  // Scan line position (sweeps top to bottom of vault interior)
  const scanY = scanline ? (cy - r * 0.7) + ((wavePhase * 80) % (r * 1.4)) : 0;
  
  return (
    <div style={{ position: 'relative', width: w, height: h, display: 'inline-block' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`vf-${id}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={`vs-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={`vsc-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <clipPath id={`vc-${id}`}>
            <polygon points={ptStr} />
          </clipPath>
        </defs>
        
        {/* outer glow */}
        {glow && (
          <polygon points={ptStr} fill="none" stroke={color} strokeWidth={size * 0.025} opacity={flash ? 0.7 : 0.25} filter={`blur(${size * 0.06}px)`} style={{ transition: 'opacity 400ms' }} />
        )}
        
        {/* sealing flash ring (expands outward) */}
        {flash && (
          <polygon points={ptStr} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'vaultFlash 800ms ease-out' }} />
        )}
        
        {/* liquid fill */}
        <g clipPath={`url(#vc-${id})`}>
          <path d={wavePath} fill={`url(#vf-${id})`} />
          {/* surface highlight */}
          <path d={surfacePath} fill="none" stroke={color} strokeWidth="0.8" opacity="0.7" />
          {/* scan line inside vault */}
          {scanline && (
            <line x1={cx - r * 0.85} y1={scanY} x2={cx + r * 0.85} y2={scanY} stroke={color} strokeWidth="0.5" opacity="0.4" />
          )}
        </g>
        
        {/* hex outlines */}
        <polygon points={ptStr} fill="none" stroke={`url(#vs-${id})`} strokeWidth={size * 0.015} />
        <polygon points={innerPtStr} fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
        
        {/* center indicator */}
        {state === 'sealed' && (
          <>
            <circle cx={cx} cy={cy} r={size * 0.045} fill={color} style={{ '--core-r': `${size * 0.045}px`, animation: animate ? 'vaultCore 2.4s ease-in-out infinite' : 'none' }} />
            <circle cx={cx} cy={cy} r={size * 0.09} fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />
            <circle cx={cx} cy={cy} r={size * 0.14} fill="none" stroke={color} strokeWidth="0.4" opacity="0.25" />
          </>
        )}
        {state === 'open' && (
          <>
            <line x1={cx - size*0.15} y1={cy} x2={cx + size*0.15} y2={cy} stroke={color} strokeWidth="1" opacity="0.6" />
            <line x1={cx - size*0.08} y1={cy + size*0.04} x2={cx + size*0.08} y2={cy + size*0.04} stroke={color} strokeWidth="0.5" opacity="0.3" />
          </>
        )}
        {state === 'sealing' && (
          <>
            <circle cx={cx} cy={cy} r={size * 0.06} fill={color} style={{ '--seal-r': `${size * 0.06}px`, animation: 'vaultSealing 600ms ease-in-out infinite alternate' }} />
            <line x1={cx - size*0.1} y1={cy} x2={cx + size*0.1} y2={cy} stroke={color} strokeWidth="1.5" opacity="0.8" />
          </>
        )}
        
        {/* corner notches */}
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={size * 0.012} fill={color} opacity="0.85" />
        ))}
      </svg>
      {label && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: size * 0.18, color: 'var(--fg)', fontWeight: 600 }}>{label}</div>}
    </div>
  );
}

// Logo wordmark with vault icon
function Logo({ size = 26 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Vault size={size} state="sealed" fillPct={80} animate={false} />
      <span style={{ fontSize: size * 0.62, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--fg)' }}>GGLaunch</span>
    </span>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function GGLaunch() {
  const [page, setPage] = useState('home');
  const [selectedToken, setSelectedToken] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddr] = useState('GG1aunch7xK...3mQ');
  const [solBalance, setSolBalance] = useState(42.18);
  const [tokens, setTokens] = useState(SEED_TOKENS);
  const [stakedPositions, setStakedPositions] = useState([
    { tokenId: 'wif2', gLPAmount: 1240, baseValue: 4.2, currentValue: 6.84, apr: 142.3, fees24h: 0.084 },
    { tokenId: 'pepe3', gLPAmount: 412, baseValue: 1.8, currentValue: 2.41, apr: 87.4, fees24h: 0.021 },
  ]);
  const [holdings, setHoldings] = useState({ moon42: 184000, cope: 92000 });
  const [tvl, setTvl] = useState(34_842_193);
  const [feesGenerated, setFeesGenerated] = useState(842_193);
  const [toast, setToast] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTvl(v => v + Math.random() * 1200);
      setFeesGenerated(v => v + Math.random() * 18);
      setTokens(ts => ts.map(t => ({
        ...t,
        price: t.price * (1 + (Math.random() - 0.48) * 0.008),
        change24h: t.change24h + (Math.random() - 0.5) * 0.4,
      })));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Global mouse tracker — updates CSS vars on .gg-btn-primary and .gg-magnetic elements
  useEffect(() => {
    const handler = (e) => {
      // walk up from target to find candidates
      let el = e.target;
      while (el && el !== document.body) {
        if (el.classList && (el.classList.contains('gg-btn-primary') || el.classList.contains('gg-magnetic'))) {
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          el.style.setProperty('--mx', `${x}%`);
          el.style.setProperty('--my', `${y}%`);
        }
        el = el.parentElement;
      }
    };
    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, []);

  // ⌘K to open command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    const openHandler = () => setPaletteOpen(true);
    document.addEventListener('keydown', handler);
    window.addEventListener('gg-open-palette', openHandler);
    return () => {
      document.removeEventListener('keydown', handler);
      window.removeEventListener('gg-open-palette', openHandler);
    };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const connectWallet = () => { setWalletConnected(true); showToast('Wallet connected · Phantom'); };

  const navigate = (p, tokenId = null) => {
    setPage(p);
    setPaletteOpen(false);
    if (tokenId) setSelectedToken(tokens.find(t => t.id === tokenId));
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--fg)', fontFamily: 'var(--sans)' }}>
      <Styles />
      <Nav page={page} navigate={navigate} walletConnected={walletConnected} connectWallet={connectWallet} walletAddr={walletAddr} solBalance={solBalance} />
      
      <main key={page} style={{ paddingTop: 64 }} className="gg-page-enter">
        {page === 'home' && <HomePage navigate={navigate} tokens={tokens} tvl={tvl} feesGenerated={feesGenerated} />}
        {page === 'discover' && <DiscoverPage navigate={navigate} tokens={tokens} />}
        {page === 'token' && selectedToken && <TokenPage token={selectedToken} navigate={navigate} walletConnected={walletConnected} connectWallet={connectWallet} solBalance={solBalance} setSolBalance={setSolBalance} holdings={holdings} setHoldings={setHoldings} setStakedPositions={setStakedPositions} stakedPositions={stakedPositions} showToast={showToast} />}
        {page === 'stake' && <StakePage navigate={navigate} positions={stakedPositions} tokens={tokens} walletConnected={walletConnected} connectWallet={connectWallet} showToast={showToast} setStakedPositions={setStakedPositions} setSolBalance={setSolBalance} />}
        {page === 'launch' && <LaunchPage navigate={navigate} walletConnected={walletConnected} connectWallet={connectWallet} setTokens={setTokens} showToast={showToast} setSolBalance={setSolBalance} solBalance={solBalance} />}
        {page === 'docs' && <DocsPage />}
      </main>

      <Footer navigate={navigate} />
      
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {paletteOpen && <CommandPalette tokens={tokens} navigate={navigate} onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

function Styles() {
  return (
    <style>{`
      @import url('https://api.fontshare.com/v2/css?f[]=general-sans@300,400,500,600&f[]=instrument-serif@400,400i&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
      
      :root {
        --bg: #06080f;
        --bg-1: #0b0f1c;
        --bg-2: #11172a;
        --bg-3: #1a2138;
        --fg: #e8edf7;
        --fg-dim: #7a8aac;
        --fg-mute: #45506b;
        --line: #161d33;
        --line-2: #202840;
        --acid: #6ba3ff;
        --acid-d: #4778d4;
        --acid-l: #94beff;
        --purple: #9f7aea;
        --purple-d: #7950d4;
        --purple-l: #b794f4;
        --steel: #5a8dd6;
        --steel-d: #3d6cb0;
        --red: #ff6b8a;
        --green: #4ade80;
        --amber: #fbbf24;
        --mono: 'JetBrains Mono', ui-monospace, monospace;
        --serif: 'Instrument Serif', 'Times New Roman', serif;
        --sans: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        
        /* Layered shadows for depth */
        --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
        --shadow-md: 0 4px 12px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.4);
        --shadow-lg: 0 12px 32px -8px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4);
        --shadow-glow: 0 0 0 1px rgba(107,163,255,0.2), 0 8px 32px -8px rgba(107,163,255,0.4);
        
        /* Surface hairlines - top brighter (light from above), bottom darker */
        --hairline-top: inset 0 1px 0 rgba(255,255,255,0.04);
        --hairline-bottom: inset 0 -1px 0 rgba(0,0,0,0.4);
        --hairline-both: inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4);
      }
      * { box-sizing: border-box; }
      *:focus { outline: none; }
      *:focus-visible { 
        outline: 2px solid rgba(107,163,255,0.5); 
        outline-offset: 2px;
      }
      body { 
        margin: 0; 
        font-family: var(--sans); 
        -webkit-font-smoothing: antialiased; 
        -moz-osx-font-smoothing: grayscale;
        background: var(--bg);
      }
      ::selection { background: var(--acid); color: #000; }
      
      /* Atmospheric background - fixed, sits behind everything */
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        background: 
          radial-gradient(ellipse 1200px 800px at 80% 0%, rgba(107,163,255,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 1000px 600px at 0% 80%, rgba(159,122,234,0.05) 0%, transparent 60%),
          radial-gradient(ellipse 800px 600px at 50% 100%, rgba(61,108,176,0.04) 0%, transparent 60%);
        pointer-events: none;
        z-index: 0;
      }
      /* Subtle noise texture */
      body::after {
        content: '';
        position: fixed;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        opacity: 0.025;
        pointer-events: none;
        z-index: 0;
        mix-blend-mode: overlay;
      }
      main, nav, footer { position: relative; z-index: 1; }
      
      .gg-grid {
        background-image:
          linear-gradient(var(--line) 1px, transparent 1px),
          linear-gradient(90deg, var(--line) 1px, transparent 1px);
        background-size: 64px 64px;
      }
      
      /* BUTTONS — looksmaxxed */
      .gg-btn {
        position: relative;
        display: inline-flex; align-items: center; gap: 8px;
        padding: 11px 20px;
        font-family: var(--sans);
        font-size: 13px;
        font-weight: 500;
        letter-spacing: -0.005em;
        border: 1px solid var(--line-2);
        background: linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%);
        color: var(--fg);
        cursor: pointer;
        transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
        border-radius: 0;
        box-shadow: var(--hairline-top), var(--shadow-sm);
        overflow: hidden;
      }
      .gg-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 50%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 200ms;
      }
      .gg-btn:hover { 
        border-color: var(--fg-dim); 
        background: linear-gradient(180deg, var(--bg-3) 0%, var(--bg-2) 100%);
        transform: translateY(-1px);
        box-shadow: var(--hairline-top), var(--shadow-md);
      }
      .gg-btn:hover::before { opacity: 1; }
      .gg-btn:active { 
        transform: translateY(0); 
        box-shadow: var(--hairline-top), var(--shadow-sm), inset 0 1px 4px rgba(0,0,0,0.3); 
      }
      
      .gg-btn-primary {
        background: linear-gradient(180deg, var(--acid-l) 0%, var(--acid) 50%, var(--acid-d) 100%);
        color: #050810;
        border: 1px solid var(--acid);
        font-weight: 600;
        box-shadow: 
          inset 0 1px 0 rgba(255,255,255,0.3),
          inset 0 -1px 0 rgba(0,0,0,0.15),
          0 1px 2px rgba(0,0,0,0.3),
          0 0 0 1px rgba(107,163,255,0.15),
          0 4px 16px -4px rgba(107,163,255,0.4);
        position: relative;
      }
      .gg-btn-primary::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(120px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.35) 0%, transparent 60%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 240ms;
      }
      .gg-btn-primary:hover::after { opacity: 1; }
      .gg-btn-primary:hover { 
        background: linear-gradient(180deg, #c9deff 0%, var(--acid-l) 50%, var(--acid) 100%);
        border-color: var(--acid-l);
        transform: translateY(-1px);
        box-shadow: 
          inset 0 1px 0 rgba(255,255,255,0.4),
          inset 0 -1px 0 rgba(0,0,0,0.15),
          0 1px 2px rgba(0,0,0,0.3),
          0 0 0 1px rgba(107,163,255,0.3),
          0 8px 24px -4px rgba(107,163,255,0.5);
      }
      .gg-btn-primary:active {
        transform: translateY(0);
        box-shadow: 
          inset 0 1px 0 rgba(255,255,255,0.2),
          inset 0 2px 6px rgba(0,0,0,0.2),
          0 0 0 1px rgba(107,163,255,0.2);
      }
      
      /* Magnetic card hover */
      .gg-magnetic {
        transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 200ms;
        transform-style: preserve-3d;
        will-change: transform;
      }
      .gg-magnetic::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(107,163,255,0.06) 0%, transparent 50%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 320ms;
        z-index: 1;
      }
      .gg-magnetic:hover::after { opacity: 1; }
      
      .gg-btn-danger { 
        border: 1px solid var(--red); 
        color: var(--red); 
        background: linear-gradient(180deg, rgba(255,107,138,0.05) 0%, transparent 100%);
      }
      .gg-btn-danger:hover { 
        background: linear-gradient(180deg, var(--red) 0%, #d4506e 100%); 
        color: #fff; 
        border-color: var(--red);
        box-shadow: 0 4px 16px -4px rgba(255,107,138,0.4);
      }
      
      /* CARDS — premium surface */
      .gg-card { 
        background: linear-gradient(180deg, var(--bg-1) 0%, rgba(11,15,28,0.7) 100%);
        border: 1px solid var(--line-2);
        position: relative;
        box-shadow: var(--hairline-top), var(--hairline-bottom), var(--shadow-md);
      }
      .gg-card-elevated {
        background: linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%);
        border: 1px solid var(--line-2);
        position: relative;
        box-shadow: var(--hairline-top), var(--hairline-bottom), var(--shadow-lg);
      }
      
      /* Glass surface */
      .gg-glass {
        background: rgba(11,15,28,0.6);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.06);
        box-shadow: var(--hairline-top), var(--shadow-lg);
      }
      
      .gg-tag {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 8px;
        font-family: var(--sans);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.02em;
        border: 1px solid currentColor;
        background: rgba(0,0,0,0.2);
      }
      
      .gg-input {
        background: var(--bg);
        border: 1px solid var(--line-2);
        color: var(--fg);
        padding: 12px 14px;
        font-family: var(--sans);
        font-size: 14px;
        width: 100%;
        outline: none;
        transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
      }
      .gg-input:focus { 
        border-color: var(--acid); 
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 0 0 3px rgba(107,163,255,0.15);
      }
      
      /* Token thumbnail container */
      .gg-token-thumb {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--bg-2) 0%, var(--bg-1) 100%);
        border: 1px solid var(--line-2);
        box-shadow: var(--hairline-top), inset 0 0 20px rgba(0,0,0,0.4);
        overflow: hidden;
      }
      .gg-token-thumb::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.04) 0%, transparent 50%);
        pointer-events: none;
      }
      
      /* LED status dot */
      .gg-led {
        display: inline-block;
        width: 6px; height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px currentColor, 0 0 12px currentColor;
      }
      
      /* Keyboard key */
      .gg-kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        font-family: var(--mono);
        font-size: 10px;
        font-weight: 500;
        background: linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%);
        border: 1px solid var(--line-2);
        border-bottom-width: 2px;
        color: var(--fg-dim);
        border-radius: 3px;
      }
      
      .gg-pulse { animation: pulse 1.6s ease-in-out infinite; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      
      .gg-fade-in { animation: fadeIn 600ms ease both; }
      @keyframes fadeIn { from {opacity:0; transform:translateY(8px)} to {opacity:1; transform:translateY(0)} }
      
      .gg-rise { animation: rise 1200ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
      @keyframes rise { from {opacity:0; transform:translateY(24px)} to {opacity:1; transform:translateY(0)} }
      
      /* Page enter */
      .gg-page-enter { animation: pageEnter 400ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
      @keyframes pageEnter {
        from { opacity: 0; transform: translateY(12px); filter: blur(6px); }
        to { opacity: 1; transform: translateY(0); filter: blur(0); }
      }
      
      .gg-stagger > * {
        animation: rise 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
      }
      .gg-stagger > *:nth-child(1) { animation-delay: 0ms; }
      .gg-stagger > *:nth-child(2) { animation-delay: 80ms; }
      .gg-stagger > *:nth-child(3) { animation-delay: 160ms; }
      .gg-stagger > *:nth-child(4) { animation-delay: 240ms; }
      .gg-stagger > *:nth-child(5) { animation-delay: 320ms; }
      .gg-stagger > *:nth-child(6) { animation-delay: 400ms; }
      
      @keyframes vaultFlash {
        0% { transform: scale(1); opacity: 0.9; stroke-width: 2; }
        100% { transform: scale(1.6); opacity: 0; stroke-width: 0.5; }
      }
      @keyframes vaultCore {
        0%, 100% { opacity: 1; r: var(--core-r, 4px); }
        50% { opacity: 0.5; r: calc(var(--core-r, 4px) * 1.4); }
      }
      @keyframes vaultSealing {
        0% { opacity: 0.6; r: var(--seal-r, 4px); }
        100% { opacity: 1; r: calc(var(--seal-r, 4px) * 1.4); }
      }
      
      .gg-rotate-slow { animation: rotate 80s linear infinite; transform-origin: center; }
      @keyframes rotate { from {transform: rotate(0deg)} to {transform: rotate(360deg)} }
      
      .gg-rotate-rev { animation: rotateRev 120s linear infinite; transform-origin: center; }
      @keyframes rotateRev { from {transform: rotate(360deg)} to {transform: rotate(0deg)} }
      
      .gg-particle-fall {
        position: absolute;
        width: 4px; height: 4px;
        border-radius: 50%;
        animation: particleFall 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes particleFall {
        0% { transform: translateY(-200px) scale(0.6); opacity: 0; }
        15% { opacity: 1; }
        85% { opacity: 1; transform: translateY(160px) scale(1); }
        100% { transform: translateY(180px) scale(0); opacity: 0; }
      }
      
      .gg-particle-rise {
        position: absolute;
        width: 3px; height: 3px;
        border-radius: 50%;
        animation: particleRise 3.6s linear infinite;
      }
      @keyframes particleRise {
        0% { transform: translateY(60px) scale(0.5); opacity: 0; }
        15% { opacity: 1; }
        70% { opacity: 1; transform: translateY(-100px) scale(0.9); }
        100% { transform: translateY(-160px) scale(0); opacity: 0; }
      }
      
      .gg-particle-orbit {
        position: absolute;
        width: 4px; height: 4px;
        border-radius: 50%;
        animation: orbit 6s linear infinite;
        transform-origin: 0 0;
      }
      @keyframes orbit {
        from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
        to { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
      }
      .gg-particle-orbit-sm {
        position: absolute;
        width: 4px; height: 4px;
        border-radius: 50%;
        animation: orbitSm 5s linear infinite;
        transform-origin: 0 0;
      }
      @keyframes orbitSm {
        from { transform: rotate(0deg) translateX(85px) rotate(0deg); }
        to { transform: rotate(360deg) translateX(85px) rotate(-360deg); }
      }
      
      .gg-shockwave {
        position: absolute;
        border-radius: 50%;
        border: 1px solid currentColor;
        animation: shockwave 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
      }
      @keyframes shockwave {
        0% { transform: scale(0.5); opacity: 0.8; border-width: 2px; }
        100% { transform: scale(2.4); opacity: 0; border-width: 0.5px; }
      }
      
      .gg-glitch-once {
        animation: glitchOnce 600ms steps(2) 1;
      }
      @keyframes glitchOnce {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 1px); }
        40% { transform: translate(2px, -1px); }
        60% { transform: translate(-1px, -1px); }
        80% { transform: translate(1px, 2px); }
        100% { transform: translate(0); }
      }
      
      .num { font-family: var(--mono); font-variant-numeric: tabular-nums; }
      .mono { font-family: var(--mono); }
      .serif { font-family: var(--serif); }
      
      input[type="range"] { -webkit-appearance: none; background: var(--bg-2); height: 2px; outline: none; }
      input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: var(--acid); cursor: pointer; }
      
      a { color: inherit; text-decoration: none; }
      
      /* ============================================================== */
      /* RESPONSIVE — mobile-first overrides                            */
      /* ============================================================== */
      
      /* Tablet — 768px and below */
      @media (max-width: 900px) {
        .gg-resp-hero {
          grid-template-columns: 1fr !important;
          padding: 32px 20px 0 !important;
          min-height: auto !important;
          gap: 32px !important;
        }
        .gg-resp-hero h1 {
          font-size: clamp(40px, 9vw, 64px) !important;
        }
        .gg-resp-hero-vault-wrap {
          height: 480px !important;
          order: -1 !important;
        }
        .gg-resp-stats-4 {
          grid-template-columns: repeat(2, 1fr) !important;
          max-width: 100% !important;
        }
        .gg-resp-mechanism-grid {
          grid-template-columns: 1fr !important;
          gap: 32px !important;
          margin-bottom: 48px !important;
        }
        .gg-resp-mechanism-flow {
          grid-template-columns: 1fr !important;
        }
        .gg-resp-mechanism-flow > * {
          padding: 0 0 24px !important;
          text-align: left !important;
          display: grid !important;
          grid-template-columns: 100px 1fr !important;
          gap: 20px !important;
          align-items: start !important;
        }
        .gg-resp-mechanism-flow > * > div:first-child {
          height: auto !important;
          margin-bottom: 0 !important;
        }
        .gg-resp-mechanism-flow > * > div:nth-child(2) {
          grid-column: 1 !important;
        }
        .gg-resp-comparison {
          grid-template-columns: 1fr !important;
        }
        .gg-resp-comparison > * {
          border-right: none !important;
          border-bottom: 1px solid var(--line-2) !important;
        }
        .gg-resp-comparison > *:last-child {
          border-bottom: none !important;
        }
        .gg-resp-token-grid {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        .gg-resp-token-detail {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        .gg-resp-token-detail > * {
          position: static !important;
        }
        .gg-resp-inspector {
          grid-template-columns: 1fr !important;
        }
        .gg-resp-inspector > div:first-child {
          border-right: none !important;
          border-bottom: 1px solid var(--line) !important;
          min-height: 280px !important;
        }
        .gg-resp-stake-position {
          grid-template-columns: 1fr !important;
        }
        .gg-resp-stake-position > div:first-child {
          border-right: none !important;
          border-bottom: 1px solid var(--line) !important;
        }
        .gg-resp-stake-metrics {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 16px !important;
        }
        .gg-resp-stake-actions {
          flex-direction: row !important;
          border-left: none !important;
          border-top: 1px solid var(--line) !important;
        }
        .gg-resp-stake-actions > * {
          border-bottom: none !important;
          border-right: 1px solid var(--line) !important;
        }
        .gg-resp-stake-actions > *:last-child {
          border-right: none !important;
        }
        .gg-resp-docs {
          grid-template-columns: 1fr !important;
          gap: 24px !important;
        }
        .gg-resp-docs-toc {
          position: static !important;
          padding: 16px !important;
          border: 1px solid var(--line-2) !important;
          background: var(--bg-1) !important;
        }
        .gg-resp-discover-table-row,
        .gg-resp-discover-table-head {
          display: grid !important;
          grid-template-columns: 36px 1fr auto !important;
          gap: 12px !important;
          padding: 14px 16px !important;
          align-items: center !important;
        }
        .gg-resp-discover-hide-mobile { display: none !important; }
        .gg-resp-discover-mobile-block {
          display: block !important;
          font-size: 12px !important;
          color: var(--fg-dim) !important;
          margin-top: 4px !important;
          font-family: var(--mono) !important;
        }
        .gg-resp-graduating-strip {
          grid-template-columns: repeat(5, 240px) !important;
          overflow-x: auto !important;
          padding-bottom: 8px !important;
          scrollbar-width: none !important;
        }
        .gg-resp-graduating-strip::-webkit-scrollbar { display: none; }
        .gg-resp-flow-line {
          display: none !important;
        }
        .gg-resp-flow-pulse {
          display: none !important;
        }
        .gg-nav-search-hint {
          display: none !important;
        }
        .gg-nav-wallet-balance {
          display: none !important;
        }
        .gg-nav-mobile-menu-btn {
          display: flex !important;
        }
        .gg-nav-desktop-links {
          display: none !important;
        }
        .gg-pip-vault {
          bottom: 16px !important;
          right: 16px !important;
        }
        .gg-pip-vault > * {
          padding: 10px !important;
          gap: 10px !important;
          min-width: 0 !important;
        }
        .gg-pip-vault svg { width: 36px !important; height: 39px !important; }
        .gg-comparison-vault-wrap {
          height: 160px !important;
          margin-bottom: 24px !important;
          padding-bottom: 24px !important;
        }
        .gg-section-pad-lg { padding: 80px 20px !important; }
        .gg-section-pad-xl { padding: 120px 20px !important; }
        .gg-page-pad { padding: 32px 20px 80px !important; }
        .gg-token-header { gap: 16px !important; }
        .gg-token-header > div:first-child { gap: 16px !important; }
        .gg-tilt-disable {
          transform: none !important;
        }
        .gg-btn { min-height: 44px; }
        .gg-magnetic::after { display: none !important; }
      }
      
      /* Phone — 480px and below */
      @media (max-width: 480px) {
        .gg-resp-hero h1 {
          font-size: clamp(36px, 11vw, 52px) !important;
        }
        .gg-resp-hero-vault-wrap {
          height: 380px !important;
        }
        .gg-resp-hero-vault-wrap > * {
          transform: scale(0.7);
          transform-origin: center center;
        }
        .gg-resp-stats-4 {
          grid-template-columns: 1fr 1fr !important;
        }
        .gg-resp-stats-4 > * {
          padding: 16px 14px !important;
        }
        .gg-resp-stats-4 > * .num {
          font-size: 18px !important;
        }
        .gg-resp-graduating-strip {
          grid-template-columns: repeat(5, 200px) !important;
        }
        .gg-resp-stake-metrics {
          grid-template-columns: 1fr 1fr !important;
        }
        .gg-resp-orbital-readout-hide-mobile {
          display: none !important;
        }
      }
    `}</style>
  );
}

// ============================================================================
// NAV
// ============================================================================

function Nav({ page, navigate, walletConnected, connectWallet, walletAddr, solBalance }) {
  const items = [
    { id: 'discover', label: 'Discover' },
    { id: 'launch', label: 'Launch' },
    { id: 'stake', label: 'Stake' },
    { id: 'docs', label: 'Docs' },
  ];
  const [hoveredNav, setHoveredNav] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleNavigate = (id) => {
    navigate(id);
    setMobileMenuOpen(false);
  };
  
  return (
    <>
    <nav style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, height: 64, 
      background: 'rgba(6,8,15,0.65)', 
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.06)', 
      zIndex: 50,
      boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px -8px rgba(0,0,0,0.4)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', height: '100%', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 32 }}>
        <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'opacity 200ms' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <Logo size={24} />
        </button>
        
        <div className="gg-nav-desktop-links" style={{ display: 'flex', gap: 0, marginLeft: 24, position: 'relative' }} onMouseLeave={() => setHoveredNav(null)}>
          {items.map(it => {
            const active = page === it.id;
            const hovered = hoveredNav === it.id;
            return (
              <button 
                key={it.id} 
                onClick={() => navigate(it.id)} 
                onMouseEnter={() => setHoveredNav(it.id)}
                style={{ 
                  position: 'relative',
                  background: 'none', 
                  border: 'none', 
                  color: active ? 'var(--fg)' : hovered ? 'var(--fg)' : 'var(--fg-dim)', 
                  padding: '20px 16px', 
                  fontSize: 14, 
                  cursor: 'pointer', 
                  fontWeight: 500, 
                  fontFamily: 'var(--sans)',
                  transition: 'color 200ms',
                  letterSpacing: '-0.005em',
                }}
              >
                {it.label}
                {active && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: '20%', right: '20%',
                    height: 1,
                    background: 'var(--acid)',
                    boxShadow: '0 0 8px var(--acid)',
                  }} />
                )}
                {hovered && !active && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: '20%', right: '20%',
                    height: 1,
                    background: 'var(--fg-dim)',
                    opacity: 0.5,
                  }} />
                )}
              </button>
            );
          })}
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Search hint - hidden on mobile */}
          <button className="gg-nav-search-hint" onClick={() => { window.dispatchEvent(new CustomEvent('gg-open-palette')); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', border: '1px solid var(--line-2)', background: 'rgba(11,15,28,0.5)', cursor: 'pointer', transition: 'all 200ms', fontFamily: 'var(--sans)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fg-mute)'; e.currentTarget.style.background = 'var(--bg-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.background = 'rgba(11,15,28,0.5)'; }}>
            <Search size={12} color="var(--fg-mute)" />
            <span style={{ fontSize: 12, color: 'var(--fg-dim)' }}>Search vaults</span>
            <span className="gg-kbd">⌘K</span>
          </button>
          
          {walletConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="gg-nav-wallet-balance" style={{ fontSize: 13, color: 'var(--fg-dim)', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--acid)', fontSize: 11 }}>◆</span> 
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{solBalance.toFixed(2)}</span>
                <span style={{ color: 'var(--fg-mute)', fontSize: 11 }}>SOL</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', border: '1px solid var(--line-2)', background: 'linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%)', boxShadow: 'var(--hairline-top)' }}>
                <div className="gg-led" style={{ color: 'var(--green)', width: 6, height: 6 }} />
                <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{walletAddr}</span>
              </div>
            </div>
          ) : (
            <button onClick={connectWallet} className="gg-btn gg-btn-primary">
              <Wallet size={14} /> Connect Wallet
            </button>
          )}
          
          {/* Mobile hamburger - hidden on desktop */}
          <button 
            className="gg-nav-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(o => !o)}
            style={{ 
              display: 'none', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 40, height: 40, 
              border: '1px solid var(--line-2)', 
              background: 'rgba(11,15,28,0.5)',
              cursor: 'pointer',
              padding: 0,
            }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 1.5, background: 'var(--fg)', transition: 'transform 200ms', transform: mobileMenuOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none' }} />
              <div style={{ width: 16, height: 1.5, background: 'var(--fg)', opacity: mobileMenuOpen ? 0 : 1, transition: 'opacity 200ms' }} />
              <div style={{ width: 16, height: 1.5, background: 'var(--fg)', transition: 'transform 200ms', transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
            </div>
          </button>
        </div>
      </div>
    </nav>
    
    {/* Mobile menu drawer */}
    {mobileMenuOpen && (
      <div style={{ 
        position: 'fixed', top: 64, left: 0, right: 0, 
        background: 'rgba(6,8,15,0.95)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--line-2)',
        zIndex: 49, 
        padding: '8px 0',
        animation: 'mobileMenuSlide 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        boxShadow: '0 12px 32px -8px rgba(0,0,0,0.5)',
      }}>
        <button 
          onClick={() => { window.dispatchEvent(new CustomEvent('gg-open-palette')); setMobileMenuOpen(false); }} 
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', background: 'none', border: 'none', borderBottom: '1px solid var(--line)', color: 'var(--fg-dim)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 14, textAlign: 'left' }}>
          <Search size={14} />
          Search vaults
          <span style={{ marginLeft: 'auto' }} className="gg-kbd">⌘K</span>
        </button>
        {items.map(it => {
          const active = page === it.id;
          return (
            <button 
              key={it.id} 
              onClick={() => handleNavigate(it.id)}
              style={{ 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                background: 'none', 
                border: 'none', 
                borderLeft: active ? '2px solid var(--acid)' : '2px solid transparent',
                color: active ? 'var(--fg)' : 'var(--fg-dim)', 
                padding: '14px 22px', 
                fontSize: 16, 
                cursor: 'pointer', 
                fontWeight: 500, 
                fontFamily: 'var(--sans)',
                textAlign: 'left',
                letterSpacing: '-0.005em',
              }}>
              {it.label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--acid)' }} />}
            </button>
          );
        })}
        <style>{`
          @keyframes mobileMenuSlide {
            from { opacity: 0; transform: translateY(-12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )}
    </>
  );
}

// ============================================================================
// HOME — built around the vault visual
// ============================================================================

function Reveal({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(36px)',
      transition: `opacity 900ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function HomePage({ navigate, tokens, tvl, feesGenerated }) {
  const [showFloater, setShowFloater] = useState(false);
  
  useEffect(() => {
    const handler = () => {
      // show floater after scrolling past 600px (well past hero)
      setShowFloater(window.scrollY > 600 && window.scrollY < document.body.scrollHeight - window.innerHeight - 400);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);
  
  return (
    <div className="gg-fade-in">
      <Hero navigate={navigate} tvl={tvl} feesGenerated={feesGenerated} tokens={tokens} />
      <Reveal><MechanismFlow /></Reveal>
      <Reveal><ComparisonFlow /></Reveal>
      <Manifesto />
      <Reveal><FinalCTA navigate={navigate} /></Reveal>
      {showFloater && <FloatingVault />}
    </div>
  );
}

function FloatingVault() {
  return (
    <div className="gg-pip-vault" style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 40,
      animation: 'floaterIn 480ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    }}>
      <div className="gg-glass" style={{
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minWidth: 220,
      }}>
        <Vault size={48} state="sealed" fillPct={100} animate={true} breathe={true} />
        <div>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>Vault Active</div>
          <div style={{ fontSize: 12, color: 'var(--acid)', fontFamily: 'var(--mono)', fontWeight: 500 }}>
            Compounding · ∞
          </div>
        </div>
      </div>
      <style>{`
        @keyframes floaterIn {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// HERO — bespoke instrument composition: copy left, vault inside instrument bezel right
function Hero({ navigate, tvl, feesGenerated, tokens }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
      {/* atmospheric backdrop */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 900, height: 900, background: 'radial-gradient(circle, rgba(107,163,255,0.10) 0%, rgba(159,122,234,0.05) 40%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div className="gg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.18, maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)' }} />
      
      <div className="gg-resp-hero" style={{ maxWidth: 1400, margin: '0 auto', padding: '64px 24px 0', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 620px', gap: 48, alignItems: 'center', minHeight: 720 }}>
        {/* LEFT: copy */}
        <div className="gg-rise">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56, padding: '6px 12px', background: 'rgba(11,15,28,0.5)', border: '1px solid var(--line-2)', width: 'fit-content', boxShadow: 'var(--hairline-top)' }}>
            <div className="gg-led gg-pulse" style={{ color: 'var(--acid)' }} />
            <span style={{ fontSize: 11, color: 'var(--fg-dim)', fontWeight: 500, letterSpacing: '0.02em' }}>LIVE ON SOLANA</span>
            <span style={{ fontSize: 11, color: 'var(--fg-mute)' }}>·</span>
            <span style={{ fontSize: 11, color: 'var(--fg-dim)', fontFamily: 'var(--mono)' }}>Block 348,291,042</span>
          </div>

          <h1 style={{ fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.96, margin: 0, fontWeight: 400, letterSpacing: '-0.04em' }}>
            <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--fg-dim)' }}>The launchpad</span><br />
            where liquidity<br />
            <span style={{ background: 'linear-gradient(120deg, var(--purple-l) 0%, var(--acid) 60%, var(--steel) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 500 }}>cannot be pulled.</span>
          </h1>

          <p style={{ marginTop: 36, fontSize: 19, lineHeight: 1.55, color: 'var(--fg-dim)', maxWidth: 540, fontWeight: 400 }}>
            At graduation, every memecoin's liquidity is sealed in a vault with <span style={{ color: 'var(--fg)', fontWeight: 500 }}>no withdraw function</span>. Not by promise. Not by multisig. By the absence of any code that could remove it.
          </p>

          <div style={{ marginTop: 48, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => navigate('launch')} className="gg-btn gg-btn-primary" style={{ padding: '14px 24px', fontSize: 14 }}>
              <Zap size={15} /> Launch a Token
            </button>
            <button onClick={() => navigate('discover')} className="gg-btn" style={{ padding: '14px 24px', fontSize: 14 }}>
              <Search size={15} /> Explore Vaults
            </button>
          </div>

          {/* live counter strip — now 4-up with vault count + active */}
          <div className="gg-resp-stats-4" style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--line-2)', maxWidth: 580 }}>
            <MicroStat label="Sealed" value={<CountUp to={tvl} formatter={v => `$${fmt(v, 1)}`} />} accent />
            <MicroStat label="Fees" value={<CountUp to={feesGenerated} formatter={v => `$${fmt(v, 0)}`} />} />
            <MicroStat label="Vaults" value={tokens.filter(t => t.graduated).length} />
            <MicroStat label="On curve" value={tokens.filter(t => !t.graduated).length} />
          </div>
        </div>

        {/* RIGHT: the giant vault inside instrument bezel */}
        <div className="gg-resp-hero-vault-wrap" style={{ position: 'relative', height: 620, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HeroVault />
        </div>
      </div>

      {/* LIVE ACTIVITY TICKER */}
      <ActivityTicker tokens={tokens} />

      {/* GRADUATING NOW STRIP */}
      <GraduatingNow tokens={tokens} navigate={navigate} />
    </section>
  );
}

// Live activity ticker - protocol events scrolling across a strip
function ActivityTicker({ tokens }) {
  const events = useMemo(() => {
    const out = [];
    const graduated = tokens.filter(t => t.graduated);
    const oncurve = tokens.filter(t => !t.graduated && t.progress > 50);
    
    for (let i = 0; i < 14; i++) {
      const r = Math.random();
      if (r > 0.7 && graduated.length > 0) {
        const t = graduated[Math.floor(Math.random() * graduated.length)];
        out.push({ kind: 'sealed', token: t, mins: Math.floor(Math.random() * 240) });
      } else if (r > 0.45 && graduated.length > 0) {
        const t = graduated[Math.floor(Math.random() * graduated.length)];
        out.push({ kind: 'fees', token: t, amount: 8 + Math.random() * 240 });
      } else if (r > 0.2 && oncurve.length > 0) {
        const t = oncurve[Math.floor(Math.random() * oncurve.length)];
        out.push({ kind: 'progress', token: t });
      } else {
        const t = tokens[Math.floor(Math.random() * tokens.length)];
        out.push({ kind: 'buy', token: t, amount: 0.1 + Math.random() * 8 });
      }
    }
    return out;
  }, [tokens]);

  return (
    <div style={{ position: 'relative', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg, rgba(11,15,28,0.6) 0%, rgba(11,15,28,0.4) 100%)', overflow: 'hidden', height: 56, display: 'flex', alignItems: 'center', marginTop: 64 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(90deg, var(--bg) 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(270deg, var(--bg) 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
      
      <div style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 3, padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--line-2)', boxShadow: 'var(--hairline-top)' }}>
        <div className="gg-led gg-pulse" style={{ color: 'var(--acid)', width: 5, height: 5 }} />
        <span style={{ fontSize: 10, color: 'var(--fg-dim)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Activity</span>
      </div>
      
      <div style={{ display: 'flex', gap: 32, animation: 'tickerScroll 80s linear infinite', whiteSpace: 'nowrap', paddingLeft: 160 }}>
        {[...events, ...events, ...events].map((e, i) => <ActivityEvent key={i} event={e} />)}
      </div>
      
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}

function ActivityEvent({ event }) {
  const t = event.token;
  if (event.kind === 'sealed') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
        <Vault size={20} state="sealed" fillPct={100} animate={false} glow={false} />
        <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{t.symbol}</span>
        <span style={{ color: 'var(--fg-dim)' }}>vault sealed ·</span>
        <span style={{ color: 'var(--acid)', fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmt(t.lpLocked, 0)} SOL locked</span>
        <span style={{ color: 'var(--fg-mute)' }}>· {event.mins}m ago</span>
      </div>
    );
  }
  if (event.kind === 'fees') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
        <span style={{ color: 'var(--purple-l)' }}>◆</span>
        <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{t.symbol}</span>
        <span style={{ color: 'var(--fg-dim)' }}>fees compounded ·</span>
        <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontWeight: 500 }}>+${fmt(event.amount, 0)}</span>
      </div>
    );
  }
  if (event.kind === 'progress') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
        <Vault size={20} state="open" fillPct={t.progress} animate={false} glow={false} />
        <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{t.symbol}</span>
        <span style={{ color: 'var(--fg-dim)' }}>curve at</span>
        <span style={{ color: 'var(--amber)', fontFamily: 'var(--mono)', fontWeight: 500 }}>{t.progress}%</span>
      </div>
    );
  }
  if (event.kind === 'buy') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
        <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontWeight: 600 }}>BUY</span>
        <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{t.symbol}</span>
        <span style={{ color: 'var(--fg-dim)' }}>·</span>
        <span style={{ color: 'var(--fg)', fontFamily: 'var(--mono)', fontWeight: 500 }}>{event.amount.toFixed(2)} SOL</span>
      </div>
    );
  }
  return null;
}

// Tokens at 80%+ progress, displayed as a horizontal carousel
function GraduatingNow({ tokens, navigate }) {
  const candidates = useMemo(() => {
    return tokens.filter(t => !t.graduated && t.progress >= 70).sort((a, b) => b.progress - a.progress).slice(0, 5);
  }, [tokens]);
  
  if (candidates.length === 0) return null;
  
  return (
    <div style={{ padding: '32px 24px 56px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="gg-led gg-pulse" style={{ color: 'var(--amber)' }} />
            <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Graduating Now</span>
            <span style={{ fontSize: 12, color: 'var(--fg-dim)' }}>· {candidates.length} vaults nearing seal</span>
          </div>
          <button onClick={() => navigate('discover')} className="gg-btn" style={{ padding: '8px 14px', fontSize: 12 }}>
            All vaults <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="gg-resp-graduating-strip" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(candidates.length, 5)}, 1fr)`, gap: 12 }}>
          {candidates.map(t => <GraduatingCard key={t.id} token={t} navigate={navigate} />)}
        </div>
      </div>
    </div>
  );
}

function GraduatingCard({ token, navigate }) {
  return (
    <button
      onClick={() => navigate('token', token.id)}
      className="gg-card gg-magnetic"
      style={{
        padding: 16,
        textAlign: 'left',
        cursor: 'pointer',
        color: 'var(--fg)',
        fontFamily: 'var(--sans)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 12,
        alignItems: 'center',
        transition: 'all 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; }}
    >
      <Vault size={48} state="open" fillPct={token.progress} animate={true} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{token.symbol}</span>
          <span style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'var(--mono)', fontWeight: 500 }}>{token.progress}%</span>
        </div>
        <div style={{ height: 3, background: 'var(--bg-2)', position: 'relative', marginBottom: 4 }}>
          <div style={{ position: 'absolute', inset: 0, width: `${token.progress}%`, background: 'linear-gradient(90deg, var(--amber) 0%, var(--purple) 100%)', boxShadow: '0 0 6px var(--amber)' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg-dim)', fontFamily: 'var(--mono)' }}>${fmt(token.mcap, 0)} / $69K</div>
      </div>
    </button>
  );
}

// THE HERO VAULT — interactive centerpiece
// Small data readout positioned at corners of the hero vault container
function OrbitalReadout({ position, label, value, active, color }) {
  const positions = {
    'top-left':     { top: 32,    left: 24,  textAlign: 'left' },
    'top-right':    { top: 32,    right: 24, textAlign: 'right' },
    'bottom-left':  { bottom: 80, left: 24,  textAlign: 'left' },
    'bottom-right': { bottom: 80, right: 24, textAlign: 'right' },
  };
  const pos = positions[position];
  const isRight = position.includes('right');
  
  const hideOnMobile = position === 'top-left' || position === 'bottom-right';
  
  return (
    <div className={hideOnMobile ? 'gg-resp-orbital-readout-hide-mobile' : ''} style={{ 
      position: 'absolute', 
      ...pos,
      zIndex: 4,
      animation: 'fadeIn 1200ms ease both',
      animationDelay: '600ms',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        flexDirection: isRight ? 'row-reverse' : 'row',
        marginBottom: 6,
      }}>
        <div className={active ? 'gg-led gg-pulse' : 'gg-led'} style={{ color: active ? color : 'var(--fg-mute)', width: 4, height: 4 }} />
        <div style={{ 
          fontSize: 10, 
          color: 'var(--fg-mute)', 
          fontFamily: 'var(--mono)', 
          fontWeight: 600, 
          letterSpacing: '0.08em',
          textAlign: pos.textAlign,
        }}>{label}</div>
      </div>
      <div key={value} style={{ 
        fontSize: 16, 
        fontFamily: 'var(--mono)', 
        fontWeight: 500, 
        color: active ? 'var(--fg)' : 'var(--fg-dim)', 
        letterSpacing: '-0.01em',
        textAlign: pos.textAlign,
        animation: 'fadeIn 400ms ease',
        transition: 'color 800ms',
      }}>{value}</div>
      {/* connector line to vault */}
      <div style={{
        position: 'absolute',
        [isRight ? 'right' : 'left']: 0,
        top: position.startsWith('top') ? 'calc(100% + 8px)' : 'auto',
        bottom: position.startsWith('bottom') ? 'calc(100% + 8px)' : 'auto',
        width: 60,
        height: 1,
        background: `linear-gradient(${isRight ? '270deg' : '90deg'}, ${color}40 0%, transparent 100%)`,
        opacity: active ? 1 : 0.3,
        transition: 'opacity 800ms',
      }} />
    </div>
  );
}

function HeroVault() {
  const [phase, setPhase] = useState('curve');
  const [fillPct, setFillPct] = useState(20);
  const [flashKey, setFlashKey] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Mouse parallax tilt
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setTilt({ x: dx * 8, y: -dy * 8 });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const seq = async () => {
      // CURVE: fill 20 → 95
      for (let i = 20; i <= 95; i += 1) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 75));
        setFillPct(i);
      }
      if (cancelled) return;
      // small pause at the brim
      await new Promise(r => setTimeout(r, 300));
      // SEALING
      setPhase('sealing');
      setFlashKey(k => k + 1);
      await new Promise(r => setTimeout(r, 1600));
      if (cancelled) return;
      // SEALED
      setPhase('sealed');
      setFlashKey(k => k + 1);
      await new Promise(r => setTimeout(r, 7000));
      if (cancelled) return;
      // RESET
      setPhase('curve');
      setFillPct(20);
    };
    seq();
    const id = setInterval(seq, 16000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const state = phase === 'sealed' ? 'sealed' : phase === 'sealing' ? 'sealing' : 'open';
  const color = phase === 'sealed' ? '#6ba3ff' : phase === 'sealing' ? '#9f7aea' : '#fbbf24';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 540, height: 540, perspective: 1200 }}>
      <div className="gg-tilt-disable" style={{ 
        width: '100%', height: '100%', position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transition: 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
      {/* ambient glow — pulses brighter on phase change */}
      <div key={`glow-${phase}`} style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${color}40 0%, ${color}15 30%, transparent 65%)`, filter: 'blur(50px)', transition: 'background 1500ms ease', animation: 'fadeIn 1200ms ease' }} />
      
      {/* far outer dotted ring (slow rotate) */}
      <svg width="540" height="540" viewBox="0 0 540 540" style={{ position: 'absolute', inset: 0 }}>
        <g style={{ transformOrigin: '270px 270px', animation: 'rotate 80s linear infinite' }}>
          <circle cx="270" cy="270" r="255" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" strokeDasharray="2 8" style={{ transition: 'stroke 1200ms ease' }} />
        </g>
      </svg>

      {/* outer ring with grad — counter-rotates */}
      <svg width="540" height="540" viewBox="0 0 540 540" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="ringg" cx="0.5" cy="0.5" r="0.5">
            <stop offset="60%" stopColor={color} stopOpacity="0" />
            <stop offset="80%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g style={{ transformOrigin: '270px 270px', animation: 'rotateRev 120s linear infinite' }}>
          <circle cx="270" cy="270" r="220" fill="none" stroke={color} strokeWidth="0.5" opacity="0.15" style={{ transition: 'stroke 1200ms ease' }} />
        </g>
        <circle cx="270" cy="270" r="250" fill="url(#ringg)" />
      </svg>

      {/* tick marks */}
      <svg width="540" height="540" viewBox="0 0 540 540" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 36 }, (_, i) => {
          const a = (Math.PI * 2 / 36) * i - Math.PI / 2;
          const inner = i % 9 === 0 ? 248 : 252;
          const outer = i % 9 === 0 ? 264 : 258;
          const x1 = 270 + inner * Math.cos(a);
          const y1 = 270 + inner * Math.sin(a);
          const x2 = 270 + outer * Math.cos(a);
          const y2 = 270 + outer * Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={i % 9 === 0 ? 1.2 : 0.6} opacity={i % 9 === 0 ? 0.7 : 0.25} style={{ transition: 'stroke 1200ms ease' }} />;
        })}
      </svg>

      {/* sealing shockwave — emanates from vault when sealing starts */}
      {phase === 'sealing' && [0, 0.3, 0.6].map((delay, i) => (
        <div key={`sw-${flashKey}-${i}`} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 280, height: 280,
          marginTop: -140, marginLeft: -140,
          color: color,
          animation: 'shockwave 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) 1',
          animationDelay: `${delay}s`,
          borderRadius: '50%',
          border: '1px solid currentColor',
          opacity: 0,
        }} />
      ))}

      {/* CURVE: SOL particles falling INTO the vault */}
      {phase === 'curve' && Array.from({ length: 8 }).map((_, i) => (
        <div key={`fall-${i}`} className="gg-particle-fall" style={{
          left: `${30 + (i * 45) % 280}px`,
          top: '60px',
          background: color,
          boxShadow: `0 0 8px ${color}, 0 0 14px ${color}88`,
          animationDelay: `${i * 0.3}s`,
          animationDuration: `${2.0 + (i % 3) * 0.4}s`,
        }} />
      ))}

      {/* SEALED: orbital fee particles around the vault */}
      {phase === 'sealed' && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`orbit-${i}`} className="gg-particle-orbit" style={{
              background: color,
              boxShadow: `0 0 8px ${color}, 0 0 14px ${color}aa`,
              animationDelay: `${i * 1}s`,
              animationDuration: `${5 + (i % 3) * 1}s`,
              top: -2, left: -2,
            }} />
          ))}
        </div>
      )}

      {/* SEALED: rising fee absorption particles */}
      {phase === 'sealed' && Array.from({ length: 6 }).map((_, i) => (
        <div key={`rise-${i}`} className="gg-particle-rise" style={{
          left: `${100 + (i * 55) % 320}px`,
          top: '380px',
          background: color,
          boxShadow: `0 0 6px ${color}, 0 0 12px ${color}88`,
          animationDelay: `${i * 0.6}s`,
        }} />
      ))}

      {/* ORBITAL INSTRUMENT READOUTS at cardinal positions */}
      <OrbitalReadout 
        position="top-left" 
        label="LP LOCKED" 
        value={phase === 'sealed' ? '412.0 SOL' : '—'} 
        active={phase === 'sealed'} 
        color={color}
      />
      <OrbitalReadout 
        position="top-right" 
        label="STATUS" 
        value={phase === 'curve' ? 'CURVE' : phase === 'sealing' ? 'SEALING' : 'SEALED'} 
        active={true}
        color={color}
      />
      <OrbitalReadout 
        position="bottom-left" 
        label="FILL" 
        value={`${phase === 'sealed' ? 100 : fillPct}%`} 
        active={true}
        color={color}
      />
      <OrbitalReadout 
        position="bottom-right" 
        label="WITHDRAW FN" 
        value="NEVER" 
        active={phase === 'sealed'}
        color={color}
      />

      {/* THE VAULT */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div>
            <Vault 
              size={310} 
              state={state} 
              fillPct={phase === 'sealed' ? 100 : fillPct} 
              animate={true}
              breathe={phase === 'sealed'}
              scanline={phase !== 'curve'}
              flash={phase === 'sealing'}
              key={`hv-${flashKey}`}
            />
          </div>
          
          {/* bright flash overlay at sealing moment */}
          {phase === 'sealing' && (
            <div key={`flash-${flashKey}`} style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle, #fff 0%, ${color}88 30%, transparent 60%)`,
              borderRadius: '50%',
              animation: 'fadeOutFlash 1200ms ease-out 1',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }} />
          )}
          
          {/* status readout */}
          <div style={{ position: 'absolute', top: 'calc(100% + 28px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', minWidth: 360 }}>
            <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--mono)' }}>
              vault status
            </div>
            <div key={`status-${phase}`} style={{ fontSize: 22, fontWeight: 500, color, letterSpacing: '-0.01em', animation: 'fadeIn 600ms ease' }}>
              {phase === 'curve' && 'Accepting deposits'}
              {phase === 'sealing' && 'Sealing vault…'}
              {phase === 'sealed' && 'Permanently sealed'}
            </div>
            <div key={`sub-${phase}-${fillPct}`} style={{ fontSize: 13, color: 'var(--fg-dim)', marginTop: 6, fontFamily: 'var(--mono)' }}>
              {phase === 'curve' && `Curve filled · ${fillPct}%`}
              {phase === 'sealing' && 'Transferring LP to Vault PDA'}
              {phase === 'sealed' && 'Fees compounding · withdraw fn does not exist'}
            </div>
          </div>
        </div>
      </div>

      </div>{/* /tilt wrapper */}
      <style>{`
        @keyframes fadeOutFlash {
          0% { opacity: 0.9; transform: scale(0.6); }
          40% { opacity: 0.7; }
          100% { opacity: 0; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

function CountUp({ to, duration = 1600, prefix = '', suffix = '', formatter }) {
  const [val, setVal] = useState(0);
  const startVal = useRef(0);
  const startTime = useRef(null);
  const target = useRef(to);
  
  useEffect(() => {
    startVal.current = val;
    target.current = to;
    startTime.current = null;
    let raf;
    const tick = (now) => {
      if (!startTime.current) startTime.current = now;
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(startVal.current + (target.current - startVal.current) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, duration]);
  
  const display = formatter ? formatter(val) : Math.floor(val).toLocaleString();
  return <>{prefix}{display}{suffix}</>;
}

function MicroStat({ label, value, accent }) {
  return (
    <div style={{ 
      padding: '22px 24px', 
      background: accent ? 'linear-gradient(180deg, rgba(107,163,255,0.06) 0%, rgba(107,163,255,0.02) 100%)' : 'linear-gradient(180deg, rgba(11,15,28,0.6) 0%, rgba(11,15,28,0.3) 100%)', 
      borderRight: '1px solid var(--line-2)',
      boxShadow: 'var(--hairline-top)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        {accent && <div className="gg-led gg-pulse" style={{ color: 'var(--acid)', width: 4, height: 4 }} />}
        <div style={{ fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
      </div>
      <div className="num" style={{ fontSize: 26, fontWeight: 500, color: accent ? 'var(--acid)' : 'var(--fg)', letterSpacing: '-0.025em', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// MECHANISM FLOW — animated horizontal diagram
function MechanismFlow() {
  return (
    <section className="gg-section-pad-xl" style={{ padding: '120px 24px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div className="gg-resp-mechanism-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80, marginBottom: 80, alignItems: 'end' }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--acid)', letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase' }}>§ The Mechanism</span>
            <h2 style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', margin: '20px 0 0', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
              <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>How</span> a promise<br />becomes a law.
            </h2>
          </div>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--fg-dim)', maxWidth: 580 }}>
            On every other launchpad, the team holds the LP keys. They <span style={{ color: 'var(--fg)' }}>say</span> they won't pull liquidity. We don't ask you to trust anyone's word. The contract that holds the LP has no instruction that releases it. Read the code yourself.
          </p>
        </div>

        <FlowDiagram />
      </div>
    </section>
  );
}

function FlowDiagram() {
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % 5), 2400); // 5 means restart pause
    return () => clearInterval(id);
  }, []);

  const steps = [
    { n: '01', t: 'Bonding Curve', d: 'Buyers deposit SOL. Tokens minted by formula. No presale, no team allocation.', vault: { state: 'open', fill: 30 } },
    { n: '02', t: 'Graduation', d: 'At $69K mcap, curve reserves seed a Raydium pool. Atomic, single transaction.', vault: { state: 'open', fill: 95 } },
    { n: '03', t: 'Vault Sealed', d: 'LP transferred to Vault PDA. The withdraw instruction does not exist.', vault: { state: 'sealing', fill: 100 } },
    { n: '04', t: 'Compounding', d: '70% of fees deepen the LP. 20% distributed to gLP holders. Forever.', vault: { state: 'sealed', fill: 100 } },
  ];

  return (
    <div className="gg-resp-mechanism-flow" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
      {/* connecting line baseline */}
      <div className="gg-resp-flow-line" style={{ position: 'absolute', top: 60, left: '12.5%', right: '12.5%', height: 1, background: 'var(--line-2)', zIndex: 0 }} />
      {/* progressive line with shimmer */}
      <div className="gg-resp-flow-line" style={{ position: 'absolute', top: 60, left: '12.5%', height: 1, background: 'linear-gradient(90deg, var(--amber), var(--purple), var(--acid))', zIndex: 1, width: `calc(${Math.min(activeStep, 3) / 3 * 75}%)`, transition: 'width 1400ms cubic-bezier(0.2, 0.8, 0.2, 1)', boxShadow: '0 0 8px var(--acid)' }} />
      {/* travelling pulse on the line - React-driven position */}
      {activeStep > 0 && activeStep <= 3 && (
        <div key={`pulse-${activeStep}`} className="gg-resp-flow-pulse" style={{ 
          position: 'absolute', top: 56, 
          left: `calc(12.5% + ${(activeStep - 1) / 3 * 75}%)`, 
          width: 10, height: 10, borderRadius: '50%', 
          background: 'var(--acid)', 
          boxShadow: '0 0 16px var(--acid), 0 0 32px var(--acid)', 
          zIndex: 3,
          transform: 'translate(-50%, 0)',
          animation: 'flowDot 1400ms cubic-bezier(0.2, 0.8, 0.2, 1) 1 forwards',
          '--dx': `calc(${75 / 3}% - 0px)`,
        }} />
      )}
      <style>{`
        @keyframes flowDot {
          from { transform: translate(-50%, 0) scale(1); opacity: 1; }
          50% { opacity: 1; }
          to { transform: translate(calc(-50% + var(--dx)), 0) scale(0.4); opacity: 0; }
        }
      `}</style>
      
      {steps.map((s, i) => {
        const active = i === activeStep;
        const reached = i <= activeStep;
        return (
          <div key={i} style={{ padding: '0 16px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            {/* vault indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, height: 120, alignItems: 'center', position: 'relative' }}>
              {/* glow ring on active step */}
              {active && (
                <div key={`r-${i}-${activeStep}`} style={{
                  position: 'absolute',
                  width: 130, height: 130,
                  borderRadius: '50%',
                  border: `1px solid ${s.vault.state === 'sealed' ? '#6ba3ff' : s.vault.state === 'sealing' ? '#9f7aea' : '#fbbf24'}`,
                  color: s.vault.state === 'sealed' ? '#6ba3ff' : s.vault.state === 'sealing' ? '#9f7aea' : '#fbbf24',
                  animation: 'shockwave 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
                  opacity: 0,
                }} />
              )}
              <div style={{ 
                opacity: reached ? 1 : 0.3, 
                transition: 'all 800ms', 
                transform: active ? 'scale(1.08)' : 'scale(1)',
              }}>
                <Vault size={88} state={s.vault.state} fillPct={s.vault.fill} animate={true} breathe={active && s.vault.state === 'sealed'} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-mute)', fontFamily: 'var(--mono)', marginBottom: 8 }}>{s.n}</div>
            <div style={{ fontSize: 19, fontWeight: 500, marginBottom: 10, letterSpacing: '-0.015em', color: reached ? 'var(--fg)' : 'var(--fg-dim)', transition: 'color 800ms' }}>{s.t}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.55, maxWidth: 240, margin: '0 auto' }}>{s.d}</div>
          </div>
        );
      })}
    </div>
  );
}

// COMPARISON — two flows side by side
function ComparisonFlow() {
  return (
    <section style={{ padding: '120px 24px', background: 'var(--bg-1)', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 80, maxWidth: 720 }}>
          <span style={{ fontSize: 12, color: 'var(--acid)', letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase' }}>§ The Difference</span>
          <h2 style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', margin: '20px 0 0', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
            <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>What</span> the others won't do.
          </h2>
        </div>

        <div className="gg-resp-comparison" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--line-2)' }}>
          <ComparisonColumn
            kind="bad"
            label="Other launchpads"
            sublabel="pump.fun · Bags · Moonshot"
            steps={[
              { t: 'LP minted', desc: 'Pool created at graduation' },
              { t: 'LP → team wallet', desc: 'Transferred to deployer / multisig' },
              { t: 'Withdraw available', desc: 'removeLiquidity() callable any time', flag: true },
              { t: '⚠ Rug pull', desc: 'Single transaction. Wallet emptied. Holders left with nothing.', danger: true },
            ]}
            color="var(--red)"
          />
          <ComparisonColumn
            kind="good"
            label="GGLaunch"
            sublabel="The protocol you're reading about"
            steps={[
              { t: 'LP minted', desc: 'Pool created at graduation' },
              { t: 'LP → Vault PDA', desc: 'Transferred to deterministic contract' },
              { t: 'Withdraw nonexistent', desc: 'removeLiquidity() does not exist in program' },
              { t: '∞ Permanent liquidity', desc: 'Fees compound back. Holders earn forever.', good: true },
            ]}
            color="var(--acid)"
            highlight
          />
        </div>
      </div>
    </section>
  );
}

function ComparisonColumn({ label, sublabel, steps, color, highlight, kind }) {
  const [pulseStep, setPulseStep] = useState(-1);

  // Periodically light up the final step
  useEffect(() => {
    let cancelled = false;
    const seq = async () => {
      for (let i = 0; i < steps.length; i++) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 700));
        setPulseStep(i);
      }
      await new Promise(r => setTimeout(r, 2400));
      if (cancelled) return;
      setPulseStep(-1);
      await new Promise(r => setTimeout(r, 800));
    };
    seq();
    const id = setInterval(seq, 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, [steps.length]);

  return (
    <div style={{ padding: 40, background: highlight ? 'rgba(107,163,255,0.03)' : 'transparent', borderRight: '1px solid var(--line-2)', position: 'relative' }}>
      {/* HEADER VISUAL — large vault with state-specific animation */}
      <div className="gg-comparison-vault-wrap" style={{ height: 200, marginBottom: 32, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 32 }}>
        {kind === 'bad' ? (
          <BadVaultVisual active={pulseStep === steps.length - 1} />
        ) : (
          <GoodVaultVisual active={pulseStep === steps.length - 1} />
        )}
      </div>
      
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Vault size={20} state={highlight ? 'sealed' : 'open'} fillPct={highlight ? 100 : 60} animate={false} glow={false} />
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{label}</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-dim)', marginLeft: 30 }}>{sublabel}</div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 1, background: 'var(--line-2)' }} />
        
        {steps.map((s, i) => {
          const reached = pulseStep >= i;
          return (
            <div key={i} style={{ position: 'relative', paddingLeft: 36, paddingBottom: i === steps.length - 1 ? 0 : 28 }}>
              <div style={{
                position: 'absolute', left: 4, top: 4,
                width: 16, height: 16,
                border: `1px solid ${reached ? (s.danger ? 'var(--red)' : s.good ? 'var(--acid)' : 'var(--fg-dim)') : 'var(--line-2)'}`,
                background: reached ? (s.danger ? 'rgba(255,107,138,0.15)' : s.good ? 'rgba(107,163,255,0.15)' : 'var(--bg)') : 'var(--bg)',
                display: 'grid', placeItems: 'center',
                transition: 'all 400ms',
                ...(pulseStep === i ? { boxShadow: `0 0 0 4px ${s.danger ? 'rgba(255,107,138,0.15)' : s.good ? 'rgba(107,163,255,0.15)' : 'transparent'}` } : {}),
              }}>
                <div style={{ width: 6, height: 6, background: reached ? (s.danger ? 'var(--red)' : s.good ? 'var(--acid)' : 'var(--fg-dim)') : 'var(--fg-mute)', transition: 'all 400ms' }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: reached ? (s.danger ? 'var(--red)' : s.good ? 'var(--acid)' : 'var(--fg)') : 'var(--fg-dim)', marginBottom: 4, transition: 'color 400ms' }}>{s.t}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bad path: vault that drains/cracks at the rug pull moment
function BadVaultVisual({ active }) {
  return (
    <div style={{ position: 'relative', width: 200, height: 180 }}>
      {/* ambient glow */}
      <div style={{ position: 'absolute', inset: 0, background: active ? 'radial-gradient(circle, rgba(255,107,138,0.15) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(255,107,138,0.06) 0%, transparent 60%)', filter: 'blur(30px)', transition: 'background 800ms' }} />
      
      {/* leaking particles when active */}
      {active && Array.from({ length: 8 }).map((_, i) => (
        <div key={`leak-${i}`} className="gg-particle-fall" style={{
          position: 'absolute',
          left: `${40 + (i * 18) % 120}px`,
          top: '90px',
          background: 'var(--red)',
          boxShadow: '0 0 6px var(--red), 0 0 10px #ff6b8a88',
          animationDelay: `${i * 0.15}s`,
          animationDuration: '1.4s',
        }} />
      ))}
      
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          {/* the vault — drains when active */}
          <div style={{ animation: active ? 'glitchOnce 600ms steps(2) 1' : 'none' }}>
            <Vault size={130} state="open" fillPct={active ? 5 : 75} animate={true} glow={true} />
          </div>
          {/* "RUG" indicator when active */}
          {active && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              fontSize: 11, color: 'var(--red)', fontWeight: 600, letterSpacing: '0.1em',
              padding: '4px 10px', border: '1px solid var(--red)',
              background: 'rgba(7,10,18,0.9)',
              animation: 'fadeIn 300ms ease 200ms both',
              fontFamily: 'var(--mono)',
            }}>
              DRAINED
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Good path: vault sealed with orbiting fees
function GoodVaultVisual({ active }) {
  return (
    <div style={{ position: 'relative', width: 200, height: 180 }}>
      {/* ambient glow — brighter when active */}
      <div style={{ position: 'absolute', inset: 0, background: active ? 'radial-gradient(circle, rgba(107,163,255,0.20) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(107,163,255,0.06) 0%, transparent 60%)', filter: 'blur(30px)', transition: 'background 800ms' }} />
      
      {/* orbital fee particles when active */}
      {active && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`orb-${i}`} className="gg-particle-orbit-sm" style={{
              background: 'var(--acid)',
              boxShadow: '0 0 6px var(--acid), 0 0 12px #6ba3ffaa',
              animationDelay: `${i * 1.25}s`,
            }} />
          ))}
        </div>
      )}
      
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Vault size={130} state="sealed" fillPct={100} animate={true} breathe={active} glow={true} />
      </div>
      
      {/* "SEALED" indicator when active */}
      {active && (
        <div style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, color: 'var(--acid)', fontWeight: 600, letterSpacing: '0.1em',
          padding: '4px 10px', border: '1px solid var(--acid-d)',
          background: 'rgba(7,10,18,0.9)',
          animation: 'fadeIn 300ms ease 200ms both',
          fontFamily: 'var(--mono)',
        }}>
          ∞ SEALED
        </div>
      )}
    </div>
  );
}

// MANIFESTO
function Manifesto() {
  return (
    <section style={{ padding: '180px 24px', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
      {/* atmospheric backdrop */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(159,122,234,0.05) 0%, transparent 65%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      
      {/* faint vault watermark behind everything */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.025, pointerEvents: 'none' }}>
        <Vault size={680} state="sealed" fillPct={100} animate={false} glow={false} />
      </div>
      
      <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
        {/* eyebrow */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 12, color: 'var(--acid)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>§ A word from the builders</span>
        </div>

        {/* PULL QUOTE — line-by-line reveal */}
        <ManifestoQuote />

        {/* THREE MOVEMENTS */}
        <div style={{ marginTop: 96, maxWidth: 640, margin: '96px auto 0', position: 'relative' }}>
          <ManifestoMovement
            n="01"
            lead="An entire industry built on a quiet cruelty."
            body="A founder launches a token. The community buys. The price climbs. Then, in a single transaction rehearsed long before launch, the liquidity is pulled — and the wallets that trusted him are left holding nothing."
            delay={0}
          />
          <ManifestoMovement
            n="02"
            lead="We do not accept this as the cost of innovation."
            body="The strong are not entitled to take from the weak. A system that permits it is broken at the root."
            emphasized
            delay={120}
          />
          <ManifestoMovement
            n="03"
            lead="GGLaunch is our answer."
            body={
              <>A launchpad with the rug pull surgically <span style={{ color: 'var(--fg)', fontWeight: 500 }}>removed</span>. Not promised away. Not deferred to a multisig. The contract that holds the liquidity has no door. There is no key, because there is no lock, because there is no exit. We wrote it that way on purpose.</>
            }
            delay={240}
          />
        </div>

        {/* CLOSING — minimal, weighty */}
        <ManifestoClosing />

        <div style={{ marginTop: 64, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 1, background: 'var(--line-2)' }} />
          <span style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>The GGLaunch team</span>
          <div style={{ width: 32, height: 1, background: 'var(--line-2)' }} />
        </div>
      </div>
    </section>
  );
}

function ManifestoQuote() {
  const lines = [
    '"We were tired of watching ordinary people',
    'lose what they could not afford to lose."',
  ];
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) { setVisible(true); observer.unobserve(e.target); } });
      },
      { threshold: 0.4 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref} className="serif" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', lineHeight: 1.28, color: 'var(--fg)', textAlign: 'center', fontStyle: 'italic', letterSpacing: '-0.015em', fontWeight: 400 }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: `opacity 1100ms cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 320}ms, transform 1100ms cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 320}ms`,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

function ManifestoMovement({ n, lead, body, emphasized, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) { setVisible(true); observer.unobserve(e.target); } });
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div 
      ref={ref}
      style={{
        marginBottom: 56,
        position: 'relative',
        paddingLeft: 64,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 900ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
      }}>
      {/* number ornament + breathing dot */}
      <div style={{ position: 'absolute', left: 0, top: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--fg-mute)', fontFamily: 'var(--mono)', letterSpacing: '0.08em', fontWeight: 500 }}>{n}</span>
        <div style={{ width: 1, height: 32, background: 'linear-gradient(180deg, var(--line-2) 0%, transparent 100%)' }} />
      </div>
      
      {/* lead line — like a heading inside the prose */}
      <div style={{ 
        fontSize: 22, 
        fontWeight: 500, 
        color: emphasized ? 'var(--fg)' : 'var(--fg)',
        letterSpacing: '-0.02em', 
        lineHeight: 1.3, 
        marginBottom: 14,
      }}>
        {lead}
      </div>
      
      {/* body */}
      <div style={{ 
        fontSize: 16, 
        lineHeight: 1.65, 
        color: 'var(--fg-dim)',
        maxWidth: 580,
      }}>
        {body}
      </div>
    </div>
  );
}

function ManifestoClosing() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) { setVisible(true); observer.unobserve(e.target); } });
      },
      { threshold: 0.4 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div 
      ref={ref}
      style={{
        marginTop: 64,
        paddingTop: 48,
        borderTop: '1px solid var(--line)',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 1200ms cubic-bezier(0.2, 0.8, 0.2, 1) 200ms, transform 1200ms cubic-bezier(0.2, 0.8, 0.2, 1) 200ms',
      }}>
      <div className="serif" style={{ fontSize: 'clamp(22px, 2.6vw, 30px)', lineHeight: 1.4, color: 'var(--fg)', fontStyle: 'italic', letterSpacing: '-0.01em', maxWidth: 720, margin: '0 auto' }}>
        This is not a product. It is a stand.
      </div>
      <div style={{ fontSize: 16, color: 'var(--fg-dim)', marginTop: 20, lineHeight: 1.6, maxWidth: 580, margin: '20px auto 0' }}>
        We are building the place where people are protected by the math itself — where a man's word is kept by the chain because no man can break it.
      </div>
    </div>
  );
}

function FinalCTA({ navigate }) {
  return (
    <section style={{ padding: '140px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.08, pointerEvents: 'none' }}>
        <Vault size={420} state="sealed" fillPct={100} animate={false} />
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
        <h2 style={{ fontSize: 'clamp(40px, 6vw, 80px)', margin: 0, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1 }}>
          Build something <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--purple-l)' }}>worth keeping.</span>
        </h2>
        <p style={{ marginTop: 24, fontSize: 17, color: 'var(--fg-dim)', maxWidth: 540, margin: '24px auto 0', lineHeight: 1.55 }}>
          Launch a token your community can hold without flinching. The promise is in the contract.
        </p>
        <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('launch')} className="gg-btn gg-btn-primary" style={{ padding: '14px 28px', fontSize: 14 }}>
            Launch Now <ArrowUpRight size={15} />
          </button>
          <button onClick={() => navigate('docs')} className="gg-btn" style={{ padding: '14px 28px', fontSize: 14 }}>
            Read the Spec
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// DISCOVER
// ============================================================================

function DiscoverPage({ navigate, tokens }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('mcap');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let t = [...tokens];
    if (filter === 'sealed') t = t.filter(x => x.graduated);
    if (filter === 'curve') t = t.filter(x => !x.graduated);
    if (search) t = t.filter(x => x.name.toLowerCase().includes(search.toLowerCase()) || x.symbol.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'mcap') t.sort((a, b) => b.mcap - a.mcap);
    if (sort === 'change') t.sort((a, b) => b.change24h - a.change24h);
    if (sort === 'volume') t.sort((a, b) => b.volume24h - a.volume24h);
    return t;
  }, [tokens, filter, sort, search]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '64px 24px 120px' }} className="gg-fade-in">
      <div style={{ marginBottom: 48 }}>
        <span style={{ fontSize: 12, color: 'var(--acid)', letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase' }}>Markets</span>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 56px)', margin: '14px 0 0', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
          Every project. <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--fg-dim)' }}>Every promise kept.</span>
        </h1>
      </div>

      {/* filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--fg-mute)' }} />
          <input className="gg-input" placeholder="Search tokens…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
        </div>
        <div style={{ display: 'flex', border: '1px solid var(--line-2)' }}>
          {[['all','All'],['sealed','Sealed'],['curve','On Curve']].map(([f, l]) => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? 'var(--bg-2)' : 'transparent', border: 'none', color: filter === f ? 'var(--fg)' : 'var(--fg-dim)', padding: '12px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 500, borderRight: f === 'curve' ? 'none' : '1px solid var(--line-2)' }}>
              {l}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: 'var(--bg-1)', border: '1px solid var(--line-2)', color: 'var(--fg)', padding: '12px 14px', fontSize: 13, fontFamily: 'var(--sans)', fontWeight: 500 }}>
          <option value="mcap">Sort: Market Cap</option>
          <option value="change">Sort: 24h Change</option>
          <option value="volume">Sort: Volume</option>
        </select>
      </div>

      {/* table */}
      <div className="gg-card" style={{ overflow: 'hidden' }}>
        <div className="gg-resp-discover-table-head" style={{ display: 'grid', gridTemplateColumns: '40px 60px 2fr 1fr 1fr 1fr 1fr 140px', padding: '14px 20px', borderBottom: '1px solid var(--line-2)', background: 'linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%)', boxShadow: 'var(--hairline-top)' }}>
          <div className="gg-resp-discover-hide-mobile" style={{ fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>#</div>
          <div style={{ fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}></div>
          <div style={{ fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Token</div>
          <div className="gg-resp-discover-hide-mobile" style={{ fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Price</div>
          <div style={{ fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>24h</div>
          <div className="gg-resp-discover-hide-mobile" style={{ fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Market Cap</div>
          <div className="gg-resp-discover-hide-mobile" style={{ fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Volume 24h</div>
          <div className="gg-resp-discover-hide-mobile" style={{ fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Vault</div>
        </div>
        {filtered.map((t, i) => {
          const up = t.change24h >= 0;
          return (
            <button key={t.id} onClick={() => navigate('token', t.id)} className="gg-resp-discover-table-row" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '40px 60px 2fr 1fr 1fr 1fr 1fr 140px', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'transparent', border: 'none', borderBottomColor: 'var(--line)', borderBottomStyle: 'solid', borderBottomWidth: 1, width: '100%', textAlign: 'left', cursor: 'pointer', alignItems: 'center', color: 'var(--fg)', transition: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)', fontFamily: 'var(--sans)' }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = 'linear-gradient(90deg, rgba(107,163,255,0.04) 0%, transparent 100%)';
                const indicator = e.currentTarget.querySelector('[data-indicator]');
                if (indicator) indicator.style.transform = 'scaleY(1)';
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = 'transparent';
                const indicator = e.currentTarget.querySelector('[data-indicator]');
                if (indicator) indicator.style.transform = 'scaleY(0)';
              }}>
              {/* sliding left edge indicator */}
              <div data-indicator style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--acid)', boxShadow: '0 0 8px var(--acid)', transform: 'scaleY(0)', transformOrigin: 'center', transition: 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
              <div className="mono gg-resp-discover-hide-mobile" style={{ fontSize: 12, color: 'var(--fg-mute)' }}>{String(i + 1).padStart(2, '0')}</div>
              <div><Vault size={36} state={t.graduated ? 'sealed' : 'open'} fillPct={t.graduated ? 100 : t.progress} animate={false} glow={false} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div className="gg-token-thumb" style={{ width: 36, height: 36, fontSize: 18, flexShrink: 0 }}>{t.image}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.symbol}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                  {/* Mobile-only inline data */}
                  <div className="gg-resp-discover-mobile-block" style={{ display: 'none' }}>
                    ${fmt(t.mcap, 1)} mcap{t.graduated ? ` · SEALED ${fmt(t.lpLocked, 0)} SOL` : ` · ${t.progress}%`}
                  </div>
                </div>
              </div>
              <div className="num gg-resp-discover-hide-mobile" style={{ fontSize: 13, fontWeight: 500 }}>${fmtPrice(t.price)}</div>
              <div className="num" style={{ fontSize: 13, color: up ? 'var(--green)' : 'var(--red)', fontWeight: 500, textAlign: 'right' }}>{up ? '↑' : '↓'} {Math.abs(t.change24h).toFixed(1)}%</div>
              <div className="num gg-resp-discover-hide-mobile" style={{ fontSize: 13, fontWeight: 500 }}>${fmt(t.mcap, 1)}</div>
              <div className="num gg-resp-discover-hide-mobile" style={{ fontSize: 13, color: 'var(--fg-dim)' }}>${fmt(t.volume24h, 1)}</div>
              <div className="gg-resp-discover-hide-mobile">
                {t.graduated ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="gg-led" style={{ color: 'var(--acid)', width: 5, height: 5 }} />
                    <span style={{ fontSize: 11, color: 'var(--acid)', fontWeight: 600, letterSpacing: '0.04em', fontFamily: 'var(--mono)' }}>SEALED · {fmt(t.lpLocked, 0)} SOL</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--bg-2)', position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, width: `${t.progress}%`, background: 'var(--amber)' }} />
                    </div>
                    <span className="num" style={{ fontSize: 11, color: 'var(--amber)' }}>{t.progress}%</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TOKEN DETAIL — vault inspector
// ============================================================================

function TokenPage({ token, navigate, walletConnected, connectWallet, solBalance, setSolBalance, holdings, setHoldings, stakedPositions, setStakedPositions, showToast }) {
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const series = useMemo(() => genSeries(token.id.charCodeAt(0) * 13, 120, token.price, 0.04, token.change24h > 0 ? 0.003 : -0.002), [token.id]);
  const up = token.change24h >= 0;
  const userHolding = holdings[token.id] || 0;
  const [feesLive, setFeesLive] = useState(token.feesAccrued || 0);

  useEffect(() => {
    if (!token.graduated) return;
    const id = setInterval(() => setFeesLive(f => f + Math.random() * 4), 1000);
    return () => clearInterval(id);
  }, [token.graduated]);

  const estTokens = side === 'buy' && amount ? (parseFloat(amount) / token.price) : 0;
  const estSol = side === 'sell' && amount ? (parseFloat(amount) * token.price) : 0;

  const execute = () => {
    if (!walletConnected) { connectWallet(); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    if (side === 'buy') {
      if (amt > solBalance) { showToast('Insufficient SOL', 'error'); return; }
      setSolBalance(s => s - amt);
      setHoldings(h => ({ ...h, [token.id]: (h[token.id] || 0) + amt / token.price }));
      showToast(`Bought ${fmt(amt / token.price, 0)} ${token.symbol}`);
    } else {
      if (amt > userHolding) { showToast('Insufficient balance', 'error'); return; }
      setSolBalance(s => s + amt * token.price);
      setHoldings(h => ({ ...h, [token.id]: h[token.id] - amt }));
      showToast(`Sold ${fmt(amt, 0)} ${token.symbol}`);
    }
    setAmount('');
  };

  const stake = () => {
    if (!walletConnected) { connectWallet(); return; }
    if (stakedPositions.find(p => p.tokenId === token.id)) { showToast('Already staked', 'error'); return; }
    const baseValue = userHolding * token.price;
    if (baseValue < 0.1) { showToast('Need to hold tokens to stake', 'error'); return; }
    setStakedPositions(p => [...p, { tokenId: token.id, gLPAmount: baseValue * 280, baseValue, currentValue: baseValue, apr: token.change24h > 0 ? token.change24h : 42, fees24h: baseValue * 0.001 }]);
    showToast(`Staked ${fmt(baseValue * 280, 0)} gLP-${token.symbol}`);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 120px' }} className="gg-fade-in">
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13 }}>
        <button onClick={() => navigate('discover')} style={{ background: 'none', border: 'none', color: 'var(--fg-dim)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500 }}>Markets</button>
        <span style={{ color: 'var(--fg-mute)' }}>/</span>
        <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{token.symbol}</span>
      </div>

      {/* header */}
      <div className="gg-token-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div className="gg-token-thumb" style={{ width: 96, height: 96, fontSize: 46 }}>{token.image}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', margin: 0, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05 }}>{token.name}</h1>
              <span className="mono" style={{ fontSize: 14, color: 'var(--fg-dim)' }}>${token.symbol}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 13, color: 'var(--fg-dim)', flexWrap: 'wrap' }}>
              <span>Created by <span className="mono">{token.creator}</span></span>
              <span style={{ color: 'var(--fg-mute)' }}>·</span>
              <span>{token.graduated ? `Sealed ${token.sealedAt}` : 'On bonding curve'}</span>
              <button style={{ background: 'none', border: 'none', color: 'var(--fg-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'var(--sans)' }}>
                <Copy size={11} /> Contract
              </button>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1 }}>${fmtPrice(token.price)}</div>
          <div className="num" style={{ fontSize: 14, color: up ? 'var(--green)' : 'var(--red)', marginTop: 8 }}>
            {up ? '+' : ''}{token.change24h.toFixed(2)}% · 24h
          </div>
        </div>
      </div>

      {/* THE INSPECTOR — main 2-col layout */}
      <div className="gg-resp-token-detail" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* VAULT INSPECTOR */}
          <VaultInspector token={token} feesLive={feesLive} />

          {/* CHART */}
          <div className="gg-card">
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} color="var(--acid)" />
              <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Price Chart</span>
              <div style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', marginLeft: 'auto' }} className="gg-pulse" />
              <span style={{ fontSize: 11, color: 'var(--fg-dim)', fontWeight: 500, letterSpacing: '0.05em' }}>LIVE</span>
            </div>
            <div style={{ padding: 20, height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="ch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={up ? '#6ba3ff' : '#ff6b8a'} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={up ? '#6ba3ff' : '#ff6b8a'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#45506b', fontFamily: 'JetBrains Mono' }} stroke="#161d33" />
                  <YAxis tick={{ fontSize: 10, fill: '#45506b', fontFamily: 'JetBrains Mono' }} stroke="#161d33" tickFormatter={v => fmtPrice(v)} width={70} />
                  <Tooltip contentStyle={{ background: '#06080f', border: '1px solid #202840', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                  <Area type="monotone" dataKey="v" stroke={up ? '#6ba3ff' : '#ff6b8a'} strokeWidth={2} fill="url(#ch)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT TRADES */}
          <div className="gg-card">
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Recent Trades</span>
            </div>
            <RecentTrades token={token} />
          </div>
        </div>

        {/* TRADE PANEL */}
        <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="gg-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
              {/* sliding indicator */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: side === 'sell' ? '50%' : '0%',
                width: '50%',
                height: 2,
                background: side === 'buy' ? 'var(--acid)' : 'var(--red)',
                boxShadow: side === 'buy' ? '0 0 12px var(--acid)' : '0 0 12px var(--red)',
                transition: 'all 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                zIndex: 1,
              }} />
              <button onClick={() => setSide('buy')} style={{ 
                padding: '18px 16px', 
                background: side === 'buy' ? 'linear-gradient(180deg, rgba(107,163,255,0.12) 0%, rgba(107,163,255,0.04) 100%)' : 'transparent', 
                color: side === 'buy' ? 'var(--acid-l)' : 'var(--fg-dim)', 
                border: 'none', cursor: 'pointer', 
                fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em', 
                fontFamily: 'var(--sans)',
                transition: 'all 240ms',
                borderBottom: '1px solid var(--line)',
              }}>Buy</button>
              <button onClick={() => setSide('sell')} style={{ 
                padding: '18px 16px', 
                background: side === 'sell' ? 'linear-gradient(180deg, rgba(255,107,138,0.12) 0%, rgba(255,107,138,0.04) 100%)' : 'transparent', 
                color: side === 'sell' ? 'var(--red)' : 'var(--fg-dim)', 
                border: 'none', cursor: 'pointer', 
                fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em', 
                fontFamily: 'var(--sans)',
                transition: 'all 240ms',
                borderBottom: '1px solid var(--line)',
              }}>Sell</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 8 }}>
                {side === 'buy' ? `Amount (SOL) · Bal: ${solBalance.toFixed(2)}` : `Amount (${token.symbol}) · Bal: ${fmt(userHolding, 0)}`}
              </div>
              <input className="gg-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={{ fontSize: 18, padding: 16 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 12 }}>
                {[0.25, 0.5, 0.75, 1].map(p => (
                  <button key={p} onClick={() => {
                    const max = side === 'buy' ? solBalance : userHolding;
                    setAmount((max * p).toFixed(side === 'buy' ? 4 : 0));
                  }} style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', color: 'var(--fg-dim)', padding: '8px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--mono)', fontWeight: 500 }}>
                    {p === 1 ? 'MAX' : `${p * 100}%`}
                  </button>
                ))}
              </div>
              {amount && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                  <Row k="You receive" v={side === 'buy' ? `${fmt(estTokens, 0)} ${token.symbol}` : `${fmt(estSol, 4)} SOL`} />
                  <Row k="Slippage" v="0.5%" dim />
                  <Row k="Network fee" v="~0.00005 SOL" dim />
                </div>
              )}
              <button onClick={execute} className={side === 'buy' ? 'gg-btn gg-btn-primary' : 'gg-btn gg-btn-danger'} style={{ width: '100%', justifyContent: 'center', padding: 16, marginTop: 16, fontSize: 14 }}>
                {!walletConnected ? 'Connect Wallet' : side === 'buy' ? `Buy ${token.symbol}` : `Sell ${token.symbol}`}
              </button>
            </div>
          </div>

          {token.graduated && userHolding > 0 && (
            <div className="gg-card" style={{ padding: 20, border: '1px solid var(--acid-d)', background: 'rgba(107,163,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Vault size={20} state="sealed" fillPct={100} animate={false} glow={false} />
                <span style={{ fontSize: 12, color: 'var(--acid)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Stake to Vault</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-dim)', marginBottom: 14, lineHeight: 1.55 }}>
                Convert your {token.symbol} to gLP-{token.symbol}. Earn auto-compounding fees from the locked pool.
              </div>
              <Row k="Estimated APR" v={`${(token.change24h > 0 ? token.change24h : 42).toFixed(1)}%`} highlight />
              <button onClick={stake} className="gg-btn gg-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 14 }}>
                Stake to Vault
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, dim, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', fontFamily: 'var(--mono)' }}>
      <span style={{ color: 'var(--fg-dim)' }}>{k}</span>
      <span style={{ color: dim ? 'var(--fg-dim)' : highlight ? 'var(--acid)' : 'var(--fg)' }}>{v}</span>
    </div>
  );
}

// THE VAULT INSPECTOR — the core of the token detail page
function VaultInspector({ token, feesLive }) {
  const sealed = token.graduated;
  const fillPct = sealed ? 100 : token.progress;
  const state = sealed ? 'sealed' : 'open';

  return (
    <div className="gg-card gg-magnetic" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      {/* atmospheric tint */}
      <div style={{ position: 'absolute', inset: 0, background: sealed 
        ? 'radial-gradient(ellipse at center, rgba(107,163,255,0.05) 0%, transparent 70%)'
        : 'radial-gradient(ellipse at center, rgba(251,191,36,0.04) 0%, transparent 70%)',
        pointerEvents: 'none' }} />
      
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
        <Vault size={22} state={state} fillPct={fillPct} animate={false} glow={false} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Vault Inspector</span>
        <span style={{ fontSize: 10, color: 'var(--fg-mute)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>v0.1</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={sealed ? 'gg-led' : 'gg-led gg-pulse'} style={{ color: sealed ? 'var(--acid)' : 'var(--amber)' }} />
          <span style={{ fontSize: 11, color: sealed ? 'var(--acid)' : 'var(--amber)', fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>
            {sealed ? 'SEALED' : 'ACCEPTING'}
          </span>
        </div>
      </div>

      <div className="gg-resp-inspector" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, position: 'relative' }}>
        {/* LEFT: visual */}
        <div style={{ padding: 32, borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, position: 'relative', overflow: 'hidden' }}>
          {/* ambient backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: sealed 
            ? 'radial-gradient(circle at center, rgba(107,163,255,0.10) 0%, transparent 60%)'
            : 'radial-gradient(circle at center, rgba(251,191,36,0.08) 0%, transparent 60%)',
            filter: 'blur(20px)', pointerEvents: 'none' }} />
          
          {/* fee particles when sealed */}
          {sealed && Array.from({ length: 4 }).map((_, i) => (
            <div key={`fp-${i}`} className="gg-particle-rise" style={{
              left: `${30 + (i * 60) % 200}px`,
              top: '240px',
              background: 'var(--acid)',
              boxShadow: '0 0 6px var(--acid), 0 0 10px #6ba3ff88',
              animationDelay: `${i * 0.9}s`,
              animationDuration: '4s',
              zIndex: 1,
            }} />
          ))}
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Vault size={200} state={state} fillPct={fillPct} animate={true} breathe={sealed} scanline={true} />
          </div>
          <div style={{ marginTop: 20, textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div className="num" style={{ fontSize: 28, fontWeight: 500, color: sealed ? 'var(--acid)' : 'var(--amber)', letterSpacing: '-0.02em' }}>
              {sealed ? `${fmt(token.lpLocked, 1)} SOL` : `${token.progress}%`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 4 }}>
              {sealed ? 'Permanently locked' : `to graduation`}
            </div>
          </div>
        </div>

        {/* RIGHT: data readout */}
        <div style={{ padding: 32, position: 'relative' }}>
          {sealed ? (
            <>
              <InspectorRow label="Vault PDA" value={`vault_${token.id}_pda...x9k2`} mono />
              <InspectorRow label="Sealed at" value={token.sealedAt} />
              <InspectorRow label="Locked SOL" value={`${fmt(token.lpLocked, 2)} SOL`} mono />
              <InspectorRow label="Locked tokens" value={`${fmt(token.mcap / token.price * 0.5, 0)} ${token.symbol}`} mono />
              <InspectorRow label="Withdraw fn exists" value={<><X size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--red)' }} />NEVER</>} />
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
                <InspectorRow label="Fees accrued" value={<span className="gg-pulse">${fmt(feesLive, 0)}</span>} mono accent />
                <InspectorRow label="gLP supply" value={`${fmt(token.lpLocked * 280, 0)} gLP-${token.symbol}`} mono />
                <InspectorRow label="Backing per gLP" value={`${(token.lpLocked / (token.lpLocked * 280)).toFixed(6)} SOL`} mono />
              </div>
            </>
          ) : (
            <>
              <InspectorRow label="Curve formula" value="y = 0.000001 · (s + 1)^1.6" mono />
              <InspectorRow label="Current mcap" value={`$${fmt(token.mcap, 0)}`} mono />
              <InspectorRow label="Graduation at" value="$69,000" mono />
              <InspectorRow label="Reserves" value={`${(token.mcap / 165).toFixed(2)} SOL`} mono />
              <InspectorRow label="Holders" value={fmt(token.holders, 0)} mono />
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pre-Graduation</div>
                <div style={{ height: 8, background: 'var(--bg-2)', position: 'relative', marginBottom: 8 }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${token.progress}%`, background: 'linear-gradient(90deg, var(--amber), var(--purple))' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-dim)' }}>
                  At graduation, the vault will atomically seal {((100 - token.progress) / 100 * 85).toFixed(1)} SOL more from incoming buys, then transfer LP to the Vault PDA. <span style={{ color: 'var(--acid)' }}>Withdraw will become impossible.</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InspectorRow({ label, value, mono, accent }) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '160px 1fr', 
      gap: 16, 
      padding: '10px 0', 
      fontSize: 13, 
      borderBottom: '1px dashed rgba(36,48,73,0.5)',
      transition: 'background 200ms',
    }}>
      <div style={{ color: 'var(--fg-mute)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, alignSelf: 'center' }}>{label}</div>
      <div style={{ color: accent ? 'var(--acid)' : 'var(--fg)', fontFamily: mono ? 'var(--mono)' : 'var(--sans)', fontWeight: mono ? 400 : 500, wordBreak: 'break-word', fontSize: 13, textAlign: 'right' }}>{value}</div>
    </div>
  );
}

function RecentTrades({ token }) {
  const [trades, setTrades] = useState(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      const buy = Math.random() > 0.4;
      arr.push({
        id: i,
        side: buy ? 'buy' : 'sell',
        amount: Math.random() * 5 + 0.1,
        price: token.price * (1 + (Math.random() - 0.5) * 0.02),
        addr: Math.random().toString(36).slice(2, 5).toUpperCase() + '…' + Math.random().toString(36).slice(2, 5),
        time: `${Math.floor(Math.random() * 60)}s ago`
      });
    }
    return arr;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setTrades(t => [{
        id: Date.now(),
        side: Math.random() > 0.4 ? 'buy' : 'sell',
        amount: Math.random() * 5 + 0.1,
        price: token.price * (1 + (Math.random() - 0.5) * 0.02),
        addr: Math.random().toString(36).slice(2, 5).toUpperCase() + '…' + Math.random().toString(36).slice(2, 5),
        time: 'just now'
      }, ...t.slice(0, 9)]);
    }, 3000);
    return () => clearInterval(id);
  }, [token.price]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 80px', padding: '10px 20px', fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
        <div>Side</div><div>Amount</div><div>Price</div><div>Wallet</div><div>Time</div>
      </div>
      {trades.map(t => (
        <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 80px', padding: '10px 20px', fontSize: 12, borderTop: '1px solid var(--line)', fontFamily: 'var(--mono)' }}>
          <div style={{ color: t.side === 'buy' ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase', fontSize: 11, fontWeight: 600 }}>{t.side}</div>
          <div className="num">{t.amount.toFixed(2)} SOL</div>
          <div className="num">${fmtPrice(t.price)}</div>
          <div style={{ color: 'var(--fg-dim)' }}>{t.addr}</div>
          <div style={{ color: 'var(--fg-mute)' }}>{t.time}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// STAKE
// ============================================================================

function StakePage({ navigate, positions, tokens, walletConnected, connectWallet, showToast, setStakedPositions, setSolBalance }) {
  const totalStaked = positions.reduce((s, p) => s + p.currentValue, 0);
  const totalFees24h = positions.reduce((s, p) => s + p.fees24h, 0);
  const avgApr = positions.length ? positions.reduce((s, p) => s + p.apr, 0) / positions.length : 0;

  useEffect(() => {
    const id = setInterval(() => {
      setStakedPositions(ps => ps.map(p => ({
        ...p,
        currentValue: p.currentValue * (1 + p.apr / 100 / 365 / 24 / 60 / 30),
        fees24h: p.fees24h * (1 + Math.random() * 0.001),
      })));
    }, 1000);
    return () => clearInterval(id);
  }, [setStakedPositions]);

  const claim = (tokenId) => {
    const pos = positions.find(p => p.tokenId === tokenId);
    if (!pos) return;
    setSolBalance(s => s + pos.fees24h);
    showToast(`Claimed ${pos.fees24h.toFixed(4)} SOL`);
  };

  const unstake = (tokenId) => {
    const pos = positions.find(p => p.tokenId === tokenId);
    if (!pos) return;
    setSolBalance(s => s + pos.currentValue * 0.97);
    setStakedPositions(ps => ps.filter(p => p.tokenId !== tokenId));
    showToast(`Sold gLP for ${(pos.currentValue * 0.97).toFixed(3)} SOL`);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '64px 24px 120px' }} className="gg-fade-in">
      <div style={{ marginBottom: 48 }}>
        <span style={{ fontSize: 12, color: 'var(--acid)', letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase' }}>Your Positions</span>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 56px)', margin: '14px 0 0', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
          What you held. <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--fg-dim)' }}>What it grew into.</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--fg-dim)', maxWidth: 640, marginTop: 16, lineHeight: 1.55 }}>
          Your share of sealed liquidity. Trading fees compound back into the pool every block. Exit by selling gLP — the underlying never leaves the vault.
        </p>
      </div>

      {!walletConnected && (
        <div className="gg-card" style={{ padding: 80, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Vault size={80} state="sealed" fillPct={60} animate={false} />
          </div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Connect your wallet to view positions</div>
          <div style={{ fontSize: 13, color: 'var(--fg-dim)', marginBottom: 28 }}>Your gLP holdings will appear here</div>
          <button onClick={connectWallet} className="gg-btn gg-btn-primary"><Wallet size={14} /> Connect Wallet</button>
        </div>
      )}

      {walletConnected && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, border: '1px solid var(--line-2)', marginBottom: 32 }}>
            <PortfolioStat label="Total value staked" value={`◆ ${fmt(totalStaked, 3)}`} />
            <PortfolioStat label="24h fees" value={`+◆ ${fmt(totalFees24h, 4)}`} accent />
            <PortfolioStat label="Avg APR" value={`${avgApr.toFixed(1)}%`} />
            <PortfolioStat label="Active positions" value={positions.length} />
          </div>

          {positions.length === 0 ? (
            <div className="gg-card" style={{ padding: 64, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--fg-dim)', marginBottom: 16 }}>No active positions</div>
              <button onClick={() => navigate('discover')} className="gg-btn">Browse Vaults <ChevronRight size={14} /></button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {positions.map(pos => {
                const token = tokens.find(t => t.id === pos.tokenId);
                if (!token) return null;
                const pnl = ((pos.currentValue - pos.baseValue) / pos.baseValue) * 100;
                return (
                  <div key={pos.tokenId} className="gg-card gg-magnetic gg-resp-stake-position" style={{ padding: 0, display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 0, alignItems: 'stretch', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--line)', padding: 24, position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(107,163,255,0.10) 0%, transparent 65%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
                      <div style={{ position: 'relative' }}>
                        <Vault size={88} state="sealed" fillPct={100} animate={true} breathe={true} />
                      </div>
                    </div>
                    <div className="gg-resp-stake-metrics" style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>gLP-{token.symbol}</div>
                        <div className="mono" style={{ fontSize: 12, color: 'var(--fg-dim)' }}>{fmt(pos.gLPAmount, 0)} gLP</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 4 }}>Value</div>
                        <div className="num" style={{ fontSize: 16, fontWeight: 500 }}>◆ {pos.currentValue.toFixed(3)}</div>
                        <div className="num" style={{ fontSize: 12, color: pnl >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 4 }}>APR</div>
                        <div className="num" style={{ fontSize: 16, fontWeight: 500, color: 'var(--acid)' }}>{pos.apr.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 4 }}>Pending fees</div>
                        <div className="num" style={{ fontSize: 16, fontWeight: 500, color: 'var(--acid)' }}>+◆ {pos.fees24h.toFixed(4)}</div>
                      </div>
                    </div>
                    <div className="gg-resp-stake-actions" style={{ display: 'flex', flexDirection: 'column', gap: 1, borderLeft: '1px solid var(--line)' }}>
                      <button onClick={() => claim(pos.tokenId)} className="gg-btn" style={{ border: 'none', borderBottom: '1px solid var(--line)', flex: 1, padding: '14px 24px' }}>Claim</button>
                      <button onClick={() => unstake(pos.tokenId)} className="gg-btn" style={{ border: 'none', flex: 1, padding: '14px 24px' }}>Sell gLP</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PortfolioStat({ label, value, accent }) {
  return (
    <div style={{ padding: '28px 24px', borderRight: '1px solid var(--line-2)', background: accent ? 'rgba(107,163,255,0.04)' : 'var(--bg-1)' }}>
      <div style={{ fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 12 }}>{label}</div>
      <div className="num" style={{ fontSize: 28, fontWeight: 500, color: accent ? 'var(--acid)' : 'var(--fg)', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

// ============================================================================
// LAUNCH
// ============================================================================

function LaunchPage({ navigate, walletConnected, connectWallet, setTokens, showToast, setSolBalance, solBalance }) {
  const [form, setForm] = useState({ name: '', symbol: '', image: '🚀', desc: '', initialBuy: '0.5' });
  const [launching, setLaunching] = useState(false);
  const emojis = ['🚀','🐕','🐸','💪','🌙','🔥','🗿','💎'];

  const launch = () => {
    if (!walletConnected) { connectWallet(); return; }
    setLaunching(true);
    setTimeout(() => {
      const fee = 0.02 + parseFloat(form.initialBuy);
      if (fee > solBalance) { showToast('Insufficient SOL', 'error'); setLaunching(false); return; }
      setSolBalance(s => s - fee);
      const newToken = {
        id: form.symbol.toLowerCase() + Date.now(),
        symbol: form.symbol.toUpperCase(),
        name: form.name,
        creator: 'GG1aunch7xK...3mQ',
        mcap: 1200,
        price: 0.0000012,
        change24h: 0,
        volume24h: parseFloat(form.initialBuy) || 0,
        holders: 1,
        graduated: false,
        lpLocked: 0,
        feesAccrued: 0,
        sealedAt: null,
        progress: 1,
        image: form.image,
        desc: form.desc,
      };
      setTokens(t => [newToken, ...t]);
      showToast(`${form.symbol.toUpperCase()} launched`);
      setLaunching(false);
      navigate('token', newToken.id);
    }, 2600);
  };

  const valid = form.name.length > 0 && form.symbol.length > 0 && form.desc.length > 0;

  return (
    <>
    {launching && <DeploymentOverlay symbol={form.symbol || 'TOKEN'} />}
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 120px' }} className="gg-fade-in">
      <div style={{ marginBottom: 48 }}>
        <span style={{ fontSize: 12, color: 'var(--acid)', letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase' }}>New Token</span>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 56px)', margin: '14px 0 0', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
          Build it. <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--fg-dim)' }}>Then let it stand.</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--fg-dim)', marginTop: 16, lineHeight: 1.6 }}>
          Your token launches on a bonding curve. At <span className="mono" style={{ color: 'var(--fg)' }}>$69K</span> mcap, the vault seals. No allowlist. No team allocation. No way back.
        </p>
      </div>

      <div className="gg-card">
        <div style={{ padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <Label>Token icon</Label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {emojis.map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, image: e }))} style={{ width: 48, height: 48, background: form.image === e ? 'var(--bg-3)' : 'var(--bg)', border: form.image === e ? '1px solid var(--acid)' : '1px solid var(--line-2)', fontSize: 24, cursor: 'pointer', transition: 'all 120ms' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <Label>Name</Label>
              <input className="gg-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Memecoin" maxLength={32} />
            </div>
            <div>
              <Label>Ticker</Label>
              <input className="gg-input" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} placeholder="MEME" maxLength={8} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Label>Description</Label>
            <textarea className="gg-input" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="What's your memecoin about?" rows={3} maxLength={240} style={{ resize: 'vertical' }} />
            <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 4, textAlign: 'right', fontFamily: 'var(--mono)' }}>{form.desc.length}/240</div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Label>Initial buy (SOL) — optional</Label>
            <input className="gg-input" type="number" step="0.01" min="0" value={form.initialBuy} onChange={e => setForm(f => ({ ...f, initialBuy: e.target.value }))} />
            <div style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 6 }}>Buying first prevents snipers. Recommended: 0.1–1 SOL.</div>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', padding: 16, marginBottom: 24 }}>
            <Label small>Cost breakdown</Label>
            <Row k="Token creation" v="0.02 SOL" />
            <Row k="Initial buy" v={`${form.initialBuy || '0'} SOL`} />
            <Row k="Network fees" v="~0.001 SOL" dim />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingTop: 10, marginTop: 8, borderTop: '1px solid var(--line)', fontWeight: 600, fontFamily: 'var(--mono)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--acid)' }}>{(0.02 + parseFloat(form.initialBuy || 0) + 0.001).toFixed(3)} SOL</span>
            </div>
          </div>

          <button onClick={launch} disabled={!valid || launching} className="gg-btn gg-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 14, opacity: !valid || launching ? 0.5 : 1, cursor: !valid || launching ? 'not-allowed' : 'pointer' }}>
            {launching ? 'Deploying to Solana…' : !walletConnected ? 'Connect Wallet to Launch' : <>Launch Token <ArrowUpRight size={15} /></>}
          </button>

          <div style={{ marginTop: 16, padding: 16, background: 'rgba(107,163,255,0.04)', border: '1px solid var(--acid-d)', display: 'flex', gap: 12 }}>
            <Vault size={20} state="sealed" fillPct={100} animate={false} glow={false} />
            <div style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.55 }}>
              By launching, you accept that <span style={{ color: 'var(--fg)' }}>liquidity will be sealed at graduation and cannot be retrieved</span>. The vault has no withdraw function — not for you, not for us, not for anyone.
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function DeploymentOverlay({ symbol }) {
  const stages = [
    'Compiling token program',
    'Initializing bonding curve',
    'Deploying to Solana mainnet',
    'Confirming transaction',
    `${symbol} live`,
  ];
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => setStage(s => Math.min(s + 1, stages.length - 1)), 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,8,15,0.92)', backdropFilter: 'blur(20px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 200ms ease' }}>
      <div style={{ textAlign: 'center', position: 'relative' }}>
        {/* ambient */}
        <div style={{ position: 'absolute', inset: -100, background: 'radial-gradient(circle, rgba(107,163,255,0.18) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Vault size={200} state="open" fillPct={Math.min(100, (stage + 1) * 20)} animate={true} scanline={true} />
        </div>
        
        <div style={{ marginTop: 32, fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase', fontFamily: 'var(--mono)', marginBottom: 8 }}>
          deployment in progress
        </div>
        <div key={stage} style={{ fontSize: 22, fontWeight: 500, color: 'var(--fg)', letterSpacing: '-0.01em', animation: 'fadeIn 400ms ease', minWidth: 360 }}>
          {stages[stage]}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 6, justifyContent: 'center' }}>
          {stages.map((_, i) => (
            <div key={i} style={{ width: 32, height: 2, background: i <= stage ? 'var(--acid)' : 'var(--line-2)', transition: 'background 400ms' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children, small }) {
  return (
    <div style={{ fontSize: small ? 11 : 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 10 }}>{children}</div>
  );
}

// ============================================================================
// DOCS
// ============================================================================

function DocsPage() {
  const sections = [
    { num: '01', t: 'The Problem' },
    { num: '02', t: 'Mechanism Overview' },
    { num: '03', t: 'Bonding Curve' },
    { num: '04', t: 'Graduation' },
    { num: '05', t: 'The Sealed Vault' },
    { num: '06', t: 'gLP — Liquid Stake' },
    { num: '07', t: 'Fee Economics' },
    { num: '08', t: 'Exit & Secondary Market' },
    { num: '09', t: 'Risk & Mitigations' },
    { num: '10', t: 'Verification' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 120px' }} className="gg-fade-in">
      <div style={{ marginBottom: 64 }}>
        <span style={{ fontSize: 12, color: 'var(--acid)', letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase' }}>Protocol Specification · v0.1</span>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', margin: '14px 0 0', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
          The full mechanism, <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--fg-dim)' }}>without abbreviation.</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--fg-dim)', maxWidth: 640, marginTop: 24, lineHeight: 1.55 }}>
          Every claim on the front of this site is grounded in a specific design choice, a specific number, or a specific contract instruction. This document covers all of them.
        </p>
      </div>

      <div className="gg-resp-docs" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 64, alignItems: 'start' }}>
        <nav className="gg-resp-docs-toc" style={{ position: 'sticky', top: 88 }}>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.04em', fontWeight: 500, textTransform: 'uppercase', marginBottom: 16 }}>Contents</div>
          {sections.map(s => (
            <a key={s.num} href={`#sec-${s.num}`} style={{ display: 'block', padding: '7px 0', fontSize: 13, color: 'var(--fg-dim)', borderTop: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--fg-mute)', marginRight: 10, fontFamily: 'var(--mono)', fontSize: 11 }}>{s.num}</span>{s.t}
            </a>
          ))}
        </nav>

        <div style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--fg-dim)', maxWidth: 720 }}>
          <DocSection num="01" title="The Problem">
            <p>Memecoin launchpads in 2026 share one architectural flaw: the LP tokens minted at graduation are held by a human-controlled address. A team multisig, a platform vault, a deployer wallet. Whoever holds those LP tokens can call <span className="mono" style={{ color: 'var(--fg)' }}>removeLiquidity</span> at will. The whole industry asks buyers to trust they won't.</p>
            <p>That trust is violated routinely. Chainalysis reported $4.6B lost to rug pulls in 2024 alone, and 2025 was worse. The harm falls disproportionately on retail — people who put in what they could not afford to lose because they believed the architecture was the safeguard. It wasn't. The architecture was the vulnerability.</p>
            <p>GGLaunch removes the vulnerability at its root: <span style={{ color: 'var(--fg)' }}>nobody holds the LP.</span> Not the team. Not the platform. Not a multisig. The LP is owned by a Program-Derived Address (PDA) whose only authorized callers are deterministic, on-chain, and incapable of withdrawing the underlying.</p>
          </DocSection>

          <DocSection num="02" title="Mechanism Overview">
            <p>The protocol consists of four contracts deployed as a single Anchor program on Solana mainnet:</p>
            <SpecTable rows={[
              ['Curve', 'Manages bonding curve buys/sells in the pre-graduation phase'],
              ['Graduator', 'Atomic transition: drains curve reserves, creates Raydium pool, mints LP, transfers LP to Vault'],
              ['Vault PDA', 'Holds LP tokens. Has no instruction that releases them.'],
              ['gLP Mint', 'Issues liquid stake derivatives proportional to LP claim'],
            ]} />
            <p style={{ marginTop: 20 }}>The complete transition from "user buys on curve" to "liquidity sealed forever" happens inside a single, atomic transaction. There is no window during which any party — including the launching team — controls the LP tokens.</p>
          </DocSection>

          <DocSection num="03" title="Bonding Curve">
            <p>Pricing follows a constant-product curve calibrated to graduate at exactly $69,000 USD-equivalent market cap. The choice of $69K is not a meme; it is the threshold at which a Raydium pool of 1B token supply has sufficient depth (~85 SOL at current prices) to absorb meaningful trade volume without ruinous slippage.</p>
            <SpecTable rows={[
              ['Token supply', '1,000,000,000 (fixed, no inflation)'],
              ['Curve reserve target', '85 SOL @ graduation'],
              ['Initial price', '~0.0000003 SOL'],
              ['Graduation price', '~0.000069 SOL'],
              ['Curve fee', '1% (0.5% creator, 0.5% protocol)'],
              ['Anti-snipe cap', '2% of supply per tx for first 60s'],
            ]} />
            <p style={{ marginTop: 20 }}>There is no team allocation, no presale, no private round. <span style={{ color: 'var(--fg)' }}>The first buyer and the founder pay the same price for the same token at the same time.</span></p>
          </DocSection>

          <DocSection num="04" title="Graduation">
            <p>When the curve reaches $69K mcap, the next buy transaction triggers graduation atomically. Within a single Solana transaction, the program executes:</p>
            <ol style={{ paddingLeft: 20, marginTop: 12 }}>
              <li style={{ marginBottom: 8 }}>Withdraws all SOL and tokens from the curve reserve</li>
              <li style={{ marginBottom: 8 }}>Calls Raydium's <span className="mono" style={{ color: 'var(--fg)' }}>initialize_pool</span>, creating a CLMM with the curve reserves as initial liquidity</li>
              <li style={{ marginBottom: 8 }}>Receives the LP token mint from Raydium</li>
              <li style={{ marginBottom: 8 }}>Transfers 100% of the LP tokens to the Vault PDA</li>
              <li style={{ marginBottom: 8 }}>Mints gLP-TOKEN to all curve participants pro-rata</li>
              <li>Burns the curve account, making further direct curve buys impossible</li>
            </ol>
            <p style={{ marginTop: 20 }}>If any step fails, the entire transaction reverts and the curve continues. There is no partial-graduation state.</p>
          </DocSection>

          <DocSection num="05" title="The Sealed Vault">
            <p>The Vault PDA is the core of the rug-proof guarantee. Its address is derived deterministically from <span className="mono" style={{ color: 'var(--fg)' }}>["vault", token_mint]</span>, meaning anyone can verify ownership of a given LP without consulting the team.</p>
            <p style={{ marginTop: 16, color: 'var(--fg)' }}>The Vault program contains exactly two instructions affecting the LP tokens:</p>
            <SpecTable rows={[
              ['receive_lp', 'Called once at graduation. Idempotent. Cannot be called again for the same token.'],
              ['claim_fees', 'Called by anyone (typically a keeper). Pulls accumulated fees from Raydium and routes them to gLP holders. Does NOT move the underlying LP.'],
            ]} />
            <p style={{ marginTop: 20 }}>There is no <span className="mono" style={{ color: 'var(--fg)' }}>withdraw_lp</span>, no <span className="mono" style={{ color: 'var(--fg)' }}>migrate</span>, no <span className="mono" style={{ color: 'var(--fg)' }}>emergency_exit</span>, no <span className="mono" style={{ color: 'var(--fg)' }}>upgrade_authority</span>. The program is deployed with the upgrade authority set to the burn address. <span style={{ color: 'var(--fg)' }}>The code that runs today is the code that will run forever.</span></p>
          </DocSection>

          <DocSection num="06" title="gLP — Liquid Stake">
            <p>For every locked LP position, the protocol mints a corresponding SPL token, <span className="mono" style={{ color: 'var(--fg)' }}>gLP-{'{TOKEN}'}</span>. This is the staker's claim on the underlying.</p>
            <SpecTable rows={[
              ['Initial supply', 'Pro-rata to curve participation × 280'],
              ['Backing', '1 unit gLP = (locked LP × current pool value) / total gLP supply'],
              ['Mintable post-grad?', 'No — supply is fixed at graduation'],
              ['Burn mechanism?', 'No — gLP is permanent; supply only redistributes via secondary'],
            ]} />
            <p style={{ marginTop: 20 }}>Because the underlying LP cannot be withdrawn but trading fees continuously deepen the pool, <span style={{ color: 'var(--fg)' }}>each unit of gLP becomes monotonically more valuable in SOL terms over time</span>.</p>
          </DocSection>

          <DocSection num="07" title="Fee Economics">
            <p>Trading fees on the Raydium CLMM (0.25% per swap) are the protocol's only source of yield:</p>
            <SpecTable rows={[
              ['LP compounding', '70% — increases the underlying LP position permanently'],
              ['gLP holder distribution', '20% — claimable in SOL, pro-rata to gLP balance'],
              ['Protocol treasury', '8% — funds operations, audits, indexer'],
              ['Original creator', '2% — perpetual royalty to the launching wallet'],
            ]} />
            <p style={{ marginTop: 20 }}>For a token with $500K daily volume, this means roughly <span className="mono" style={{ color: 'var(--fg)' }}>$1,250</span> in fees per day. <span className="mono" style={{ color: 'var(--fg)' }}>$875</span> deepens the locked LP, <span className="mono" style={{ color: 'var(--fg)' }}>$250</span> is distributed to gLP holders. At a $50K total gLP market cap, that distribution alone equates to <span className="mono" style={{ color: 'var(--fg)' }}>~180% APR</span> at flat volume.</p>
          </DocSection>

          <DocSection num="08" title="Exit & Secondary Market">
            <p>A staker who wants to liquidate has exactly one path: sell gLP on a secondary AMM. Jupiter-routed liquidity for gLP markets is bootstrapped at graduation by routing 5% of curve fees into a gLP/SOL pool.</p>
            <p>The clearing price reflects (a) the present SOL value of the locked underlying LP, and (b) the discounted present value of expected future fees. <span style={{ color: 'var(--fg)' }}>In a healthy market gLP trades close to fair value; in panic, it discounts.</span> The discount is the cost of immediate exit — a price the holder pays themselves, not a violence done to them.</p>
          </DocSection>

          <DocSection num="09" title="Risk & Mitigations">
            <p>An honest accounting of what can go wrong, and what we have done about it.</p>
            <SpecTable rows={[
              ['Smart contract bug', 'Mitigated by formal verification of vault module + pre-launch audit by OtterSec. Vault is intentionally minimal (~280 LOC).'],
              ['Raydium dependency', 'If Raydium pauses or deprecates, fees stop. Graduation flow is interface-abstracted; future versions can plug in Meteora or Orca.'],
              ['gLP secondary depth', 'Early markets may be thin. 5% of curve fees seed initial gLP/SOL liquidity; Jupiter ensures aggregated routing.'],
              ['Token-level scams', 'A founder cannot rug the LP, but can launch low-effort tokens. Editorial curation surfaces serious projects on the front-end.'],
              ['Price manipulation', 'Graduation threshold uses TWAP over 60s, not spot price. A flash-pump cannot trigger graduation.'],
              ['Team going dark', 'No effect on locked LPs. The vault has no admin. Existing positions continue to compound regardless of the team\'s status.'],
            ]} />
          </DocSection>

          <DocSection num="10" title="Verification">
            <p>The protocol is open-source. The vault module can be verified independently:</p>
            <SpecTable rows={[
              ['Program ID', 'GG1aunchVau1tProgramXXXXXXXXXXXXXXXXXXX'],
              ['Upgrade authority', 'None (burned at deployment)'],
              ['Source repository', 'github.com/gglaunch/protocol'],
              ['Audit (OtterSec)', 'Scheduled Q2 2026'],
              ['Formal verification', 'Vault module verified via Certora'],
            ]} />
            <p style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)', color: 'var(--fg)', fontStyle: 'italic' }}>The promise of this protocol is not enforced by the team's good intentions. It is enforced by the absence of any code that could be used to break it. Read the program. The function does not exist.</p>
          </DocSection>
        </div>
      </div>
    </div>
  );
}

function SpecTable({ rows }) {
  return (
    <div style={{ marginTop: 16, border: '1px solid var(--line)' }}>
      {rows.map(([k, v], i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
          <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--fg-dim)', borderRight: '1px solid var(--line)', background: 'var(--bg-1)', fontFamily: 'var(--mono)' }}>{k}</div>
          <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--fg)', lineHeight: 1.55 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function DocSection({ num, title, children }) {
  return (
    <section id={`sec-${num}`} style={{ marginBottom: 56, paddingBottom: 56, borderBottom: '1px solid var(--line)', scrollMarginTop: 88 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: 'var(--fg-mute)', letterSpacing: '0.04em', fontWeight: 500, fontFamily: 'var(--mono)' }}>§ {num}</span>
        <h2 style={{ fontSize: 28, margin: 0, fontWeight: 500, letterSpacing: '-0.025em', color: 'var(--fg)', lineHeight: 1.1 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ============================================================================
// FOOTER + TOAST
// ============================================================================

function Footer({ navigate }) {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '64px 24px 32px', background: 'var(--bg-1)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>
        <div>
          <Logo size={28} />
          <p style={{ fontSize: 13, color: 'var(--fg-dim)', marginTop: 16, lineHeight: 1.55, maxWidth: 320 }}>A launchpad built so that what is promised cannot be undone. Sealed by code. Sustained by the people who funded it.</p>
        </div>
        {[
          { t: 'Protocol', l: ['Discover', 'Launch', 'Stake', 'Documentation'] },
          { t: 'Resources', l: ['Audit Report', 'Whitepaper', 'Brand Kit', 'Press'] },
          { t: 'Community', l: ['Twitter', 'Discord', 'Telegram', 'GitHub'] },
        ].map(c => (
          <div key={c.t}>
            <div style={{ fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 16 }}>{c.t}</div>
            {c.l.map(i => (
              <div key={i} style={{ fontSize: 13, color: 'var(--fg-dim)', padding: '5px 0', cursor: 'pointer' }}>{i}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1400, margin: '48px auto 0', paddingTop: 24, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--fg-mute)' }}>© 2026 GGLaunch · A stand, not a service · Built on Solana</span>
        <span style={{ fontSize: 12, color: 'var(--fg-mute)', fontFamily: 'var(--mono)' }}>v0.1.0-beta · Mainnet</span>
      </div>
    </footer>
  );
}

function CommandPalette({ tokens, navigate, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const navItems = [
    { kind: 'page', label: 'Discover', sub: 'Browse all vaults', action: () => navigate('discover'), icon: Search },
    { kind: 'page', label: 'Launch a Token', sub: 'Create new bonding curve', action: () => navigate('launch'), icon: Zap },
    { kind: 'page', label: 'Stake Dashboard', sub: 'Your gLP positions', action: () => navigate('stake'), icon: Layers },
    { kind: 'page', label: 'Documentation', sub: 'Protocol specification', action: () => navigate('docs'), icon: AlertCircle },
  ];

  const tokenItems = tokens.map(t => ({
    kind: 'token',
    label: t.symbol,
    sub: t.name,
    token: t,
    action: () => navigate('token', t.id),
  }));

  const allItems = [...navItems, ...tokenItems];
  const filtered = query
    ? allItems.filter(i => 
        i.label.toLowerCase().includes(query.toLowerCase()) || 
        i.sub.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); filtered[selectedIdx]?.action(); }
  };

  const groupedFiltered = useMemo(() => {
    const pages = filtered.filter(i => i.kind === 'page');
    const toks = filtered.filter(i => i.kind === 'token');
    return { pages, toks };
  }, [filtered]);

  let runningIdx = 0;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(6,8,15,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'paletteFade 200ms ease',
      }}>
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(640px, 92vw)',
          background: 'rgba(11,15,28,0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'var(--hairline-top), 0 24px 64px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(107,163,255,0.1), 0 0 80px -20px rgba(107,163,255,0.3)',
          animation: 'paletteRise 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={16} color="var(--fg-dim)" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search vaults, navigate, run commands…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--fg)',
              fontSize: 16,
              fontFamily: 'var(--sans)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--fg-mute)', fontFamily: 'var(--mono)' }}>ESC</span>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '52vh', overflowY: 'auto', padding: '8px 0' }}>
          {groupedFiltered.pages.length > 0 && (
            <>
              <div style={{ padding: '12px 24px 8px', fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Navigate</div>
              {groupedFiltered.pages.map((item) => {
                const myIdx = runningIdx++;
                const sel = selectedIdx === myIdx;
                return (
                  <PaletteItem key={item.label} item={item} selected={sel} onMouseEnter={() => setSelectedIdx(myIdx)} />
                );
              })}
            </>
          )}
          {groupedFiltered.toks.length > 0 && (
            <>
              <div style={{ padding: '16px 24px 8px', fontSize: 10, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Vaults · {groupedFiltered.toks.length}</div>
              {groupedFiltered.toks.map((item) => {
                const myIdx = runningIdx++;
                const sel = selectedIdx === myIdx;
                return (
                  <PaletteItem key={item.token.id} item={item} selected={sel} onMouseEnter={() => setSelectedIdx(myIdx)} />
                );
              })}
            </>
          )}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--fg-dim)', fontSize: 14 }}>
              No results for <span style={{ color: 'var(--fg)', fontFamily: 'var(--mono)' }}>"{query}"</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'var(--fg-mute)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="gg-kbd">↑</span><span className="gg-kbd">↓</span> Navigate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="gg-kbd">↵</span> Open
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Vault size={14} state="sealed" fillPct={100} animate={false} glow={false} />
            <span style={{ color: 'var(--fg-dim)', fontWeight: 500 }}>GGLaunch</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes paletteFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes paletteRise {
          from { opacity: 0; transform: translateY(-12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function PaletteItem({ item, selected, onMouseEnter }) {
  return (
    <button
      onClick={item.action}
      onMouseEnter={onMouseEnter}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '11px 24px',
        background: selected ? 'linear-gradient(90deg, rgba(107,163,255,0.10) 0%, rgba(107,163,255,0.04) 100%)' : 'transparent',
        border: 'none',
        borderLeft: selected ? '2px solid var(--acid)' : '2px solid transparent',
        cursor: 'pointer',
        textAlign: 'left',
        color: 'var(--fg)',
        fontFamily: 'var(--sans)',
        transition: 'background 120ms, border-color 120ms',
      }}>
      {item.kind === 'token' ? (
        <>
          <Vault size={28} state={item.token.graduated ? 'sealed' : 'open'} fillPct={item.token.graduated ? 100 : item.token.progress} animate={false} glow={false} />
          <div className="gg-token-thumb" style={{ width: 28, height: 28, fontSize: 14 }}>{item.token.image}</div>
        </>
      ) : (
        <div style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--line-2)' }}>
          <item.icon size={14} color="var(--fg-dim)" />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em' }}>{item.label}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 2 }}>{item.sub}</div>
      </div>
      {item.kind === 'token' && (
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontSize: 12, fontWeight: 500 }}>${fmtPrice(item.token.price)}</div>
          <div className="num" style={{ fontSize: 11, color: item.token.change24h >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {item.token.change24h >= 0 ? '+' : ''}{item.token.change24h.toFixed(1)}%
          </div>
        </div>
      )}
      {selected && (
        <ChevronRight size={14} color="var(--acid)" />
      )}
    </button>
  );
}

function Toast({ msg, type }) {
  const color = type === 'error' ? 'var(--red)' : 'var(--acid)';
  return (
    <div style={{ 
      position: 'fixed', bottom: 24, right: 24, zIndex: 100, 
      background: 'rgba(11,15,28,0.85)', 
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: `1px solid ${color}40`, 
      borderLeft: `3px solid ${color}`,
      padding: '14px 20px 14px 16px', 
      display: 'flex', alignItems: 'center', gap: 12, 
      boxShadow: 'var(--shadow-lg), 0 0 24px -4px ' + color + '40',
      animation: 'toastSlide 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      minWidth: 280,
    }}>
      {type === 'error' ? <AlertCircle size={15} color={color} /> : <Check size={15} color={color} />}
      <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em' }}>{msg}</span>
      <style>{`
        @keyframes toastSlide {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
