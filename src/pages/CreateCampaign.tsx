import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORY_LABELS, CampaignCategory } from '@/types/campaign';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { Plus, Trash2, AlertCircle, Loader2, Shield, Image as ImageIcon, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '@/lib/api';
import { ethers } from 'ethers';
import { FUNDCHAIN_ABI, CONTRACT_ADDRESS } from '@/contracts/FundChain';
import IPFSUpload from '@/components/IPFSUpload';

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
    ipfsImageHash: '',
  });
  const [milestones, setMilestones] = useState([{ title: '', amount: '', requiredApprovals: '1' }]);
  const [multiSigners, setMultiSigners] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'milestones' | 'advanced'>('basic');

  const addMilestone = () => setMilestones([...milestones, { title: '', amount: '', requiredApprovals: '1' }]);
  const removeMilestone = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i));

  const addSigner = () => setMultiSigners([...multiSigners, '']);
  const removeSigner = (i: number) => setMultiSigners(multiSigners.filter((_, idx) => idx !== i));

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
          <p className="text-muted-foreground mb-6">Please connect your MetaMask wallet to create a campaign on the blockchain.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.target || !form.deadline) {
      toast({ title: 'Missing fields', description: 'Fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (!signer || !userAddress) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, signer);
      const targetWei = ethers.parseEther(form.target);
      const date = new Date(form.deadline);
      date.setHours(23, 59, 59);
      const deadlineTimestamp = Math.floor(date.getTime() / 1000);

      const validSigners = multiSigners.filter(s => ethers.isAddress(s));

      toast({ title: '🚀 Deploying to Blockchain', description: 'Confirm in MetaMask...' });

      const tx = await contract.createCampaign(
        form.title,
        form.description,
        form.category,
        targetWei,
        deadlineTimestamp,
        form.ipfsImageHash || '',
        validSigners,
        { gasLimit: 500000 }
      );

      toast({ title: 'Transaction sent', description: 'Waiting for confirmation...' });
      const receipt = await tx.wait();

      // Extract campaign ID from event
      const event = receipt.logs
        .map((log: any) => {
          try { return contract.interface.parseLog(log); } catch { return null; }
        })
        .find((e: any) => e?.name === 'CampaignCreated');
      const blockchainId = event ? Number(event.args[0]) : null;

      // Sync to backend
      toast({ title: '🔄 Syncing with backend...' });
      const campaignData = {
        title: form.title,
        description: form.description,
        category: form.category,
        targetAmount: parseFloat(form.target),
        deadline: form.deadline,
        ngoId: userAddress,
        blockchainId: blockchainId?.toString(),
        milestones: milestones
          .filter(m => m.title && m.amount)
          .map(m => ({ title: m.title, amount: parseFloat(m.amount) })),
      };
      await createCampaign(campaignData);

      toast({ title: '✅ Campaign Live!', description: `Campaign #${blockchainId} is live on-chain!` });
      navigate('/explore');
    } catch (err: any) {
      console.error('Create campaign error:', err);
      let msg = err?.message || 'Unknown error';
      if (err?.code === 'ACTION_REJECTED') msg = 'Transaction rejected in MetaMask.';
      if (err?.message?.includes('Deadline')) msg = 'Deadline must be in the future.';
      toast({ title: '❌ Deployment Failed', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'milestones', label: 'Milestones' },
    { key: 'advanced', label: 'Advanced' },
  ] as const;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Campaign</h1>
          <p className="text-muted-foreground">Deploy your campaign as a smart contract. Funds are locked until milestones are approved by donors.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="rounded-xl bg-card border border-border p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Campaign Title *</label>
                  <Input
                    placeholder="e.g. Build a Solar School"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Description *</label>
                  <Textarea
                    placeholder="Describe your project, its impact, and how funds will be used..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="bg-secondary border-border min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Category *</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value as CampaignCategory })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                    >
                      {(Object.entries(CATEGORY_LABELS) as [CampaignCategory, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Target (ETH) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 5.0"
                      value={form.target}
                      onChange={e => setForm({ ...form, target: e.target.value })}
                      className="bg-secondary border-border font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Deadline *</label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              {/* IPFS Image */}
              <div className="rounded-xl bg-card border border-border p-6">
                <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" /> Campaign Cover Image (IPFS)
                </label>
                <IPFSUpload
                  label="Upload Campaign Image"
                  accept="image/*"
                  onUpload={(hash) => setForm({ ...form, ipfsImageHash: hash })}
                />
                {form.ipfsImageHash && (
                  <p className="text-xs text-muted-foreground font-mono mt-2">IPFS: {form.ipfsImageHash}</p>
                )}
              </div>
            </div>
          )}

          {/* MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="rounded-xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Milestone Roadmap</h3>
                  <p className="text-xs text-muted-foreground">Funds release only when donors vote to approve each milestone</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              <div className="space-y-4">
                {milestones.map((ms, i) => (
                  <div key={i} className="p-4 rounded-lg bg-secondary border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Milestone {i + 1}</span>
                      {milestones.length > 1 && (
                        <button type="button" onClick={() => removeMilestone(i)} className="text-destructive/60 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="Milestone title (e.g. Foundation complete)"
                      value={ms.title}
                      onChange={e => setMilestones(milestones.map((m, idx) => idx === i ? { ...m, title: e.target.value } : m))}
                      className="bg-card border-border"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Amount (ETH)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.001"
                          placeholder="1.0"
                          value={ms.amount}
                          onChange={e => setMilestones(milestones.map((m, idx) => idx === i ? { ...m, amount: e.target.value } : m))}
                          className="bg-card border-border font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Votes Required</label>
                        <Input
                          type="number"
                          min="1"
                          value={ms.requiredApprovals}
                          onChange={e => setMilestones(milestones.map((m, idx) => idx === i ? { ...m, requiredApprovals: e.target.value } : m))}
                          className="bg-card border-border font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                💡 Milestones are stored on-chain. Donors vote to approve each milestone before funds are released. This creates a DAO-style governance system.
              </div>
            </div>
          )}

          {/* ADVANCED */}
          {activeTab === 'advanced' && (
            <div className="rounded-xl bg-card border border-border p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Multi-Signature Withdrawal</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Add trusted co-signers who must also approve fund withdrawal. Majority confirmation required.</p>
              <div className="space-y-3">
                {multiSigners.map((signer, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Co-signer ${i + 1} address (0x...)`}
                      value={signer}
                      onChange={e => setMultiSigners(multiSigners.map((s, idx) => idx === i ? e.target.value : s))}
                      className="bg-secondary border-border font-mono text-xs"
                    />
                    {multiSigners.length > 1 && (
                      <button type="button" onClick={() => removeSigner(i)} className="text-destructive/60 hover:text-destructive px-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSigner} className="gap-1 text-xs">
                  <Plus className="w-3 h-3" /> Add Co-Signer
                </Button>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-secondary text-xs text-muted-foreground">
                ⚠️ Leave empty to skip multi-sig. With multi-sig, you need majority approval from all listed addresses before withdrawing funds.
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabOrder: typeof activeTab[] = ['basic', 'milestones', 'advanced'];
                const idx = tabOrder.indexOf(activeTab);
                if (idx < tabOrder.length - 1) setActiveTab(tabOrder[idx + 1]);
              }}
              className="flex-1"
              disabled={activeTab === 'advanced'}
            >
              Next →
            </Button>
            {activeTab === 'advanced' && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-11 text-base gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deploying...</>
                ) : (
                  <><Shield className="w-4 h-4" /> Deploy Campaign</>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
