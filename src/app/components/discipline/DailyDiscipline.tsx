
"use client";
import "./DailyDiscipline.css";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2,
  Circle, Clock3, Code2, Flame, Mic, Terminal, X,
  Target, Sparkles, Leaf, Sun, Trophy, Zap
} from "lucide-react";
import "./DailyDiscipline.css";

type Task = {
  id: string;
  slug: string;
  title: string;
  description: string;
  targetMinutes: number | null;
  completed: boolean;
};

type Plan = {
  id: string;
  completed: boolean;
  tasks: Task[];
};

type DayStatus = {
  date: string;
  completed: boolean;
  tasks: { completed: boolean }[];
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dateKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const icons: Record<string, typeof Mic> = {
  english: Mic,
  "linux-aws": Terminal,
  softvivo: Code2,
};

const colors: Record<string, string> = {
  english: "english",
  "linux-aws": "linux",
  softvivo: "softvivo",
};

export default function DailyDiscipline() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plan, setPlan] = useState<Plan | null>(null);
  const [days, setDays] = useState<DayStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [seconds, setSeconds] = useState(180);
  const [timerRunning, setTimerRunning] = useState(false);
  const [message, setMessage] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const completedDays = days.filter(d => d.completed).length;
  const completedTasks = plan?.tasks.filter(t => t.completed).length ?? 0;

  const loadMonth = useCallback(async () => {
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    try {
      const res = await fetch(`/api/discipline?month=${monthKey}`);
      if (res.ok) setDays(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [year, month]);

  const loadPlan = useCallback(async (date: string) => {
    setLoading(true);
    setPlan(null);
    setMessage("");
    setSeconds(180);
    setTimerRunning(false);

    try {
      const res = await fetch(`/api/discipline/${date}`);
      if (!res.ok) throw new Error("Could not load missions");
      setPlan(await res.json());
    } catch (e) {
      console.error(e);
      setMessage("Could not load your missions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  useEffect(() => {
    if (selectedDate) loadPlan(selectedDate);
  }, [selectedDate, loadPlan]);

  useEffect(() => {
    if (!timerRunning || seconds <= 0) {
      if (seconds === 0) setTimerRunning(false);
      return;
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [timerRunning, seconds]);

  async function toggleTask(task: Task) {
    if (!plan || !selectedDate || updating) return;
    setUpdating(true);
    setMessage("");

    try {
      const res = await fetch(`/api/discipline/${selectedDate}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: task.slug,
          completed: !task.completed,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setPlan(updated);
      await loadMonth();
    } catch (e) {
      console.error(e);
      setMessage("Unable to save. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  function closeModal() {
    setSelectedDate(null);
    setTimerRunning(false);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const progress = Math.round((completedTasks / 3) * 100);
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <main className="discipline-page">

      {/* OFFICE BACKGROUND */}
      <div className="office-scene">
        <div className="office-window">
          <div className="window-sky" />
          <div className="window-sun" />
          <div className="window-lines" />
        </div>

        <div className="office-shelf">
          <span /><span /><span />
        </div>

        <div className="office-plant plant-left">
          <i /><i /><i /><i /><i />
          <div className="plant-pot" />
        </div>

        <div className="office-plant plant-right">
          <i /><i /><i /><i /><i /><i />
          <div className="plant-pot" />
        </div>
      </div>

      <div className="discipline-content">

        {/* HEADER */}
        <header className="discipline-header">
          <div>
            <div className="eyebrow">
              <Sparkles size={15} /> SOFTVIVO PERSONAL GROWTH
            </div>
            <h1>Build Your <span>Future.</span></h1>
            <p>Focus on your goals. Show up every day. Make progress.</p>
          </div>

          <div className="header-date">
            <Sun size={19} />
            <div>
              <strong>{new Date().toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric"
              })}</strong>
              <small>Your next chapter starts today.</small>
            </div>
          </div>
        </header>

        {/* HERO STATS */}
        <section className="discipline-stats">
          <article className="stat-card stat-green">
            <div className="stat-icon"><Target /></div>
            <small>Monthly progress</small>
            <strong>{Math.round(completedDays / daysInMonth * 100)}%</strong>
            <div className="stat-track">
              <span style={{ width: `${completedDays / daysInMonth * 100}%` }} />
            </div>
          </article>

          <article className="stat-card stat-orange">
            <div className="stat-icon"><Flame /></div>
            <small>Completed days</small>
            <strong>{completedDays}<small> / {daysInMonth}</small></strong>
            <p>Keep your consistency alive.</p>
          </article>

          <article className="stat-card stat-purple">
            <div className="stat-icon"><Zap /></div>
            <small>Daily missions</small>
            <strong>03</strong>
            <p>Learn. Build. Grow.</p>
          </article>
        </section>

        {/* CALENDAR */}
        <section className="calendar-panel">
          <div className="calendar-heading">
            <div>
              <div className="eyebrow"><CalendarDays size={15} /> YOUR JOURNEY</div>
              <h2>Daily Activity Calendar</h2>
              <p>Every day is another opportunity to improve.</p>
            </div>

            <div className="calendar-controls">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                <ArrowLeft size={18} />
              </button>
              <strong>{currentDate.toLocaleDateString("en-US", {
                month: "long", year: "numeric"
              })}</strong>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d =>
              <div className="weekday" key={d}>{d}</div>
            )}

            {Array.from({ length: firstDay }).map((_, i) =>
              <div key={`blank-${i}`} />
            )}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const key = dateKey(year, month, day);
              const status = days.find(d => d.date.slice(0, 10) === key);
              const done = !!status?.completed;
              const partial = !done && (status?.tasks?.filter(t => t.completed).length ?? 0) > 0;
              const isToday = today() === key;
              const selected = selectedDate === key;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(key)}
                  className={`calendar-day ${done ? "day-done" : ""} ${partial ? "day-partial" : ""} ${isToday ? "day-today" : ""} ${selected ? "day-selected" : ""}`}
                >
                  <span className="day-number">{day}</span>
                  {done ? (
                    <span className="day-check"><Check size={15} /></span>
                  ) : (
                    <span className="day-dot" />
                  )}
                  {isToday && <span className="today-label">TODAY</span>}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span><i className="legend-done" /> Completed</span>
            <span><i className="legend-partial" /> In progress</span>
            <span><i className="legend-today" /> Today</span>
          </div>
        </section>

        {/* MOTIVATION */}
        <section className="motivation-panel">
          <div className="motivation-icon"><Leaf size={25} /></div>
          <div>
            <strong>Growth takes patience.</strong>
            <p>Like a plant, your skills grow when you take care of them every day.</p>
          </div>
          <Trophy className="motivation-trophy" size={34} />
        </section>
      </div>

      {/* DYNAMIC DAILY POPUP */}
      {selectedDate && (
        <div className="mission-overlay" onClick={closeModal}>
          <section className="mission-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top-decoration" />

            <header className="modal-header">
              <div>
                <div className="eyebrow"><Sparkles size={14} /> DAILY CHALLENGE</div>
                <h2>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                  "en-US", { weekday: "long", month: "long", day: "numeric" }
                )}</h2>
                <p>{selectedDate === today()
                  ? "Today is your opportunity to get better."
                  : "Your progress for this day."}</p>
              </div>
              <button className="modal-close" onClick={closeModal}><X /></button>
            </header>

            {loading || !plan ? (
              <div className="modal-loading">
                {message || "Preparing your daily missions..."}
              </div>
            ) : (
              <>
                <div className="mission-progress">
                  <div className="progress-ring" style={{
                    background: `conic-gradient(#20C997 ${progress}%, #26344A 0)`
                  }}>
                    <div><strong>{progress}%</strong><small>DONE</small></div>
                  </div>
                  <div className="progress-copy">
                    <strong>{completedTasks} of 3 missions completed</strong>
                    <p>One step closer to your goals.</p>
                    <div className="progress-line">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mission-list">
                  {plan.tasks.map(task => {
                    const Icon = icons[task.slug] || Target;
                    return (
                      <article key={task.id} className={`mission-card mission-${colors[task.slug]} ${task.completed ? "mission-complete" : ""}`}>
                        <div className="mission-icon"><Icon size={24} /></div>
                        <div className="mission-details">
                          <div className="mission-title">
                            <h3>{task.title}</h3>
                            <span>{task.targetMinutes === 180 ? "3 HOURS" : task.targetMinutes === 3 ? "3 MIN" : "LEARNING"}</span>
                          </div>
                          <p>{task.description}</p>

                          {task.slug === "english" && (
                            <div className="speaking-timer">
                              <div>
                                <small>YOUR SPEAKING SESSION</small>
                                <strong>{formatTime(seconds)}</strong>
                              </div>
                              <div className="timer-buttons">
                                <button disabled={task.completed} onClick={() => setTimerRunning(v => !v)}>
                                  {timerRunning ? "Pause" : "Start"}
                                </button>
                                <button disabled={task.completed} onClick={() => {
                                  setSeconds(180);
                                  setTimerRunning(false);
                                }}>Reset</button>
                              </div>
                            </div>
                          )}

                          <button
                            disabled={updating}
                            onClick={() => toggleTask(task)}
                            className={`mission-action ${task.completed ? "action-done" : ""}`}
                          >
                            {task.completed ? <><CheckCircle2 size={17} /> Completed</> : <><Circle size={17} /> Mark as completed</>}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {message && <p className="mission-error">{message}</p>}

                {plan.completed && (
                  <div className="success-banner">
                    <Trophy size={28} />
                    <div>
                      <strong>YOU DID IT!</strong>
                      <p>Three missions. One powerful day. Keep growing!</p>
                    </div>
                    <CheckCircle2 size={25} />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
