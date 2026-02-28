import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { X, Sparkles, Wallet } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

interface DonateModalProps {
  campaignTitle: string;
  onClose: () => void;
  onDonate?: (amount: string, mode: 'wallet' | 'smile') => Promise<void> | void;
}

export default function DonateModal({ campaignTitle, onClose, onDonate }: DonateModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'wallet' | 'smile'>('wallet');
  const { toast } = useToast();
  const { savingsBalance, convertToInr } = useWallet();

  const presets = ['0.01', '0.05', '0.1', '0.5', '1'];

  const handleDonate = async () => {
    const num = parseFloat(amount || '0');
    if (!num || num <= 0) return;

    if (mode === 'smile' && num > savingsBalance) {
      toast({ title: 'Insufficient Savings', description: "You don't have enough Smile points for this donation.", variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      await onDonate?.(amount, mode);
    } catch (e) {
      console.warn('onDonate handler failed', e);
    }
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 md:p-8 shadow-2xl glassmorphism overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-foreground mb-1 leading-none tracking-tight">MAKE A DONATION</h2>
        <p className="text-sm font-bold text-muted-foreground mb-8">to {campaignTitle}</p>

        {/* Mode Toggle */}
        <div className="flex p-1.5 bg-secondary/50 border border-border/50 rounded-2xl mb-8">
          <button
            onClick={() => setMode('wallet')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'wallet' ? 'bg-background text-primary shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Wallet className="w-4 h-4" /> ETH WALLET
          </button>
          <button
            onClick={() => setMode('smile')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'smile' ? 'bg-background text-amber-500 shadow-sm border border-amber-500/20' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> SMILE SAVINGS
          </button>
        </div>

        {mode === 'smile' && (
          <div className="mb-8 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-center glassmorphism relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.2em] mb-2">Available Savings</div>
              <div className="text-4xl font-black text-amber-500 font-mono tracking-tighter leading-none mb-2">{savingsBalance.toFixed(6)} ETH</div>
              <div className="text-[9px] text-amber-500/40 uppercase font-bold tracking-wider">Converted from your Smile Coins</div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black font-mono border transition-all ${amount === p
                ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10 scale-105'
                : 'border-border/50 text-muted-foreground hover:border-primary/30'
                }`}
            >
              {p} ETH
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Input
            type="number"
            step="0.001"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="font-mono bg-secondary/50 border-border/50 h-16 text-2xl font-black text-foreground focus:ring-primary/20 rounded-2xl pl-6 pr-16"
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground tracking-widest uppercase opacity-40">ETH</span>
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div className="mb-6 -mt-3 px-2 text-sm font-bold text-primary animate-in fade-in slide-in-from-top-2 duration-300">
            Equiv: {convertToInr(amount)}
          </div>
        )}

        <div className="text-[10px] font-black text-muted-foreground mb-8 p-5 rounded-2xl bg-secondary/30 border border-border/50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="uppercase tracking-[0.15em] opacity-40 font-black">Transaction Fee</span>
            <span className="text-foreground font-mono">{mode === 'wallet' ? '~0.002 ETH' : '0.000 ETH'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="uppercase tracking-[0.15em] opacity-40 font-black">Funding Source</span>
            <span className="text-foreground uppercase tracking-widest font-black">{mode === 'wallet' ? 'Personal Wallet' : 'Smile Savings'}</span>
          </div>
        </div>

        <Button
          onClick={handleDonate}
          disabled={!amount || parseFloat(amount) <= 0 || isProcessing || (mode === 'smile' && parseFloat(amount) > savingsBalance)}
          className={`w-full h-16 text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] rounded-2xl ${mode === 'smile'
            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-2xl shadow-amber-500/30'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 glow-primary shadow-2xl shadow-primary/30'
            }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            `Donate ${amount || '0'} ETH`
          )}
        </Button>
      </div>
    </div>
  );
}
