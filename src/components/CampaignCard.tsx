import { Link } from 'react-router-dom';
import { Campaign, CATEGORY_LABELS } from '@/types/campaign';
import { getProgress, getTimeRemaining, formatEth, formatAddress } from '@/lib/web3Utils';
import { Clock, Users, BadgeCheck, TrendingUp } from 'lucide-react';

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = getProgress(campaign.amountCollected, campaign.target);
  const time = getTimeRemaining(campaign.deadline);

  return (
    <Link
      to={`/campaign/${campaign.id}`}
      className="group block rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden hover:glow-primary"
    >
      {/* Image placeholder */}
      <div className="h-44 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center animate-float">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </div>
        {campaign.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
            <BadgeCheck className="w-3 h-3" />
            Verified
          </div>
        )}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
          {CATEGORY_LABELS[campaign.category]}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {campaign.description}
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-primary font-mono font-medium">{formatEth(campaign.amountCollected)} ETH</span>
            <span className="text-muted-foreground font-mono">{formatEth(campaign.target)} ETH</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-xs text-muted-foreground mt-1">{progress.toFixed(0)}%</div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {campaign.donors.length} donors
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time.expired ? (
              <span className="text-destructive">Expired</span>
            ) : (
              <span>{time.days}d {time.hours}h left</span>
            )}
          </div>
        </div>

        {/* Owner */}
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground font-mono">
          by {formatAddress(campaign.owner)}
        </div>
      </div>
    </Link>
  );
}
