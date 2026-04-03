/**
 * Temas do invólucro oval (Device), não do sprite pixel do pet.
 * `color_theme` na BD guarda a chave ou null (padrão creme tipo plástico vintage).
 */

export interface ShellTheme {
  border: string;
  from: string;
  via: string;
  to: string;
  /** "r, g, b" para rgba na sombra */
  shadow: string;
}

export const THEMES = {
  /** Plástico creme/areia (brinquedo real); chave histórica `rosa` na BD continua válida. */
  rosa: {
    label: "Creme",
    shell: {
      border: "#c9b8a4",
      from: "#fffdf8",
      via: "#f5efe6",
      to: "#e0d4c4",
      shadow: "110, 95, 80",
    },
  },
  azul: {
    label: "Azul",
    shell: {
      border: "#93c5fd",
      from: "#eff6ff",
      via: "#dbeafe",
      to: "#7dd3fc",
      shadow: "59, 130, 246",
    },
  },
  verde: {
    label: "Verde",
    shell: {
      border: "#86efac",
      from: "#f0fdf4",
      via: "#dcfce7",
      to: "#4ade80",
      shadow: "34, 197, 94",
    },
  },
  amarelo: {
    label: "Amarelo",
    shell: {
      border: "#fde047",
      from: "#fffbeb",
      via: "#fef3c7",
      to: "#fcd34d",
      shadow: "234, 179, 8",
    },
  },
  roxo: {
    label: "Roxo",
    shell: {
      border: "#d8b4fe",
      from: "#faf5ff",
      via: "#f3e8ff",
      to: "#c084fc",
      shadow: "168, 85, 247",
    },
  },
  laranja: {
    label: "Laranja",
    shell: {
      border: "#fdba74",
      from: "#fff7ed",
      via: "#ffedd5",
      to: "#fb923c",
      shadow: "249, 115, 22",
    },
  },
  menta: {
    label: "Menta",
    shell: {
      border: "#5eead4",
      from: "#f0fdfa",
      via: "#ccfbf1",
      to: "#2dd4bf",
      shadow: "20, 184, 166",
    },
  },
} as const satisfies Record<string, { label: string; shell: ShellTheme }>;

export type ColorThemeId = keyof typeof THEMES;

export function isValidColorThemeId(v: string): v is ColorThemeId {
  return v in THEMES;
}

export function shellThemeOrNull(
  themeId: string | null | undefined,
): ShellTheme | null {
  if (themeId == null || themeId === "") return null;
  return isValidColorThemeId(themeId) ? THEMES[themeId].shell : null;
}
