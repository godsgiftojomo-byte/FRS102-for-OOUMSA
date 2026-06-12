import { useState, useEffect, useRef, useCallback } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

async function supabase(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.status === 204 ? null : res.json();
}

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { id: 1, q: "Which ancient text is credited as the first written use of entomology to solve a criminal case?", opts: ["The Corpus Juris Civilis", "Xi Yuan Lu (Washing Away of Wrongs)", "The Bertillon Manual", "Handbook for Coroners by Hans Gross"], ans: 1 },
  { id: 2, q: "In 1784, John Toms was convicted of murder when a pistol wad matched a torn newspaper in his pocket. This is an early example of:", opts: ["DNA evidence", "Ballistics comparison", "Physical impression evidence linking suspect to crime", "Toxicological analysis"], ans: 2 },
  { id: 3, q: "Carl Wilhelm Scheele's contribution to forensic toxicology in 1773 was:", opts: ["Devising the first method to detect arsenic in corpses", "Developing fingerprint classification", "Founding the first forensic laboratory", "Creating the anthropometry system"], ans: 0 },
  { id: 4, q: "The Institut de Police Scientifique of the University of Lausanne, the first school of forensic science, was founded by:", opts: ["Edmond Locard", "Hans Gross", "Archibald Reiss", "Alexandre Lacassagne"], ans: 2 },
  { id: 5, q: "Sir William Herschel began using thumbprints on documents as a security measure while working in:", opts: ["London Metropolitan Police", "The Indian Civil Service", "The French National Gendarmerie", "The New York Civil Service"], ans: 1 },
  { id: 6, q: "Juan Vucetich is notable for:", opts: ["Publishing the first scientific paper on fingerprints in Nature", "Setting up the world's first fingerprint bureau and solving the Rojas murder using a bloody thumbprint", "Developing the Henry Classification System", "Introducing fingerprinting to the United States"], ans: 1 },
  { id: 7, q: "Which fictional character became a symbol of forensic reasoning and inspired real forensic techniques?", opts: ["Hercule Poirot", "Miss Marple", "Sherlock Holmes", "Inspector Morse"], ans: 2 },
  { id: 8, q: "Two of Bertillon's contributions that remain in use today are:", opts: ["Toxicological screening and autopsy protocols", "The mug shot and systematisation of crime-scene photography", "Ballistic databases and trace metal analysis", "DNA profiling and serology"], ans: 1 },
  { id: 9, q: "The Uhlenhuth precipitin test was further refined for forensic use in the:", opts: ["1880s", "1920s", "1960s", "1990s"], ans: 2 },
  { id: 10, q: "The Marsh test is so sensitive it can detect as little as:", opts: ["One gram of arsenic", "One milligram of arsenic", "One-fiftieth of a milligram of arsenic", "One microgram of arsenic"], ans: 2 },
  { id: 11, q: "A fingerprint lifted from a smooth glass surface but not yet matched to a suspect is classified as a:", opts: ["Patent print", "Plastic print", "Latent print", "Visible print"], ans: 2 },
  { id: 12, q: "A fingerprint impression left in soft wax or fresh paint, retaining a three-dimensional form, is called a:", opts: ["Latent print", "Patent print", "Plastic print", "Dusted print"], ans: 2 },
  { id: 13, q: "Which surface is MOST suitable for powder dusting to develop latent fingerprints?", opts: ["Rough brick wall", "Smooth non-porous metal", "Coarse fabric", "Wet sand"], ans: 1 },
  { id: 14, q: "Which fingerprint pattern is the LEAST commonly found among individuals?", opts: ["Loop", "Whorl", "Arch", "Composite"], ans: 2 },
  { id: 15, q: "When cyanoacrylate fuming develops fingerprints, the print residue reacts to form a:", opts: ["Purple compound visible under normal light", "White polymer deposit that makes the print visible", "Fluorescent coating detectable only under UV light", "Dark silver residue on the ridge lines"], ans: 1 },
  { id: 16, q: "The study of fingerprints is formally known as:", opts: ["Dactyloscopy", "Trichology", "Odontoscopy", "Serotyping"], ans: 0 },
  { id: 17, q: "In the Henry Classification System, fingerprints are classified into which THREE main groups?", opts: ["Spirals, cores, and deltas", "Loops, whorls, and arches", "Radials, ulnars, and composites", "Singles, doubles, and triples"], ans: 1 },
  { id: 18, q: "An 'enclosure' as a fingerprint minutia refers to:", opts: ["A ridge that terminates abruptly", "A ridge that splits into two branches", "A ridge that forms a small closed loop", "The central area of a whorl pattern"], ans: 2 },
  { id: 19, q: "Why must investigators wear gloves when handling fingerprint evidence?", opts: ["To prevent infection from biological hazards only", "To avoid adding their own skin oil which could contaminate existing fingerprints", "Because gloves enhance adhesion of dusting powder", "To comply with uniform regulations"], ans: 1 },
  { id: 20, q: "Francis Galton calculated the probability of two individuals having identical fingerprints as approximately:", opts: ["1 in 1 million", "1 in 100 million", "1 in 64 billion", "1 in 1 trillion"], ans: 2 },
  { id: 21, q: "DNA evidence can be used for paternity testing because:", opts: ["A child's DNA is identical to both parents", "Each parent contributes half of the child's DNA, creating a traceable pattern", "DNA is the same across all blood relatives", "Paternal DNA is always dominant"], ans: 1 },
  { id: 22, q: "In forensic DNA analysis, PCR (Polymerase Chain Reaction) is used to:", opts: ["Separate DNA fragments by size", "Amplify small amounts of DNA for analysis", "Determine the blood group of a sample", "Compare fingerprint ridge patterns"], ans: 1 },
  { id: 23, q: "When bullets are fired, they acquire unique markings from the barrel of the weapon. These are called:", opts: ["Crimping marks", "Primer indentations", "Striation marks from the rifling", "Ejector stamps"], ans: 2 },
  { id: 24, q: "Gunshot residue (GSR) consists of particles primarily containing:", opts: ["Carbon monoxide and nitrogen", "Lead, barium, and antimony from the primer", "Copper and zinc from the bullet jacket only", "Sulphur and nitrates from propellant only"], ans: 1 },
  { id: 25, q: "An initial screening test in forensic toxicology is best described as:", opts: ["A highly specific confirmatory test with no false positives", "A presumptive test to detect a class of substance, to be confirmed by GC-MS or LC-MS", "A definitive quantitative analysis of drug concentration", "A DNA extraction procedure"], ans: 1 },
  { id: 26, q: "In forensic toxicology, high blood alcohol content (BAC) is most directly relevant in cases involving:", opts: ["Bite mark analysis", "Driving under the influence (DUI) and related impairment", "Identification of victims in mass disasters", "Establishing time of death in homicides"], ans: 1 },
  { id: 27, q: "Thin Layer Chromatography (TLC) separates components of a mixture based on:", opts: ["Molecular weight alone", "Differences in migration rate through a stationary phase driven by a mobile phase", "Electrical charge of the molecules", "Boiling point differences between compounds"], ans: 1 },
  { id: 28, q: "HPLC is particularly suited to forensic analysis of:", opts: ["Volatile accelerants in arson debris", "Explosive gases at blast scenes", "Non-volatile and thermally unstable compounds such as certain drugs and biological molecules", "Soil mineral composition"], ans: 2 },
  { id: 29, q: "Raman spectroscopy in forensic science is useful for:", opts: ["Identifying the sex of skeletal remains", "Non-destructive identification of substances by measuring light scattering", "Amplifying DNA from degraded samples", "Matching bullet striations to a firearm"], ans: 1 },
  { id: 30, q: "Digital forensics involves all of the following EXCEPT:", opts: ["Recovery of deleted files from hard drives", "Analysis of network intrusion logs", "Extraction of call history from mobile devices", "Examination of bite marks on a victim's skin"], ans: 3 },
  { id: 31, q: "A death where the manner cannot be conclusively established is classified as:", opts: ["Accidental", "Natural", "Homicide", "Undetermined"], ans: 3 },
  { id: 32, q: "In forensic pathology, the external examination during an autopsy includes:", opts: ["Organ evaluation and histological sampling", "Toxicological screening of blood and urine", "Documentation of injuries, identifying marks, and body surface findings", "DNA profiling of all biological fluids"], ans: 2 },
  { id: 33, q: "Livor mortis becomes FIXED (no longer shifts with repositioning) approximately:", opts: ["Immediately after death", "6–12 hours after death", "48 hours after death", "Only after complete decomposition"], ans: 1 },
  { id: 34, q: "Which forensic sub-discipline examines diatoms (microscopic algae) found in freshwater to connect suspects with victims?", opts: ["Forensic geology", "Forensic limnology", "Forensic botany", "Forensic microbiology"], ans: 1 },
  { id: 35, q: "In forensic anthropology, the LENGTH of long bones is primarily used to estimate:", opts: ["Age at death", "Sex of the individual", "Ancestry", "Stature (height)"], ans: 3 },
  { id: 36, q: "Which aspect of the skull is most useful for determining ANCESTRY in forensic anthropology?", opts: ["Suture closure patterns", "Jaw angle and brow ridge prominence", "Shape of the nose, orbital structure, and dental traits", "Bone density measurements"], ans: 2 },
  { id: 37, q: "The legal principle that a forensic expert's method must be peer-reviewed and accepted by the scientific community relates to the:", opts: ["Chain of custody requirement", "Relevance standard", "Reliability standard under the Daubert test", "Burden of proof"], ans: 2 },
  { id: 38, q: "A forensic nurse's duties include all of the following EXCEPT:", opts: ["Categorisation of wounds and traumas", "Collection of bodily fluids as evidence", "Sentencing recommendations to the court", "Emotional support for victims"], ans: 2 },
  { id: 39, q: "Criminal procedure codes in forensic legislation primarily outline:", opts: ["The salary structure of forensic scientists", "Procedures for evidence collection and admissibility in court", "The ethical training requirements for medical examiners", "International data-sharing agreements between forensic labs"], ans: 1 },
  { id: 40, q: "A forensic pathologist estimating time of death of a body found outdoors would use:", opts: ["DNA profiling and fingerprint comparison", "Rigor mortis, livor mortis, algor mortis, and insect activity assessment", "Ballistic trajectory analysis and blood spatter patterns", "Bite mark comparison and handwriting analysis"], ans: 1 },
  { id: 41, q: "Forensic accounting is concerned with:", opts: ["Identifying chemical compounds in financial fraud scenes", "Study and interpretation of accounting evidence and financial statements", "Analysing currency notes for fingerprints", "Tracking digital transactions for cybercrime only"], ans: 1 },
  { id: 42, q: "Forensic podiatry is applied to investigate cases using:", opts: ["Dental records of unidentified bodies", "Footprints and footwear traces to establish identity or link a suspect to a scene", "Soil composition at burial sites", "Insect species found on decomposing feet"], ans: 1 },
  { id: 43, q: "Forensic geomorphology is the study of the ground surface primarily to:", opts: ["Detect accelerants in soil after fires", "Identify locations of buried objects or remains", "Analyse mineral trace evidence from suspects", "Map crime scene boundaries"], ans: 1 },
  { id: 44, q: "Bloodstain pattern analysis (BPA) is used in forensic investigations to:", opts: ["Identify the blood group of the victim", "Detect the presence of drugs in blood", "Reconstruct events of a crime from the distribution and characteristics of blood spatter", "Match blood DNA to a suspect"], ans: 2 },
  { id: 45, q: "Forensic seismology is specifically used to distinguish:", opts: ["Human-caused fires from natural fires", "Underground nuclear explosions from natural earthquakes", "Buried remains from geological formations", "Drug manufacturing sites from agricultural land"], ans: 1 },
  { id: 46, q: "Election forensics applies which discipline to detect gerrymandering or electoral fraud?", opts: ["Toxicology", "Linguistics", "Statistics", "Entomology"], ans: 2 },
  { id: 47, q: "Forensic meteorology provides:", opts: ["General climate trend analysis for environmental cases", "A site-specific analysis of past weather conditions at a point of loss or incident", "Satellite imaging for crime scene reconstruction", "Atmospheric chemical analysis for arson cases"], ans: 1 },
  { id: 48, q: "Which emerging forensic technology creates an immutable, tamper-evident record of evidence handling through a decentralised digital ledger?", opts: ["Virtual Reality (VR)", "Artificial Intelligence (AI)", "Blockchain technology", "Nanotechnology"], ans: 2 },
  { id: 49, q: "NISTIR-7941 is significant in 21st-century forensic science because it provides:", opts: ["A global DNA database standard", "A blueprint for forensic science laboratory planning, design, construction, and relocation", "Guidelines for expert witness testimony", "International fingerprint exchange protocols"], ans: 1 },
  { id: 50, q: "Which of the following best summarises WHY forensic science continues to evolve as a field?", opts: ["Because courts continuously change their standards of proof", "Because advances in technology expand the tools and disciplines available for legal investigation", "Because criminal behaviour becomes increasingly complex each decade", "Because DNA evidence has become less reliable over time"], ans: 1 },
];

