import { TrendingUp, Users, Target, Award } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export default function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl bg-card border border-border p-4 text-center">
          <div className="flex justify-center mb-2 text-primary">{s.icon}</div>
          <div className="text-2xl font-bold text-foreground font-mono">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export function defaultStats() {
  return [
    { label: 'Campaigns', value: '142', icon: <Target className="w-5 h-5" /> },
    { label: 'ETH Raised', value: '2,847', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Donors', value: '3,891', icon: <Users className="w-5 h-5" /> },
    { label: 'Success Rate', value: '78%', icon: <Award className="w-5 h-5" /> },
  ];
}
