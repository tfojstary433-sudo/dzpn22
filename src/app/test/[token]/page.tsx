'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ShieldAlert, Timer, ChevronRight, CheckCircle2, XCircle, AlertTriangle, LogIn } from 'lucide-react';
import { RobloxAvatar } from '@/components/roblox-avatar';

const EXAM_DURATION = 5 * 60; // 5 minutes in seconds
const VALID_TOKEN = 'pff-admin-exam-2026'; // Simple hardcoded token for the private link

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ExamData {
  authorizedDiscordIds: { discordId: string }[];
  questions: Question[];
  passThreshold: number;
  results: any[];
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [userIp, setUserIp] = useState<string>('');
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if token is valid
  const isTokenValid = token === VALID_TOKEN;

  // Fetch initial data and user info
  useEffect(() => {
    const init = async () => {
      // 1. Check user login
      const savedUser = localStorage.getItem('discord_user');
      if (!savedUser) {
        setLoading(false);
        return;
      }
      const userData = JSON.parse(savedUser);
      setUser(userData);

      // 2. Fetch IP
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        setUserIp(ipData.ip);
      } catch (e) {
        console.error('Failed to fetch IP:', e);
      }

      // 3. Fetch exam data and check authorization
      try {
        const res = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/exam/data');
        if (!res.ok) throw new Error('Failed to fetch exam data');
        const data: ExamData = await res.json();
        setExamData(data);

        // Check whitelist
        const isAuthorized = data.authorizedDiscordIds.some(auth => auth.discordId === (userData.robloxId || userData.id));
        setAuthorized(isAuthorized);

        // Check if already taken (by ID or IP)
        const hasTaken = data.results?.some(res => res.discordId === (userData.robloxId || userData.id) || res.ip === userIp);
        if (hasTaken) {
          setAlreadyTaken(true);
        }
      } catch (e) {
        console.error(e);
        setError('Błąd podczas pobierania danych egzaminu.');
      } finally {
        setLoading(false);
      }
    };

    if (isTokenValid) {
      init();
    } else {
      setLoading(false);
    }
  }, [isTokenValid, userIp]);

  // Anti-refresh/cheat
  useEffect(() => {
    if (examStarted && !examFinished) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        // Egzamin zostanie zakończony przy odświeżeniu
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [examStarted, examFinished]);

  const finishExam = useCallback(async () => {
    if (examFinished) return;
    setExamFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const endTime = Date.now();
    const duration = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
    
    // Calculate results
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    const questions = examData?.questions || [];
    const userAnswers = answers.map((ans, idx) => {
      const isCorrect = ans === questions[idx].correctAnswer;
      if (ans === -1) skipped++;
      else if (isCorrect) correct++;
      else incorrect++;
      
      return {
        questionId: questions[idx].id,
        answer: ans,
        isCorrect
      };
    });

    const percentage = Math.round((correct / questions.length) * 100);

    const result = {
      discordId: user.robloxId || user.id,
      username: user.robloxUsername || user.username,
      ip: userIp,
      score: correct,
      totalQuestions: questions.length,
      percentage,
      incorrect,
      skipped,
      answers: userAnswers,
      date: new Date().toISOString(),
      durationSeconds: duration
    };

    // Save to API
    try {
      await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/exam/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
    } catch (e) {
      console.error('Failed to save exam results:', e);
    }
  }, [examFinished, examData, startTime, user, userIp, answers]);

  // Timer logic
  useEffect(() => {
    if (examStarted && !examFinished && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, examFinished, timeLeft, finishExam]);

  const startExam = () => {
    if (!authorized || alreadyTaken) return;
    setExamStarted(true);
    setStartTime(Date.now());
    setAnswers(new Array(examData?.questions.length || 0).fill(-1));
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (!examData) return;
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishExam();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto opacity-20" />
          <h1 className="text-2xl font-black uppercase tracking-widest text-white/20">404 - Strona nie znaleziona</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[#00ccff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/40 font-black uppercase tracking-widest animate-pulse">Inicjalizacja systemu egzaminacyjnego...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl text-center space-y-8">
          <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto border border-blue-500/20">
            <LogIn className="w-10 h-10 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Wymagane Logowanie</h1>
            <p className="text-white/40 font-medium leading-relaxed">Aby rozpocząć egzamin dla administracji, musisz zalogować się przez Roblox OAuth2.</p>
          </div>
          <button
            onClick={() => {
              const clientId = "8976718339232083701";
              const origin = window.location.origin.replace(/\/$/, "");
              const redirectUri = encodeURIComponent(origin + "/robloxcallback");
              window.location.href = `https://authorize.roblox.com/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile&state=exam:${token}&step=accountConfirm`;
            }}
            className="w-full bg-black hover:bg-white/10 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl border border-white/10"
          >
             <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.5 4L20 18.5L5.5 20L4 5.5L18.5 4ZM14.5 10.5H9.5V14.5H14.5V10.5Z" />
             </svg>
             Zaloguj się przez Roblox
          </button>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] backdrop-blur-xl text-center space-y-8">
          <XCircle className="w-20 h-20 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-red-400">Brak Uprawnień</h1>
            <p className="text-white/60 font-medium">Twój Discord ID ({user.id}) nie znajduje się na liście osób uprawnionych do egzaminu.</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl transition-all"
          >
            Wróć na stronę główną
          </button>
        </div>
      </div>
    );
  }

  if (alreadyTaken && !examFinished) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-yellow-500/5 border border-yellow-500/20 p-8 rounded-[2.5rem] backdrop-blur-xl text-center space-y-8">
          <AlertTriangle className="w-20 h-20 text-yellow-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-yellow-500">Próba Wykorzystana</h1>
            <p className="text-white/60 font-medium">Ten egzamin można wykonać tylko raz. Wykryto, że Twoje konto lub adres IP już brało udział w teście.</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl transition-all"
          >
            Wróć na stronę główną
          </button>
        </div>
      </div>
    );
  }

  if (examFinished) {
    const questions = examData?.questions || [];
    const correct = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx]?.correctAnswer ? 1 : 0), 0);
    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= (examData?.passThreshold || 65);

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className={`bg-white/5 border ${passed ? 'border-green-500/30' : 'border-red-500/30'} p-12 rounded-[3rem] backdrop-blur-2xl text-center space-y-8 relative overflow-hidden`}>
            {passed ? (
              <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto animate-in zoom-in duration-500" />
            ) : (
              <XCircle className="w-24 h-24 text-red-500 mx-auto animate-in zoom-in duration-500" />
            )}
            
            <div className="space-y-2">
              <h1 className="text-5xl font-black uppercase tracking-tighter">
                Egzamin <span className={passed ? 'text-green-400' : 'text-red-400'}>{passed ? 'Zaliczony' : 'Niezaliczony'}</span>
              </h1>
              <p className="text-white/40 text-lg font-medium italic">Twój wynik został zapisany w systemie.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-white">{correct}/{questions.length}</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Poprawne</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-white">{answers.filter(a => a !== -1 && a !== questions[answers.indexOf(a)]?.correctAnswer).length}</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Błędne</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-white">{answers.filter(a => a === -1).length}</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pominięte</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-blue-400">{percentage}%</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Skuteczność</div>
              </div>
            </div>

            <button 
              onClick={() => router.push('/')}
              className="px-12 py-5 bg-white text-black font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              Zakończ i wyjdź
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-4">
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-2xl space-y-10">
          <div className="flex items-center gap-6 pb-8 border-b border-white/10">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 overflow-hidden shrink-0 shadow-2xl">
               <RobloxAvatar username={user.username} className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Status: Uprawniony</div>
              <h2 className="text-2xl font-black uppercase tracking-tight">{user.discordUsername || user.username}</h2>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Egzamin Kompetencyjny <span className="text-blue-400">PFF</span></h1>
            <div className="space-y-4 text-white/60 font-medium leading-relaxed">
              <p>Witaj w systemie egzaminacyjnym. Przed rozpoczęciem zapoznaj się z zasadami:</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Timer className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Masz dokładnie <strong>5 minut</strong> na rozwiązanie testu.</span>
                </li>
                <li className="flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  <span><strong>Nie możesz</strong> cofać się do poprzednich pytań.</span>
                </li>
                <li className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                  <span>Odświeżenie strony <strong>automatycznie kończy</strong> egzamin.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <span>Próg zaliczenia wynosi <strong>{examData?.passThreshold || 65}%</strong>.</span>
                </li>
              </ul>
            </div>
          </div>

          <button 
            onClick={startExam}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-6 rounded-3xl uppercase tracking-widest text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(59,130,246,0.2)] flex items-center justify-center gap-3"
          >
            Rozpocznij Egzamin <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = examData?.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (examData?.questions.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
      <div className="h-2 w-full bg-white/5 fixed top-0 left-0 z-[100]">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="container mx-auto px-4 flex-grow flex items-center justify-center py-24">
        <div className="max-w-3xl w-full space-y-12">
          <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
                <span className="text-blue-400 font-black text-xl italic tracking-tighter">{currentQuestionIndex + 1}/{examData?.questions.length}</span>
              </div>
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Pytanie</div>
            </div>

            <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border ${timeLeft < 30 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-white'}`}>
              <Timer className="w-5 h-5" />
              <span className="text-2xl font-black font-mono tracking-widest">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl font-black leading-tight tracking-tight uppercase italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              {currentQuestion?.question}
            </h1>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion?.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`group relative flex items-center p-8 rounded-[2rem] border transition-all duration-300 text-left ${
                    answers[currentQuestionIndex] === idx 
                      ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_40px_rgba(59,130,246,0.1)]' 
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black mr-6 transition-colors ${
                    answers[currentQuestionIndex] === idx ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40 group-hover:bg-white/20'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-xl font-bold tracking-tight uppercase">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-12 flex justify-end">
            <button
              onClick={nextQuestion}
              disabled={answers[currentQuestionIndex] === -1}
              className="group px-16 py-6 bg-white disabled:bg-white/10 text-black disabled:text-white/20 font-black rounded-3xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
            >
              {currentQuestionIndex === (examData?.questions.length || 0) - 1 ? 'Zakończ Egzamin' : 'Dalej'} 
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
