import { Link } from 'react-router-dom';
import { Campaign } from '@/types/campaign';
import { ShieldCheck, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { formatEth } from '@/lib/web3Utils';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const { t } = useTranslation();
  const { convertToInr } = useWallet();
  const [imgError, setImgError] = useState(false);
  const { id, title, description, target, amountCollected, verified, owner, donors, blockchainId } = campaign;
  const progress = Math.min(100, Math.round((Number(amountCollected || 0) / Number(target || 1)) * 100));

  // Determine image source:
  // 1. IPFS Hash
  // 2. Picsum seeded fallback
  const imgSrc = campaign.ipfsImageHash
    ? `https://ipfs.io/ipfs/${campaign.ipfsImageHash}`
    : `https://picsum.photos/seed/${id || blockchainId || 'default'}/600/400`;

  return (
    <Link
      to={`/campaign/${id}`}
      className="group flex flex-col bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden glassmorphism"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-secondary">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-10 h-10 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />

        {verified && (
          <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" /> {t('card.verified')}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed flex-1">
          {description}
        </p>

        <div className="space-y-4 mt-auto">
          {/* Progress Section */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <div className="text-2xl font-black font-mono tracking-tighter text-foreground drop-shadow-sm">
                {formatEth(String(amountCollected || 0))} <span className="text-sm font-medium text-muted-foreground tracking-normal">ETH {t('card.raised')}</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono font-bold mt-0.5">{convertToInr(amountCollected || 0)}</div>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden shadow-inner w-full border border-border/20">
              <div
                className="h-full bg-primary/80 transition-all duration-700 rounded-full bg-gradient-to-r from-primary to-primary/80 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/20 to-transparent flex items-center pr-1 truncate">
                  <span className="text-[10px] items-center text-white/50 block font-bold w-full text-right">{progress}%</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
              <span>{t('card.of')} {formatEth(String(target))} ETH ({convertToInr(target)}) {t('card.goal')}</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                {donors?.length || 0} {t('card.donors')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {owner?.slice(2, 4).toUpperCase()}
              </div>
              <span className="font-mono text-muted-foreground">{owner?.slice(0, 6)}...{owner?.slice(-4)}</span>
            </div>
            <span className="font-semibold text-primary text-sm flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
              {t('card.view')} <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
