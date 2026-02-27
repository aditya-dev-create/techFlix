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
import { BadgeCheck, Clock, Users, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CampaignDetail() {
  const { id } = useParams();
  const [localCampaign, setLocalCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { signer, provider, address, refreshBalance, isConnected, connect } = useWallet();
  const { toast } = useToast();
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await fetchCampaignById(id);
        // Map backend data to UI structure
        const mapped = {
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
        };
        setLocalCampaign(mapped);
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

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to campaigns
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header image */}
            <div className="h-56 rounded-xl bg-secondary grid-pattern relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                  {CATEGORY_LABELS[campaign.category]}
                </span>
                {campaign.verified && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{campaign.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{campaign.description}</p>
            </div>

            {/* Milestones */}
            <div className="rounded-xl bg-card border border-border p-6">
              <MilestoneTracker milestones={campaign.milestones} />
            </div>

            {/* Donation History */}
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Donation History</h3>
              <div className="space-y-3">
                {campaign.donors.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <span className="text-sm font-mono text-foreground">{formatAddress(d.donor)}</span>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(d.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-primary font-medium">{d.amount} ETH</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${d.txHash}`}
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-0.5"
                      >
                        View tx <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl bg-card border border-border p-6 sticky top-24">
              {/* Progress */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-foreground font-mono">
                  {formatEth(campaign.amountCollected)} <span className="text-lg text-muted-foreground">ETH</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  raised of {formatEth(campaign.target)} ETH goal
                </div>
              </div>

              <div className="h-3 bg-secondary rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-primary font-medium mb-6">{progress.toFixed(1)}% funded</div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <div className="text-lg font-bold text-foreground">{campaign.donors.length}</div>
                  <div className="text-xs text-muted-foreground">Donors</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  {time.expired ? (
                    <>
                      <div className="text-lg font-bold text-destructive">Ended</div>
                      <div className="text-xs text-muted-foreground">Expired</div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-foreground">{time.days}d {time.hours}h</div>
                      <div className="text-xs text-muted-foreground">Remaining</div>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setShowDonate(true)}
                disabled={time.expired}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12 text-base"
              >
                {time.expired ? 'Campaign Ended' : 'Donate Now'}
              </Button>

              <div className="mt-4 text-xs text-muted-foreground font-mono">
                <div className="flex justify-between py-1">
                  <span>Contract</span>
                  <span className="text-foreground">0x1a2b...3c4d</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Owner</span>
                  <span className="text-foreground">{formatAddress(campaign.owner)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Network</span>
                  <span className="text-foreground">Sepolia</span>
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
          onDonate={async (amount) => {
            if (!signer || !address) {
              toast({ title: 'Wallet not connected', description: 'Please connect your wallet to donate.' });
              return;
            }

            const num = parseFloat(amount || '0') || 0;
            if (num <= 0) return;

            try {
              // 1. Blockchain Transaction
              const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);

              // We need the blockchainId (the index in the contract)
              const bId = campaign.blockchainId;
              if (bId === undefined || bId === null) {
                toast({ title: 'System Error', description: 'This campaign is not properly linked to the blockchain.', variant: 'destructive' });
                return;
              }

              toast({ title: 'MetaMask Request', description: `Donating ${amount} ETH to "${campaign.title}"` });

              const tx = await contract.donate(bId, {
                value: ethers.parseEther(num.toString()),
                gasLimit: 500000
              });

              toast({ title: 'Transaction Sent', description: 'Waiting for blockchain confirmation...' });
              await tx.wait();

              // 2. Sync with Backend
              await recordDonation({
                campaignId: campaign.id,
                wallet: address,
                amount: num,
                txHash: tx.hash
              });

              // 3. Update Local State
              const updated = { ...campaign };
              updated.amountCollected = (parseFloat(updated.amountCollected) + num).toString();
              const donorEntry = { donor: address, amount: amount, timestamp: Date.now(), txHash: tx.hash };
              updated.donors = [donorEntry, ...updated.donors];
              setLocalCampaign(updated);

              toast({ title: '🚀 Donation Successful!', description: `Thank you for donating ${amount} ETH!` });

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
