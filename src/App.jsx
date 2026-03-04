import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const PHASES = [
  {
    id: 1,
    name: "Hypertrophy",
    color: "#00ff88",
    desc: "Volume-focused, 8-12 reps",
    weeks: 4,
  },
  {
    id: 2,
    name: "Strength",
    color: "#00cfff",
    desc: "Heavy loads, 4-6 reps",
    weeks: 4,
  },
  {
    id: 3,
    name: "Power",
    color: "#ff6b35",
    desc: "Explosive, 3-5 reps",
    weeks: 4,
  },
];

const WORKOUTS = {
  1: {
    // Hypertrophy
    A: {
      name: "Push Day",
      icon: "⬆",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "10", muscle: "Chest" },
        { name: "Overhead Press", sets: 3, reps: "10", muscle: "Shoulders" },
        { name: "Incline DB Press", sets: 3, reps: "12", muscle: "Upper Chest" },
        { name: "Lateral Raises", sets: 3, reps: "15", muscle: "Delts" },
        { name: "Cable Tricep Pushdown", sets: 3, reps: "12", muscle: "Triceps" },
      ],
      cardio: { type: "HIIT", duration: 12, desc: "30s on / 30s off sprints", hasCardio: true },
    },
    B: {
      name: "Pull Day",
      icon: "⬇",
      exercises: [
        { name: "Deadlift", sets: 4, reps: "8", muscle: "Posterior Chain" },
        { name: "Barbell Row", sets: 4, reps: "10", muscle: "Back" },
        { name: "Pull-Ups", sets: 3, reps: "10", muscle: "Lats" },
        { name: "Face Pulls", sets: 3, reps: "15", muscle: "Rear Delts" },
        { name: "Barbell Curl", sets: 3, reps: "12", muscle: "Biceps" },
      ],
      cardio: { type: "Steady State", duration: 15, desc: "Zone 2 rowing", hasCardio: true },
    },
    C: {
      name: "Leg Day",
      icon: "⚡",
      exercises: [
        { name: "Squat", sets: 4, reps: "10", muscle: "Quads" },
        { name: "Romanian Deadlift", sets: 3, reps: "10", muscle: "Hamstrings" },
        { name: "Leg Press", sets: 3, reps: "12", muscle: "Quads" },
        { name: "Walking Lunges", sets: 3, reps: "12", muscle: "Glutes" },
        { name: "Calf Raises", sets: 4, reps: "15", muscle: "Calves" },
      ],
      cardio: { type: "HIIT", duration: 10, desc: "Bike sprints — 20s on / 40s off", hasCardio: false },
    },
  },
  2: {
    // Strength
    A: {
      name: "Push Strength",
      icon: "⬆",
      exercises: [
        { name: "Bench Press", sets: 5, reps: "5", muscle: "Chest" },
        { name: "Overhead Press", sets: 5, reps: "5", muscle: "Shoulders" },
        { name: "Close-Grip Bench", sets: 3, reps: "6", muscle: "Triceps" },
        { name: "DB Shoulder Press", sets: 3, reps: "6", muscle: "Delts" },
        { name: "Dips", sets: 3, reps: "8", muscle: "Chest/Triceps" },
      ],
      cardio: { type: "Steady State", duration: 12, desc: "Incline walk at 3.5mph", hasCardio: false },
    },
    B: {
      name: "Pull Strength",
      icon: "⬇",
      exercises: [
        { name: "Deadlift", sets: 5, reps: "5", muscle: "Posterior Chain" },
        { name: "Weighted Pull-Ups", sets: 4, reps: "6", muscle: "Lats" },
        { name: "Pendlay Row", sets: 4, reps: "6", muscle: "Back" },
        { name: "Trap Bar Shrug", sets: 3, reps: "8", muscle: "Traps" },
        { name: "Hammer Curl", sets: 3, reps: "8", muscle: "Biceps" },
      ],
      cardio: { type: "HIIT", duration: 10, desc: "Sled pushes — 20m on / 60s off", hasCardio: true },
    },
    C: {
      name: "Leg Strength",
      icon: "⚡",
      exercises: [
        { name: "Squat", sets: 5, reps: "5", muscle: "Quads" },
        { name: "Romanian Deadlift", sets: 4, reps: "6", muscle: "Hamstrings" },
        { name: "Bulgarian Split Squat", sets: 3, reps: "6", muscle: "Glutes" },
        { name: "Hack Squat", sets: 3, reps: "8", muscle: "Quads" },
        { name: "Standing Calf Raise", sets: 4, reps: "10", muscle: "Calves" },
      ],
      cardio: { type: "Steady State", duration: 15, desc: "Assault bike Zone 2", hasCardio: true },
    },
  },
  3: {
    // Power
    A: {
      name: "Push Power",
      icon: "⬆",
      exercises: [
        { name: "Bench Press", sets: 6, reps: "3", muscle: "Chest" },
        { name: "Push Press", sets: 5, reps: "3", muscle: "Shoulders" },
        { name: "Floor Press", sets: 3, reps: "5", muscle: "Triceps" },
        { name: "DB Incline Press", sets: 3, reps: "5", muscle: "Chest" },
        { name: "Skull Crushers", sets: 3, reps: "6", muscle: "Triceps" },
      ],
      cardio: { type: "HIIT", duration: 10, desc: "Box jumps — 5 reps / 90s rest", hasCardio: true },
    },
    B: {
      name: "Pull Power",
      icon: "⬇",
      exercises: [
        { name: "Trap Bar Deadlift", sets: 6, reps: "3", muscle: "Posterior Chain" },
        { name: "Power Clean", sets: 5, reps: "3", muscle: "Full Body" },
        { name: "Weighted Pull-Ups", sets: 4, reps: "5", muscle: "Lats" },
        { name: "Cable Row", sets: 3, reps: "6", muscle: "Back" },
        { name: "EZ Bar Curl", sets: 3, reps: "6", muscle: "Biceps" },
      ],
      cardio: { type: "Steady State", duration: 12, desc: "Row ergometer moderate pace", hasCardio: true },
    },
    C: {
      name: "Leg Power",
      icon: "⚡",
      exercises: [
        { name: "Box Squat", sets: 6, reps: "3", muscle: "Quads" },
        { name: "Romanian Deadlift", sets: 4, reps: "5", muscle: "Hamstrings" },
        { name: "Jump Squat", sets: 4, reps: "5", muscle: "Power" },
        { name: "Leg Curl", sets: 3, reps: "6", muscle: "Hamstrings" },
        { name: "Seated Calf Raise", sets: 4, reps: "8", muscle: "Calves" },
      ],
      cardio: { type: "HIIT", duration: 12, desc: "Sprint intervals — 10s max / 2m walk", hasCardio: false },
    },
  },
};

