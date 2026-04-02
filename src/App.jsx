import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── DATA ────────────────────────────────────────────────────────────────────
const PHASES_MALE = [
  { id: 1, name: "Hypertrophy", icon: "💪", color: "#3b82f6", desc: "Volume-focused, 8-12 reps", weeks: 4 },
  { id: 2, name: "Strength",    icon: "🏋️", color: "#60a5fa", desc: "Heavy loads, 4-6 reps",    weeks: 4 },
  { id: 3, name: "Power",       icon: "⚡", color: "#93c5fd", desc: "Explosive, 3-5 reps",       weeks: 4 },
];
const PHASES_DEFAULT = [
  { id: 1, name: "Hypertrophy", icon: "💪", color: "#00ff88", desc: "Volume-focused, 8-12 reps", weeks: 4 },
  { id: 2, name: "Strength",    icon: "🏋️", color: "#00cfff", desc: "Heavy loads, 4-6 reps",    weeks: 4 },
  { id: 3, name: "Power",       icon: "⚡", color: "#ff6b35", desc: "Explosive, 3-5 reps",       weeks: 4 },
];
const PHASES_FEMALE = [
  { id: 1, name: "Hypertrophy", icon: "💪", color: "#e879f9", desc: "Volume-focused, 8-12 reps", weeks: 4 },
  { id: 2, name: "Strength",    icon: "🏋️", color: "#f472b6", desc: "Heavy loads, 4-6 reps",    weeks: 4 },
  { id: 3, name: "Power",       icon: "⚡", color: "#fb923c", desc: "Explosive, 3-5 reps",       weeks: 4 },
];
const PHASES = PHASES_DEFAULT; // default palette (used for phase switcher labels in HomeScreen/ProfileScreen)
const WORKOUT_DAYS = ["A", "B", "C", "D", "E"]; // supports up to 5-day splits


// ─── ONBOARDING CONFIG ────────────────────────────────────────────────────────
const GOALS = [
  { id: "build_muscle",   label: "Build Muscle",      icon: "💪", desc: "Maximize hypertrophy and size" },
  { id: "get_stronger",   label: "Get Stronger",      icon: "🏋️", desc: "Increase strength and power" },
  { id: "lose_weight",    label: "Lose Weight",        icon: "🔥", desc: "Burn fat, maintain muscle" },
  { id: "general_fitness",label: "General Fitness",   icon: "⚡", desc: "Well-rounded health and endurance" },
  { id: "athletic",       label: "Athletic Performance", icon: "🚀", desc: "Speed, power and agility" },
];

const EQUIPMENT_OPTIONS = [
  { id: "barbell",      label: "Barbell & Plates",  icon: "🏋️" },
  { id: "dumbbells",    label: "Dumbbells",          icon: "🥊" },
  { id: "cables",       label: "Cable Machine",      icon: "🔗" },
  { id: "machines",     label: "Machines",           icon: "⚙️" },
  { id: "pullup_bar",   label: "Pull-Up Bar",        icon: "🔝" },
  { id: "bench",        label: "Bench",              icon: "🛋️" },
  { id: "kettlebells",  label: "Kettlebells",        icon: "🫙" },
  { id: "resistance_bands", label: "Resistance Bands", icon: "🎗️" },
  { id: "bodyweight",   label: "Bodyweight Only",    icon: "🧘" },
];

const FREQUENCY_OPTIONS = [
  { id: 2, label: "2x / week",  desc: "Light schedule, full body" },
  { id: 3, label: "3x / week",  desc: "Classic Push/Pull/Legs" },
  { id: 4, label: "4x / week",  desc: "Upper/Lower split" },
  { id: 5, label: "5x / week",  desc: "High frequency split" },
];

