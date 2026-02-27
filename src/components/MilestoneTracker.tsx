import { CheckCircle2, Lock, Unlock, ExternalLink, ThumbsUp, Loader2, UploadCloud } from 'lucide-react';
import { ethers } from 'ethers';
import { useState } from 'react';
import { FUNDCHAIN_ABI, CONTRACT_ADDRESS } from '@/contracts/FundChain';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import IPFSUpload from '@/components/IPFSUpload';

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
  const { t } = useTranslation();
  const { signer, isConnected } = useWallet();
  const { toast } = useToast();
  const [voting, setVoting] = useState<number | null>(null);
  const [withdrawing, setWithdrawing] = useState<number | null>(null);
  const [uploadingMilestone, setUploadingMilestone] = useState<number | null>(null);

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

  const handleProofUpload = async (milestoneId: number, hash: string) => {
    if (!signer || !isOwner) return;
    setUploadingMilestone(milestoneId);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);
      const tx = await contract.uploadMilestoneProof(campaignId, milestoneId, hash, { gasLimit: 200000 });
      toast({ title: 'Uploading Proof...', description: 'Waiting for blockchain confirmation.' });
      await tx.wait();
      toast({ title: '✅ Proof Submitted!', description: `Document secured on IPFS and linked to milestone.` });
      onMilestoneVoted?.();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.reason || e?.message, variant: 'destructive' });
    } finally {
      setUploadingMilestone(null);
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
        {t('milestone.roadmap') || 'Milestone Roadmap'}
        <span className="text-xs font-normal text-muted-foreground">({milestones.filter(m => m.approved).length}/{milestones.length} {t('milestone.approved') || 'approved'})</span>
      </h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {milestones.map((ms, i) => {
            const mId = ms.id ?? i;
            return (
              <div key={mId} className="relative flex gap-4 pl-0">
                {/* Status icon */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${ms.fundsReleased
                  ? 'bg-accent/20 border-accent text-accent'
                  : ms.approved
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-secondary border-border text-muted-foreground'
                  }`}>
                  {ms.fundsReleased ? <Unlock className="w-4 h-4" /> : ms.approved ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-4 rounded-xl p-5 border transition-all ${ms.fundsReleased
                  ? 'bg-accent/5 border-accent/30'
                  : ms.approved
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-secondary/30 border-border glassmorphism hover:border-border/80'
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="text-sm font-bold text-foreground">{ms.title}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{ms.amount} ETH</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {ms.fundsReleased && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">{t('milestone.paid') || 'Paid Out'}</span>}
                      {ms.approved && !ms.fundsReleased && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">{t('milestone.approved') || 'Approved ✓'}</span>}
                      {!ms.approved && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">{t('milestone.pending') || 'Pending'}</span>}
                    </div>
                  </div>

                  {/* Vote progress */}
                  {!ms.approved && ms.requiredApprovals > 0 && (
                    <div className="mb-4 bg-background/50 p-3 rounded-lg border border-border/30">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                        <span>{t('milestone.votesCount') || 'Donor votes'}</span>
                        <span>{ms.approvalCount}/{ms.requiredApprovals}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(100, (ms.approvalCount / ms.requiredApprovals) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* IPFS Proof Input or Display */}
                  {ms.ipfsProofHash ? (
                    <a
                      href={`https://ipfs.io/ipfs/${ms.ipfsProofHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 hover:underline mb-3 p-2 bg-primary/5 rounded-lg border border-primary/10 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Proof Document on IPFS
                    </a>
                  ) : (
                    isOwner && !ms.approved && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                          <UploadCloud className="w-3.5 h-3.5 text-primary" />
                          {t('milestone.provideProof') || 'Provide Proof for Donors'}
                        </p>
                        <IPFSUpload
                          label="Upload Document/Receipt"
                          onUpload={(hash) => handleProofUpload(mId, hash)}
                        />
                        {uploadingMilestone === mId && <p className="text-xs text-primary mt-2 animate-pulse">Confirming on blockchain...</p>}
                      </div>
                    )
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    {!ms.approved && isConnected && (
                      <Button
                        size="sm"
                        className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary shadow-sm"
                        disabled={voting === mId || (ms.requiredApprovals > 0 && ms.approvalCount >= ms.requiredApprovals)}
                        onClick={() => handleVote(mId)}
                      >
                        {voting === mId ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3 fill-current/20" />}
                        {t('milestone.approve') || 'Vote Approve'}
                      </Button>
                    )}
                    {isOwner && ms.approved && !ms.fundsReleased && (
                      <Button
                        size="sm"
                        className="h-8 text-xs gap-1.5 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 shadow-sm"
                        disabled={withdrawing === mId}
                        onClick={() => handleWithdraw(mId)}
                      >
                        {withdrawing === mId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                        {t('milestone.withdraw') || 'Withdraw Funds'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