const WORKOUT_DAYS = ["A", "B", "C"];

const SWAP_ALTERNATIVES = {
  "Chest": [
    { name: "DB Flat Press", sets: null, reps: null },
    { name: "Cable Chest Fly", sets: null, reps: null },
    { name: "Push-Ups (Weighted)", sets: null, reps: null },
    { name: "Pec Deck Machine", sets: null, reps: null },
    { name: "Hammer Strength Press", sets: null, reps: null },
  ],
  "Upper Chest": [
    { name: "Incline Barbell Press", sets: null, reps: null },
    { name: "High Cable Fly", sets: null, reps: null },
    { name: "Smith Machine Incline", sets: null, reps: null },
    { name: "Landmine Press", sets: null, reps: null },
  ],
  "Shoulders": [
    { name: "Arnold Press", sets: null, reps: null },
    { name: "Machine Shoulder Press", sets: null, reps: null },
    { name: "Cable Lateral Raise", sets: null, reps: null },
    { name: "Smith Machine Press", sets: null, reps: null },
    { name: "DB Front Raise", sets: null, reps: null },
  ],
  "Delts": [
    { name: "Cable Lateral Raise", sets: null, reps: null },
    { name: "Machine Lateral Raise", sets: null, reps: null },
    { name: "DB Upright Row", sets: null, reps: null },
    { name: "Band Pull-Apart", sets: null, reps: null },
  ],
  "Triceps": [
    { name: "Overhead Tricep Extension", sets: null, reps: null },
    { name: "DB Kickback", sets: null, reps: null },
    { name: "Rope Pushdown", sets: null, reps: null },
    { name: "Close-Grip Bench Press", sets: null, reps: null },
    { name: "EZ Bar Skullcrusher", sets: null, reps: null },
  ],
  "Chest/Triceps": [
    { name: "Close-Grip Push-Ups", sets: null, reps: null },
    { name: "Machine Chest Press", sets: null, reps: null },
    { name: "Cable Crossover", sets: null, reps: null },
    { name: "Bench Dips (Feet Elevated)", sets: null, reps: null },
  ],
  "Posterior Chain": [
    { name: "Rack Pull", sets: null, reps: null },
    { name: "Trap Bar Deadlift", sets: null, reps: null },
    { name: "Good Mornings", sets: null, reps: null },
    { name: "Barbell Hip Thrust", sets: null, reps: null },
    { name: "Cable Pull-Through", sets: null, reps: null },
  ],
  "Back": [
    { name: "T-Bar Row", sets: null, reps: null },
    { name: "Seated Cable Row", sets: null, reps: null },
    { name: "DB Row", sets: null, reps: null },
    { name: "Machine Row", sets: null, reps: null },
    { name: "Chest-Supported Row", sets: null, reps: null },
  ],
  "Lats": [
    { name: "Lat Pulldown", sets: null, reps: null },
    { name: "Straight-Arm Pushdown", sets: null, reps: null },
    { name: "Assisted Pull-Up Machine", sets: null, reps: null },
    { name: "Single-Arm Cable Row", sets: null, reps: null },
  ],
  "Rear Delts": [
    { name: "Rear Delt Fly Machine", sets: null, reps: null },
    { name: "Bent-Over DB Fly", sets: null, reps: null },
    { name: "Cable Face Pull", sets: null, reps: null },
    { name: "Band Pull-Apart", sets: null, reps: null },
  ],
  "Biceps": [
    { name: "Incline DB Curl", sets: null, reps: null },
    { name: "Cable Curl", sets: null, reps: null },
    { name: "Preacher Curl", sets: null, reps: null },
    { name: "Machine Curl", sets: null, reps: null },
    { name: "Concentration Curl", sets: null, reps: null },
  ],
  "Traps": [
    { name: "DB Shrug", sets: null, reps: null },
    { name: "Cable Shrug", sets: null, reps: null },
    { name: "Behind-Back Barbell Shrug", sets: null, reps: null },
    { name: "Farmer Carry", sets: null, reps: null },
  ],
  "Full Body": [
    { name: "Hang Clean", sets: null, reps: null },
    { name: "DB Snatch", sets: null, reps: null },
    { name: "Kettlebell Swing", sets: null, reps: null },
    { name: "Barbell Complex", sets: null, reps: null },
  ],
  "Quads": [
    { name: "Leg Extension", sets: null, reps: null },
    { name: "Smith Machine Squat", sets: null, reps: null },
    { name: "Goblet Squat", sets: null, reps: null },
    { name: "Step-Ups", sets: null, reps: null },
    { name: "Sissy Squat", sets: null, reps: null },
  ],
  "Hamstrings": [
    { name: "Leg Curl", sets: null, reps: null },
    { name: "Nordic Curl", sets: null, reps: null },
    { name: "Seated Leg Curl", sets: null, reps: null },
    { name: "Good Mornings", sets: null, reps: null },
    { name: "Stiff-Leg Deadlift", sets: null, reps: null },
  ],
  "Glutes": [
    { name: "Hip Thrust", sets: null, reps: null },
    { name: "Cable Kickback", sets: null, reps: null },
    { name: "Sumo Deadlift", sets: null, reps: null },
    { name: "Step-Ups", sets: null, reps: null },
    { name: "Glute Bridge", sets: null, reps: null },
  ],
  "Calves": [
    { name: "Donkey Calf Raise", sets: null, reps: null },
    { name: "Leg Press Calf Press", sets: null, reps: null },
    { name: "Smith Machine Calf Raise", sets: null, reps: null },
    { name: "Single-Leg Calf Raise", sets: null, reps: null },
  ],
  "Power": [
    { name: "Broad Jump", sets: null, reps: null },
    { name: "Box Jump", sets: null, reps: null },
    { name: "Depth Jump", sets: null, reps: null },
    { name: "Medicine Ball Slam", sets: null, reps: null },
  ],
};



// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
const getStore = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const setStore = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

// ─── INIT DATA ────────────────────────────────────────────────────────────────
const initUser = () =>
  getStore("user", {
    id: "u1",
    name: "Athlete",
    current_weight: null,
    start_date: new Date().toISOString(),
  });

const initWeightLogs = () => getStore("weightLogs", []);

const initExerciseLogs = () => getStore("exerciseLogs", []);

const getPhaseAndDay = (startDate) => {
  const start = new Date(startDate);
  const now = new Date();
  const daysDiff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const phaseIndex = Math.floor(daysDiff / 30) % PHASES.length;
  const workoutCount = getStore("workoutCount", 0);
  const dayIndex = workoutCount % 3;
  return {
    phase: PHASES[phaseIndex],
    dayKey: WORKOUT_DAYS[dayIndex],
    daysDiff,
    phaseDay: daysDiff % 30,
  };
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    dumbbell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4M6 9h12M6 15h12"/>
      </svg>
    ),
    chart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    user: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    minus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    flame: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M12 2C9 7 6 9 6 13a6 6 0 0012 0c0-4-3-6-6-11zm0 17a3 3 0 01-3-3c0-2 1.5-3 3-5 1.5 2 3 3 3 5a3 3 0 01-3 3z"/>
      </svg>
    ),
    bolt: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    trophy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H4a2 2 0 000 4c0 2.5 2 4.5 5 5"/><path d="M17 4h3a2 2 0 010 4c0 2.5-2 4.5-5 5"/><path d="M7 4h10v8a5 5 0 01-10 0V4z"/>
      </svg>
    ),
    arrow: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    ),
    weight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="6" r="4"/><path d="M4 20h16M6 20c0-4 2-7 6-7s6 3 6 7"/>
      </svg>
    ),
    timer: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
      </svg>
    ),
    swap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

