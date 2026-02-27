import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORY_LABELS, CampaignCategory } from '@/types/campaign';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '@/lib/api';
import { ethers } from 'ethers';
import { FUNDCHAIN_ABI, CONTRACT_ADDRESS } from '@/contracts/FundChain';

export default function CreateCampaign() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { address: userAddress, isConnected, signer, isInitializing } = useWallet();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'defi' as CampaignCategory,
    target: '',
    deadline: '',
  });
  const [milestones, setMilestones] = useState([{ title: '', amount: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMilestone = () => setMilestones([...milestones, { title: '', amount: '' }]);
  const removeMilestone = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i));

  if (isInitializing) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-2xl border border-border max-w-md">
          <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Please connect your wallet to create and manage campaigns.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress || !signer) {
      toast({ title: 'Wallet error', description: 'Please connect your wallet first', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Deploy to Blockchain
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);

      const targetWei = ethers.parseEther(form.target);

      // Ensure deadline is at the end of the picked day to stay in the "future"
      const date = new Date(form.deadline);
      date.setHours(23, 59, 59);
      const deadlineTimestamp = Math.floor(date.getTime() / 1000);

      toast({ title: 'MetaMask Request', description: 'Please confirm the transaction in MetaMask.' });

      const tx = await contract.createCampaign(
        form.title,
        form.description,
        form.category,
        targetWei,
        deadlineTimestamp,
        { gasLimit: 3000000 } // Add manual gas limit for local node stability
      );

      toast({ title: 'Transaction Sent', description: 'Waiting for blockchain confirmation...' });
      const receipt = await tx.wait();

      // 2. Parse ID from Event
      // Look for CampaignCreated event in logs
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'CampaignCreated';
        } catch (e) { return false; }
      });

      const blockchainId = event ? contract.interface.parseLog(event)?.args[0].toString() : null;

      // 3. Sync with Backend
      const campaignData = {
        title: form.title,
        description: form.description,
        targetAmount: parseFloat(form.target),
        deadline: form.deadline,
        ngoId: userAddress,
        blockchainId: blockchainId, // Store the contract ID reference
        milestones: milestones.filter(m => m.title && m.amount).map(m => ({
          title: m.title,
          amount: parseFloat(m.amount)
        }))
      };

      await createCampaign(campaignData);

      toast({
        title: '🚀 Campaign Live!',
        description: `Your campaign # ${blockchainId} is now live on the blockchain and database.`,
      });
      navigate('/explore');
    } catch (err: any) {
      console.error('DEPLOYMENT ERROR DETAILS:', err);
      let errorMsg = err.message || 'Error interacting with blockchain.';

      if (err.code === 'ACTION_REJECTED') {
        errorMsg = 'Transaction was rejected in MetaMask.';
      } else if (err.message?.includes('Deadline')) {
        errorMsg = 'Blockchain error: Deadline must be in the future.';
      } else if (err.message?.includes('Target')) {
        errorMsg = 'Blockchain error: Target must be greater than 0.';
      }

      toast({
        title: '❌ Deployment Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Campaign</h1>
        <p className="text-muted-foreground mb-8">Deploy a transparent crowdfunding campaign to the blockchain</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Campaign Title</label>
              <Input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. DeFi Protocol for the Unbanked"
                required
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <Textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your project, goals, and how funds will be used..."
                rows={4}
                required
                className="bg-secondary border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as CampaignCategory })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {(Object.entries(CATEGORY_LABELS) as [CampaignCategory, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Target (ETH)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}
                  placeholder="50"
                  required
                  className="bg-secondary border-border font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Deadline</label>
              <Input
                type="date"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                required
                className="bg-secondary border-border"
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Milestones</h3>
              <button type="button" onClick={() => { console.debug('[CreateCampaign] Add milestone'); addMilestone(); }} className="text-primary text-sm flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {milestones.map((ms, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder={`Milestone ${i + 1} title`}
                      value={ms.title}
                      onChange={e => {
                        const updated = [...milestones];
                        updated[i].title = e.target.value;
                        setMilestones(updated);
                      }}
                      className="bg-secondary border-border text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="ETH"
                      value={ms.amount}
                      onChange={e => {
                        const updated = [...milestones];
                        updated[i].amount = e.target.value;
                        setMilestones(updated);
                      }}
                      className="bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                  {milestones.length > 1 && (
                    <button type="button" onClick={() => { console.debug('[CreateCampaign] Remove milestone', i); removeMilestone(i); }} className="text-muted-foreground hover:text-destructive mt-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12 text-base"
            onClick={() => console.debug('[CreateCampaign] Deploy clicked')}
          >
            {isSubmitting ? 'Deploying to Blockchain...' : 'Deploy Campaign'}
          </Button>
        </form>
      </div>
    </div>
  );
}
