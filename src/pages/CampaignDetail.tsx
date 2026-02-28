import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchCampaignById, recordDonation } from '@/lib/api';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { FUNDCHAIN_ABI, CONTRACT_ADDRESS } from '@/contracts/FundChain';
import { CATEGORY_LABELS } from '@/types/campaign';
import { getProgress, getTimeRemaining, formatEth, formatAddress } from '@/lib/web3Utils';
import MilestoneTracker from '@/components/MilestoneTracker';
import DonateModal from '@/components/DonateModal';
import { Button } from '@/components/ui/button';
import { BadgeCheck, Clock, Users, ExternalLink, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSocket } from '@/context/SocketContext';

export default function CampaignDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [localCampaign, setLocalCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { signer, address, refreshBalance, deductSmilePoints, convertToInr } = useWallet();
  const { toast } = useToast();
  const [showDonate, setShowDonate] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { socket } = useSocket();

  const mapCampaign = (data: any) => ({
    ...data,
    target: data.targetAmount,
    owner: data.ngo?.wallet || data.ngoId,
    donors: (data.donations || []).map((d: any) => ({
      donor: d.wallet || d.user?.wallet || 'Unknown',
      amount: d.amount,
      timestamp: new Date(d.timestamp).getTime(),
      txHash: d.txHash
    })),
    category: data.category || 'charity'
  });

  useEffect(() => {
    if (!socket || !id) return;
    socket.on('CAMPAIGN_UPDATED', (updated: any) => {
      if (updated.id === id || updated.blockchainId === localCampaign?.blockchainId) {
        setLocalCampaign(mapCampaign(updated));
      }
    });
    return () => { socket.off('CAMPAIGN_UPDATED'); };
  }, [socket, id, localCampaign?.blockchainId]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await fetchCampaignById(id);
        setLocalCampaign(mapCampaign(data));
      } catch (err) {
        console.error('Failed to load campaign', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!localCampaign) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">
        Campaign not found
      </div>
    );
  }

  const campaign = localCampaign;
  const progress = getProgress(campaign.amountCollected, campaign.target);
  const time = getTimeRemaining(campaign.deadline);

  const imgSrc = campaign.ipfsImageHash
    ? `https://ipfs.io/ipfs/${campaign.ipfsImageHash}`
    : `https://picsum.photos/seed/${id || campaign.blockchainId || 'default'}/1200/600`;

  return (
    <div className="min-h-screen pt-24 pb-16 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm md:text-base font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> {t('explore.title') || 'Back to campaigns'}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header image */}
            <div className="relative aspect-[21/9] rounded-2xl bg-secondary overflow-hidden glassmorphism shadow-md border border-border/50 group">
              {!imgError ? (
                <img
                  src={imgSrc}
                  alt={campaign.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-16 h-16 opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
              <div className="absolute bottom-5 left-5 flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-secondary/80 backdrop-blur-md border border-border/50 text-foreground text-xs font-bold uppercase tracking-wider shadow-sm">
                  {CATEGORY_LABELS[campaign.category as keyof typeof CATEGORY_LABELS]}
                </span>
                {campaign.verified && (
                  <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider shadow-sm">
                    <BadgeCheck className="w-4 h-4" /> {t('card.verified') || 'Verified'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight">{campaign.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
            </div>

            {/* Milestones */}
            <div className="rounded-3xl bg-card border border-border/50 p-6 md:p-8 glassmorphism shadow-sm">
              <MilestoneTracker milestones={campaign.milestones} campaignId={campaign.blockchainId} isOwner={address?.toLowerCase() === campaign.owner.toLowerCase()} />
            </div>

            {/* Donation History */}
            <div className="rounded-3xl bg-card border border-border/50 p-6 md:p-8 glassmorphism shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Donation History
              </h3>
              <div className="space-y-4">
                {campaign.donors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-secondary/30 rounded-xl border border-border/50">
                    No donations yet. Be the first!
                  </div>
                ) : (
                  campaign.donors.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {d.donor.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-foreground font-mono">{formatAddress(d.donor)}</span>
                          <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                            {new Date(d.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-primary font-mono">{d.amount} ETH</span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${d.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mt-1 transition-colors justify-end"
                        >
                          View tx <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-card border border-border/50 p-6 md:p-8 sticky top-24 glassmorphism shadow-lg shadow-primary/5">
              {/* Progress */}
              <div className="mb-6">
                <div className="text-3xl font-black text-foreground font-mono tracking-tighter">
                  {formatEth(campaign.amountCollected)} <span className="text-lg font-medium text-muted-foreground tracking-normal uppercase">ETH {t('card.raised')}</span>
                </div>
                <div className="text-sm font-bold text-muted-foreground font-mono mt-1">{convertToInr(campaign.amountCollected)}</div>
              </div>
              <div className="flex justify-between text-sm font-semibold text-muted-foreground mb-4 font-mono">
                <span>{((campaign.amountCollected / campaign.target) * 100).toFixed(1)}%</span>
                <span>{t('card.of')} {formatEth(campaign.target)} ETH ({convertToInr(campaign.target)}) {t('card.goal')}</span>
              </div>

              <div className="h-4 bg-secondary/50 rounded-full overflow-hidden mb-3 shadow-inner border border-border/50">
                <div
                  className="h-full bg-gradient-to-r from-primary via-primary to-accent rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                </div>
              </div>
              <div className="text-sm font-bold text-primary mb-8">{progress.toFixed(1)}% funded</div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 rounded-2xl bg-secondary/50 border border-border/50">
                  <Users className="w-5 h-5 mx-auto text-primary mb-2" />
                  <div className="text-xl font-black text-foreground">{campaign.donors.length}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('card.donors')}</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-secondary/50 border border-border/50">
                  <Clock className="w-5 h-5 mx-auto text-accent mb-2" />
                  {time.expired ? (
                    <>
                      <div className="text-xl font-black text-destructive">Ended</div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expired</div>
                    </>
                  ) : (
                    <>
                      <div className="text-xl font-black text-foreground">{time.days}d {time.hours}h</div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Remaining</div>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setShowDonate(true)}
                disabled={time.expired}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {time.expired ? 'Campaign Ended' : 'Donate Now'}
              </Button>

              <div className="mt-8 space-y-3 text-xs font-semibold text-muted-foreground font-mono bg-secondary/30 p-4 rounded-xl border border-border/50">
                <div className="flex justify-between items-center">
                  <span>Contract</span>
                  <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    {formatAddress(CONTRACT_ADDRESS)} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span>Owner</span>
                  <a href={`https://sepolia.etherscan.io/address/${campaign.owner}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    {formatAddress(campaign.owner)} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span>Network</span>
                  <span className="text-foreground bg-background px-2 py-0.5 rounded-md border border-border">Sepolia / Local</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDonate && (
        <DonateModal
          campaignTitle={campaign.title}
          onClose={() => setShowDonate(false)}
          onDonate={async (amount, mode) => {
            if (!address) {
              toast({ title: 'Wallet not connected', description: 'Please connect your wallet to donate.', variant: 'destructive' });
              return;
            }

            const num = parseFloat(amount || '0') || 0;
            if (num <= 0) return;

            try {
              let txHash = '';

              if (mode === 'wallet') {
                if (!signer) {
                  toast({ title: 'Wallet error', description: 'No signer found. Try reconnecting your wallet.', variant: 'destructive' });
                  return;
                }

                const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);
                const bIdString = campaign.blockchainId;
                if (bIdString === undefined || bIdString === null) {
                  toast({ title: 'Link error', description: 'This campaign is not linked to blockchain.', variant: 'destructive' });
                  return;
                }

                // Ensure bId is BigInt for ethers v6
                const bId = BigInt(bIdString);

                toast({ title: 'MetaMask Request', description: `Please confirm the ${amount} ETH donation in your wallet.` });
                const tx = await contract.donate(bId, {
                  value: ethers.parseEther(num.toString()),
                  gasLimit: 500000
                });

                toast({ title: 'Transaction Sent', description: 'Waiting for blockchain confirmation...' });
                await tx.wait();
                txHash = tx.hash;
              } else {
                // Smile Donation Flow
                const pointsNeeded = Math.round(num * 1250000); // 1 ETH = 1,250,000 points

                toast({ title: 'Processing Smile Donation', description: `Converting ${pointsNeeded.toLocaleString()} Smile Coins to ${amount} ETH` });

                // Generate a virtual txHash
                txHash = `smile_${Date.now()}_${address.toLowerCase()}`;
              }

              const { campaign: updatedData } = await recordDonation({
                campaignId: campaign.id,
                wallet: address,
                amount: num,
                txHash: txHash
              });

              if (mode === 'smile') {
                // Deduct points after successful DB update
                const pointsNeeded = Math.round(num * 1000000);
                deductSmilePoints(pointsNeeded);
              }

              if (updatedData) {
                setLocalCampaign(mapCampaign(updatedData));
              }

              toast({ title: mode === 'smile' ? '🌟 Smile Contribution Successful!' : '🚀 Donation Successful!', description: `Thank you for donating ${amount} ETH!` });
              try { await refreshBalance?.(); } catch { }
              setShowDonate(false);
            } catch (e: any) {
              console.error('donation failed', e);
              let msg = e?.message || String(e);
              if (e.code === 'ACTION_REJECTED') msg = 'Transaction was rejected.';
              toast({ title: 'Donation failed', description: msg, variant: 'destructive' });
            }
          }}
        />
      )}
    </div>
  );
}
