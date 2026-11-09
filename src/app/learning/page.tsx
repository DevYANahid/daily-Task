
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./learning.module.css";

type TrackId = "ai" | "devops" | "english";
type TabId = "overview" | "roadmap";

type Task = {
  id: string;
  title: string;
  detail: string;
  duration: string;
};

type Track = {
  id: TrackId;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  tasks: Task[];
};

type ProgressData = Record<string, Record<TrackId, string[]>>;

type RoadmapWeek = {
  title: string;
  outcome: string;
  topics: string[];
  project: string;
};

const STORAGE_KEY = "softvivo-learning-dashboard-v2";

const tracks: Track[] = [
  {
    id: "ai",
    title: "AI Agent Development",
    subtitle: "Build the SoftVivo AI Sales Agent",
    icon: "✳",
    accent: "violet",
    tasks: [
      { id: "python", title: "Python practice", detail: "Learn and code one Python concept.", duration: "30 min" },
      { id: "javascript", title: "JavaScript practice", detail: "Practice async, objects, arrays or functions.", duration: "30 min" },
      { id: "learning", title: "AI Agent lesson", detail: "Study one topic from this week's roadmap.", duration: "30 min" },
      { id: "build", title: "Build something practical", detail: "Add a small feature to your SoftVivo AI Sales Agent.", duration: "30 min" },
    ],
  },
  {
    id: "devops",
    title: "DevOps / DevSecOps",
    subtitle: "Build, deploy and secure applications",
    icon: "⌘",
    accent: "blue",
    tasks: [
      { id: "linux", title: "Linux command practice", detail: "Use terminal commands and understand the output.", duration: "25 min" },
      { id: "concept", title: "Study a core concept", detail: "Networking, cloud, CI/CD or infrastructure.", duration: "25 min" },
      { id: "tool", title: "Hands-on tool practice", detail: "Work with Git, Docker, AWS or Terraform.", duration: "25 min" },
      { id: "security", title: "Security and review", detail: "Review permissions, secrets or deployment security.", duration: "15 min" },
    ],
  },
  {
    id: "english",
    title: "English Fluency",
    subtitle: "Speak clearly and confidently",
    icon: "◉",
    accent: "emerald",
    tasks: [
      { id: "listen", title: "Focused listening", detail: "Listen to a short English talk or interview.", duration: "15 min" },
      { id: "shadow", title: "Shadow speaking", detail: "Repeat sentences aloud with natural rhythm.", duration: "15 min" },
      { id: "vocab", title: "Useful expressions", detail: "Learn and use five practical phrases.", duration: "10 min" },
      { id: "speak", title: "One-minute speaking", detail: "Record yourself speaking on one topic.", duration: "10 min" },
    ],
  },
];

const roadmap: RoadmapWeek[] = [
  { title: "Python + JavaScript fundamentals", outcome: "Write the basic logic behind an agent.", topics: ["Python syntax, variables and functions", "JavaScript fundamentals and async", "Conditions, loops, arrays and objects"], project: "Create a command-line study assistant." },
  { title: "APIs, JSON, HTTP and async", outcome: "Connect your application to external services.", topics: ["HTTP methods and status codes", "JSON parsing and API requests", "Async / await and error handling"], project: "Build a small API-powered application." },
  { title: "LLMs, prompts and OpenAI API", outcome: "Create your first AI-powered assistant.", topics: ["How LLMs work", "Prompt structure and system instructions", "Calling an LLM API from Python and JavaScript"], project: "Build a SoftVivo FAQ assistant." },
  { title: "Function calling and tools", outcome: "Let an AI agent perform useful actions.", topics: ["Tool and function schemas", "Validating tool arguments", "Calling external APIs safely"], project: "Give the assistant a lead-capture tool." },
  { title: "Agent memory and RAG", outcome: "Build an agent that can use business knowledge.", topics: ["Embeddings and semantic search", "Vector database concepts", "Retrieval-augmented generation"], project: "Answer questions from SoftVivo service documents." },
  { title: "OpenAI Agents SDK", outcome: "Create a structured working agent.", topics: ["Agents and instructions", "Tools, handoffs and guardrails", "Tracing and evaluation basics"], project: "Build the first complete sales-agent workflow." },
  { title: "LangGraph and workflows", outcome: "Coordinate multi-step agent tasks.", topics: ["Graph, nodes and edges", "State and conditional routing", "Human approval and recovery"], project: "Create a lead qualification workflow." },
  { title: "FastAPI + PostgreSQL", outcome: "Build a reliable backend and data layer.", topics: ["FastAPI routes and validation", "PostgreSQL schema design", "Persistence and database integration"], project: "Store leads and conversations." },
  { title: "Next.js integration", outcome: "Turn the agent into a complete web application.", topics: ["Next.js UI and server routes", "Connect frontend to backend", "Authentication and dashboard states"], project: "Build the SoftVivo sales-agent dashboard." },
  { title: "n8n + MCP + automation", outcome: "Connect the agent to business workflows.", topics: ["n8n triggers and workflows", "MCP concepts and tool connections", "Email, CRM and notification automation"], project: "Automate a new-lead follow-up." },
  { title: "Docker + AWS + security", outcome: "Deploy the application safely.", topics: ["Docker images and containers", "AWS deployment fundamentals", "Secrets, access control and logging"], project: "Deploy a staging version." },
  { title: "Testing, monitoring and launch", outcome: "Launch the SoftVivo AI Sales Agent.", topics: ["Test agent responses and tools", "Monitor errors, latency and cost", "Improve reliability and business value"], project: "Launch, document and demo the product." },
];

function localToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function readSavedProgress(): ProgressData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressData) : {};
  } catch {
    return {};
  }
}

export default function LearningPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [progress, setProgress] = useState<ProgressData>({});
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeTrack, setActiveTrack] = useState<TrackId | "all">("all");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSelectedDate(localToday());
    setProgress(readSavedProgress());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Unable to save learning progress:", error);
    }
  }, [progress, loaded]);

  const dayData = progress[selectedDate] ?? ({} as Record<TrackId, string[]>);
  const totalTasks = tracks.reduce((sum, track) => sum + track.tasks.length, 0);

  const completedTasks = tracks.reduce(
    (sum, track) => sum + (dayData[track.id]?.length ?? 0),
    0
  );

  const dailyProgress = Math.round((completedTasks / totalTasks) * 100);
  const visibleTracks = activeTrack === "all"
    ? tracks
    : tracks.filter((track) => track.id === activeTrack);

  const activeDays = useMemo(
    () => Object.values(progress).filter((day) =>
      tracks.some((track) => (day?.[track.id]?.length ?? 0) > 0)
    ).length,
    [progress]
  );

  const currentWeek = roadmap[selectedWeek - 1];

  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  function toggleTask(trackId: TrackId, taskId: string) {
    setProgress((previous) => {
      const currentDay = previous[selectedDate] ?? ({} as Record<TrackId, string[]>);
      const currentTasks = currentDay[trackId] ?? [];
      const updated = currentTasks.includes(taskId)
        ? currentTasks.filter((id) => id !== taskId)
        : [...currentTasks, taskId];

      return {
        ...previous,
        [selectedDate]: { ...currentDay, [trackId]: updated },
      };
    });
  }

  function resetDay() {
    if (!window.confirm("Reset all checklist progress for this date?")) return;
    setProgress((previous) => ({ ...previous, [selectedDate]: {} as Record<TrackId, string[]> }));
  }

  function openTrack(track: TrackId) {
    setActiveTrack(track);
    setActiveTab("overview");
  }

  if (!loaded) {
    return <div className={styles.loading}>Loading your learning workspace...</div>;
  }

  return (
    <main className={styles.appShell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>S</span>
          <span className={styles.brandText}>
            <strong>SoftVivo</strong>
            <small>LEARNING STUDIO</small>
          </span>
        </Link>

        <div className={styles.sidebarLabel}>WORKSPACE</div>
        <nav className={styles.sidebarNav}>
          <button className={`${styles.navItem} ${activeTab === "overview" && activeTrack === "all" ? styles.navActive : ""}`} onClick={() => { setActiveTab("overview"); setActiveTrack("all"); }}>
            <span className={styles.navIcon}>▦</span> Overview
          </button>
          <button className={`${styles.navItem} ${activeTrack === "ai" ? styles.navActive : ""}`} onClick={() => openTrack("ai")}>
            <span className={styles.navIcon}>✳</span> AI Agent Development
          </button>
          <button className={`${styles.navItem} ${activeTrack === "devops" ? styles.navActive : ""}`} onClick={() => openTrack("devops")}>
            <span className={styles.navIcon}>⌘</span> DevOps / DevSecOps
          </button>
          <button className={`${styles.navItem} ${activeTrack === "english" ? styles.navActive : ""}`} onClick={() => openTrack("english")}>
            <span className={styles.navIcon}>◉</span> English Fluency
          </button>
        </nav>

        <div className={styles.sidebarLabel}>YOUR PLAN</div>
        <nav className={styles.sidebarNav}>
          <button className={`${styles.navItem} ${activeTab === "roadmap" ? styles.navActive : ""}`} onClick={() => setActiveTab("roadmap")}>
            <span className={styles.navIcon}>⌁</span> 12-Week AI Roadmap
          </button>
          <button className={styles.navItem} onClick={resetDay}>
            <span className={styles.navIcon}>↺</span> Reset today's tasks
          </button>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.focusCard}>
            <div className={styles.focusIcon}>✦</div>
            <strong>Keep showing up.</strong>
            <p>One focused session today is better than a perfect plan tomorrow.</p>
          </div>
          <span className={styles.sidebarFoot}>BUILD YOUR FUTURE · SOFTVIVO</span>
        </div>
      </aside>

      <section className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <div className={styles.breadcrumb}>WORKSPACE <span>/</span> PERSONAL DEVELOPMENT</div>
            <h1>{activeTab === "roadmap" ? "AI Agent Roadmap" : "Your Learning Dashboard"}</h1>
            <p className={styles.headerSubtitle}>Learn consistently. Build real skills. Create your future.</p>
          </div>
          <div className={styles.dateControl}>
            <label htmlFor="learning-date">LEARNING DATE</label>
            <input id="learning-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            <span>{formattedDate}</span>
          </div>
        </header>

        <div className={styles.welcomeBanner}>
          <div>
            <span className={styles.bannerEyebrow}>YOUR NEXT CHAPTER STARTS HERE</span>
            <h2>Make today count.</h2>
            <p>Stay consistent across technology, career skills and communication.</p>
          </div>
          <div className={styles.bannerOrb} aria-hidden="true"><span>✦</span></div>
        </div>

        <section className={styles.statsGrid}>
          <article className={`${styles.statCard} ${styles.progressStat}`}>
            <div className={styles.statLabel}>TODAY'S PROGRESS</div>
            <div className={styles.statValue}>{dailyProgress}<small>%</small></div>
            <div className={styles.statHint}>{completedTasks} of {totalTasks} tasks completed</div>
            <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${dailyProgress}%` }} /></div>
          </article>
          <article className={styles.statCard}>
            <div className={styles.statIcon}>✳</div>
            <div className={styles.statLabel}>LEARNING TRACKS</div>
            <div className={styles.statValue}>03</div>
            <div className={styles.statHint}>Your active development goals</div>
          </article>
          <article className={styles.statCard}>
            <div className={styles.statIcon}>◷</div>
            <div className={styles.statLabel}>ACTIVE DAYS</div>
            <div className={styles.statValue}>{activeDays}</div>
            <div className={styles.statHint}>Days with at least one task done</div>
          </article>
        </section>

        <div className={styles.contentTabs}>
          <button className={activeTab === "overview" ? styles.tabActive : ""} onClick={() => setActiveTab("overview")}>Daily checklist <span>12 tasks</span></button>
          <button className={activeTab === "roadmap" ? styles.tabActive : ""} onClick={() => setActiveTab("roadmap")}>AI Agent roadmap <span>12 weeks</span></button>
        </div>

        {activeTab === "overview" ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionEyebrow}>DAILY EXECUTION</span>
                <h2>Learning checklist</h2>
                <p>Choose a track and complete each small action.</p>
              </div>
              <div className={styles.filterGroup}>
                {(["all", "ai", "devops", "english"] as const).map((id) => (
                  <button key={id} className={activeTrack === id ? styles.filterActive : ""} onClick={() => setActiveTrack(id)}>
                    {id === "all" ? "All tracks" : id === "ai" ? "AI Agent" : id === "devops" ? "DevOps" : "English"}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.trackGrid}>
              {visibleTracks.map((track) => {
                const done = dayData[track.id] ?? [];
                const percent = Math.round((done.length / track.tasks.length) * 100);
                return (
                  <article key={track.id} className={`${styles.trackCard} ${styles[track.accent]}`}>
                    <div className={styles.trackHeader}>
                      <div className={styles.trackIcon}>{track.icon}</div>
                      <span className={styles.trackPercent}>{percent}%</span>
                    </div>
                    <h3>{track.title}</h3>
                    <p className={styles.trackSubtitle}>{track.subtitle}</p>
                    <div className={styles.trackProgressMeta}><span>Daily progress</span><strong>{done.length}/{track.tasks.length}</strong></div>
                    <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${percent}%` }} /></div>
                    <div className={styles.taskList}>
                      {track.tasks.map((task) => {
                        const checked = done.includes(task.id);
                        return (
                          <label key={task.id} className={`${styles.taskRow} ${checked ? styles.taskDone : ""}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggleTask(track.id, task.id)} />
                            <span className={styles.customCheck}>{checked ? "✓" : ""}</span>
                            <span className={styles.taskCopy}>
                              <strong>{task.title}</strong>
                              <small>{task.detail}</small>
                            </span>
                            <span className={styles.taskDuration}>{task.duration}</span>
                          </label>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
            <div className={styles.bottomActions}>
              <p>Progress is saved automatically in this browser.</p>
              <button onClick={resetDay}>Reset selected date</button>
            </div>
          </section>
        ) : (
          <section className={styles.roadmapSection}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionEyebrow}>12-WEEK BUILD PLAN</span>
                <h2>Become an AI Agent Developer</h2>
                <p>A practical path towards launching your SoftVivo AI Sales Agent.</p>
              </div>
              <div className={styles.weekSelect}>
                <label htmlFor="week-select">JUMP TO WEEK</label>
                <select id="week-select" value={selectedWeek} onChange={(event) => setSelectedWeek(Number(event.target.value))}>
                  {roadmap.map((_, index) => <option key={index} value={index + 1}>Week {index + 1}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.roadmapLayout}>
              <div className={styles.weekList}>
                {roadmap.map((week, index) => (
                  <button key={week.title} className={selectedWeek === index + 1 ? styles.weekSelected : ""} onClick={() => setSelectedWeek(index + 1)}>
                    <span>WEEK {String(index + 1).padStart(2, "0")}</span>
                    <strong>{week.title}</strong>
                    <i>{selectedWeek === index + 1 ? "●" : "○"}</i>
                  </button>
                ))}
              </div>
              <article className={styles.weekDetail}>
                <span className={styles.weekBadge}>WEEK {String(selectedWeek).padStart(2, "0")} / 12</span>
                <h3>{currentWeek.title}</h3>
                <p className={styles.outcomeLabel}>YOUR TARGET OUTCOME</p>
                <div className={styles.outcomeBox}><span>✦</span>{currentWeek.outcome}</div>
                <h4>What you'll learn</h4>
                <ul className={styles.topicList}>
                  {currentWeek.topics.map((topic) => <li key={topic}><span>✓</span>{topic}</li>)}
                </ul>
                <div className={styles.projectBox}>
                  <span>WEEKLY PRACTICAL PROJECT</span>
                  <strong>{currentWeek.project}</strong>
                </div>
                <div className={styles.roadmapFooter}>
                  <span>Roadmap position</span><strong>{selectedWeek} / 12</strong>
                </div>
                <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${(selectedWeek / 12) * 100}%` }} /></div>
                <div className={styles.weekActions}>
                  <button disabled={selectedWeek === 1} onClick={() => setSelectedWeek((week) => week - 1)}>← Previous</button>
                  <button disabled={selectedWeek === 12} onClick={() => setSelectedWeek((week) => week + 1)}>Next week →</button>
                </div>
              </article>
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <span>SOFTVIVO LEARNING STUDIO</span>
          <p>Consistency beats intensity. Keep building.</p>
        </footer>
      </section>
    </main>
  );
}
