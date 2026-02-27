import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORY_LABELS, CampaignCategory } from '@/types/campaign';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { Plus, Trash2, AlertCircle, Loader2, Shield, Image as ImageIcon, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '@/lib/api';
import { ethers } from 'ethers';
import { FUNDCHAIN_ABI, CONTRACT_ADDRESS } from '@/contracts/FundChain';
import IPFSUpload from '@/components/IPFSUpload';
import { useTranslation } from 'react-i18next';

export default function CreateCampaign() {
  const { t } = useTranslation();
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
        <div className="text-center p-8 bg-card rounded-2xl border border-border max-w-md glassmorphism">
          <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{t('nav.connect')}</h2>
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
    { key: 'basic', label: t('create.tab.basic') || 'Basic Info' },
    { key: 'milestones', label: t('create.tab.milestones') || 'Milestones' },
    { key: 'advanced', label: t('create.tab.advanced') || 'Advanced' },
  ] as const;

  return (
    <div className="min-h-screen pt-24 pb-16 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-3">{t('create.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('create.desc')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1.5 mb-8 glassmorphism shadow-inner">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={(e) => { e.preventDefault(); setActiveTab(t.key); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === t.key ? 'bg-primary text-primary-foreground shadow-sm glow-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-5 glassmorphism shadow-sm">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">{t('create.basic.title')}</label>
                  <Input
                    placeholder="e.g. Build a Solar School"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="bg-secondary border-border/50 h-11 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">{t('create.basic.desc')}</label>
                  <Textarea
                    placeholder="Describe your project, its impact, and how funds will be used..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="bg-secondary border-border/50 min-h-[120px] focus:ring-primary/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">{t('create.basic.category')}</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value as CampaignCategory })}
                      className="w-full px-4 h-11 rounded-lg bg-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {(Object.entries(CATEGORY_LABELS) as [CampaignCategory, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">{t('create.basic.target')}</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 5.0"
                      value={form.target}
                      onChange={e => setForm({ ...form, target: e.target.value })}
                      className="bg-secondary border-border/50 font-mono h-11 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">{t('create.basic.deadline')}</label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="bg-secondary border-border/50 h-11 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* IPFS Image */}
              <div className="rounded-2xl bg-card border border-border/50 p-6 glassmorphism">
                <label className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" /> {t('create.basic.image')}
                </label>
                <IPFSUpload
                  label="Upload Campaign Image"
                  accept="image/*"
                  onUpload={(hash) => setForm({ ...form, ipfsImageHash: hash })}
                />
                {form.ipfsImageHash && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-400 font-mono bg-green-400/10 p-2 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> IPFS: {form.ipfsImageHash.slice(0, 10)}...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="rounded-2xl bg-card border border-border/50 p-6 glassmorphism animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-foreground">Milestone Roadmap</h3>
                  <p className="text-xs text-muted-foreground mt-1">Funds release only when donors vote to approve each milestone</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="gap-1 border-primary/20 text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4" /> {t('milestone.add')}
                </Button>
              </div>
              <div className="space-y-4">
                {milestones.map((ms, i) => (
                  <div key={i} className="p-5 rounded-xl bg-secondary/50 border border-border/50 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Milestone {i + 1}</span>
                      {milestones.length > 1 && (
                        <button type="button" onClick={() => removeMilestone(i)} className="text-destructive/60 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{t('milestone.title')}</label>
                      <Input
                        placeholder="e.g. Foundation complete"
                        value={ms.title}
                        onChange={e => setMilestones(milestones.map((m, idx) => idx === i ? { ...m, title: e.target.value } : m))}
                        className="bg-card border-border/50 focus:ring-primary/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">{t('milestone.amount')}</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.001"
                          placeholder="1.0"
                          value={ms.amount}
                          onChange={e => setMilestones(milestones.map((m, idx) => idx === i ? { ...m, amount: e.target.value } : m))}
                          className="bg-card border-border/50 font-mono focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">{t('milestone.votes')} Required</label>
                        <Input
                          type="number"
                          min="1"
                          value={ms.requiredApprovals}
                          onChange={e => setMilestones(milestones.map((m, idx) => idx === i ? { ...m, requiredApprovals: e.target.value } : m))}
                          className="bg-card border-border/50 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-primary">💡 Verification System:</span> Milestones are mapped on-chain. Before unlocking funds, you must upload Document Proofs to IPFS. Donors review and vote to approve payout.
              </div>
            </div>
          )}

          {/* ADVANCED */}
          {activeTab === 'advanced' && (
            <div className="rounded-2xl bg-card border border-border/50 p-6 glassmorphism animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Multi-Signature Withdrawal</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Add trusted co-signers who must also approve fund withdrawal. Majority confirmation required.</p>
              <div className="space-y-3">
                {multiSigners.map((signer, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder={`Co-signer ${i + 1} address (0x...)`}
                      value={signer}
                      onChange={e => setMultiSigners(multiSigners.map((s, idx) => idx === i ? e.target.value : s))}
                      className="bg-secondary border-border/50 font-mono text-sm h-11 focus:ring-primary/50"
                    />
                    {multiSigners.length > 1 && (
                      <button type="button" onClick={() => removeSigner(i)} className="text-destructive/60 hover:text-destructive p-2.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={addSigner} className="gap-2 text-sm border-dashed border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 w-full h-11">
                    <Plus className="w-4 h-4" /> Add Co-Signer
                  </Button>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground leading-relaxed">
                ⚠️ Leave empty to skip multi-sig. With multi-sig, you need majority approval from all listed addresses before withdrawing funds.
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="mt-8 flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabOrder: typeof activeTab[] = ['basic', 'milestones', 'advanced'];
                const idx = tabOrder.indexOf(activeTab);
                if (idx < tabOrder.length - 1) setActiveTab(tabOrder[idx + 1]);
              }}
              className="flex-1 h-12 text-base font-bold border-border/50 hover:bg-secondary/80 transition-all"
              disabled={activeTab === 'advanced'}
            >
              {t('create.next')}
            </Button>
            {activeTab === 'advanced' && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12 text-base gap-2 font-bold transition-all shadow-xl shadow-primary/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Deploying...</>
                ) : (
                  <><Shield className="w-5 h-5" /> {t('create.submit')}</>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
