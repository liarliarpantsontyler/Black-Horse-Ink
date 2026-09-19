export type LeadSize = "tiny" | "small" | "medium" | "large" | "not_sure";

export const SIZE_OPTIONS: {
  id: LeadSize;
  label: string;
  hint: string;
}[] = [
  { id: "tiny", label: "Tiny", hint: "Under 2\"" },
  { id: "small", label: "Small", hint: "2–3\"" },
  { id: "medium", label: "Medium", hint: "4–6\"" },
  { id: "large", label: "Large", hint: "6\"+" },
  { id: "not_sure", label: "Not sure", hint: "We'll help" },
];

export const PLACEMENT_OPTIONS = [
  "Arm",
  "Forearm",
  "Wrist",
  "Hand",
  "Chest",
  "Back",
  "Ribs",
  "Leg",
  "Thigh",
  "Calf",
  "Ankle",
  "Other",
  "Not sure",
] as const;

export const TIMING_OPTIONS = [
  { id: "asap", label: "ASAP" },
  { id: "couple_weeks", label: "Next couple weeks" },
  { id: "next_month", label: "Next month" },
  { id: "exploring", label: "Just exploring" },
] as const;
