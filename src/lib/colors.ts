const BADGE_COLORS = [
  "border-primary/40 text-primary bg-primary/10",
  "border-secondary/40 text-secondary bg-secondary/10",
  "border-chart-1/40 text-chart-1 bg-chart-1/10",
  "border-chart-2/40 text-chart-2 bg-chart-2/10",
  "border-chart-3/40 text-chart-3 bg-chart-3/10",
  "border-chart-4/40 text-chart-4 bg-chart-4/10",
  "border-chart-5/40 text-chart-5 bg-chart-5/10",
  "border-info/40 text-info bg-info/10",
  "border-primary/40 text-primary bg-primary/10", // substituto para purple-500
  "border-[hsl(var(--success)/0.4)] text-[hsl(var(--success-text))] bg-[hsl(var(--success-subtle))]", // substituto para emerald-500
];

const HSL_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--info))",
  "hsl(var(--primary))", // substituto para purple-500
  "hsl(var(--success))", // substituto para emerald-500
];

const forcedIndex: Record<string, number> = {
  soja: 0,
  milho: 1,
};

function getCultureColorIndex(name: string) {
  if (!name) return 0;
  const lower = name.toLowerCase().trim();
  if (forcedIndex[lower] !== undefined) return forcedIndex[lower];
  
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = lower.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Start from index 2 to reserve 0 and 1 for Soja and Milho
  const availableIndices = BADGE_COLORS.length - 2;
  return 2 + (Math.abs(hash) % availableIndices);
}

export function getCultureBadgeStyle(name: string) {
  return BADGE_COLORS[getCultureColorIndex(name)];
}

export function getCultureChartColor(name: string) {
  return HSL_COLORS[getCultureColorIndex(name)];
}

export const getServiceBadgeStyle = getCultureBadgeStyle;
