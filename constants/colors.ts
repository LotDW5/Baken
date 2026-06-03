export const THEME_COLORS = [
  { id: "purple", name: "Paars", color: "#6B5CE7", bgColor: "#F0EDF7" },
  { id: "blue", name: "Blauw", color: "#3B82F6", bgColor: "#DBEAFE" },
  { id: "green", name: "Groen", color: "#10B981", bgColor: "#D1FAE5" },
  { id: "teal", name: "Turquoise", color: "#14B8A6", bgColor: "#CCFBF1" },
  { id: "orange", name: "Oranje", color: "#F59E0B", bgColor: "#FEF3C7" },
  { id: "pink", name: "Roze", color: "#EC4899", bgColor: "#FCE7F3" },
];

export function getTheme(savedTheme?: string) {
  const theme = savedTheme || "purple";
  return THEME_COLORS.find(t => t.id === theme) || THEME_COLORS[0];
}

export const MOOD_OPTIONS = [
  { id: "good", label: "Goed", color: "#4CAF93", bgColor: "#E8F5F1" },
  { id: "okay", label: "Minder goed", color: "#FFB84D", bgColor: "#FFF4E5" },
  { id: "bad", label: "Niet goed", color: "#9B8CE8", bgColor: "#F0EDF7" },
  { id: "crisis", label: "In crisis", color: "#E85D75", bgColor: "#FFE8ED" },
];

export const COLORS = {
  background: "#F7F5FB",
  foreground: "#2D2D3A",
  card: "#ffffff",
  cardForeground: "#2D2D3A",
  secondary: "#E8E4F8",
  secondaryForeground: "#2D2D3A",
  muted: "#F0EDF7",
  mutedForeground: "#7C7C8A",
  border: "rgba(107, 92, 231, 0.12)",
  inputBackground: "#F9F8FC",
  destructive: "#E85D75",
  white: "#ffffff",
};
