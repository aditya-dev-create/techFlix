import { CheckCircle2, Circle, Lock, Unlock, ExternalLink, ThumbsUp, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import { useState } from 'react';
import { FUNDCHAIN_ABI, CONTRACT_ADDRESS } from '@/contracts/FundChain';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Milestone {
  id: number;
  title: string;
  amount: string;
  approved: boolean;
  fundsReleased: boolean;
  approvalCount: number;
  requiredApprovals: number;
  ipfsProofHash?: string;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  campaignId: number | string;
  isOwner?: boolean;
  onMilestoneVoted?: () => void;
}

export default function MilestoneTracker({ milestones, campaignId, isOwner, onMilestoneVoted }: MilestoneTrackerProps) {
  const { signer, isConnected } = useWallet();
  const { toast } = useToast();
  const [voting, setVoting] = useState<number | null>(null);
  const [withdrawing, setWithdrawing] = useState<number | null>(null);

  const handleVote = async (milestoneId: number) => {
    if (!signer) { toast({ title: 'Connect wallet first', variant: 'destructive' }); return; }
    setVoting(milestoneId);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);
      const tx = await contract.approveMilestone(campaignId, milestoneId, { gasLimit: 200000 });
      toast({ title: 'Vote submitted', description: 'Waiting for confirmation...' });
      await tx.wait();
      toast({ title: '✅ Vote confirmed!', description: 'Your approval is recorded on-chain.' });
      onMilestoneVoted?.();
    } catch (e: any) {
      toast({ title: 'Vote failed', description: e?.reason || e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setVoting(null);
    }
  };

  const handleWithdraw = async (milestoneId: number) => {
    if (!signer || !isOwner) return;
    setWithdrawing(milestoneId);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);
      const tx = await contract.withdrawFunds(campaignId, milestoneId, { gasLimit: 200000 });
      toast({ title: 'Withdrawal in progress...', description: 'Waiting for blockchain confirmation.' });
      await tx.wait();
      toast({ title: '💰 Funds Withdrawn!', description: `Milestone ${milestoneId + 1} funds sent to your wallet.` });
      onMilestoneVoted?.();
    } catch (e: any) {
      toast({ title: 'Withdrawal failed', description: e?.reason || e?.message, variant: 'destructive' });
    } finally {
      setWithdrawing(null);
    }
  };

  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No milestones defined for this campaign.
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        Milestone Roadmap
        <span className="text-xs font-normal text-muted-foreground">({milestones.filter(m => m.approved).length}/{milestones.length} approved)</span>
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {milestones.map((ms, i) => (
            <div key={ms.id ?? i} className="relative flex gap-4 pl-0">
              {/* Status icon */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${ms.fundsReleased
                  ? 'bg-accent/20 border-accent'
                  : ms.approved
                    ? 'bg-primary/20 border-primary'
                    : 'bg-secondary border-border'
                }`}>
                {ms.fundsReleased ? (
                  <Unlock className="w-4 h-4 text-accent" />
                ) : ms.approved ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-4 rounded-xl p-4 border transition-all ${ms.fundsReleased
                  ? 'bg-accent/5 border-accent/30'
                  : ms.approved
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-secondary/30 border-border'
                }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">{ms.title}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{ms.amount} ETH</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {ms.fundsReleased && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">Paid Out</span>
                    )}
                    {ms.approved && !ms.fundsReleased && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Approved ✓</span>
                    )}
                    {!ms.approved && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Pending</span>
                    )}
                  </div>
                </div>

                {/* Vote progress */}
                {!ms.approved && ms.requiredApprovals > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Donor votes</span>
                      <span>{ms.approvalCount}/{ms.requiredApprovals}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (ms.approvalCount / ms.requiredApprovals) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* IPFS Proof link */}
                {ms.ipfsProofHash && (
                  <a
                    href={`https://ipfs.io/ipfs/${ms.ipfsProofHash}`}
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline mb-2"
                  >
                    <ExternalLink className="w-3 h-3" /> View Proof on IPFS
                  </a>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  {!ms.approved && isConnected && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      disabled={voting === (ms.id ?? i)}
                      onClick={() => handleVote(ms.id ?? i)}
                    >
                      {voting === (ms.id ?? i) ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
                      Vote Approve
                    </Button>
                  )}
                  {isOwner && ms.approved && !ms.fundsReleased && (
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30"
                      disabled={withdrawing === (ms.id ?? i)}
                      onClick={() => handleWithdraw(ms.id ?? i)}
                    >
                      {withdrawing === (ms.id ?? i) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                      Withdraw Funds
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
