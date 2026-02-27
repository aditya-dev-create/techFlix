import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FUNDCHAIN_ABI, CONTRACT_ADDRESS } from '@/contracts/FundChain';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, RotateCcw, Users, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';

interface AdminPanelProps {
    campaignId: number;
    campaignTitle: string;
    isVerified: boolean;
    onAction?: () => void;
}

export default function AdminPanel({ campaignId, campaignTitle, isVerified, onAction }: AdminPanelProps) {
    const { signer, address } = useWallet();
    const { toast } = useToast();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [loadingRefund, setLoadingRefund] = useState(false);
    const [contractBalance, setContractBalance] = useState<string | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!address) return;
            try {
                if (window.ethereum) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, provider);
                    const adminAddr = await contract.admin();
                    setIsAdmin(adminAddr.toLowerCase() === address.toLowerCase());
                    const bal = await contract.getContractBalance();
                    setContractBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
                }
            } catch { }
        };
        checkAdmin();
    }, [address]);

    const handleVerify = async () => {
        if (!signer) return;
        setLoadingVerify(true);
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);
            const tx = await contract.verifyCampaign(campaignId, { gasLimit: 100000 });
            await tx.wait();
            toast({ title: '✅ Campaign Verified!', description: 'The campaign now has a Verified badge on-chain.' });
            onAction?.();
        } catch (e: any) {
            toast({ title: 'Verify failed', description: e?.reason || e?.message, variant: 'destructive' });
        } finally {
            setLoadingVerify(false);
        }
    };

    const handleEnableRefunds = async () => {
        if (!signer) return;
        setLoadingRefund(true);
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);
            const tx = await contract.enableRefunds(campaignId, { gasLimit: 100000 });
            await tx.wait();
            toast({ title: '🔄 Refunds Enabled', description: 'Donors can now claim refunds for this campaign.' });
            onAction?.();
        } catch (e: any) {
            toast({ title: 'Failed', description: e?.reason || e?.message, variant: 'destructive' });
        } finally {
            setLoadingRefund(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/30 p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                    <div className="text-sm font-semibold text-amber-400">Admin Controls</div>
                    <div className="text-xs text-muted-foreground">You are the contract admin</div>
                </div>
            </div>

            {contractBalance && (
                <div className="mb-4 p-3 rounded-lg bg-secondary text-xs font-mono">
                    <span className="text-muted-foreground">Contract Balance: </span>
                    <span className="text-foreground">{contractBalance} ETH</span>
                </div>
            )}

            <div className="space-y-2">
                <Button
                    onClick={handleVerify}
                    disabled={isVerified || loadingVerify}
                    className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 h-9"
                    size="sm"
                >
                    {loadingVerify ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    {isVerified ? 'Already Verified ✓' : 'Verify Campaign'}
                </Button>

                <Button
                    onClick={handleEnableRefunds}
                    disabled={loadingRefund}
                    className="w-full justify-start gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 h-9"
                    size="sm"
                    variant="ghost"
                >
                    {loadingRefund ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                    Enable Refunds (Emergency)
                </Button>

                <a
                    href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                    <ExternalLink className="w-3 h-3" />
                    View Contract on Etherscan
                </a>
            </div>
        </div>
    );
}
