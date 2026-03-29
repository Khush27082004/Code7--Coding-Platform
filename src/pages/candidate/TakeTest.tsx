import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CodeEditor } from '../../components/CodeEditor';
import api from '../../services/api';

export const TakeTest = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(38);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'results'>('description');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startAssessment();
  }, [id]);

  // Tab switch detection
  const [switchCount, setSwitchCount] = useState(0);
  useEffect(() => {
    if (!assessment?.id) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        const newCount = switchCount + 1;
        setSwitchCount(newCount);
        
        console.log(`Tab switch detected! Count: ${newCount}`);
        
        try {
          await api.patch(`/assessments/${assessment.id}/tab-switch`);
        } catch (err) {
          console.error('Failed to log tab switch', err);
        }

        if (newCount === 1) {
          alert('🚨 WARNING: Tab switching is NOT allowed during the assessment. Switching again will result in AUTOMATIC SUBMISSION.');
        } else if (newCount >= 2) {
          alert('🚫 MAXIMUM ATTEMPTS EXCEEDED: Your assessment is being submitted automatically due to multiple tab switches.');
          submitCode(); // This submits the current question
          // In a more advanced version, we might want to flag the entire UserAssessment as 'completed'
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [assessment?.id, switchCount]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      if (newWidth >= 20 && newWidth <= 60) setLeftPanelWidth(newWidth);
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const startAssessment = async () => {
    try {
      const res = await api.post(`/assessments/${id}/start`);
      setAssessment(res.data.data);
      if (res.data.data.assessment.assessmentQuestions[0]) {
        const question = res.data.data.assessment.assessmentQuestions[0].question;
        const starterCode = getStarterCode(question, language);
        setCode(starterCode);
      }
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to start assessment');
    }
  };

  const getStarterCode = (question: any, lang: string) => {
    const codeMap: any = {
      python: question.starterCodePython,
      javascript: question.starterCodeJavascript,
      java: question.starterCodeJava,
      cpp: question.starterCodeCpp,
    };
    return codeMap[lang] || '';
  };

  const runCode = async () => {
    setLoading(true);
    setOutput('Running...');
    try {
      const res = await api.post('/submissions/run', {
        language,
        code,
        input: '',
      });
      setOutput(res.data.data.output || res.data.data.error);
    } catch (error) {
      setOutput('Error running code');
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    setSubmitting(true);
    setOutput('Submitting solution...');
    try {
      const question = assessment.assessment.assessmentQuestions[currentQuestion].question;
      const submitRes = await api.post('/submissions', {
        userAssessmentId: assessment.id,
        questionId: question.id,
        language,
        code,
      });

      const submissionId = submitRes.data.data.id;
      let attempts = 0;
      let isCompleted = false;

      while (attempts < 30 && !isCompleted) {
        attempts += 1;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const statusRes = await api.get(`/submissions/${submissionId}`);
        if (statusRes.data.data.status === 'completed') {
          isCompleted = true;
          const evaluated = statusRes.data.data;
          setOutput(`Submitted and evaluated. Passed ${evaluated.passedTests}/${evaluated.totalTests}, score ${evaluated.score}/${evaluated.maxScore}.`);
        }
      }

      if (!isCompleted) {
        setOutput('Submission accepted. Evaluation is taking longer than expected. Please check submissions.');
      }

      // Check if the full assessment is completed and show final message
      const assessmentsRes = await api.get('/assessments');
      const currentAssessment = (assessmentsRes.data.data || []).find((a: any) => a.id === id);
      const ua = currentAssessment?.userAssessments?.[0];
      if (ua?.status === 'completed') {
        setOutput(`✅ Test finished. Final Score: ${ua.score}/${ua.maxScore}`);
      } else {
        setOutput((prev) => `${prev}\n✅ Solution submitted and evaluated. Continue with remaining questions.`);
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to submit';
      setOutput(`❌ ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!assessment) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-black/10"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-black animate-spin"></div>
        </div>
        <p className="text-sm text-zinc-500 font-medium tracking-wide">Loading assessment...</p>
      </div>
    </div>
  );

  const question = assessment.assessment.assessmentQuestions[currentQuestion]?.question;
  if (!question) return <div className="p-6">No questions available</div>;

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const starterCode = getStarterCode(question, newLang);
    setCode(starterCode);
  };

  const difficultyConfig: Record<string, { label: string; cls: string }> = {
    easy: { label: 'Easy', cls: 'text-green-500 bg-green-500/10 border-green-500/20' },
    medium: { label: 'Medium', cls: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
    hard: { label: 'Hard', cls: 'text-red-500 bg-red-500/10 border-red-500/20' },
  };

  const diff = difficultyConfig[question.difficulty] || difficultyConfig.easy;
  const langIcons: Record<string, string> = {
    python: '🐍',
    javascript: '⚡',
    java: '☕',
    cpp: '⚙️',
  };

  return (
    <div className="h-screen flex flex-col bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* ── Top Navigation Bar ────────────────────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-zinc-200 flex items-center px-4 gap-4 flex-shrink-0 z-10">
        {/* Title / Info */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {currentQuestion + 1}
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 leading-none">{assessment.assessment.title}</h1>
            <p className="text-[10px] text-zinc-500 mt-1 font-medium">Question {currentQuestion + 1} of {assessment.assessment.assessmentQuestions.length}</p>
          </div>
        </div>

        <div className="h-5 w-px bg-zinc-200" />

        {/* Current Question Title */}
        <h2 className="text-sm font-semibold text-zinc-900 flex-1 truncate">{question.title}</h2>

        {/* Status Badge */}
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${diff.cls}`}>
          {diff.label}
        </span>

        <div className="h-5 w-px bg-zinc-200" />

        {/* Switch count (Warning) */}
        {switchCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-md text-red-600 text-[10px] font-bold">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            TAB SWITCHES: {switchCount}/2
          </div>
        )}

        <div className="h-5 w-px bg-zinc-200" />

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-zinc-900 text-white text-[11px] font-bold pl-3 pr-8 py-1.5 rounded-md border border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              <option value="python">🐍 Python</option>
              <option value="javascript">⚡ JavaScript</option>
              <option value="java">☕ Java</option>
              <option value="cpp">⚙️ C++</option>
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={runCode}
            disabled={loading}
            className="flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all shadow-sm"
          >
            {loading ? (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            )}
            Run
          </button>
          <button
            onClick={submitCode}
            disabled={submitting || loading}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-40 text-white px-4 py-1.5 rounded-md text-[11px] font-bold transition-all shadow-sm"
          >
            {submitting ? (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            )}
            Submit
          </button>
        </div>
      </header>

      {/* ── Main Split Layout ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        
        {/* ── LEFT: Problem Panel ─────────────────────────────────────────────── */}
        <div 
          style={{ width: `${leftPanelWidth}%` }}
          className="flex flex-col bg-white border-r border-zinc-200 overflow-hidden"
        >
          {/* Tab bar */}
          <div className="flex border-b border-zinc-200 flex-shrink-0">
            {(['description', 'results'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'results' && !output) setOutput('No execution output yet.');
                }}
                className={`relative px-5 py-3 text-xs font-bold transition-colors capitalize ${
                  activeTab === tab ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {tab === 'results' ? 'Output' : 'Description'}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'description' ? (
              <div className="p-6 space-y-7">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 uppercase">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {question.timeLimit}ms
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 uppercase">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    {question.memoryLimit}MB
                  </span>
                </div>

                {/* Body */}
                <section>
                  <p className="text-zinc-800 text-sm leading-relaxed whitespace-pre-wrap">{question.description}</p>
                </section>

                {question.constraints && (
                  <section>
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Constraints</h3>
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                      <pre className="text-[11px] text-zinc-700 font-mono whitespace-pre-wrap leading-relaxed">{question.constraints}</pre>
                    </div>
                  </section>
                )}

                {question.sampleInput && (
                  <section>
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Example Input</h3>
                    <div className="bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
                      <pre className="px-4 py-3 text-[11px] text-green-400 font-mono overflow-x-auto leading-relaxed">{question.sampleInput}</pre>
                    </div>
                  </section>
                )}

                {question.sampleOutput && (
                  <section>
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Example Output</h3>
                    <div className="bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
                      <pre className="px-4 py-3 text-[11px] text-blue-400 font-mono overflow-x-auto leading-relaxed">{question.sampleOutput}</pre>
                    </div>
                  </section>
                )}

                {question.explanation && (
                  <section>
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Explanation</h3>
                    <p className="text-zinc-700 text-sm leading-relaxed">{question.explanation}</p>
                  </section>
                )}

                {question.tags && question.tags.length > 0 && (
                  <section className="pt-2">
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag: string) => (
                        <span key={tag} className="px-2.5 py-1 bg-zinc-100 text-zinc-500 rounded text-[10px] font-bold uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              /* Results tab */
              <div className="p-0 flex flex-col h-full bg-zinc-950">
                <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Execution Stream</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed">
                  {output ? (
                    <pre className={`whitespace-pre-wrap ${output.includes('❌') || output.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{output}</pre>
                  ) : (
                    <p className="text-zinc-600 italic">Run your code to see output here…</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Drag Handle ─────────────────────────────────────────────────────── */}
        <div 
          onMouseDown={() => setIsDragging(true)}
          className={`w-1 flex-shrink-0 bg-zinc-200 hover:bg-zinc-400 cursor-col-resize transition-colors ${isDragging ? 'bg-zinc-400' : ''}`}
        />

        {/* ── RIGHT: Editor ───────────────────────────────────────────────────── */}
        <div 
          style={{ width: `${100 - leftPanelWidth}%` }}
          className="flex flex-col bg-zinc-950 min-h-0"
        >
          {/* Editor Tool Bar */}
          <div className="flex items-center px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0 gap-3">
             <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
             </div>
             <span className="text-[11px] text-zinc-500 font-mono">solution.{language === 'python' ? 'py' : 'code'}</span>
             <div className="flex-1" />
             <button 
                onClick={() => setCode(getStarterCode(question, language))}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 font-bold transition-colors uppercase tracking-wide"
             >
              Reset
             </button>
          </div>

          <div className="flex-1 min-h-0">
            <CodeEditor value={code} onChange={setCode} language={language} />
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation Bar ─────────────────────────────────────────────── */}
      <footer className="h-12 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between px-6 flex-shrink-0">
        <button
          onClick={() => {
             const prev = Math.max(0, currentQuestion - 1);
             setCurrentQuestion(prev);
             setCode(getStarterCode(assessment.assessment.assessmentQuestions[prev].question, language));
             setOutput('');
             setActiveTab('description');
          }}
          disabled={currentQuestion === 0}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 disabled:opacity-30 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </button>

        <div className="flex items-center gap-2">
          {assessment.assessment.assessmentQuestions.map((_: any, idx: number) => (
            <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentQuestion ? 'w-4 bg-zinc-900' : 'bg-zinc-300'}`} />
          ))}
        </div>

        <button
          onClick={() => {
             const next = Math.min(assessment.assessment.assessmentQuestions.length - 1, currentQuestion + 1);
             setCurrentQuestion(next);
             setCode(getStarterCode(assessment.assessment.assessmentQuestions[next].question, language));
             setOutput('');
             setActiveTab('description');
          }}
          disabled={currentQuestion === assessment.assessment.assessmentQuestions.length - 1}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 disabled:opacity-30 transition-colors"
        >
          Next
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </footer>
    </div>
  );
};
