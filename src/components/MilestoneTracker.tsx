import { Milestone } from '@/types/campaign';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

export default function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground mb-4">Milestone Progress</h3>
      {milestones.map((ms, i) => (
        <div key={ms.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            {ms.approved ? (
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
            ) : ms.approvalCount > 0 ? (
              <Circle className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            {i < milestones.length - 1 && (
              <div className={`w-px h-8 mt-1 ${ms.approved ? 'bg-accent/50' : 'bg-border'}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${ms.approved ? 'text-accent' : 'text-foreground'}`}>
                {ms.title}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{ms.amount} ETH</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {ms.approved
                ? 'Approved ✓'
                : `${ms.approvalCount}/${ms.requiredApprovals} approvals`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
