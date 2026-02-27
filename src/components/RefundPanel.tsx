import { useState } from 'react';
import { ethers } from 'ethers';
import { FUNDCHAIN_ABI, CONTRACT_ADDRESS } from '@/contracts/FundChain';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RefundPanelProps {
    campaignId: number | string;
    deadline: Date | string;
    targetMet: boolean;
    userDonation: number; // in ETH
    onRefund?: () => void;
}

export default function RefundPanel({ campaignId, deadline, targetMet, userDonation, onRefund }: RefundPanelProps) {
    const { signer, isConnected } = useWallet();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [refunded, setRefunded] = useState(false);

    const deadlineDate = new Date(deadline);
    const campaignEnded = Date.now() > deadlineDate.getTime();
    const canRefund = campaignEnded && (!targetMet) && userDonation > 0 && !refunded;

    const handleClaimRefund = async () => {
        if (!signer) { toast({ title: 'Connect wallet first', variant: 'destructive' }); return; }
        setLoading(true);
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);
            const tx = await contract.claimRefund(campaignId, { gasLimit: 150000 });
            toast({ title: 'Refund Processing', description: 'Waiting for blockchain confirmation...' });
            await tx.wait();
            setRefunded(true);
            toast({ title: `💸 Refund Successful!`, description: `${userDonation} ETH has been returned to your wallet.` });
            onRefund?.();
        } catch (e: any) {
            const msg = e?.reason || e?.message || 'Unknown error';
            toast({ title: 'Refund failed', description: msg, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) return null;

    return (
        <div className={`rounded-xl p-4 border ${canRefund ? 'bg-destructive/5 border-destructive/30' : 'bg-secondary border-border'}`}>
            <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${canRefund ? 'bg-destructive/20' : 'bg-secondary'}`}>
                    {refunded ? (
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                    ) : canRefund ? (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                    ) : (
                        <RotateCcw className="w-4 h-4 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="text-sm font-medium text-foreground mb-1">
                        {refunded ? 'Refund Claimed ✓' : 'Refund Status'}
                    </div>

                    {!campaignEnded && (
                        <p className="text-xs text-muted-foreground">Campaign is still active. Refunds are available if the goal is not met by the deadline.</p>
                    )}

                    {campaignEnded && targetMet && (
                        <p className="text-xs text-muted-foreground">Campaign reached its goal. Refunds are not available.</p>
                    )}

                    {campaignEnded && !targetMet && userDonation === 0 && (
                        <p className="text-xs text-muted-foreground">You did not donate to this campaign.</p>
                    )}

                    {canRefund && (
                        <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-2">
                                Campaign failed to meet its goal. You donated <span className="text-foreground font-mono">{userDonation} ETH</span>. Click below to reclaim it.
                            </p>
                            <Button
                                size="sm"
                                onClick={handleClaimRefund}
                                disabled={loading}
                                className="bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 h-8 text-xs gap-1"
                            >
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                Claim {userDonation} ETH Refund
                            </Button>
                        </div>
                    )}

                    {refunded && (
                        <p className="text-xs text-accent mt-1">Your ETH has been returned to your wallet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
