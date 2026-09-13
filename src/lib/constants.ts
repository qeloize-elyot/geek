export const WORK_STATUSES = [
  { value: "WANT_TO_WATCH", label: "Quero ver" },
  { value: "WATCHING", label: "Consumindo" },
  { value: "COMPLETED", label: "Concluido" },
  { value: "ON_HOLD", label: "Pausado" },
  { value: "DROPPED", label: "Abandonei" },
] as const;

export type WorkStatusValue = (typeof WORK_STATUSES)[number]["value"];

export const CATEGORIES = [
  "Filme",
  "Serie",
  "Livro",
  "Anime",
  "Jogo",
  "Documentario",
  "Outro",
] as const;

export function statusLabel(value: string) {
  return WORK_STATUSES.find((s) => s.value === value)?.label ?? value;
}