const TOTAL = QUESTIONS.length;
const DURATION = 20 * 60; // 20 minutes in seconds
const OPTS = ["A", "B", "C", "D"];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDuration(secs) {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ─── PAGES ────────────────────────────────────────────────────────────────────
// PAGE: Entry
function EntryPage({ onStart }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter your name or identifier before starting."); return; }
    onStart(trimmed);
  }

  return (
    <div className="page-center">
      <div className="card entry-card">
        <div className="logo-badge">OOUMSA</div>
        <h1 className="entry-title">FRS102 TEST</h1>
        <p className="entry-subtitle">Introductory Forensic Science &nbsp;·&nbsp; 50 Questions &nbsp;·&nbsp; 20 Minutes</p>
        <div className="entry-rules">
          <div className="rule-item"><span className="rule-icon">⏱</span><span>You have exactly <strong>20 minutes</strong>. The test auto-submits when time runs out.</span></div>
          <div className="rule-item"><span className="rule-icon">📋</span><span>50 multiple-choice questions covering all topics.</span></div>
          <div className="rule-item"><span className="rule-icon">🔒</span><span>Once you start, you cannot pause.</span></div>
        </div>
        <label className="field-label" htmlFor="name-input">Your name or identifier</label>
        <input
          id="name-input"
          className={`field-input ${error ? "field-input--error" : ""}`}
          type="text"
          placeholder="e.g. Chidi Okeke"
          value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleStart()}
          autoFocus
        />
        {error && <p className="field-error">{error}</p>}
        <button className="btn-primary" onClick={handleStart}>Start Test</button>
      </div>
    </div>
  );
}