// ─── EXERCISE DATABASE ────────────────────────────────────────────────────────
// equipment: which equipment tags are needed (any match = usable)
// goal: which goals this exercise suits best (empty = all)
const EXERCISE_DB = {
  // CHEST
  "Bench Press":            { muscle: "Chest",      equipment: ["barbell","bench"],           sets: {hypertrophy:4,strength:5,power:6}, reps: {hypertrophy:"10",strength:"5",power:"3"} },
  "Incline DB Press":       { muscle: "Upper Chest",equipment: ["dumbbells","bench"],          sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"5"} },
  "DB Flat Press":          { muscle: "Chest",      equipment: ["dumbbells","bench"],          sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"5"} },
  "Push-Ups":               { muscle: "Chest",      equipment: ["bodyweight"],                 sets: {hypertrophy:4,strength:4,power:4}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "Cable Crossover":        { muscle: "Chest",      equipment: ["cables"],                     sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "Machine Chest Press":    { muscle: "Chest",      equipment: ["machines"],                   sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Floor Press":            { muscle: "Chest",      equipment: ["barbell"],                    sets: {hypertrophy:3,strength:4,power:5}, reps: {hypertrophy:"10",strength:"5",power:"3"} },
  "Dips":                   { muscle: "Chest/Triceps",equipment:["bodyweight","pullup_bar"],   sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Close-Grip Push-Ups":    { muscle: "Chest/Triceps",equipment:["bodyweight"],                sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },

  // SHOULDERS
  "Overhead Press":         { muscle: "Shoulders",  equipment: ["barbell","bench"],            sets: {hypertrophy:3,strength:5,power:5}, reps: {hypertrophy:"10",strength:"5",power:"3"} },
  "DB Shoulder Press":      { muscle: "Delts",      equipment: ["dumbbells","bench"],          sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Lateral Raises":         { muscle: "Delts",      equipment: ["dumbbells","cables"],         sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"15",power:"12"} },
  "Push Press":             { muscle: "Shoulders",  equipment: ["barbell"],                    sets: {hypertrophy:4,strength:5,power:5}, reps: {hypertrophy:"8",strength:"5",power:"3"} },
  "Arnold Press":           { muscle: "Delts",      equipment: ["dumbbells"],                  sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "Face Pulls":             { muscle: "Rear Delts", equipment: ["cables","resistance_bands"],   sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"15",power:"12"} },
  "Band Pull-Apart":        { muscle: "Rear Delts", equipment: ["resistance_bands"],            sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"20",strength:"20",power:"15"} },
  "DB Upright Row":         { muscle: "Traps",      equipment: ["dumbbells"],                  sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "DB Front Raise":         { muscle: "Delts",      equipment: ["dumbbells"],                  sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"12",power:"10"} },

  // TRICEPS
  "Cable Tricep Pushdown":  { muscle: "Triceps",    equipment: ["cables"],                     sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "Skull Crushers":         { muscle: "Triceps",    equipment: ["barbell","bench"],             sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Overhead Tricep Extension":{ muscle:"Triceps",   equipment: ["dumbbells","cables"],          sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "DB Kickback":            { muscle: "Triceps",    equipment: ["dumbbells"],                   sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "Close-Grip Bench":       { muscle: "Triceps",    equipment: ["barbell","bench"],             sets: {hypertrophy:3,strength:4,power:5}, reps: {hypertrophy:"10",strength:"6",power:"3"} },
  "Rope Pushdown":          { muscle: "Triceps",    equipment: ["cables"],                      sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "Diamond Push-Ups":       { muscle: "Triceps",    equipment: ["bodyweight"],                  sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },

  // BACK
  "Deadlift":               { muscle: "Posterior Chain", equipment: ["barbell"],               sets: {hypertrophy:4,strength:5,power:6}, reps: {hypertrophy:"8",strength:"5",power:"3"} },
  "Barbell Row":            { muscle: "Back",       equipment: ["barbell"],                     sets: {hypertrophy:4,strength:4,power:5}, reps: {hypertrophy:"10",strength:"6",power:"3"} },
  "Pendlay Row":            { muscle: "Back",       equipment: ["barbell"],                     sets: {hypertrophy:4,strength:5,power:5}, reps: {hypertrophy:"8",strength:"5",power:"3"} },
  "Pull-Ups":               { muscle: "Lats",       equipment: ["pullup_bar","bodyweight"],     sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"10",strength:"8",power:"6"} },
  "Weighted Pull-Ups":      { muscle: "Lats",       equipment: ["pullup_bar","barbell"],        sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"8",strength:"6",power:"5"} },
  "Lat Pulldown":           { muscle: "Lats",       equipment: ["cables","machines"],           sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Cable Row":              { muscle: "Back",       equipment: ["cables"],                      sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "DB Row":                 { muscle: "Back",       equipment: ["dumbbells","bench"],           sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "T-Bar Row":              { muscle: "Back",       equipment: ["barbell"],                     sets: {hypertrophy:4,strength:4,power:5}, reps: {hypertrophy:"10",strength:"6",power:"4"} },
  "Chest-Supported Row":    { muscle: "Back",       equipment: ["dumbbells","bench","machines"],sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Inverted Row":           { muscle: "Back",       equipment: ["bodyweight","pullup_bar"],     sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "Trap Bar Deadlift":      { muscle: "Posterior Chain", equipment: ["barbell"],               sets: {hypertrophy:4,strength:5,power:6}, reps: {hypertrophy:"8",strength:"5",power:"3"} },
  "Power Clean":            { muscle: "Full Body",  equipment: ["barbell"],                     sets: {hypertrophy:4,strength:5,power:5}, reps: {hypertrophy:"5",strength:"3",power:"3"} },
  "Straight-Arm Pushdown":  { muscle: "Lats",       equipment: ["cables"],                     sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },

  // BICEPS
  "Barbell Curl":           { muscle: "Biceps",     equipment: ["barbell"],                     sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Hammer Curl":            { muscle: "Biceps",     equipment: ["dumbbells"],                   sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "Incline DB Curl":        { muscle: "Biceps",     equipment: ["dumbbells","bench"],           sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "Cable Curl":             { muscle: "Biceps",     equipment: ["cables"],                      sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "Preacher Curl":          { muscle: "Biceps",     equipment: ["barbell","cables","machines"], sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "EZ Bar Curl":            { muscle: "Biceps",     equipment: ["barbell"],                     sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Concentration Curl":     { muscle: "Biceps",     equipment: ["dumbbells"],                   sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },

  // TRAPS
  "DB Shrug":               { muscle: "Traps",      equipment: ["dumbbells"],                   sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"15",strength:"10",power:"8"} },
  "Barbell Shrug":          { muscle: "Traps",      equipment: ["barbell"],                     sets: {hypertrophy:3,strength:4,power:5}, reps: {hypertrophy:"12",strength:"8",power:"5"} },
  "Trap Bar Shrug":         { muscle: "Traps",      equipment: ["barbell"],                     sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Farmer Carry":           { muscle: "Traps",      equipment: ["dumbbells","kettlebells","barbell"], sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"40m",strength:"40m",power:"30m"} },

  // LEGS - QUADS
  "Squat":                  { muscle: "Quads",      equipment: ["barbell","bench"],             sets: {hypertrophy:4,strength:5,power:6}, reps: {hypertrophy:"10",strength:"5",power:"3"} },
  "Leg Press":              { muscle: "Quads",      equipment: ["machines"],                    sets: {hypertrophy:4,strength:5,power:5}, reps: {hypertrophy:"12",strength:"8",power:"5"} },
  "Bulgarian Split Squat":  { muscle: "Quads",      equipment: ["dumbbells","barbell","bench"], sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"10",strength:"6",power:"5"} },
  "Goblet Squat":           { muscle: "Quads",      equipment: ["dumbbells","kettlebells"],     sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "Leg Extension":          { muscle: "Quads",      equipment: ["machines"],                    sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "Hack Squat":             { muscle: "Quads",      equipment: ["machines"],                    sets: {hypertrophy:3,strength:4,power:5}, reps: {hypertrophy:"10",strength:"6",power:"4"} },
  "Box Squat":              { muscle: "Quads",      equipment: ["barbell","bench"],             sets: {hypertrophy:4,strength:5,power:6}, reps: {hypertrophy:"8",strength:"5",power:"3"} },
  "Step-Ups":               { muscle: "Quads",      equipment: ["dumbbells","bodyweight","bench"],sets:{hypertrophy:3,strength:3,power:3},reps:{hypertrophy:"12",strength:"10",power:"8"} },
  "Walking Lunges":         { muscle: "Quads",      equipment: ["dumbbells","barbell","bodyweight"],sets:{hypertrophy:3,strength:3,power:3},reps:{hypertrophy:"12",strength:"10",power:"8"} },
  "Sissy Squat":            { muscle: "Quads",      equipment: ["bodyweight"],                  sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "Jump Squat":             { muscle: "Power",      equipment: ["bodyweight","barbell"],        sets: {hypertrophy:4,strength:4,power:5}, reps: {hypertrophy:"8",strength:"6",power:"5"} },

  // LEGS - POSTERIOR
  "Romanian Deadlift":      { muscle: "Hamstrings", equipment: ["barbell","dumbbells"],         sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"10",strength:"6",power:"5"} },
  "Leg Curl":               { muscle: "Hamstrings", equipment: ["machines"],                    sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "Nordic Curl":            { muscle: "Hamstrings", equipment: ["bodyweight","pullup_bar"],     sets: {hypertrophy:3,strength:3,power:4}, reps: {hypertrophy:"8",strength:"6",power:"5"} },
  "Stiff-Leg Deadlift":     { muscle: "Hamstrings", equipment: ["barbell","dumbbells"],         sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"10",strength:"6",power:"5"} },
  "Hip Thrust":             { muscle: "Glutes",     equipment: ["barbell","dumbbells","bench"], sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"12",strength:"8",power:"6"} },
  "Glute Bridge":           { muscle: "Glutes",     equipment: ["bodyweight","barbell"],        sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "Cable Kickback":         { muscle: "Glutes",     equipment: ["cables"],                      sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "Sumo Deadlift":          { muscle: "Glutes",     equipment: ["barbell"],                     sets: {hypertrophy:4,strength:5,power:5}, reps: {hypertrophy:"8",strength:"5",power:"3"} },

  // CALVES
  "Calf Raises":            { muscle: "Calves",     equipment: ["bodyweight","machines","barbell"],sets:{hypertrophy:4,strength:4,power:4},reps:{hypertrophy:"15",strength:"12",power:"10"} },
  "Seated Calf Raise":      { muscle: "Calves",     equipment: ["machines"],                    sets: {hypertrophy:4,strength:4,power:4}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "Donkey Calf Raise":      { muscle: "Calves",     equipment: ["machines","bodyweight"],       sets: {hypertrophy:4,strength:3,power:3}, reps: {hypertrophy:"20",strength:"15",power:"12"} },
  "Single-Leg Calf Raise":  { muscle: "Calves",     equipment: ["bodyweight","dumbbells"],      sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"15",strength:"12",power:"10"} },

  // PLYOMETRIC / POWER
  "Box Jump":               { muscle: "Power",      equipment: ["bodyweight"],                  sets: {hypertrophy:4,strength:4,power:5}, reps: {hypertrophy:"8",strength:"6",power:"5"} },
  "Broad Jump":             { muscle: "Power",      equipment: ["bodyweight"],                  sets: {hypertrophy:3,strength:4,power:5}, reps: {hypertrophy:"6",strength:"5",power:"5"} },
  "Medicine Ball Slam":     { muscle: "Full Body",  equipment: ["bodyweight"],                  sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"10",strength:"8",power:"6"} },
  "Kettlebell Swing":       { muscle: "Full Body",  equipment: ["kettlebells"],                 sets: {hypertrophy:3,strength:4,power:4}, reps: {hypertrophy:"15",strength:"12",power:"10"} },
  "DB Snatch":              { muscle: "Full Body",  equipment: ["dumbbells"],                   sets: {hypertrophy:3,strength:4,power:5}, reps: {hypertrophy:"8",strength:"5",power:"3"} },

  // CORE
  "Plank":                  { muscle: "Core",       equipment: ["bodyweight"],                  sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"45s",strength:"45s",power:"30s"} },
  "Ab Wheel Rollout":       { muscle: "Core",       equipment: ["bodyweight"],                  sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
  "Hanging Leg Raise":      { muscle: "Core",       equipment: ["pullup_bar"],                  sets: {hypertrophy:3,strength:3,power:3}, reps: {hypertrophy:"12",strength:"10",power:"8"} },
};

// ─── WORKOUT GENERATOR ────────────────────────────────────────────────────────
// Generates a full workout plan from user preferences
const generateWorkoutPlan = (prefs) => {
  const { goal, equipment, frequency, phase } = prefs;
  const phaseKey = phase === 1 ? "hypertrophy" : phase === 2 ? "strength" : "power";
  const eq = new Set(equipment);

  // Returns exercises available with given equipment
  const canDo = (exName) => {
    const ex = EXERCISE_DB[exName];
    if (!ex) return false;
    return ex.equipment.some(e => eq.has(e));
  };

  const makeEx = (name) => {
    const db = EXERCISE_DB[name];
    return {
      name,
      muscle: db.muscle,
      sets: db.sets[phaseKey],
      reps: db.reps[phaseKey],
    };
  };

  // Cardio config by goal
  const cardioByGoal = {
    lose_weight:      { type: "HIIT",         duration: 15, desc: "30s on / 30s off sprints",      hasCardio: true },
    general_fitness:  { type: "Steady State", duration: 15, desc: "Zone 2 — conversational pace",  hasCardio: true },
    build_muscle:     { type: "HIIT",         duration: 10, desc: "10 min low-intensity cooldown",  hasCardio: false },
    get_stronger:     { type: "Steady State", duration: 10, desc: "Incline walk at 3.5mph",         hasCardio: false },
    athletic:         { type: "HIIT",         duration: 12, desc: "Sprint intervals — 10s on / 50s off", hasCardio: true },
  };
  const cardio = cardioByGoal[goal] || cardioByGoal.general_fitness;

  // Priority exercise pools per split — preference order, filtered by equipment
  const pools = {
    push: [
      "Bench Press","Overhead Press","Squat","Push Press",
      "Incline DB Press","DB Flat Press","DB Shoulder Press","Arnold Press",
      "Machine Chest Press","Lateral Raises","Cable Tricep Pushdown",
      "Skull Crushers","Close-Grip Bench","Dips","Push-Ups",
      "Overhead Tricep Extension","DB Kickback","Diamond Push-Ups","Floor Press",
    ].filter(canDo),
    pull: [
      "Deadlift","Trap Bar Deadlift","Barbell Row","Pendlay Row","Power Clean",
      "Pull-Ups","Weighted Pull-Ups","Lat Pulldown","Cable Row","DB Row",
      "T-Bar Row","Chest-Supported Row","Inverted Row","Face Pulls",
      "Barbell Curl","EZ Bar Curl","Hammer Curl","Cable Curl",
      "Preacher Curl","Incline DB Curl","Concentration Curl",
      "DB Shrug","Barbell Shrug","Trap Bar Shrug","Farmer Carry",
    ].filter(canDo),
    legs: [
      "Squat","Box Squat","Leg Press","Bulgarian Split Squat","Goblet Squat",
      "Romanian Deadlift","Hip Thrust","Walking Lunges","Step-Ups",
      "Leg Curl","Leg Extension","Hack Squat","Stiff-Leg Deadlift",
      "Glute Bridge","Sumo Deadlift","Nordic Curl",
      "Calf Raises","Seated Calf Raise","Single-Leg Calf Raise","Donkey Calf Raise",
      "Box Jump","Jump Squat","Broad Jump",
    ].filter(canDo),
    upper: [
      "Bench Press","Overhead Press","Barbell Row","Pull-Ups","Weighted Pull-Ups",
      "Incline DB Press","DB Shoulder Press","DB Row","Lat Pulldown","Cable Row",
      "Lateral Raises","Face Pulls","Barbell Curl","Hammer Curl",
      "Cable Tricep Pushdown","Skull Crushers","Push-Ups","Inverted Row",
    ].filter(canDo),
    lower: [
      "Squat","Leg Press","Romanian Deadlift","Hip Thrust","Bulgarian Split Squat",
      "Walking Lunges","Leg Curl","Leg Extension","Goblet Squat",
      "Glute Bridge","Step-Ups","Stiff-Leg Deadlift","Nordic Curl",
      "Calf Raises","Seated Calf Raise","Single-Leg Calf Raise",
      "Box Jump","Jump Squat",
    ].filter(canDo),
    full: [
      "Deadlift","Squat","Bench Press","Barbell Row","Overhead Press",
      "Romanian Deadlift","Pull-Ups","Push-Ups","Goblet Squat","DB Row",
      "Hip Thrust","Lateral Raises","Hammer Curl","Skull Crushers",
      "Walking Lunges","Calf Raises","Kettlebell Swing","Medicine Ball Slam",
    ].filter(canDo),
  };

  const pick = (pool, n) => {
    const seen = new Set();
    return pool.filter(name => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    }).slice(0, n).map(makeEx);
  };

  // 2x/week: 2 full body sessions
  if (frequency === 2) {
    const exCount = goal === "lose_weight" ? 5 : 6;
    return {
      split: "full_body",
      days: [
        { key: "A", name: "Full Body A", icon: "⚡", exercises: pick(pools.full, exCount), cardio },
        { key: "B", name: "Full Body B", icon: "⚡", exercises: pick([...pools.full].reverse(), exCount), cardio },
      ],
    };
  }

  // 3x/week: Push/Pull/Legs
  if (frequency === 3) {
    return {
      split: "ppl",
      days: [
        { key: "A", name: "Push Day",  icon: "⬆", exercises: pick(pools.push, 5), cardio: { ...cardio, hasCardio: goal === "lose_weight" } },
        { key: "B", name: "Pull Day",  icon: "⬇", exercises: pick(pools.pull, 5), cardio },
        { key: "C", name: "Leg Day",   icon: "🦵", exercises: pick(pools.legs, 5), cardio: { ...cardio, hasCardio: false } },
      ],
    };
  }

  // 4x/week: Upper/Lower
  if (frequency === 4) {
    return {
      split: "upper_lower",
      days: [
        { key: "A", name: "Upper A",  icon: "⬆", exercises: pick(pools.upper, 6), cardio: { ...cardio, hasCardio: false } },
        { key: "B", name: "Lower A",  icon: "🦵", exercises: pick(pools.lower, 5), cardio },
        { key: "C", name: "Upper B",  icon: "⬆", exercises: pick([...pools.upper].reverse(), 6), cardio: { ...cardio, hasCardio: false } },
        { key: "D", name: "Lower B",  icon: "🦵", exercises: pick([...pools.lower].reverse(), 5), cardio },
      ],
    };
  }

  // 5x/week: PPL + Upper + Lower
  if (frequency === 5) {
    return {
      split: "ppl_plus",
      days: [
        { key: "A", name: "Push",     icon: "⬆", exercises: pick(pools.push, 5), cardio: { ...cardio, hasCardio: false } },
        { key: "B", name: "Pull",     icon: "⬇", exercises: pick(pools.pull, 5), cardio },
        { key: "C", name: "Legs",     icon: "🦵", exercises: pick(pools.legs, 5), cardio: { ...cardio, hasCardio: false } },
        { key: "D", name: "Upper",    icon: "💪", exercises: pick([...pools.upper].reverse(), 5), cardio },
        { key: "E", name: "Lower",    icon: "🔥", exercises: pick([...pools.lower].reverse(), 5), cardio: { ...cardio, hasCardio: false } },
      ],
    };
  }

  return { split: "ppl", days: [] };
};


// ─── LOCAL CACHE HELPERS (fallback while syncing) ────────────────────────────
const getStore = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const setStore = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const getPhaseAndDay = (workoutCount, exerciseLogs, phaseOverride, palette) => {
  const count = workoutCount || 0;
  const WORKOUTS_PER_PHASE = 12;
  // phaseOverride lets user manually jump to a phase; it resets the day counter
  const phaseIndex = phaseOverride != null
    ? phaseOverride % (palette || PHASES_MALE).length
    : Math.floor(count / WORKOUTS_PER_PHASE) % (palette || PHASES_MALE).length;
  const dayIndex = count % 3;
  const workoutsInPhase = phaseOverride != null ? 0 : count % WORKOUTS_PER_PHASE;

  // Day counter: days since first workout of current phase
  const sortedLogs = (exerciseLogs || [])
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const phaseStartLogIndex = phaseOverride != null
    ? null  // override resets counter — no reference date
    : Math.floor(count / WORKOUTS_PER_PHASE) * WORKOUTS_PER_PHASE;
  const workoutDates = [...new Set(sortedLogs.map(l => l.date.split("T")[0]))];
  const phaseFirstDate = (phaseStartLogIndex != null && workoutDates[phaseStartLogIndex])
    ? new Date(workoutDates[phaseStartLogIndex])
    : null;

  let phaseDay = workoutsInPhase;
  if (phaseFirstDate) {
    const now = new Date();
    phaseDay = Math.floor((now - phaseFirstDate) / (1000 * 60 * 60 * 24));
  }

  const phases = palette || PHASES_MALE;
  return {
    phase: phases[phaseIndex],
    dayKey: WORKOUT_DAYS[dayIndex],
    phaseDay: Math.min(phaseDay, 29),
    workoutsInPhase,
    phaseIndex,
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
    paddingBottom: 120,
    minHeight: "100vh",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
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
const HomeScreen = ({ user, weightLogs, exerciseLogs, phase, dayKey, phaseDay, workoutCount, workoutsInPhase, onStartWorkout, onSetPhase, phaseIndex, accentColor, planDays, onEditPrefs, phases }) => {
  const [activeDayKey, setActiveDayKey] = useState(dayKey);
  const allWorkouts = planDays || [];
  const workout = allWorkouts.find(d => d.key === activeDayKey) || allWorkouts[0] || { name: "Workout", icon: "⚡", exercises: [], cardio: { hasCardio: false } };
  // workoutCount comes from props
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Training Phase</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: phase.color, marginTop: 2 }}>{phase.name}</div>
              <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{phase.desc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Day</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{phaseDay}<span style={{ fontSize: 14, color: "#555" }}>/30</span></div>
            </div>
          </div>
          {/* Phase switcher pills */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {(phases || PHASES_DEFAULT).map((p, i) => (
              <button key={p.id} onClick={() => {
                if (i === phaseIndex) return;
                if (window.confirm(`Switch to ${p.name}? Your day counter will reset.`)) {
                  onSetPhase(i);
                }
              }} style={{
                flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                background: i === phaseIndex ? p.color : "rgba(255,255,255,0.06)",
                color: i === phaseIndex ? "#000" : "#666",
                fontSize: 11, fontWeight: 700, transition: "all 0.2s",
                outline: i === phaseIndex ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: 13, marginBottom: 1 }}>{p.icon || "●"}</div>
                <div>{p.name}</div>
              </button>
            ))}
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
          {/* Workout title row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
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

          {/* Change workout picker */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: allWorkouts.length > 3 ? "wrap" : "nowrap" }}>
            {allWorkouts.map((w, idx) => (
              <button key={w.key} onClick={() => setActiveDayKey(w.key)} style={{
                flex: allWorkouts.length > 3 ? "1 1 calc(50% - 3px)" : 1,
                padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activeDayKey === w.key ? accentColor : "rgba(255,255,255,0.06)",
                color: activeDayKey === w.key ? "#000" : "#666",
                fontSize: 11, fontWeight: 700, transition: "all 0.2s",
                outline: activeDayKey === w.key ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: 14, marginBottom: 1 }}>{w.icon}</div>
                <div>{w.name}</div>
                {w.key === dayKey && (
                  <div style={{ fontSize: 9, marginTop: 1, opacity: 0.7 }}>Today</div>
                )}
              </button>
            ))}
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

          <button style={S.bigBtn(accentColor)} onClick={() => onStartWorkout(activeDayKey)}>
            Start Workout →
          </button>
          <button onClick={onEditPrefs} style={{
            width: "100%", marginTop: 8, padding: "10px", borderRadius: 12, border: "none",
            background: "transparent", color: "#555", fontSize: 12, cursor: "pointer",
          }}>
            ✏️ Edit goals & equipment
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

// ─── REST TIMER ────────────────────────────────
const TIMER_KEY = "fitforge_timer_end";

const playDing = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch(e) {}
};

const RestTimer = ({ onDone, accentColor }) => {
  const DURATION = 90;
  // Store absolute end time so timer survives tab switches and app backgrounding
  const [endTime] = useState(() => {
    const stored = localStorage.getItem(TIMER_KEY);
    if (stored) {
      const t = parseInt(stored);
      if (t > Date.now()) return t;
    }
    const t = Date.now() + DURATION * 1000;
    localStorage.setItem(TIMER_KEY, String(t));
    return t;
  });

  const calcRemaining = () => Math.max(0, Math.round((endTime - Date.now()) / 1000));
  const [seconds, setSeconds] = useState(calcRemaining);
  const [done, setDone] = useState(() => calcRemaining() === 0);
  const dingFired = useRef(false);

  useEffect(() => {
    if (done) return;
    const tick = () => {
      const remaining = calcRemaining();
      setSeconds(remaining);
      if (remaining === 0) {
        setDone(true);
        localStorage.removeItem(TIMER_KEY);
        if (!dingFired.current) { dingFired.current = true; playDing(); }
      }
    };
    const id = setInterval(tick, 250);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [done]);

  const handleDone = () => {
    localStorage.removeItem(TIMER_KEY);
    onDone();
  };

  const pct = seconds / DURATION;
  const r = 44, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 400,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 20,
    }}>
      <div style={{ fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {done ? "Rest Complete!" : "Rest Timer"}
      </div>
      <svg width={120} height={120} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={done ? "#00ff88" : accentColor} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.25s linear" }}/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fill={done ? "#00ff88" : "#fff"} fontSize={done ? 14 : 22} fontWeight={800}>
          {done ? "GO!" : `${seconds}s`}
        </text>
      </svg>
      <button onClick={handleDone} style={{
        background: done ? "#00ff88" : "rgba(255,255,255,0.1)",
        border: "none", borderRadius: 14, padding: "14px 32px",
        color: done ? "#000" : "#aaa", fontSize: 15, fontWeight: 700, cursor: "pointer",
      }}>
        {done ? "Next Set ✓" : "Skip Rest"}
      </button>
    </div>
  );
};

// ─── CELEBRATION EMOJIS ────────────────────────────────────────────────────────
const CELEBRATIONS = [
  { emojis: "🏆🔥💪", msg: "Crushed it! Beast mode activated." },
  { emojis: "⚡💥🎯", msg: "Electric session. You showed up and delivered." },
  { emojis: "🦁💪🏋️", msg: "Absolute animal. The weights feared you today." },
  { emojis: "🚀🌟✨", msg: "You're on another level. Keep ascending." },
  { emojis: "🎉💯🔱", msg: "Perfect execution. Progress is inevitable." },
  { emojis: "🐉⚔️🏅", msg: "Legendary effort. The grind pays off." },
  { emojis: "💎🦅🙌", msg: "Diamond mentality. Nothing stops you." },
  { emojis: "🔥😤👊", msg: "No days off. That's the standard you're setting." },
];

// ─── DUMBBELL DETECTION ──────────────────────────────────────────────────────
const isDumbbellExercise = (name) => {
  if (!name) return false;
  const n = name.toLowerCase();
  return n.includes("db ") || n.startsWith("db ") || n.includes(" db ") ||
    n.includes("dumbbell") || n.includes("incline db") ||
    // specific exercises commonly done with dumbbells
    ["lateral raises", "face pulls", "incline db press", "db shoulder press",
     "db incline press", "db flat press", "bent-over db fly", "db front raise",
     "db upright row", "db row", "db shrug", "db kickback", "db snatch",
     "incline db curl", "concentration curl"].some(e => n.includes(e));
};

// ─── ADD EXERCISE PANEL ───────────────────────────────────────────────────────
const AddExercisePanel = ({ workout, onAdd, onClose, accentColor }) => {
  // Build candidate list from EXERCISE_DB — same muscles, not already in workout
  const muscles = new Set(workout.exercises.map(e => e.muscle));
  const existing = new Set(workout.exercises.map(e => e.name));
  const defaultSets = workout.exercises[0]?.sets || 3;
  const defaultReps = parseInt(workout.exercises[0]?.reps) || 10;

  const candidates = Object.entries(EXERCISE_DB)
    .filter(([name, data]) => muscles.has(data.muscle) && !existing.has(name))
    .map(([name, data]) => ({ name, muscle: data.muscle }));

  const [idx, setIdx] = useState(0);
  const [sets, setSets] = useState(defaultSets);
  const [reps, setReps] = useState(defaultReps);
  const [added, setAdded] = useState(false);

  if (!candidates.length) {
    return (
      <>
        <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, backdropFilter:"blur(4px)" }}/>
        <div style={{
          position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
          width:"100%", maxWidth:430, background:"#111118",
          borderRadius:"24px 24px 0 0", border:"1px solid rgba(255,255,255,0.1)",
          borderBottom:"none", zIndex:201, padding:"32px 24px 48px", textAlign:"center",
        }}>
          <div style={{ fontSize:32, marginBottom:12 }}>✅</div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>All alternatives added</div>
          <div style={{ fontSize:13, color:"#666", marginBottom:24 }}>You've already added every available exercise for today's muscle groups.</div>
          <button onClick={onClose} style={{ background:accentColor, border:"none", borderRadius:14, padding:"14px 32px", color:"#000", fontSize:15, fontWeight:700, cursor:"pointer", width:"100%" }}>Done</button>
        </div>
      </>
    );
  }

  const current = candidates[idx];

  const handleAdd = () => {
    onAdd({ ...current, sets, reps: String(reps) });
    setAdded(true);
    setTimeout(() => onClose(), 600);
  };

  const stepStyle = (color) => ({
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, width: 48, height: 48, display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", flexShrink: 0, color,
  });

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, backdropFilter:"blur(4px)" }}/>
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:430, background:"#111118",
        borderRadius:"24px 24px 0 0", border:"1px solid rgba(255,255,255,0.1)",
        borderBottom:"none", zIndex:201, padding:"0 0 44px",
      }}>
        {/* Handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"14px 0 0" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"#333" }}/>
        </div>

        {/* Header */}
        <div style={{ padding:"12px 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>Add Exercise</div>
            <div style={{ fontSize:18, fontWeight:800 }}>Browse options</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#888", fontSize:18 }}>✕</button>
        </div>

        <div style={{ padding:"0 20px" }}>
          {/* Exercise card with prev/next navigation */}
          <div style={{
            background:"rgba(255,255,255,0.04)", border:`1px solid ${accentColor}33`,
            borderRadius:20, padding:"20px", marginBottom:16,
          }}>
            {/* Nav arrows + name */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <button
                onClick={() => { setIdx((idx - 1 + candidates.length) % candidates.length); setSets(defaultSets); setReps(defaultReps); }}
                style={{ ...stepStyle("#aaa"), width:40, height:40, fontSize:18 }}
              >‹</button>
              <div style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:17, fontWeight:800, lineHeight:1.2, marginBottom:4 }}>{current.name}</div>
                <div style={{ fontSize:12, color:"#666" }}>{current.muscle}</div>
              </div>
              <button
                onClick={() => { setIdx((idx + 1) % candidates.length); setSets(defaultSets); setReps(defaultReps); }}
                style={{ ...stepStyle("#aaa"), width:40, height:40, fontSize:18 }}
              >›</button>
            </div>

            {/* Pagination dots */}
            <div style={{ display:"flex", justifyContent:"center", gap:5, marginBottom:18 }}>
              {candidates.map((_, i) => (
                <div key={i} onClick={() => setIdx(i)} style={{
                  width: i === idx ? 18 : 6, height:6, borderRadius:3,
                  background: i === idx ? accentColor : "rgba(255,255,255,0.15)",
                  cursor:"pointer", transition:"all 0.2s",
                }}/>
              ))}
            </div>

            {/* Sets adjuster */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Sets</div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <button style={stepStyle(accentColor)} onClick={() => setSets(s => Math.max(1, s - 1))}>
                  <span style={{ fontSize:20, color:accentColor, lineHeight:1 }}>−</span>
                </button>
                <div style={{ flex:1, textAlign:"center", fontSize:28, fontWeight:900, color:"#fff" }}>{sets}</div>
                <button style={stepStyle(accentColor)} onClick={() => setSets(s => s + 1)}>
                  <span style={{ fontSize:20, color:accentColor, lineHeight:1 }}>+</span>
                </button>
              </div>
            </div>

            {/* Reps adjuster */}
            <div>
              <div style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Reps</div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <button style={stepStyle(accentColor)} onClick={() => setReps(r => Math.max(1, r - 1))}>
                  <span style={{ fontSize:20, color:accentColor, lineHeight:1 }}>−</span>
                </button>
                <div style={{ flex:1, textAlign:"center", fontSize:28, fontWeight:900, color:"#fff" }}>{reps}</div>
                <button style={stepStyle(accentColor)} onClick={() => setReps(r => r + 1)}>
                  <span style={{ fontSize:20, color:accentColor, lineHeight:1 }}>+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Add to Workout button */}
          <button
            onClick={handleAdd}
            disabled={added}
            style={{
              width:"100%", padding:"16px", borderRadius:16, border:"none",
              background: added ? "#1a3a2a" : accentColor,
              color: added ? "#00ff88" : "#000",
              fontSize:16, fontWeight:800, cursor: added ? "default" : "pointer",
              transition:"all 0.3s",
            }}
          >
            {added ? `✓ ${current.name} Added!` : `Add to Workout →`}
          </button>

          {/* Counter */}
          <div style={{ textAlign:"center", fontSize:12, color:"#555", marginTop:10 }}>
            {idx + 1} of {candidates.length} options
          </div>
        </div>
      </div>
    </>
  );
};

// ─── CELEBRATION SCREEN ───────────────────────────────────────────────────────
const CelebrationScreen = ({ celebration, accentColor, onDone }) => {
  const [visible, setVisible] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    // Stagger entrance: emojis pop in, then text, then button
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setShowBtn(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      onClick={showBtn ? onDone : undefined}
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 32, textAlign: "center",
        background: "radial-gradient(ellipse at center, rgba(0,255,136,0.06) 0%, #0a0a0f 70%)",
        cursor: showBtn ? "pointer" : "default",
      }}
    >
      {/* Emojis — scale in */}
      <div style={{
        fontSize: 80, lineHeight: 1.2, marginBottom: 20,
        transform: visible ? "scale(1)" : "scale(0.3)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
      }}>
        {celebration.emojis}
      </div>

      {/* Title */}
      <div style={{
        fontSize: 30, fontWeight: 900, color: accentColor, marginBottom: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
      }}>
        Workout Complete!
      </div>

      {/* Message */}
      <div style={{
        fontSize: 16, color: "#888", marginBottom: 56, lineHeight: 1.6, maxWidth: 280,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease 0.55s, transform 0.5s ease 0.55s",
      }}>
        {celebration.msg}
      </div>

      {/* Button — fades in after delay */}
      <div style={{
        width: "100%", maxWidth: 360,
        opacity: showBtn ? 1 : 0,
        transform: showBtn ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        pointerEvents: showBtn ? "auto" : "none",
      }}>
        <button style={S.bigBtn(accentColor)} onClick={onDone}>
          Back to Dashboard
        </button>
        <div style={{ fontSize: 12, color: "#444", marginTop: 10 }}>
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
};


// ─── EXERCISE INFO MODAL ──────────────────────────────────────────────────────
const ExerciseInfoModal = ({ exerciseName, onClose, accentColor }) => {
  const [data, setData] = useState(null);   // { description, images, muscles }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!exerciseName) return;
    setLoading(true); setError(false); setData(null);

    const fetchInfo = async () => {
      try {
        const BASE = "https://wger.de";

        // Step 1: search by name — returns both translation id and base_id
        const searchRes = await fetch(
          `${BASE}/api/v2/exercise/search/?term=${encodeURIComponent(exerciseName)}&language=english&format=json`
        );
        const searchData = await searchRes.json();
        const suggestions = searchData?.suggestions || [];
        if (!suggestions.length) throw new Error("not found");

        // base_id is what exerciseinfo and exerciseimage endpoints need
        const baseId = suggestions[0]?.data?.base_id || suggestions[0]?.data?.id;
        if (!baseId) throw new Error("no id");

        // Step 2: get full exercise info using base_id
        const infoRes = await fetch(`${BASE}/api/v2/exerciseinfo/${baseId}/?format=json`);
        const info = await infoRes.json();

        // English description — strip HTML
        const engTranslation = (info.translations || []).find(t => t.language === 2);
        const desc = (engTranslation?.description || "").replace(/<[^>]+>/g, "").trim();

        // Images — exerciseinfo returns full URLs; also try exerciseimage endpoint as fallback
        let images = (info.images || [])
          .map(img => {
            const src = img.image || "";
            return src.startsWith("http") ? src : `${BASE}${src}`;
          })
          .filter(Boolean)
          .slice(0, 2);

        // Fallback: fetch images directly if exerciseinfo had none
        if (!images.length) {
          const imgRes = await fetch(`${BASE}/api/v2/exerciseimage/?exercise_base=${baseId}&format=json`);
          const imgData = await imgRes.json();
          images = (imgData.results || [])
            .map(img => {
              const src = img.image || "";
              return src.startsWith("http") ? src : `${BASE}${src}`;
            })
            .filter(Boolean)
            .slice(0, 2);
        }

        // Muscles
        const muscles = [
          ...(info.muscles || []).map(m => m.name_en || m.name),
          ...(info.muscles_secondary || []).map(m => `${m.name_en || m.name} (secondary)`),
        ];

        setData({ desc, images, muscles });
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [exerciseName]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        zIndex: 500, backdropFilter: "blur(6px)",
      }} />

      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: "#13131a",
        borderRadius: "24px 24px 0 0", border: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "none", zIndex: 501,
        height: "85vh", overflowY: "scroll",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#333" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "12px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Exercise Guide</div>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{exerciseName}</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10,
            width: 36, height: 36, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: "#888", fontSize: 18, flexShrink: 0,
          }}>✕</button>
        </div>

        <div style={{ padding: "0 20px 48px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#555" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
              <div style={{ fontSize: 13 }}>Loading exercise info...</div>
            </div>
          )}

          {error && !loading && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{exerciseName}</div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                No guide available for this exercise yet. Ask a trainer or search YouTube for a demo.
              </div>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Image */}
              {data.images.length > 0 ? (
                <div style={{ marginBottom: 20, borderRadius: 16, overflow: "hidden", background: "#1a1a2e", display: "flex", gap: 2 }}>
                  {data.images.map((src, i) => (
                    <img key={i} src={src} alt={`${exerciseName} ${i+1}`}
                      style={{ flex: 1, width: 0, maxHeight: 240, objectFit: "cover", display: "block" }}
                      onError={e => { e.target.parentNode.style.display = "none"; }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ marginBottom: 20, borderRadius: 16, background: `${accentColor}11`, border: `1px solid ${accentColor}22`, padding: "32px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🏋️</div>
                  <div style={{ fontSize: 13, color: "#666" }}>No image available</div>
                </div>
              )}

              {/* Muscles */}
              {data.muscles.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Muscles Worked</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {data.muscles.map((m, i) => (
                      <div key={i} style={{
                        background: m.includes("secondary") ? "rgba(255,255,255,0.06)" : `${accentColor}18`,
                        border: `1px solid ${m.includes("secondary") ? "rgba(255,255,255,0.1)" : accentColor + "44"}`,
                        borderRadius: 20, padding: "5px 12px",
                        fontSize: 12, fontWeight: 600,
                        color: m.includes("secondary") ? "#666" : accentColor,
                      }}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {data.desc ? (
                <div>
                  <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>How To</div>
                  <div style={{ fontSize: 14, color: "#aaa", lineHeight: 1.7 }}>{data.desc}</div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, fontStyle: "italic" }}>
                  Search "{exerciseName}" on YouTube for a video demonstration.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ─── WORKOUT SCREEN ───────────────────────────────────────────────────────────
const WorkoutScreen = ({ phase, dayKey, workoutDay, exerciseLogs, onSave, onFinish, onLogExercise, accentColor, savedState, onSaveState }) => {
  const baseWorkout = workoutDay || { name: "Workout", icon: "⚡", exercises: [], cardio: { hasCardio: false } };

  // ── Restore saved state or init fresh ────────────────────────────────────
  const [exercises, setExercises] = useState(() => {
    if (savedState?.exercises) return savedState.exercises;
    const raw = (workoutDay?.exercises || []);
    // Deduplicate by name, preserving order
    const seen = new Set();
    return raw.filter(e => { if (seen.has(e.name)) return false; seen.add(e.name); return true; });
  });

  // Day changes are handled by HomeScreen — WorkoutScreen just receives workoutDay prop
  const [currentExIdx, setCurrentExIdx] = useState(() => savedState?.currentExIdx || 0);
  const [completedSets, setCompletedSets] = useState(() => savedState?.completedSets || {});
  const [weights, setWeights] = useState(() => savedState?.weights || {});
  const [reps, setReps] = useState(() => savedState?.reps || {});
  const [phase2, setPhase] = useState(() => savedState?.phase2 || "workout");
  const [swappedExercises, setSwappedExercises] = useState(() => savedState?.swappedExercises || {});
  const [loggedExercises, setLoggedExercises] = useState(() => savedState?.loggedExercises || {}); // track already-saved exercises
  const [showTimer, setShowTimer] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingSet, setEditingSet] = useState(null); // { exName, setIdx }
  const [showInfoFor, setShowInfoFor] = useState(null); // exercise name to show guide for

  // Save state to parent whenever it changes (for nav-away persistence)
  useEffect(() => {
    onSaveState({
      exercises, currentExIdx, completedSets, weights, reps,
      phase2, swappedExercises, loggedExercises,
    });
  }, [exercises, currentExIdx, completedSets, weights, reps, phase2, swappedExercises, loggedExercises]);

  const workout = { ...baseWorkout, exercises };

  const getPrevLog = (exerciseName) => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60);
    const logs = exerciseLogs
      .filter(l => l.exercise_name === exerciseName && new Date(l.date) > cutoff)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return logs.length ? logs[logs.length - 1] : null;
  };

  const getActiveEx = (idx) => swappedExercises[idx] || exercises[idx];
  const ex = getActiveEx(currentExIdx);
  const prevLog = getPrevLog(ex?.name);

  // ── #1 Default weight: last recorded or 50lbs ────────────────────────────
  useEffect(() => {
    if (ex) {
      setWeights(w => ({ ...w, [ex.name]: w[ex.name] ?? (prevLog ? prevLog.weight_used : 50) }));
      setReps(r => ({ ...r, [ex.name]: r[ex.name] ?? (prevLog ? prevLog.reps : parseInt(ex.reps)) }));
    }
  }, [currentExIdx, ex?.name]);

  const sets = parseInt(ex?.sets || 3);
  const completedForCurrent = (completedSets[ex?.name] || []).length;
  const w = weights[ex?.name] ?? 50;
  const r = reps[ex?.name] ?? parseInt(ex?.reps || 8);

  const handleSwap = () => {
    const original = exercises[currentExIdx];
    // Build alts from EXERCISE_DB — same muscle, not already in workout
    const alts = Object.entries(EXERCISE_DB)
      .filter(([name, data]) => data.muscle === original.muscle && !exercises.some(e => e.name === name))
      .map(([name]) => ({ name }));
    if (!alts.length) return;
    const currentSwap = swappedExercises[currentExIdx];
    const currentAltIdx = currentSwap ? alts.findIndex(a => a.name === currentSwap.name) : -1;
    const nextAlt = alts[(currentAltIdx + 1) % alts.length];
    const swapped = { ...original, name: nextAlt.name, swappedFrom: original.name };
    setSwappedExercises(prev => ({ ...prev, [currentExIdx]: swapped }));
    setCompletedSets(prev => { const n={...prev}; delete n[nextAlt.name]; return n; });
    const pl = getPrevLog(nextAlt.name);
    setWeights(prev => ({ ...prev, [nextAlt.name]: pl ? pl.weight_used : 50 }));
    setReps(prev => ({ ...prev, [nextAlt.name]: pl ? pl.reps : parseInt(original.reps) }));
  };

  const logSet = () => {
    const name = ex.name;
    const prev = completedSets[name] || [];
    setCompletedSets({ ...completedSets, [name]: [...prev, { w: weights[name], r: reps[name] }] });
    // Show rest timer after logging a set (not the last set of last exercise)
    setShowTimer(true);
  };

  // ── #3 Save exercise to DB as soon as we move away from it ───────────────
  const saveCurrentExercise = async () => {
    const activeEx = getActiveEx(currentExIdx);
    const sets = completedSets[activeEx.name] || [];
    if (sets.length && !loggedExercises[activeEx.name]) {
      const log = {
        date: new Date().toISOString(),
        exercise_name: activeEx.name,
        sets: sets.length,
        reps: sets[sets.length - 1]?.r,
        weight_used: sets[sets.length - 1]?.w,
        swapped_from: activeEx.swappedFrom || null,
      };
      await onLogExercise(log);
      setLoggedExercises(prev => ({ ...prev, [activeEx.name]: true }));
    }
  };

  const nextExercise = async () => {
    await saveCurrentExercise();
    if (currentExIdx < exercises.length - 1) {
      setCurrentExIdx(currentExIdx + 1);
    } else if (workout.cardio.hasCardio) {
      setPhase("cardio");
    } else {
      finishWorkout();
    }
  };

  const goToExercise = async (idx) => {
    await saveCurrentExercise();
    setCurrentExIdx(idx);
  };

  const finishWorkout = () => {
    // Save data immediately, then show celebration
    if (onSave) onSave();
    setPhase("done");
  };

  // ── Add exercise ──────────────────────────────────────────────────────────
  const handleAddExercise = (newEx) => {
    setExercises(prev => {
      if (prev.some(e => e.name === newEx.name)) return prev; // already in workout
      return [...prev, newEx];
    });
  };

  // ── Edit set ─────────────────────────────────────────────────────────────
  const handleEditSet = (exName, setIdx, field, value) => {
    setCompletedSets(prev => {
      const sets = [...(prev[exName] || [])];
      sets[setIdx] = { ...sets[setIdx], [field]: parseFloat(value) || 0 };
      return { ...prev, [exName]: sets };
    });
  };

  // ── #5 Random celebration ─────────────────────────────────────────────────
  const celebration = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];

  if (phase2 === "done") {
    return <CelebrationScreen celebration={celebration} accentColor={accentColor} onDone={() => onFinish([])} />;
  }

  if (phase2 === "cardio") {
    return (
      <div style={{ ...S.scroll, padding:"60px 20px 20px" }}>
        <div style={{ fontSize:13, color:"#666", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:20 }}>Cardio Finisher</div>
        <div style={{ fontSize:26, fontWeight:900, marginBottom:6 }}>{workout.cardio.type}</div>
        <div style={{ fontSize:16, color:"#888", marginBottom:30 }}>{workout.cardio.desc}</div>
        <div style={{ ...S.card(`${accentColor}33`), textAlign:"center", marginBottom:30 }}>
          <Icon name="timer" size={48} color={accentColor} />
          <div style={{ fontSize:64, fontWeight:900, color:accentColor, margin:"16px 0 8px" }}>{workout.cardio.duration}</div>
          <div style={{ fontSize:16, color:"#888" }}>minutes</div>
        </div>
        <div style={{ fontSize:13, color:"#666", marginBottom:30, lineHeight:1.6 }}>
          Complete your cardio at a controlled intensity. This preserves muscle while conditioning your cardiovascular system.
        </div>
        <button style={S.bigBtn(accentColor)} onClick={finishWorkout}>Complete Workout ✓</button>
      </div>
    );
  }

  return (
    <div style={{ ...S.scroll, padding:"0 16px" }}>
      {showTimer && <RestTimer accentColor={accentColor} onDone={() => setShowTimer(false)} />}
      {showInfoFor && <ExerciseInfoModal exerciseName={showInfoFor} onClose={() => setShowInfoFor(null)} accentColor={accentColor} />}
      {showAddPanel && (
        <AddExercisePanel
          workout={workout}
          onAdd={handleAddExercise}
          onClose={() => setShowAddPanel(false)}
          accentColor={accentColor}
        />
      )}

      {/* Header */}
      <div style={{ padding:"56px 4px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:12, color:"#666", textTransform:"uppercase", letterSpacing:"0.08em" }}>{workout.name}</div>
          <div style={{ fontSize:12, color:"#666" }}>{currentExIdx + 1} / {exercises.length}</div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginTop:8, gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ fontSize:22, fontWeight:800, lineHeight:1.2 }}>{ex.name}</div>
              <button onClick={() => setShowInfoFor(ex.name)} style={{
                background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)",
                borderRadius:"50%", width:24, height:24, display:"flex", alignItems:"center",
                justifyContent:"center", cursor:"pointer", color:"#888", fontSize:13,
                fontWeight:700, flexShrink:0, lineHeight:1,
              }}>?</button>
            </div>
            {ex.swappedFrom && <div style={{ fontSize:11, color:"#888", marginTop:4 }}>↔ Swapped from {ex.swappedFrom}</div>}
          </div>
          {completedForCurrent === 0 && (
            <button onClick={handleSwap} style={{
              display:"flex", alignItems:"center", gap:6,
              background: ex.swappedFrom ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.07)",
              border:`1px solid ${ex.swappedFrom ? "rgba(255,107,53,0.4)" : "rgba(255,255,255,0.12)"}`,
              borderRadius:10, padding:"7px 12px", cursor:"pointer", flexShrink:0,
              color: ex.swappedFrom ? "#ff6b35" : "#aaa", fontSize:12, fontWeight:700,
            }}>
              <Icon name="swap" size={14} color={ex.swappedFrom ? "#ff6b35" : "#aaa"} />
              {ex.swappedFrom ? "Swap Again" : "Swap"}
            </button>
          )}
        </div>

        {/* Exercise progress dots */}
        <div style={{ display:"flex", gap:6, marginTop:14 }}>
          {exercises.map((_, i) => {
            return (
              <div key={i} onClick={() => goToExercise(i)} style={{
                height:6, flex:1, borderRadius:3, cursor:"pointer",
                background: i < currentExIdx ? accentColor
                  : i === currentExIdx ? `${accentColor}88`
                  : "rgba(255,255,255,0.1)",
                transition:"all 0.3s",
              }} />
            );
          })}
          <div onClick={() => setShowAddPanel(true)} style={{
            height:6, width:16, borderRadius:3, cursor:"pointer",
            background:`${accentColor}55`, flexShrink:0,
          }}/>
        </div>
      </div>

      {/* Previous performance */}
      {prevLog ? (
        <div style={{ ...S.card(), display:"flex", gap:12, alignItems:"center", marginBottom:12, background:"rgba(0,255,136,0.04)", border:"1px solid rgba(0,255,136,0.15)" }}>
          <Icon name="bolt" size={18} color={accentColor} />
          <div>
            <div style={{ fontSize:11, color:accentColor, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700 }}>Last Session</div>
            <div style={{ fontSize:14, color:"#ccc", marginTop:2 }}>
              {prevLog.sets} sets × {prevLog.reps} reps @ <strong style={{ color:"#fff" }}>{prevLog.weight_used} lbs</strong>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...S.card(), marginBottom:12 }}>
          <div style={{ fontSize:13, color:"#666" }}>No previous data — establish your baseline today.</div>
        </div>
      )}

      {/* Weight */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div style={{ fontSize:12, color:"#666", textTransform:"uppercase", letterSpacing:"0.08em" }}>
            Weight (lbs){isDumbbellExercise(ex.name) ? " — each hand" : ""}
          </div>
          {isDumbbellExercise(ex.name) && (
            <div style={{ fontSize:11, background:"rgba(255,200,50,0.12)", border:"1px solid rgba(255,200,50,0.25)", borderRadius:6, padding:"2px 8px", color:"#ffc832" }}>
              🥊 × 2
            </div>
          )}
        </div>
        <div style={S.stepper}>
          <button style={S.stepBtn(accentColor)} onClick={() => setWeights({...weights,[ex.name]:Math.max(0,w-5)})}>
            <Icon name="minus" size={20} color={accentColor}/>
          </button>
          <div style={{ ...S.stepVal, display:"flex", flexDirection:"column", alignItems:"center", lineHeight:1.1 }}>
            <span>{w}</span>
            {isDumbbellExercise(ex.name) && (
              <span style={{ fontSize:10, color:"#888", fontWeight:400 }}>× 2 = {w*2} lbs total</span>
            )}
          </div>
          <button style={S.stepBtn(accentColor)} onClick={() => setWeights({...weights,[ex.name]:w+5})}>
            <Icon name="plus" size={20} color={accentColor}/>
          </button>
        </div>
      </div>

      {/* Reps */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:"#666", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Reps</div>
        <div style={S.stepper}>
          <button style={S.stepBtn(accentColor)} onClick={() => setReps({...reps,[ex.name]:Math.max(1,r-1)})}>
            <Icon name="minus" size={20} color={accentColor}/>
          </button>
          <div style={S.stepVal}>{r}</div>
          <button style={S.stepBtn(accentColor)} onClick={() => setReps({...reps,[ex.name]:r+1})}>
            <Icon name="plus" size={20} color={accentColor}/>
          </button>
        </div>
      </div>

      {/* Sets */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:"#666", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>
          Sets — {completedForCurrent} / {sets} completed
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {Array.from({ length: Math.max(sets, completedForCurrent) }).map((_, i) => {
            const done = i < completedForCurrent;
            const setInfo = (completedSets[ex.name] || [])[i];
            const isEditing = editingSet?.exName === ex.name && editingSet?.setIdx === i;
            return (
              <div key={i}
                onClick={() => { if (!done) return; setEditingSet(isEditing ? null : { exName: ex.name, setIdx: i }); }}
                style={{
                  flex:1, minHeight:64, borderRadius:12,
                  background: isEditing ? `${accentColor}33` : done ? `${accentColor}22` : "rgba(255,255,255,0.05)",
                  border:`1px solid ${isEditing ? accentColor : done ? accentColor+"44" : "rgba(255,255,255,0.08)"}`,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  transition:"all 0.2s", cursor: done ? "pointer" : "default", padding:"6px 4px",
                }}>
                {isEditing ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:4, width:"100%", padding:"0 6px" }}
                    onClick={e => e.stopPropagation()}>
                    <div style={{ fontSize:9, color:accentColor, textAlign:"center", textTransform:"uppercase" }}>lbs</div>
                    <input type="number" inputMode="decimal" value={setInfo?.w} autoFocus
                      onChange={e => handleEditSet(ex.name, i, "w", e.target.value)}
                      onFocus={e => e.target.select()}
                      style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:6, color:"#fff", fontSize:14, fontWeight:700, textAlign:"center", width:"100%", outline:"none", padding:"4px 0" }}/>
                    <div style={{ fontSize:9, color:"#666", textAlign:"center", textTransform:"uppercase" }}>reps</div>
                    <input type="number" inputMode="numeric" value={setInfo?.r}
                      onChange={e => handleEditSet(ex.name, i, "r", e.target.value)}
                      onFocus={e => e.target.select()}
                      style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:6, color:"#aaa", fontSize:12, textAlign:"center", width:"100%", outline:"none", padding:"3px 0" }}/>
                  </div>
                ) : done ? (
                  <>
                    <div style={{ fontSize:13, fontWeight:700, color:accentColor }}>{setInfo?.w}</div>
                    <div style={{ fontSize:10, color:"#888" }}>lbs</div>
                    <div style={{ fontSize:11, color:"#777", marginTop:2 }}>×{setInfo?.r}</div>
                    <div style={{ fontSize:8, color:"#444", marginTop:2 }}>tap to edit</div>
                  </>
                ) : (
                  <div style={{ fontSize:13, color:"#555", fontWeight:600 }}>Set {i+1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {completedForCurrent < sets ? (
        <button style={S.bigBtn(accentColor)} onClick={logSet}>
          ✓ Log Set {completedForCurrent + 1}
        </button>
      ) : (
        <button style={S.bigBtn(accentColor)} onClick={nextExercise}>
          {currentExIdx < exercises.length - 1
            ? `Next: ${getActiveEx(currentExIdx + 1).name} →`
            : workout.cardio?.hasCardio ? "Move to Cardio →" : "Finish Workout →"}
        </button>
      )}

      {/* Exercise info + add */}
      <div style={{ ...S.card(), marginTop:16, display:"flex", gap:16, justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:20 }}>
          {[
            { label:"Muscle", value:ex.muscle },
            { label:"Prescribed", value:`${ex.sets}×${ex.reps}` },
            { label:"Rest", value:"90s" },
          ].map(info => (
            <div key={info.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:"0.08em" }}>{info.label}</div>
              <div style={{ fontSize:14, fontWeight:700, marginTop:2 }}>{info.value}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowAddPanel(true)} style={{
          background:`${accentColor}22`, border:`1px solid ${accentColor}44`,
          borderRadius:10, width:36, height:36, display:"flex", alignItems:"center",
          justifyContent:"center", cursor:"pointer", color:accentColor, fontSize:20, fontWeight:300, flexShrink:0,
        }}>+</button>
      </div>
    </div>
  );
};

// ─── HISTORY SCREEN ───────────────────────────────────────────────────────────
// ─── WEIGHT LOG SCREEN ────────────────────────────────────────────────────────
const WeightScreen = ({ weightLogs, onLog, accentColor }) => {
  const [inputVal, setInputVal] = useState("");
  const [logged, setLogged] = useState(false);
  const chartData = weightLogs.slice(-12).map(l => ({
    value: l.weight_value,
    label: new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
  const latest = weightLogs.length ? weightLogs[weightLogs.length - 1] : null;
  const prev = weightLogs.length > 1 ? weightLogs[weightLogs.length - 2] : null;
  const diff = latest && prev ? (latest.weight_value - prev.weight_value).toFixed(1) : null;

  const handleLog = async () => {
    const val = parseFloat(inputVal);
    if (!val || val <= 0) return;
    await onLog(val);
    setLogged(true);
    setInputVal("");
    setTimeout(() => setLogged(false), 2000);
  };

  return (
    <div style={{ ...S.scroll, padding: "60px 16px 20px" }}>
      <div style={{ fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Track</div>
      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 24 }}>Body Weight</div>

      {/* Log weight */}
      <div style={{ ...S.card(), marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Log Today's Weight</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="number" inputMode="decimal"
            placeholder="lbs"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLog()}
            style={{
              flex: 1, background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
              color: "#fff", fontSize: 20, fontWeight: 700,
              padding: "14px 16px", outline: "none",
            }}
          />
          <button
            onClick={handleLog}
            style={{
              ...S.bigBtn(logged ? "#1a3a2a" : accentColor),
              flex: 0, padding: "14px 20px", fontSize: 14,
              color: logged ? "#00ff88" : "#000",
            }}
          >
            {logged ? "✓" : "Log"}
          </button>
        </div>
      </div>

      {/* Latest stats */}
      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div style={{ ...S.card(), marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: accentColor, marginTop: 4 }}>
              {latest.weight_value}<span style={{ fontSize: 14, color: "#555", fontWeight: 400 }}> lbs</span>
            </div>
          </div>
          <div style={{ ...S.card(), marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Change</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: diff > 0 ? "#ff6b35" : diff < 0 ? accentColor : "#888" }}>
              {diff !== null ? (diff > 0 ? `+${diff}` : diff) : "—"}<span style={{ fontSize: 14, color: "#555", fontWeight: 400 }}> lbs</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 ? (
        <div style={{ ...S.card(), marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Last {chartData.length} entries</div>
          <LineChart data={chartData} color={accentColor} height={140} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <div style={{ fontSize: 10, color: "#555" }}>{chartData[0]?.label}</div>
            <div style={{ fontSize: 10, color: "#555" }}>{chartData[chartData.length - 1]?.label}</div>
          </div>
        </div>
      ) : (
        <div style={{ ...S.card(), textAlign: "center", color: "#555", fontSize: 13 }}>
          Log at least 2 entries to see your trend chart.
        </div>
      )}
    </div>
  );
};

const HistoryScreen = ({ exerciseLogs, accentColor }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Build per-exercise summary: most recent log only
  const byExercise = {};
  exerciseLogs.forEach(log => {
    const logDate = new Date(log.date);
    const existingDate = byExercise[log.exercise_name] ? new Date(byExercise[log.exercise_name].date) : null;
    if (!existingDate || logDate > existingDate) {
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
    <div style={{ ...S.scroll, padding: "60px 16px 120px", overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
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
const ProfileScreen = ({ user, phase, authUser, cloudLoading, onReset, onSaveName, onSignOut, onAuth, accentColor, phases }) => {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const startDate = new Date(user.start_date);
  const daysSince = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));

  // Inline auth panel state
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const save = async () => {
    await onSaveName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAuth = async () => {
    setAuthError(""); setAuthMessage(""); setAuthLoading(true);
    try {
      if (authMode === "signup") {
        const { data, error: e } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: authName || "Athlete" } }
        });
        if (e) throw e;
        if (data.user && !data.session) {
          setAuthMessage("Check your email to confirm, then log in.");
        } else if (data.session) {
          onAuth(data.session.user);
        }
      } else {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onAuth(data.user);
      }
    } catch (e) {
      setAuthError(e.message || "Something went wrong.");
    } finally {
      setAuthLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, color: "#fff", fontSize: 15, width: "100%",
    padding: "13px 14px", outline: "none", boxSizing: "border-box", marginBottom: 10,
  };

  return (
    <div style={{ ...S.scroll, padding: "60px 16px 120px", overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
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
        {(phases || PHASES_DEFAULT).map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < (phases || PHASES_DEFAULT).length - 1 ? 14 : 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.id === phase.id ? p.color : "#333", flexShrink: 0, boxShadow: p.id === phase.id ? `0 0 10px ${p.color}` : "none" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: p.id === phase.id ? p.color : "#888" }}>{p.name} {p.id === phase.id ? "← Active" : ""}</div>
              <div style={{ fontSize: 11, color: "#666" }}>{p.desc} · {p.weeks * 7} days</div>
            </div>
          </div>
        ))}
      </div>

      <button
        style={{ ...S.bigBtn("#444"), color: "#ff6b35", boxShadow: "none", marginBottom: 12 }}
        onClick={() => { if (window.confirm("Reset all data? This cannot be undone.")) onReset(); }}
      >
        Reset All Data
      </button>

      {/* ── Cloud Sync Section ─────────────────────────────────────────────── */}
      {authUser ? (
        // Logged in — show account info
        <div style={{ ...S.card(), marginBottom: 12, border: `1px solid ${accentColor}33` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: accentColor, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>☁ Cloud Sync Active</div>
            {cloudLoading && <div style={{ fontSize: 11, color: "#666" }}>syncing...</div>}
          </div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>{authUser.email}</div>
          <button
            style={{ ...S.bigBtn("#1a1a2e"), color: "#888", boxShadow: "none", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={() => { if (window.confirm("Sign out of FitForge?")) onSignOut(); }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        // Guest — show inline login/signup
        <div style={{ ...S.card(), marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>☁ Save to Cloud</div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 16, lineHeight: 1.5 }}>
            Create a free account to back up your data and access it from any device.
          </div>

          {/* Toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 3, marginBottom: 14 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); setAuthMessage(""); }} style={{
                flex: 1, padding: "9px", borderRadius: 8, border: "none",
                background: authMode === m ? accentColor : "transparent",
                color: authMode === m ? "#000" : "#666",
                fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
              }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {authMode === "signup" && (
            <input type="text" placeholder="Your name" value={authName}
              onChange={e => setAuthName(e.target.value)} style={inputStyle} />
          )}
          <input type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
            style={{ ...inputStyle, marginBottom: 0 }} />

          {authError && <div style={{ color: "#ff6b35", fontSize: 12, marginTop: 10 }}>{authError}</div>}
          {authMessage && <div style={{ color: accentColor, fontSize: 12, marginTop: 10 }}>{authMessage}</div>}

          <button
            onClick={handleAuth}
            disabled={authLoading || !email || !password}
            style={{
              ...S.bigBtn(authLoading || !email || !password ? "#222" : accentColor),
              marginTop: 14,
              color: authLoading || !email || !password ? "#555" : "#000",
              boxShadow: authLoading ? "none" : undefined,
            }}
          >
            {authLoading ? "..." : authMode === "login" ? "Log In" : "Create Account"}
          </button>
        </div>
      )}


    </div>
  );
};



// ─── ONBOARDING SCREEN ───────────────────────────────────────────────────────
const OnboardingScreen = ({ onComplete, accentColor }) => {
  const [step, setStep] = useState(0); // 0=gender, 1=goal, 2=equipment, 3=frequency, 4=name
  const [gender, setGender] = useState(null);
  const [goal, setGoal] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [frequency, setFrequency] = useState(3);
  const [name, setName] = useState("");
  const [animIn, setAnimIn] = useState(true);

  const goTo = (nextStep) => {
    setAnimIn(false);
    setTimeout(() => { setStep(nextStep); setAnimIn(true); }, 220);
  };

  const toggleEquip = (id) => {
    if (id === "bodyweight") {
      // Bodyweight only — deselect everything else
      setEquipment(prev => prev.includes("bodyweight") ? [] : ["bodyweight"]);
      return;
    }
    setEquipment(prev => {
      const without = prev.filter(e => e !== "bodyweight");
      return without.includes(id) ? without.filter(e => e !== id) : [...without, id];
    });
  };

  const finish = () => {
    const prefs = { gender: gender || "male", goal, equipment: equipment.length ? equipment : ["bodyweight"], frequency, name: name.trim() || "Athlete" };
    onComplete(prefs);
  };

  const steps = [
    { title: "First, who's training?", subtitle: "We'll personalize your experience." },
    { title: "What's your goal?", subtitle: "We'll build your plan around this." },
    { title: "What equipment do you have?", subtitle: "Select everything available to you." },
    { title: "How often can you train?", subtitle: "Be realistic — consistency beats intensity." },
    { title: "What should we call you?", subtitle: "Let's make this personal." },
  ];

  const canAdvance = [
    !!gender,
    !!goal,
    equipment.length > 0,
    true,
    true,
  ];
  const totalSteps = steps.length;

  const slideStyle = {
    opacity: animIn ? 1 : 0,
    transform: animIn ? "translateY(0)" : "translateY(16px)",
    transition: "opacity 0.22s ease, transform 0.22s ease",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column" }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div style={{ height: "100%", background: "#00ff88", width: `${((step + 1) / totalSteps) * 100}%`, transition: "width 0.4s ease" }} />
      </div>

      <div style={{ flex: 1, padding: "64px 20px 120px", maxWidth: 430, margin: "0 auto", width: "100%" }}>
        {/* Step indicator */}
        <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
          Step {step + 1} of {totalSteps}
        </div>

        <div style={slideStyle}>
          <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 6, lineHeight: 1.2 }}>{steps[step].title}</div>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 28 }}>{steps[step].subtitle}</div>

          {/* STEP 0 — Gender */}
          {step === 0 && (() => {
            const opts = [
              { id: "male",   label: "Male",   icon: "♂",  sel: "rgba(59,130,246,0.15)",  border: "#3b82f6" },
              { id: "female", label: "Female", icon: "♀",  sel: "rgba(232,121,249,0.15)", border: "#e879f9" },
              { id: "other",  label: "Prefer not to say", icon: "✦", sel: "rgba(0,255,136,0.12)", border: "#00ff88" },
            ];
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {opts.map(g => (
                  <button key={g.id} onClick={() => setGender(g.id)} style={{
                    background: gender === g.id ? g.sel : "rgba(255,255,255,0.04)",
                    border: `2px solid ${gender === g.id ? g.border : "rgba(255,255,255,0.09)"}`,
                    borderRadius: 18, padding: "20px 22px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 18, textAlign: "left",
                    transition: "all 0.2s",
                  }}>
                    <span style={{
                      fontSize: 32, width: 52, height: 52, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: gender === g.id ? g.sel : "rgba(255,255,255,0.07)",
                      flexShrink: 0,
                    }}>{g.icon}</span>
                    <div style={{ fontSize: 17, fontWeight: 800, color: gender === g.id ? g.border : "#fff" }}>
                      {g.label}
                    </div>
                    {gender === g.id && <div style={{ marginLeft: "auto", color: g.border, fontSize: 20 }}>✓</div>}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* STEP 1 — Goal */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)} style={{
                  background: goal === g.id ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${goal === g.id ? "#00ff88" : "rgba(255,255,255,0.09)"}`,
                  borderRadius: 16, padding: "16px 18px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                  transition: "all 0.18s",
                }}>
                  <span style={{ fontSize: 28 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: goal === g.id ? "#00ff88" : "#fff" }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{g.desc}</div>
                  </div>
                  {goal === g.id && <div style={{ marginLeft: "auto", color: "#00ff88", fontSize: 18 }}>✓</div>}
                </button>
              ))}
            </div>
          )}

          {/* STEP 1 — Equipment */}
          {step === 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {EQUIPMENT_OPTIONS.map(e => {
                const sel = equipment.includes(e.id);
                const bwOnly = equipment.includes("bodyweight") && e.id !== "bodyweight";
                return (
                  <button key={e.id} onClick={() => toggleEquip(e.id)} disabled={bwOnly} style={{
                    background: sel ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${sel ? "#00ff88" : "rgba(255,255,255,0.09)"}`,
                    borderRadius: 14, padding: "16px 12px", cursor: bwOnly ? "default" : "pointer",
                    opacity: bwOnly ? 0.35 : 1, transition: "all 0.18s", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{e.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: sel ? "#00ff88" : "#aaa" }}>{e.label}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2 — Frequency */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FREQUENCY_OPTIONS.map(f => (
                <button key={f.id} onClick={() => setFrequency(f.id)} style={{
                  background: frequency === f.id ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${frequency === f.id ? "#00ff88" : "rgba(255,255,255,0.09)"}`,
                  borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "all 0.18s",
                }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: frequency === f.id ? "#00ff88" : "#fff" }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{f.desc}</div>
                  </div>
                  {frequency === f.id && <div style={{ color: "#00ff88", fontSize: 20 }}>✓</div>}
                </button>
              ))}
            </div>
          )}

          {/* STEP 3 — Name */}
          {step === 4 && (
            <div>
              <input
                type="text"
                placeholder="Your name..."
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                style={{
                  width: "100%", background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.14)", borderRadius: 16,
                  color: "#fff", fontSize: 22, fontWeight: 700,
                  padding: "18px 20px", outline: "none", boxSizing: "border-box",
                  marginBottom: 16,
                }}
              />
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                Your workouts will be tailored to your goal, available equipment, and training frequency. You can always update these in your profile.
              </div>

              {/* Summary */}
              <div style={{ marginTop: 24, background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Your Plan</div>
                {[
                  { label: "Gender", value: gender === "female" ? "Female 🌸" : gender === "male" ? "Male" : "Not specified" },
                  { label: "Goal", value: GOALS.find(g => g.id === goal)?.label },
                  { label: "Frequency", value: FREQUENCY_OPTIONS.find(f => f.id === frequency)?.label },
                  { label: "Equipment", value: equipment.map(e => EQUIPMENT_OPTIONS.find(o => o.id === e)?.label).filter(Boolean).join(", ") },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#666" }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#ccc", maxWidth: "60%", textAlign: "right" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "16px 20px 36px", background: "linear-gradient(transparent, #0a0a0f 40%)" }}>
        {/* Skip setup */}
        <button onClick={() => onComplete({
          gender: "other", goal: "general_fitness",
          equipment: ["bodyweight"], frequency: 3,
          name: "Athlete", skipped: true,
        })} style={{
          width: "100%", padding: "10px", marginBottom: 10,
          background: "transparent", border: "none",
          color: "#444", fontSize: 13, cursor: "pointer",
          textDecoration: "underline", textDecorationColor: "#333",
        }}>
          Skip setup — use defaults
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button onClick={() => goTo(step - 1)} style={{
              flex: 0, padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "#666", fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>←</button>
          )}
          <button
            onClick={() => step < totalSteps - 1 ? goTo(step + 1) : finish()}
            disabled={!canAdvance[step]}
            style={{
              flex: 1, padding: "16px", borderRadius: 16, border: "none",
              background: canAdvance[step] ? "#00ff88" : "rgba(255,255,255,0.07)",
              color: canAdvance[step] ? "#000" : "#444",
              fontSize: 16, fontWeight: 800, cursor: canAdvance[step] ? "pointer" : "default",
              transition: "all 0.2s",
            }}
          >
            {step < totalSteps - 1 ? "Continue →" : "Build My Plan 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
const AuthScreen = ({ onAuth }) => {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setError(""); setMessage(""); setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: e } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name || "Athlete" } }
        });
        if (e) throw e;
        if (data.user && !data.session) {
          setMessage("Check your email to confirm your account, then log in.");
        } else if (data.session) {
          onAuth(data.session.user);
        }
      } else {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onAuth(data.user);
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14, color: "#fff", fontSize: 16, width: "100%",
    padding: "15px 16px", outline: "none", boxSizing: "border-box",
    marginBottom: 12,
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 24px",
    }}>
      {/* Glow */}
      <div style={{
        position: "fixed", top: -80, left: "50%", transform: "translateX(-50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, #00ff8820 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 380, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: "#141420",
            border: "1px solid rgba(0,255,136,0.3)", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            boxShadow: "0 0 32px rgba(0,255,136,0.15)",
          }}>
            <span style={{ fontSize: 32 }}>⚡</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>FitForge</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
            {mode === "login" ? "Welcome back. Let's lift." : "Start your strength journey."}
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.05)",
          borderRadius: 12, padding: 4, marginBottom: 24,
        }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }} style={{
              flex: 1, padding: "10px", borderRadius: 9, border: "none",
              background: mode === m ? "#00ff88" : "transparent",
              color: mode === m ? "#000" : "#666",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              transition: "all 0.2s", textTransform: "capitalize",
            }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        {mode === "signup" && (
          <input
            type="text" placeholder="Your name" value={name}
            onChange={e => setName(e.target.value)} style={inputStyle}
          />
        )}
        <input
          type="email" placeholder="Email address" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ ...inputStyle, marginBottom: 20 }}
        />

        {error && (
          <div style={{ color: "#ff6b35", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{error}</div>
        )}
        {message && (
          <div style={{ color: "#00ff88", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{message}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          style={{
            width: "100%", padding: "17px", borderRadius: 16,
            background: loading || !email || !password
              ? "#222" : "linear-gradient(135deg, #00ff88, #00cc66)",
            color: loading || !email || !password ? "#555" : "#000",
            fontSize: 17, fontWeight: 800, border: "none",
            cursor: loading || !email || !password ? "default" : "pointer",
            boxShadow: loading ? "none" : "0 4px 24px rgba(0,255,136,0.3)",
            transition: "all 0.2s",
          }}
        >
          {loading ? "..." : mode === "login" ? "Log In" : "Create Account"}
        </button>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [isWorkingOut, setIsWorkingOut] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [savedWorkoutState, setSavedWorkoutState] = useState(null); // persists workout across nav
  const [selectedDayKey, setSelectedDayKey] = useState(null); // user-chosen workout override
  const [showOnboarding, setShowOnboarding] = useState(false); // show onboarding for new/pref-less users

  // ── Guest-mode local state (always available) ─────────────────────────────
  const [guestProfile, setGuestProfile] = useState(() => getStore("user", {
    name: "Athlete",
    current_weight: null,
    start_date: new Date().toISOString(),
  }));
  const [guestWeightLogs, setGuestWeightLogs] = useState(() => getStore("weightLogs", []));
  const [guestExerciseLogs, setGuestExerciseLogs] = useState(() => getStore("exerciseLogs", []));
  const [guestWorkoutCount, setGuestWorkoutCount] = useState(() => getStore("workoutCount", 0));

  // ── Cloud state (only when logged in) ────────────────────────────────────
  const [cloudProfile, setCloudProfile] = useState(null);
  const [cloudWeightLogs, setCloudWeightLogs] = useState([]);
  const [cloudExerciseLogs, setCloudExerciseLogs] = useState([]);
  const [cloudWorkoutCount, setCloudWorkoutCount] = useState(0);

  // Persist guest data to localStorage
  useEffect(() => { setStore("user", guestProfile); }, [guestProfile]);
  useEffect(() => { setStore("weightLogs", guestWeightLogs); }, [guestWeightLogs]);
  useEffect(() => { setStore("exerciseLogs", guestExerciseLogs); }, [guestExerciseLogs]);
  useEffect(() => { setStore("workoutCount", guestWorkoutCount); }, [guestWorkoutCount]);

  // ── Auth listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setAuthUser(session?.user ?? null);
      } else if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setCloudProfile(null);
        setCloudWeightLogs([]);
        setCloudExerciseLogs([]);
        setCloudWorkoutCount(0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load cloud data when user logs in ────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    loadCloudData();
  }, [authUser]);

  const loadCloudData = async () => {
    setCloudLoading(true);
    try {
      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", authUser.id).maybeSingle();

      if (prof) {
        setCloudProfile(prof);
        setCloudWorkoutCount(prof.workout_count || 0);
      } else {
        const newProf = {
          id: authUser.id,
          name: authUser.user_metadata?.display_name || "Athlete",
          current_weight: null,
          start_date: new Date().toISOString(),
          workout_count: 0,
        };
        await supabase.from("profiles").insert(newProf);
        setCloudProfile(newProf);
      }

      const { data: wLogs } = await supabase.from("weight_logs")
        .select("*").eq("user_id", authUser.id).order("date", { ascending: true });
      setCloudWeightLogs(wLogs || []);

      const { data: eLogs } = await supabase.from("exercise_logs")
        .select("*").eq("user_id", authUser.id).order("date", { ascending: true });
      setCloudExerciseLogs(eLogs || []);

    } catch (e) {
      console.error("Cloud load error:", e);
    } finally {
      setCloudLoading(false);
    }
  };

  // ── Active data: cloud if logged in, guest otherwise ─────────────────────
  const isLoggedIn = !!authUser && !cloudLoading;
  const profile = isLoggedIn ? cloudProfile : guestProfile;
  const weightLogs = isLoggedIn ? cloudWeightLogs : guestWeightLogs;
  const exerciseLogs = isLoggedIn ? cloudExerciseLogs : guestExerciseLogs;
  const workoutCount = isLoggedIn ? cloudWorkoutCount : guestWorkoutCount;

  // ── Handlers: write to cloud or guest depending on auth state ────────────
  // ── #3 Save single exercise immediately when user moves past it ──────────
  const handleLogExercise = async (log) => {
    if (authUser) {
      const { data, error } = await supabase.from("exercise_logs")
        .insert({ ...log, user_id: authUser.id }).select().single();
      if (error) console.error("Exercise log error:", error);
      if (data) setCloudExerciseLogs(prev => [...prev, data]);
    } else {
      setGuestExerciseLogs(prev => [...prev, { ...log, id: Date.now() + Math.random() }]);
    }
  };

  const handleLogWeight = async (val) => {
    const log = { date: new Date().toISOString(), weight_value: val };
    if (authUser) {
      const { data } = await supabase.from("weight_logs")
        .insert({ ...log, user_id: authUser.id }).select().single();
      if (data) setCloudWeightLogs(prev => [...prev, data]);
      await supabase.from("profiles").update({ current_weight: val }).eq("id", authUser.id);
      setCloudProfile(p => ({ ...p, current_weight: val }));
    } else {
      const newLog = { ...log, id: Date.now() };
      setGuestWeightLogs(prev => [...prev, newLog]);
      setGuestProfile(p => ({ ...p, current_weight: val }));
    }
  };

  const handleWorkoutSave = async () => {
    // Called as soon as workout finishes — saves data but does NOT navigate
    if (authUser) {
      const newCount = cloudWorkoutCount + 1;
      setCloudWorkoutCount(newCount);
      await supabase.from("profiles").update({ workout_count: newCount }).eq("id", authUser.id);
    } else {
      setGuestWorkoutCount(prev => prev + 1);
    }
    setSavedWorkoutState(null);
  };

  const handleWorkoutFinish = async () => {
    // Called when user dismisses the celebration screen — navigate home
    setIsWorkingOut(false);
    setTab("home");
  };

  const handleSaveName = async (name) => {
    if (authUser) {
      await supabase.from("profiles").update({ name }).eq("id", authUser.id);
      setCloudProfile(p => ({ ...p, name }));
    } else {
      setGuestProfile(p => ({ ...p, name }));
    }
  };

  const handleReset = async () => {
    if (authUser) {
      await supabase.from("exercise_logs").delete().eq("user_id", authUser.id);
      await supabase.from("weight_logs").delete().eq("user_id", authUser.id);
      await supabase.from("profiles").update({
        workout_count: 0, current_weight: null, start_date: new Date().toISOString(),
      }).eq("id", authUser.id);
      await loadCloudData();
    } else {
      setGuestExerciseLogs([]);
      setGuestWeightLogs([]);
      setGuestWorkoutCount(0);
      setGuestProfile({ name: "Athlete", current_weight: null, start_date: new Date().toISOString() });
    }
  };

  const handleSetPhase = async (newPhaseIdx) => {
    if (authUser) {
      await supabase.from("profiles").update({ phase_override: newPhaseIdx }).eq("id", authUser.id);
      setCloudProfile(p => ({ ...p, phase_override: newPhaseIdx }));
    } else {
      setGuestProfile(p => ({ ...p, phase_override: newPhaseIdx }));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleAuth = (u) => {
    setAuthUser(u);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const gender = profile?.gender || "other";
  const genderPalette = gender === "female" ? PHASES_FEMALE
    : gender === "male" ? PHASES_MALE
    : PHASES_DEFAULT; // "other" uses green (default)
  const phaseOverride = profile?.phase_override ?? null;
  const { phase, dayKey, phaseDay, workoutsInPhase, phaseIndex } = getPhaseAndDay(workoutCount, exerciseLogs, phaseOverride, genderPalette);
  const accentColor = phase.color;
  const user = profile || { name: "Athlete", current_weight: null, start_date: new Date().toISOString() };

  // ── Generate workout plan from user prefs ─────────────────────────────────
  const userPrefs = {
    goal: profile?.goal || "build_muscle",
    equipment: profile?.equipment || ["barbell","dumbbells","cables","machines","pullup_bar","bench"],
    frequency: profile?.frequency || 3,
    phase: phase.id,
  };
  const workoutPlan = generateWorkoutPlan(userPrefs);
  const planDays = workoutPlan.days;
  const activeDayKey = selectedDayKey || (planDays[workoutCount % planDays.length]?.key) || "A";
  const needsOnboarding = !profile?.goal;

  // Brief loading spinner only while checking auth session on first load
  if (authLoading) {
    return (
      <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 32 }}>⚡</div>
      </div>
    );
  }

  // Show onboarding if user has no preferences set yet
  if (needsOnboarding || showOnboarding) {
    return (
      <OnboardingScreen
        accentColor="#00ff88"
        onComplete={async (prefs) => {
          const update = {
            name: prefs.name,
            goal: prefs.goal,
            equipment: prefs.equipment,
            frequency: prefs.frequency,
            gender: prefs.gender,
          };
          if (authUser) {
            await supabase.from("profiles").update(update).eq("id", authUser.id);
            setCloudProfile(p => ({ ...(p || {}), ...update }));
          } else {
            setGuestProfile(p => ({ ...(p || {}), ...update }));
          }
          setShowOnboarding(false);
          setSavedWorkoutState(null);
        }}
      />
    );
  }

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
          dayKey={activeDayKey}
          workoutDay={planDays.find(d => d.key === activeDayKey) || planDays[0]}
          exerciseLogs={exerciseLogs}
          onSave={handleWorkoutSave}
          onFinish={handleWorkoutFinish}
          onLogExercise={handleLogExercise}
          accentColor={accentColor}
          savedState={savedWorkoutState}
          onSaveState={setSavedWorkoutState}
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
            workoutCount={workoutCount}
            workoutsInPhase={workoutsInPhase}
            onStartWorkout={(chosenDay) => { setSelectedDayKey(chosenDay || activeDayKey); setSavedWorkoutState(null); setIsWorkingOut(true); setTab("workout"); }}
            onSetPhase={handleSetPhase}
            phaseIndex={phaseIndex}
            accentColor={accentColor}
            planDays={planDays}
            onEditPrefs={() => setShowOnboarding(true)}
            phases={genderPalette}
          />
        );
      case "weight":
        return <WeightScreen weightLogs={weightLogs} onLog={handleLogWeight} accentColor={accentColor} />;
      case "history":
        return <HistoryScreen exerciseLogs={exerciseLogs} accentColor={accentColor} />;
      case "profile":
        return (
          <ProfileScreen
            user={user}
            phase={phase}
            authUser={authUser}
            cloudLoading={cloudLoading}
            onReset={handleReset}
            onSaveName={handleSaveName}
            onSignOut={handleSignOut}
            onAuth={handleAuth}
            accentColor={accentColor}
            phases={genderPalette}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={S.app}>
      <div style={{
        position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
        pointerEvents: "none", transition: "background 1s ease", zIndex: 0,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{renderScreen()}</div>
      <nav style={S.navbar}>
        {navItems.map((item) => {
          const active = isWorkingOut ? item.id === "workout" : tab === item.id;
          return (
            <button key={item.id} style={S.navBtn(active, accentColor)}
              onClick={() => { setIsWorkingOut(false); setTab(item.id); }}>
              <Icon name={item.icon} size={22} color={active ? accentColor : "#444"} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
