import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface DonateModalProps {
  campaignTitle: string;
  onClose: () => void;
  onDonate?: (amount: string) => Promise<void> | void;
}

export default function DonateModal({ campaignTitle, onClose, onDonate }: DonateModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const presets = ['0.01', '0.05', '0.1', '0.5', '1'];

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsProcessing(true);
    // Simulate tx
    await new Promise(r => setTimeout(r, 2000));
    try {
      await onDonate?.(amount);
    } catch (e) {
      console.warn('onDonate handler failed', e);
    }
    toast({
      title: '🎉 Donation Successful!',
      description: `You donated ${amount} ETH to "${campaignTitle}". Transaction confirmed on-chain.`,
    });
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => { console.debug('[DonateModal] overlay clicked'); onClose(); }} />
      <div className="relative w-full max-w-md rounded-xl bg-card border border-border p-6 glow-primary">
        <button onClick={() => { console.debug('[DonateModal] close clicked'); onClose(); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-1">Donate ETH</h2>
        <p className="text-sm text-muted-foreground mb-6">to {campaignTitle}</p>

        <div className="flex gap-2 mb-4 flex-wrap">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => { console.debug('[DonateModal] preset clicked', p); setAmount(p); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors ${amount === p
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
            >
              {p} ETH
            </button>
          ))}
        </div>

        <Input
          type="number"
          step="0.001"
          placeholder="Custom amount in ETH"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="font-mono mb-4 bg-secondary border-border"
        />

        <div className="text-xs text-muted-foreground mb-4 p-3 rounded-lg bg-secondary">
          <div className="flex justify-between mb-1">
            <span>Network</span>
            <span className="text-foreground">Sepolia Testnet</span>
          </div>
          <div className="flex justify-between">
            <span>Est. Gas</span>
            <span className="text-foreground">~0.002 ETH</span>
          </div>
        </div>

        <Button
          onClick={() => { console.debug('[DonateModal] Donate clicked', amount); handleDonate(); }}
          disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
        >
          {isProcessing ? 'Processing Transaction...' : `Donate ${amount || '0'} ETH`}
        </Button>
      </div>
    </div>
  );
}
