import { useState, useEffect, useRef } from "react";
import {
  Timer,
  CheckSquare,
  Sparkles,
  BarChart2,
  Music,
  Sun,
  Moon,
  Settings,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Maximize2,
  CloudRain,
  Waves,
  Trees,
  Brain,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Volume2,
} from "lucide-react";
import "./ZenPulse.css";
import oceanSound from "./assets/oceans.wav";
// Audio Stream URLs
// Replace your current SOUND_URLS object with this:
const SOUND_URLS = {
  rain: "https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3",
  ocean: oceanSound,
  forest: "https://assets.mixkit.co/active_storage/sfx/2437/2437-preview.mp3",
  alpha: "https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3",
};
export default function ZenPulse() {
  // Navigation & Theme States
  const [activeTab, setActiveTab] = useState("Timer");
  const [theme, setTheme] = useState("dark");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioDrawerOpen, setIsAudioDrawerOpen] = useState(false);

  // Timer Configuration Durations (in seconds)
  const [durations, setDurations] = useState({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  // Timer States
  const [mode, setMode] = useState("focus"); // 'focus', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);

  // Tasks States
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Audio States
  const [selectedSound, setSelectedSound] = useState("off");
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  // Analytics Stats
  const [stats, setStats] = useState({
    completedSessions: 0,
    totalMinutesFocused: 0,
  });

  // Handle Theme Toggle
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Handle Mode Change (Focus / Short Break / Long Break)
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(durations[newMode]);
  };

  // Timer Logic
  useEffect(() => {
    let timer = null;

    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);

            if (mode === "focus") {
              setSessionCount((s) => s + 1);
              setStats((prevStats) => ({
                completedSessions: prevStats.completedSessions + 1,
                totalMinutesFocused:
                  prevStats.totalMinutesFocused +
                  Math.floor(durations.focus / 60),
              }));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, mode, durations]);

  // Audio Playback Handling
  // 1. Audio Track Handler (triggers on sound change)
  // Audio Playback & Volume Handling
  useEffect(() => {
    if (selectedSound === "off" || !SOUND_URLS[selectedSound]) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUND_URLS[selectedSound]);
        audioRef.current.loop = true;
      } else if (audioRef.current.src !== SOUND_URLS[selectedSound]) {
        audioRef.current.src = SOUND_URLS[selectedSound];
      }

      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .catch((err) => console.log("Audio play error:", err));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedSound, volume]); // <-- Both dependencies declared here resolves the ESLint warning

  // Volume Adjustment
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  // Formatting MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Controls
  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const skipSession = () => {
    setIsRunning(false);
    if (mode === "focus") handleModeChange("shortBreak");
    else handleModeChange("focus");
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Task Actions
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
  };

  const toggleTaskComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Duration Settings Change Handlers
  const handleDurationChange = (type, minutes) => {
    const newSecs = Math.max(1, parseInt(minutes) || 1) * 60;
    setDurations((prev) => {
      const updated = { ...prev, [type]: newSecs };
      if (mode === type && !isRunning) {
        setTimeLeft(newSecs);
      }
      return updated;
    });
  };

  return (
    <div className={`zenpulse-container ${theme}-theme`}>
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <div className="brand">
          <div className="logo-icon">
            <Timer size={20} />
          </div>
          <span className="brand-name">ZenPulse</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === "Timer" ? "active" : ""}`}
            onClick={() => setActiveTab("Timer")}
          >
            <Timer size={16} /> Timer
          </button>
          <button
            className={`nav-btn ${activeTab === "Tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("Tasks")}
          >
            <CheckSquare size={16} /> Tasks{" "}
            <span className="badge">
              {tasks.filter((t) => !t.completed).length}
            </span>
          </button>
          <button
            className={`nav-btn ${activeTab === "Zen" ? "active" : ""}`}
            onClick={() => setActiveTab("Zen")}
          >
            <Sparkles size={16} /> Zen & Sound
          </button>
          <button
            className={`nav-btn ${activeTab === "Analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("Analytics")}
          >
            <BarChart2 size={16} /> Analytics
          </button>
        </nav>

        <div className="utility-icons">
          <button
            className="icon-btn"
            title="Audio Settings"
            onClick={() => setIsAudioDrawerOpen(!isAudioDrawerOpen)}
          >
            <Music size={18} />
          </button>
          <button
            className="icon-btn"
            title="Toggle Theme"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="icon-btn"
            title="Settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Dynamic View Sections */}
      <main className="main-content">
        {/* TAB 1: TIMER */}
        {activeTab === "Timer" && (
          <div className="tab-pane">
            {/* Mode Selector Pill */}
            <div className="mode-selector">
              <button
                className={`mode-btn ${mode === "focus" ? "active" : ""}`}
                onClick={() => handleModeChange("focus")}
              >
                Focus
              </button>
              <button
                className={`mode-btn ${mode === "shortBreak" ? "active" : ""}`}
                onClick={() => handleModeChange("shortBreak")}
              >
                Short Break
              </button>
              <button
                className={`mode-btn ${mode === "longBreak" ? "active" : ""}`}
                onClick={() => handleModeChange("longBreak")}
              >
                Long Break
              </button>
            </div>

            {/* Current Task Banner */}
            <div
              className="current-task-pill"
              onClick={() => setActiveTab("Tasks")}
              style={{ cursor: "pointer" }}
            >
              <span>
                Current Focus:{" "}
                <strong>
                  {activeTask ? activeTask.text : "No task selected"}
                </strong>
              </span>
              <span className="chevron">&rsaquo;</span>
            </div>

            {/* Circular Timer Display */}
            <div className="timer-circle-container">
              <div className="timer-circle">
                <span className="session-label">
                  {mode === "focus"
                    ? `FOCUS SESSION #${sessionCount}`
                    : mode.toUpperCase()}
                </span>
                <div className="time-display">{formatTime(timeLeft)}</div>
                <span className="status-label">
                  {isRunning ? "Focusing..." : "Ready to focus"}
                </span>
              </div>
            </div>

            {/* Action Controls */}
            <div className="controls-row">
              <button
                className="control-circle-btn"
                onClick={resetTimer}
                title="Reset"
              >
                <RotateCcw size={18} />
              </button>

              <button className="start-btn" onClick={toggleTimer}>
                {isRunning ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
                <span>{isRunning ? "Pause" : "Start Focus"}</span>
              </button>

              <button
                className="control-circle-btn"
                onClick={skipSession}
                title="Skip Session"
              >
                <SkipForward size={18} />
              </button>

              <button
                className="control-circle-btn"
                onClick={toggleFullScreen}
                title="Full Screen"
              >
                <Maximize2 size={18} />
              </button>
            </div>

            {/* Sound Selector Bar */}
            <div className="sound-bar">
              <span className="sound-label">Background Sound:</span>
              <button
                className={`sound-pill ${selectedSound === "off" ? "active" : ""}`}
                onClick={() => setSelectedSound("off")}
              >
                Off
              </button>
              <button
                className={`sound-pill ${selectedSound === "rain" ? "active" : ""}`}
                onClick={() => setSelectedSound("rain")}
              >
                <CloudRain size={14} /> Rain
              </button>
              <button
                className={`sound-pill ${selectedSound === "ocean" ? "active" : ""}`}
                onClick={() => setSelectedSound("ocean")}
              >
                <Waves size={14} /> Ocean
              </button>
              <button
                className={`sound-pill ${selectedSound === "forest" ? "active" : ""}`}
                onClick={() => setSelectedSound("forest")}
              >
                <Trees size={14} /> Forest
              </button>
              <button
                className={`sound-pill ${selectedSound === "alpha" ? "active" : ""}`}
                onClick={() => setSelectedSound("alpha")}
              >
                <Brain size={14} /> Alpha Beats
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TASKS */}
        {activeTab === "Tasks" && (
          <div className="tab-pane tasks-pane">
            <h2>Task Manager</h2>
            <form className="task-form" onSubmit={handleAddTask}>
              <input
                type="text"
                placeholder="What are you working on today?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
              />
              <button type="submit" className="add-task-btn">
                <Plus size={18} /> Add
              </button>
            </form>

            <ul className="task-list">
              {tasks.length === 0 ? (
                <p className="empty-msg">
                  No tasks added yet. Create one above!
                </p>
              ) : (
                tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`task-item ${task.completed ? "completed" : ""} ${
                      activeTaskId === task.id ? "focused" : ""
                    }`}
                  >
                    <div className="task-left">
                      <button
                        className="check-btn"
                        onClick={() => toggleTaskComplete(task.id)}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <span className="task-text">{task.text}</span>
                    </div>

                    <div className="task-actions">
                      <button
                        className={`focus-select-btn ${
                          activeTaskId === task.id ? "active" : ""
                        }`}
                        onClick={() =>
                          setActiveTaskId(
                            activeTaskId === task.id ? null : task.id,
                          )
                        }
                      >
                        {activeTaskId === task.id ? "Focusing" : "Set Active"}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {/* TAB 3: ZEN & SOUND */}
        {activeTab === "Zen" && (
          <div className="tab-pane zen-pane">
            <h2>Zen Soundscapes</h2>
            <p className="sub-heading">
              Select ambient background sound for deep focus and relaxation.
            </p>

            <div className="sound-cards-grid">
              {[
                { id: "off", name: "Silence", icon: <X size={24} /> },
                { id: "rain", name: "Rainfall", icon: <CloudRain size={24} /> },
                { id: "ocean", name: "Ocean Waves", icon: <Waves size={24} /> },
                {
                  id: "forest",
                  name: "Forest Birds",
                  icon: <Trees size={24} />,
                },
                { id: "alpha", name: "Alpha Waves", icon: <Brain size={24} /> },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`sound-card ${
                    selectedSound === item.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedSound(item.id)}
                >
                  <div className="sound-icon">{item.icon}</div>
                  <h3>{item.name}</h3>
                  <p>
                    {selectedSound === item.id
                      ? "Currently Playing"
                      : "Click to Play"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === "Analytics" && (
          <div className="tab-pane analytics-pane">
            <h2>Focus Analytics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Completed Sessions</h3>
                <div className="stat-value">{stats.completedSessions}</div>
              </div>
              <div className="stat-card">
                <h3>Total Focused Time</h3>
                <div className="stat-value">
                  {stats.totalMinutesFocused} mins
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AUDIO SETTINGS DRAWER OVERLAY */}
      {isAudioDrawerOpen && (
        <div className="drawer-overlay">
          <div className="drawer-content">
            <div className="drawer-header">
              <h3>
                <Music size={18} /> Audio Controls
              </h3>
              <button
                className="close-icon"
                onClick={() => setIsAudioDrawerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="drawer-body">
              <label>
                <Volume2 size={16} /> Volume
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
              <p>
                Active Sound: <strong>{selectedSound.toUpperCase()}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Timer Settings</h3>
              <button
                className="close-icon"
                onClick={() => setIsSettingsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="setting-field">
                <label>Focus Duration (mins)</label>
                <input
                  type="number"
                  value={durations.focus / 60}
                  onChange={(e) =>
                    handleDurationChange("focus", e.target.value)
                  }
                />
              </div>
              <div className="setting-field">
                <label>Short Break (mins)</label>
                <input
                  type="number"
                  value={durations.shortBreak / 60}
                  onChange={(e) =>
                    handleDurationChange("shortBreak", e.target.value)
                  }
                />
              </div>
              <div className="setting-field">
                <label>Long Break (mins)</label>
                <input
                  type="number"
                  value={durations.longBreak / 60}
                  onChange={(e) =>
                    handleDurationChange("longBreak", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