// PAGE: Quiz
function QuizPage({ studentName, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);

  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / TOTAL) * 100);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    let score = 0;
    QUESTIONS.forEach(q => { if (answers[q.id] === q.ans) score++; });
    onSubmit({ studentName, answers, score, elapsed, auto });
  }, [submitting, answers, studentName, onSubmit]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [handleSubmit]);

  const urgent = timeLeft <= 120;

  return (
    <div className="quiz-page">
      {/* Sticky header */}
      <header className="quiz-header">
        <div className="quiz-header-inner">
          <span className="header-logo">OOUMSA · FRS102</span>
          <div className="header-meta">
            <span className="answered-count">{answered}/{TOTAL} answered</span>
            <span className={`timer ${urgent ? "timer--urgent" : ""}`}>⏱ {formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="quiz-main">
        <div className="quiz-intro">
          <p className="quiz-student-name">Hi, <strong>{studentName}</strong> — good luck.</p>
        </div>

        {QUESTIONS.map((q, idx) => (
          <div key={q.id} className={`question-card ${answers[q.id] !== undefined ? "question-card--answered" : ""}`}>
            <div className="question-number">Question {idx + 1} of {TOTAL}</div>
            <p className="question-text">{q.q}</p>
            <div className="options-list">
              {q.opts.map((opt, oi) => (
                <button
                  key={oi}
                  className={`option-btn ${answers[q.id] === oi ? "option-btn--selected" : ""}`}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                >
                  <span className="option-letter">{OPTS[oi]}</span>
                  <span className="option-text">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="submit-zone">
          <p className="submit-hint">{TOTAL - answered > 0 ? `${TOTAL - answered} question${TOTAL - answered > 1 ? "s" : ""} still unanswered.` : "All questions answered — ready to submit!"}</p>
          <button className="btn-primary btn-submit" onClick={() => handleSubmit(false)} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Test"}
          </button>
        </div>
      </main>
    </div>
  );
}

// PAGE: Result
function ResultPage({ result }) {
  const pct = Math.round((result.score / TOTAL) * 100);
  const grade = pct >= 70 ? "Pass" : "Below Pass";
  const gradeColor = pct >= 70 ? "#22c55e" : "#ef4444";

  return (
    <div className="page-center">
      <div className="card result-card">
        <div className="logo-badge">OOUMSA</div>
        <h2 className="result-title">Test Submitted</h2>
        <p className="result-name">{result.studentName}</p>
        <div className="result-score-ring" style={{ "--pct": pct, "--color": gradeColor }}>
          <span className="result-score-num">{result.score}<span className="result-score-denom">/{TOTAL}</span></span>
          <span className="result-score-pct">{pct}%</span>
        </div>
        <div className="result-meta">
          <div className="result-meta-item"><span>Grade</span><strong style={{ color: gradeColor }}>{grade}</strong></div>
          <div className="result-meta-item"><span>Time taken</span><strong>{formatDuration(result.elapsed)}</strong></div>
          <div className="result-meta-item"><span>Questions answered</span><strong>{Object.keys(result.answers).length}/{TOTAL}</strong></div>
        </div>
        {result.auto && <p className="result-auto-note">⏱ Time ran out — test was automatically submitted.</p>}
        <p className="result-footer">Your result has been recorded. You may close this tab.</p>
      </div>
    </div>
  );
}

// PAGE: Admin
function AdminPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("submitted_at");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    async function load() {
      try {
        const data = await supabase("GET", `frs102_results?select=*&order=submitted_at.desc`);
        setResults(data || []);
      } catch (e) {
        setError("Could not load results. Check your Supabase connection.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  }

  const sorted = [...results].sort((a, b) => {
    let av = a[sortBy], bv = b[sortBy];
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
  const avgTime = results.length ? Math.round(results.reduce((s, r) => s + r.elapsed_seconds, 0) / results.length) : 0;
  const passing = results.filter(r => r.score / TOTAL >= 0.7).length;
  const highest = results.length ? Math.max(...results.map(r => r.score)) : 0;

  function SortIcon({ col }) {
    if (sortBy !== col) return <span className="sort-icon sort-icon--inactive">↕</span>;
    return <span className="sort-icon">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div>
            <div className="logo-badge">OOUMSA</div>
            <h1 className="admin-title">FRS102 Test Results</h1>
            <p className="admin-subtitle">Introductory Forensic Science · Admin Dashboard</p>
          </div>
          <div className="admin-badge">{results.length} submission{results.length !== 1 ? "s" : ""}</div>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-label">Average Score</span><span className="stat-value">{avg}/{TOTAL}</span><span className="stat-sub">{results.length ? Math.round(avg / TOTAL * 100) : 0}%</span></div>
          <div className="stat-card"><span className="stat-label">Highest Score</span><span className="stat-value">{highest}/{TOTAL}</span><span className="stat-sub">{results.length ? Math.round(highest / TOTAL * 100) : 0}%</span></div>
          <div className="stat-card"><span className="stat-label">Pass Rate (≥70%)</span><span className="stat-value">{passing}</span><span className="stat-sub">of {results.length} students</span></div>
          <div className="stat-card"><span className="stat-label">Avg. Time Spent</span><span className="stat-value">{formatDuration(avgTime)}</span><span className="stat-sub">per student</span></div>
        </div>

        {loading && <p className="admin-loading">Loading results…</p>}
        {error && <p className="admin-error">{error}</p>}

        {!loading && !error && results.length === 0 && (
          <div className="admin-empty">No submissions yet. Share the quiz link with your students.</div>
        )}

        {!loading && results.length > 0 && (
          <div className="table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort("student_name")} className="th-sort">Name <SortIcon col="student_name" /></th>
                  <th onClick={() => toggleSort("score")} className="th-sort">Score <SortIcon col="score" /></th>
                  <th onClick={() => toggleSort("score")} className="th-sort">% <SortIcon col="score" /></th>
                  <th onClick={() => toggleSort("elapsed_seconds")} className="th-sort">Time Spent <SortIcon col="elapsed_seconds" /></th>
                  <th>Auto-submitted</th>
                  <th onClick={() => toggleSort("submitted_at")} className="th-sort">Submitted <SortIcon col="submitted_at" /></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => {
                  const pct = Math.round((r.score / TOTAL) * 100);
                  const pass = pct >= 70;
                  return (
                    <tr key={r.id || i} className={pass ? "row-pass" : "row-fail"}>
                      <td className="td-name">{r.student_name}</td>
                      <td className="td-score">{r.score}/{TOTAL}</td>
                      <td><span className={`pct-badge ${pass ? "pct-badge--pass" : "pct-badge--fail"}`}>{pct}%</span></td>
                      <td>{formatDuration(r.elapsed_seconds)}</td>
                      <td>{r.auto_submitted ? <span className="badge-auto">Yes</span> : <span className="badge-manual">No</span>}</td>
                      <td className="td-date">{new Date(r.submitted_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const isAdmin = window.location.hash === "#admin";
  const [page, setPage] = useState("entry"); // entry | quiz | result
  const [studentName, setStudentName] = useState("");
  const [result, setResult] = useState(null);

  if (isAdmin) return <AdminPage />;

  async function handleSubmit(payload) {
    try {
      await supabase("POST", "frs102_results", {
        student_name: payload.studentName,
        score: payload.score,
        elapsed_seconds: payload.elapsed,
        auto_submitted: payload.auto,
        submitted_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to save result:", e);
    }
    setResult(payload);
    setPage("result");
  }

  if (page === "entry") return <EntryPage onStart={name => { setStudentName(name); setPage("quiz"); }} />;
  if (page === "quiz") return <QuizPage studentName={studentName} onSubmit={handleSubmit} />;
  if (page === "result") return <ResultPage result={result} />;
}