// ─── MINI LINE CHART ──────────────────────────────────────────────────────────
const LineChart = ({ data, color = "#00ff88", height = 80 }) => {
  if (!data || data.length < 2) return (
    <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 13 }}>
      Log at least 2 entries to see trend
    </div>
  );
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals) - 1;
  const max = Math.max(...vals) + 1;
  const w = 300, h = height;
  const px = (i) => (i / (data.length - 1)) * w;
  const py = (v) => h - ((v - min) / (max - min)) * h;
  const points = data.map((d, i) => `${px(i)},${py(d.value)}`).join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#grad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={px(i)} cy={py(d.value)} r="3" fill={color} />
      ))}
    </svg>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: {
    background: "#0a0a0f",
    minHeight: "100vh",
    maxWidth: 430,
    margin: "0 auto",
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#fff",
    position: "relative",
    overflowX: "hidden",
  },
  scroll: {
    paddingBottom: 100,
    minHeight: "calc(100vh - 80px)",
    overflowY: "auto",
  },
  navbar: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    background: "rgba(15,15,22,0.97)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0 20px",
    zIndex: 100,
  },
  navBtn: (active, color) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    color: active ? color : "#444",
    cursor: "pointer",
    fontSize: 10,
    fontWeight: active ? 700 : 400,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    transition: "all 0.2s",
    padding: "4px 16px",
  }),
  header: {
    padding: "56px 20px 20px",
    background: "linear-gradient(180deg, rgba(10,10,20,1) 0%, rgba(10,10,15,0) 100%)",
  },
  card: (border = "transparent") => ({
    background: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: "18px 20px",
    marginBottom: 12,
    border: `1px solid ${border}`,
    position: "relative",
    overflow: "hidden",
  }),
  tag: (color) => ({
    background: color + "22",
    color: color,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "inline-block",
  }),
  bigBtn: (color, disabled = false) => ({
    width: "100%",
    padding: "18px",
    borderRadius: 16,
    background: disabled ? "#222" : `linear-gradient(135deg, ${color}, ${color}cc)`,
    color: disabled ? "#555" : "#000",
    fontSize: 17,
    fontWeight: 800,
    border: "none",
    cursor: disabled ? "default" : "pointer",
    letterSpacing: "0.02em",
    transition: "all 0.2s",
    boxShadow: disabled ? "none" : `0 4px 24px ${color}44`,
  }),
  input: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    color: "#fff",
    fontSize: 28,
    fontWeight: 700,
    textAlign: "center",
    width: "100%",
    padding: "14px 0",
    outline: "none",
    boxSizing: "border-box",
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    overflow: "hidden",
  },
  stepBtn: (color) => ({
    background: "none",
    border: "none",
    color: color,
    width: 50,
    height: 50,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  }),
  stepVal: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
  },
};

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
const HomeScreen = ({ user, weightLogs, exerciseLogs, phase, dayKey, phaseDay, onStartWorkout, accentColor }) => {
  const workout = WORKOUTS[phase.id][dayKey];
  const workoutCount = getStore("workoutCount", 0);
  const thisMonthCount = exerciseLogs.filter((l) => {
    const d = new Date(l.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).map((l) => l.date).filter((v, i, a) => a.indexOf(v) === i).length;

  const latestWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight_value : null;
  const progressPct = Math.round((phaseDay / 30) * 100);

  return (
    <div style={S.scroll}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ fontSize: 13, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Let's lift,<br />
              <span style={{ color: accentColor }}>{user.name}.</span>
            </div>
          </div>
          {latestWeight && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Weight</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: accentColor }}>{latestWeight}<span style={{ fontSize: 13, color: "#666" }}> lbs</span></div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Phase Progress */}
        <div style={{ ...S.card("rgba(255,255,255,0.06)"), marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current Phase</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: phase.color, marginTop: 2 }}>{phase.name}</div>
              <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{phase.desc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Day</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{phaseDay}<span style={{ fontSize: 14, color: "#555" }}>/30</span></div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: `linear-gradient(90deg, ${phase.color}, ${phase.color}99)`, borderRadius: 8, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 6, textAlign: "right" }}>{30 - phaseDay} days until next phase</div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[
            { label: "Sessions This Month", value: thisMonthCount, icon: "trophy", color: accentColor },
            { label: "Total Workouts", value: workoutCount, icon: "flame", color: "#ff6b35" },
          ].map((stat) => (
            <div key={stat.label} style={{ ...S.card(), textAlign: "center", marginBottom: 0 }}>
              <Icon name={stat.icon} size={22} color={stat.color} />
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "6px 0 2px" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.3 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Today's Workout Card */}
        <div style={{ ...S.card(`${accentColor}33`), marginBottom: 16, background: `linear-gradient(135deg, rgba(0,255,136,0.05), rgba(10,10,15,1))` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={S.tag(accentColor)}>Today's Workout</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, letterSpacing: "-0.01em" }}>
                {workout.icon} {workout.name}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                {workout.exercises.length} exercises{workout.cardio.hasCardio ? ` · ${workout.cardio.duration}min cardio` : ""}
              </div>
            </div>
            <div style={{ ...S.tag(workout.cardio.type === "HIIT" ? "#ff6b35" : "#00cfff"), flexShrink: 0 }}>
              {workout.cardio.type}
            </div>
          </div>
          {/* Exercise list preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {workout.exercises.slice(0, 3).map((ex, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accentColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: accentColor }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: "#666" }}>{ex.muscle}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>{ex.sets}×{ex.reps}</div>
              </div>
            ))}
            {workout.exercises.length > 3 && (
              <div style={{ fontSize: 12, color: "#666", textAlign: "center", paddingTop: 4 }}>
                +{workout.exercises.length - 3} more exercises
              </div>
            )}
          </div>

          <button style={S.bigBtn(accentColor)} onClick={onStartWorkout}>
            Start Workout →
          </button>
        </div>

        {/* Cardio info */}
        {workout.cardio.hasCardio ? (
          <div style={{ ...S.card(), display: "flex", alignItems: "center", gap: 14, marginBottom: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${workout.cardio.type === "HIIT" ? "#ff6b35" : "#00cfff"}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="bolt" size={22} color={workout.cardio.type === "HIIT" ? "#ff6b35" : "#00cfff"} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Cardio Finisher · {workout.cardio.duration} min</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{workout.cardio.desc}</div>
            </div>
          </div>
        ) : (
          <div style={{ ...S.card(), display: "flex", alignItems: "center", gap: 14, marginBottom: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#33333322", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="bolt" size={22} color="#555" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#888" }}>No Cardio Today</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>Lifting only — recover and grow.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── WORKOUT SCREEN ───────────────────────────────────────────────────────────
const WorkoutScreen = ({ phase, dayKey, exerciseLogs, onFinish, accentColor }) => {
  const workout = WORKOUTS[phase.id][dayKey];
  const today = new Date().toDateString();

  // Get previous week's logs for this exercise
  const getPrevLog = (exerciseName) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 9);
    const logs = exerciseLogs.filter(
      (l) => l.exercise_name === exerciseName && new Date(l.date) < new Date() && new Date(l.date) > weekAgo
    );
    if (!logs.length) return null;
    const last = logs[logs.length - 1];
    return last;
  };

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [weights, setWeights] = useState({});
  const [reps, setReps] = useState({});
  const [phase2, setPhase] = useState("workout"); // workout | cardio | done
  const [swappedExercises, setSwappedExercises] = useState({}); // idx -> exercise object

  // Get active exercise (swapped or original)
  const getActiveEx = (idx) => swappedExercises[idx] || workout.exercises[idx];

  const ex = getActiveEx(currentExIdx);
  const prevLog = getPrevLog(ex?.name);

  const handleSwap = () => {
    const original = workout.exercises[currentExIdx];
    const alts = SWAP_ALTERNATIVES[original.muscle] || [];
    if (!alts.length) return;
    // Find current swap index to cycle through options
    const currentSwap = swappedExercises[currentExIdx];
    const currentAltIdx = currentSwap
      ? alts.findIndex(a => a.name === currentSwap.name)
      : -1;
    const nextAltIdx = (currentAltIdx + 1) % alts.length;
    const nextAlt = alts[nextAltIdx];
    const swapped = { ...original, name: nextAlt.name, swappedFrom: original.name };
    setSwappedExercises(prev => ({ ...prev, [currentExIdx]: swapped }));
    // Reset sets/weight/reps for the new exercise name
    setCompletedSets(prev => { const n = {...prev}; delete n[nextAlt.name]; return n; });
    const prevSwapLog = getPrevLog(nextAlt.name);
    setWeights(prev => ({ ...prev, [nextAlt.name]: prevSwapLog ? prevSwapLog.weight_used : 135 }));
    setReps(prev => ({ ...prev, [nextAlt.name]: prevSwapLog ? prevSwapLog.reps : parseInt(original.reps) }));
  };

  useEffect(() => {
    if (ex) {
      setWeights((w) => ({
        ...w,
        [ex.name]: w[ex.name] ?? (prevLog ? prevLog.weight_used : 135),
      }));
      setReps((r) => ({
        ...r,
        [ex.name]: r[ex.name] ?? (prevLog ? prevLog.reps : parseInt(ex.reps)),
      }));
    }
  }, [currentExIdx]);

  const sets = parseInt(ex?.sets || 3);
  const completedForCurrent = (completedSets[ex?.name] || []).length;

  const logSet = () => {
    const name = ex.name;
    const prev = completedSets[name] || [];
    setCompletedSets({ ...completedSets, [name]: [...prev, { w: weights[name], r: reps[name] }] });
  };

  const nextExercise = () => {
    if (currentExIdx < workout.exercises.length - 1) {
      setCurrentExIdx(currentExIdx + 1);
    } else if (workout.cardio.hasCardio) {
      setPhase("cardio");
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    const newLogs = [];
    workout.exercises.forEach((_, idx) => {
      const activeEx = getActiveEx(idx);
      const sets = completedSets[activeEx.name] || [];
      if (sets.length) {
        newLogs.push({
          date: today,
          exercise_name: activeEx.name,
          sets: sets.length,
          reps: sets[sets.length - 1]?.r,
          weight_used: sets[sets.length - 1]?.w,
          swappedFrom: activeEx.swappedFrom || null,
        });
      }
    });
    onFinish(newLogs);
    setPhase("done");
  };

  if (phase2 === "done") {
    return (
      <div style={{ ...S.scroll, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: 20 }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🏆</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: accentColor, marginBottom: 8, textAlign: "center" }}>Workout Complete!</div>
        <div style={{ fontSize: 15, color: "#888", marginBottom: 40, textAlign: "center" }}>
          {workout.exercises.length} exercises crushed. Rest up and come back stronger.
        </div>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <button style={S.bigBtn(accentColor)} onClick={() => window.location.reload()}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (phase2 === "cardio") {
    return (
      <div style={{ ...S.scroll, padding: "60px 20px 20px" }}>
        <div style={{ fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>Cardio Finisher</div>
        <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>{workout.cardio.type}</div>
        <div style={{ fontSize: 16, color: "#888", marginBottom: 30 }}>{workout.cardio.desc}</div>
        <div style={{ ...S.card(`${accentColor}33`), textAlign: "center", marginBottom: 30 }}>
          <Icon name="timer" size={48} color={accentColor} />
          <div style={{ fontSize: 64, fontWeight: 900, color: accentColor, margin: "16px 0 8px" }}>{workout.cardio.duration}</div>
          <div style={{ fontSize: 16, color: "#888" }}>minutes</div>
        </div>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 30, lineHeight: 1.6 }}>
          Complete your cardio finisher at a controlled intensity. This preserves muscle while conditioning your cardiovascular system.
        </div>
        <button style={S.bigBtn(accentColor)} onClick={finishWorkout}>Complete Workout ✓</button>
      </div>
    );
  }

  const w = weights[ex?.name] ?? 60;
  const r = reps[ex?.name] ?? parseInt(ex?.reps || 8);

  return (
    <div style={{ ...S.scroll, padding: "0 16px" }}>
      {/* Header */}
      <div style={{ padding: "56px 4px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>{workout.name}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{currentExIdx + 1} / {workout.exercises.length}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{ex.name}</div>
            {ex.swappedFrom && (
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                ↔ Swapped from <span style={{ color: "#666" }}>{ex.swappedFrom}</span>
              </div>
            )}
          </div>
          {(SWAP_ALTERNATIVES[workout.exercises[currentExIdx].muscle] || []).length > 0 && completedForCurrent === 0 && (
            <button
              onClick={handleSwap}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: ex.swappedFrom ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${ex.swappedFrom ? "rgba(255,107,53,0.4)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 10, padding: "7px 12px", cursor: "pointer", flexShrink: 0,
                color: ex.swappedFrom ? "#ff6b35" : "#aaa", fontSize: 12, fontWeight: 700,
              }}
            >
              <Icon name="swap" size={14} color={ex.swappedFrom ? "#ff6b35" : "#aaa"} />
              {ex.swappedFrom ? "Swap Again" : "Swap"}
            </button>
          )}
        </div>
        {/* Exercise progress dots */}
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {workout.exercises.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 2,
              background: i < currentExIdx ? accentColor
                : i === currentExIdx ? `${accentColor}88`
                : "rgba(255,255,255,0.1)",
              transition: "all 0.3s"
            }} />
          ))}
        </div>
      </div>

      {/* Previous performance */}
      {prevLog ? (
        <div style={{ ...S.card(), display: "flex", gap: 12, alignItems: "center", marginBottom: 12, background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)" }}>
          <Icon name="bolt" size={18} color={accentColor} />
          <div>
            <div style={{ fontSize: 11, color: accentColor, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Last Session Target</div>
            <div style={{ fontSize: 14, color: "#ccc", marginTop: 2 }}>
              {prevLog.sets} sets × {prevLog.reps} reps @ <strong style={{ color: "#fff" }}>{prevLog.weight_used} lbs</strong>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...S.card(), marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#666" }}>No previous data — establish your baseline today.</div>
        </div>
      )}

      {/* Weight input */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Weight (lbs)</div>
        <div style={S.stepper}>
          <button style={S.stepBtn(accentColor)} onClick={() => setWeights({ ...weights, [ex.name]: Math.max(0, w - 5) })}>
            <Icon name="minus" size={20} color={accentColor} />
          </button>
          <div style={S.stepVal}>{w}</div>
          <button style={S.stepBtn(accentColor)} onClick={() => setWeights({ ...weights, [ex.name]: w + 5 })}>
            <Icon name="plus" size={20} color={accentColor} />
          </button>
        </div>
      </div>

      {/* Reps input */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Reps</div>
        <div style={S.stepper}>
          <button style={S.stepBtn(accentColor)} onClick={() => setReps({ ...reps, [ex.name]: Math.max(1, r - 1) })}>
            <Icon name="minus" size={20} color={accentColor} />
          </button>
          <div style={S.stepVal}>{r}</div>
          <button style={S.stepBtn(accentColor)} onClick={() => setReps({ ...reps, [ex.name]: r + 1 })}>
            <Icon name="plus" size={20} color={accentColor} />
          </button>
        </div>
      </div>

      {/* Sets progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Sets — {completedForCurrent} / {sets} completed
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: sets }).map((_, i) => {
            const done = i < completedForCurrent;
            const setInfo = (completedSets[ex.name] || [])[i];
            return (
              <div key={i} style={{
                flex: 1, height: 52, borderRadius: 12,
                background: done ? `${accentColor}22` : "rgba(255,255,255,0.05)",
                border: `1px solid ${done ? accentColor + "44" : "rgba(255,255,255,0.08)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s",
              }}>
                {done ? (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: accentColor }}>{setInfo?.w} lbs</div>
                    <div style={{ fontSize: 10, color: "#888" }}>×{setInfo?.r}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>Set {i + 1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      {completedForCurrent < sets ? (
        <button style={S.bigBtn(accentColor)} onClick={logSet}>
          ✓ Log Set {completedForCurrent + 1}
        </button>
      ) : (
        <button style={S.bigBtn(accentColor)} onClick={nextExercise}>
          {currentExIdx < workout.exercises.length - 1 ? `Next: ${getActiveEx(currentExIdx + 1).name} →` : workout.cardio.hasCardio ? "Move to Cardio →" : "Finish Workout →"}
        </button>
      )}

      {/* Exercise info */}
      <div style={{ ...S.card(), marginTop: 16, display: "flex", gap: 20, justifyContent: "center" }}>
        {[
          { label: "Muscle", value: ex.muscle },
          { label: "Prescribed", value: `${ex.sets}×${ex.reps}` },
          { label: "Rest", value: "90s" },
        ].map((info) => (
          <div key={info.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>{info.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{info.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── WEIGHT LOG SCREEN ────────────────────────────────────────────────────────
const WeightScreen = ({ weightLogs, onLog, accentColor }) => {
  const [inputVal, setInputVal] = useState("");
  const [logged, setLogged] = useState(false);
  const chartData = weightLogs.slice(-12).map((l) => ({
    value: l.weight_value,
    label: new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
  const latest = weightLogs.length ? weightLogs[weightLogs.length - 1] : null;
  const prev = weightLogs.length > 1 ? weightLogs[weightLogs.length - 2] : null;
  const diff = latest && prev ? (latest.weight_value - prev.weight_value).toFixed(1) : null;

  const handleLog = () => {
    const v = parseFloat(inputVal);
    if (isNaN(v) || v < 10 || v > 700) return;
    onLog(v);
    setInputVal("");
    setLogged(true);
    setTimeout(() => setLogged(false), 2000);
  };

  return (
    <div style={{ ...S.scroll, padding: "60px 16px 20px" }}>
      <div style={{ fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Body Weight</div>
      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 24 }}>Weekly Tracking</div>

      {/* Stats */}
      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ ...S.card(), marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: accentColor, margin: "6px 0 0" }}>{latest.weight_value}<span style={{ fontSize: 14, color: "#666" }}>lbs</span></div>
          </div>
          <div style={{ ...S.card(), marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Change</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: diff > 0 ? "#ff6b35" : diff < 0 ? accentColor : "#888", margin: "6px 0 0" }}>
              {diff !== null ? `${diff > 0 ? "+" : ""}${diff}` : "—"}<span style={{ fontSize: 14, color: "#666" }}>lbs</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ ...S.card(), marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#ccc" }}>Weight Trend</div>
        <LineChart data={chartData} color={accentColor} height={100} />
        {chartData.length >= 2 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <div style={{ fontSize: 10, color: "#555" }}>{chartData[0]?.label}</div>
            <div style={{ fontSize: 10, color: "#555" }}>{chartData[chartData.length - 1]?.label}</div>
          </div>
        )}
      </div>

      {/* Log input */}
      <div style={{ ...S.card(`${accentColor}33`), marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#ccc", marginBottom: 12, fontWeight: 600 }}>Log Today's Weight</div>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            type="number"
            placeholder="75.0"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={S.input}
          />
          <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#555", fontWeight: 700 }}>lbs</div>
        </div>
        <button style={S.bigBtn(logged ? "#888" : accentColor)} onClick={handleLog}>
          {logged ? "✓ Logged!" : "Log Weight"}
        </button>
      </div>

      {/* History */}
      {weightLogs.length > 0 && (
        <div>
          <div style={{ fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>History</div>
          {weightLogs.slice().reverse().slice(0, 10).map((log, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 13, color: "#888" }}>
                {new Date(log.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{log.weight_value} lbs</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── EXERCISE PROGRESS CHART ─────────────────────────────────────────────────
const ExerciseProgressChart = ({ exerciseName, logs, accentColor, onClose }) => {
  const history = logs
    .filter(l => l.exercise_name === exerciseName)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = history.map(l => ({
    value: l.weight_used,
    label: new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    reps: l.reps,
    sets: l.sets,
  }));

  const best = Math.max(...chartData.map(d => d.value));
  const first = chartData[0]?.value;
  const last = chartData[chartData.length - 1]?.value;
  const gain = first && last ? (last - first) : 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "#0a0a0f",
      overflowY: "auto",
      maxWidth: 430, left: "50%", transform: "translateX(-50%)",
    }}>
      {/* Header */}
      <div style={{ padding: "56px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Progress</div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{exerciseName}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{history.length} session{history.length !== 1 ? "s" : ""} logged</div>
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12,
          width: 40, height: 40, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4,
          color: "#aaa", fontSize: 20, fontWeight: 300,
        }}>✕</button>
      </div>

      <div style={{ padding: "0 16px 40px" }}>
        {/* Stat pills */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Current", value: `${last ?? "—"} lbs`, color: accentColor },
            { label: "Best", value: `${best ?? "—"} lbs`, color: "#ffd700" },
            { label: "Total Gain", value: gain >= 0 ? `+${gain} lbs` : `${gain} lbs`, color: gain >= 0 ? accentColor : "#ff6b35" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 20, padding: "16px 12px 10px", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Weight Over Time</div>
          {chartData.length >= 2 ? (
            <>
              <LineChart data={chartData} color={accentColor} height={120} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <div style={{ fontSize: 10, color: "#555" }}>{chartData[0]?.label}</div>
                <div style={{ fontSize: 10, color: "#555" }}>{chartData[chartData.length - 1]?.label}</div>
              </div>
            </>
          ) : (
            <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 13 }}>
              Log at least 2 sessions to see trend
            </div>
          )}
        </div>

        {/* Session log */}
        <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>All Sessions</div>
        {history.slice().reverse().map((log, i) => {
          const isLatest = i === 0;
          return (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "13px 16px", marginBottom: 8,
              background: isLatest ? `${accentColor}0d` : "rgba(255,255,255,0.03)",
              border: `1px solid ${isLatest ? accentColor + "33" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 14,
            }}>
              <div>
                <div style={{ fontSize: 13, color: isLatest ? "#fff" : "#bbb", fontWeight: isLatest ? 700 : 400 }}>
                  {new Date(log.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  {isLatest && <span style={{ marginLeft: 8, fontSize: 10, color: accentColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Latest</span>}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{log.sets} sets × {log.reps} reps</div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: isLatest ? accentColor : "#888" }}>
                {log.weight_used}<span style={{ fontSize: 11, color: "#555", fontWeight: 400 }}> lbs</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── HISTORY SCREEN ───────────────────────────────────────────────────────────
const HistoryScreen = ({ exerciseLogs, accentColor }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Build per-exercise summary: most recent log only
  const byExercise = {};
  exerciseLogs.forEach(log => {
    if (!byExercise[log.exercise_name] || new Date(log.date) > new Date(byExercise[log.exercise_name].date)) {
      byExercise[log.exercise_name] = log;
    }
  });
  const exercises = Object.entries(byExercise).sort((a, b) => new Date(b[1].date) - new Date(a[1].date));

  if (selectedExercise) {
    return (
      <ExerciseProgressChart
        exerciseName={selectedExercise}
        logs={exerciseLogs}
        accentColor={accentColor}
        onClose={() => setSelectedExercise(null)}
      />
    );
  }

  return (
    <div style={{ ...S.scroll, padding: "60px 16px 20px" }}>
      <div style={{ fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Your</div>
      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Exercise History</div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>Tap any exercise to see your progress chart.</div>

      {exercises.length === 0 ? (
        <div style={{ textAlign: "center", color: "#555", padding: "60px 0" }}>
          <Icon name="dumbbell" size={40} color="#333" />
          <div style={{ marginTop: 16, fontSize: 15 }}>No workouts logged yet.</div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>Complete your first workout to see history.</div>
        </div>
      ) : exercises.map(([name, log]) => {
        const sessionCount = exerciseLogs.filter(l => l.exercise_name === name).length;
        return (
          <button
            key={name}
            onClick={() => setSelectedExercise(name)}
            style={{
              width: "100%", textAlign: "left", cursor: "pointer",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18, padding: "16px 18px", marginBottom: 10,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = accentColor + "55"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {log.sets} sets × {log.reps} reps · {sessionCount} session{sessionCount !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: accentColor }}>{log.weight_used}</div>
                <div style={{ fontSize: 11, color: "#555" }}>lbs</div>
              </div>
              <div style={{ color: "#444", fontSize: 18 }}>›</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
const ProfileScreen = ({ user, phase, onReset, accentColor }) => {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const startDate = new Date(user.start_date);
  const daysSince = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));

  const save = () => {
    const updated = { ...user, name };
    setStore("user", updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ ...S.scroll, padding: "60px 16px 20px" }}>
      <div style={{ fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Your</div>
      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 24 }}>Profile</div>

      <div style={{ ...S.card(), marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Display Name</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ ...S.input, fontSize: 20, padding: "12px 16px", textAlign: "left" }}
        />
        <button style={{ ...S.bigBtn(accentColor), marginTop: 12 }} onClick={save}>
          {saved ? "✓ Saved" : "Save Name"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Days Active", value: daysSince },
          { label: "Current Phase", value: phase.name },
          { label: "Started", value: startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
          { label: "Phase Color", value: "●", color: phase.color },
        ].map((stat) => (
          <div key={stat.label} style={{ ...S.card(), marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6, color: stat.color || "#fff" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Phase roadmap */}
      <div style={{ ...S.card(), marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#ccc" }}>Training Phases</div>
        {PHASES.map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < PHASES.length - 1 ? 14 : 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.id === phase.id ? p.color : "#333", flexShrink: 0, boxShadow: p.id === phase.id ? `0 0 10px ${p.color}` : "none" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: p.id === phase.id ? p.color : "#888" }}>{p.name} {p.id === phase.id ? "← Active" : ""}</div>
              <div style={{ fontSize: 11, color: "#666" }}>{p.desc} · {p.weeks * 7} days</div>
            </div>
          </div>
        ))}
      </div>

      <button
        style={{ ...S.bigBtn("#444"), color: "#ff6b35", boxShadow: "none" }}
        onClick={() => { if (window.confirm("Reset all data? This cannot be undone.")) onReset(); }}
      >
        Reset All Data
      </button>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [user, setUser] = useState(initUser);
  const [weightLogs, setWeightLogs] = useState(initWeightLogs);
  const [exerciseLogs, setExerciseLogs] = useState(initExerciseLogs);
  const [isWorkingOut, setIsWorkingOut] = useState(false);

  const { phase, dayKey, phaseDay } = getPhaseAndDay(user.start_date);
  const accentColor = phase.color;

  // Persist
  useEffect(() => { setStore("user", user); }, [user]);
  useEffect(() => { setStore("weightLogs", weightLogs); }, [weightLogs]);
  useEffect(() => { setStore("exerciseLogs", exerciseLogs); }, [exerciseLogs]);

  const handleLogWeight = (val) => {
    const log = { id: Date.now(), date: new Date().toISOString(), weight_value: val };
    const updated = [...weightLogs, log];
    setWeightLogs(updated);
    setUser((u) => ({ ...u, current_weight: val }));
  };

  const handleWorkoutFinish = (newLogs) => {
    setExerciseLogs((prev) => [...prev, ...newLogs]);
    const prev = getStore("workoutCount", 0);
    setStore("workoutCount", prev + 1);
    setIsWorkingOut(false);
    setTab("home");
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const navItems = [
    { id: "home", icon: "home", label: "Home" },
    { id: "workout", icon: "dumbbell", label: "Workout" },
    { id: "weight", icon: "weight", label: "Weight" },
    { id: "history", icon: "chart", label: "History" },
    { id: "profile", icon: "user", label: "Profile" },
  ];

  const renderScreen = () => {
    if (isWorkingOut || tab === "workout") {
      return (
        <WorkoutScreen
          phase={phase}
          dayKey={dayKey}
          exerciseLogs={exerciseLogs}
          onFinish={handleWorkoutFinish}
          accentColor={accentColor}
        />
      );
    }
    switch (tab) {
      case "home":
        return (
          <HomeScreen
            user={user}
            weightLogs={weightLogs}
            exerciseLogs={exerciseLogs}
            phase={phase}
            dayKey={dayKey}
            phaseDay={phaseDay}
            onStartWorkout={() => { setIsWorkingOut(true); setTab("workout"); }}
            accentColor={accentColor}
          />
        );
      case "weight":
        return <WeightScreen weightLogs={weightLogs} onLog={handleLogWeight} accentColor={accentColor} />;
      case "history":
        return <HistoryScreen exerciseLogs={exerciseLogs} accentColor={accentColor} />;
      case "profile":
        return <ProfileScreen user={user} phase={phase} onReset={handleReset} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <div style={S.app}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
        pointerEvents: "none", transition: "background 1s ease",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {renderScreen()}
      </div>

      {/* Bottom nav */}
      <nav style={S.navbar}>
        {navItems.map((item) => {
          const active = isWorkingOut ? item.id === "workout" : tab === item.id;
          return (
            <button
              key={item.id}
              style={S.navBtn(active, accentColor)}
              onClick={() => { setIsWorkingOut(false); setTab(item.id); }}
            >
              <Icon name={item.icon} size={22} color={active ? accentColor : "#444"} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
