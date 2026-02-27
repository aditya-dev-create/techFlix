import { useState, useEffect } from 'react';
import { fetchDashboardData } from '@/lib/api';
import { useWallet } from '@/hooks/useWallet';
import CampaignCard from '@/components/CampaignCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { formatEth } from '@/lib/web3Utils';
import { FUNDCHAIN_ABI, CONTRACT_ADDRESS } from '@/contracts/FundChain';
import {
  Wallet, TrendingUp, BarChart3, Activity, Loader2, AlertCircle, Plus,
  ExternalLink, ShieldCheck, Download, Zap, Users, Copy, Check
} from 'lucide-react';

export default function Dashboard() {
  const { address: userAddress, isConnected, isInitializing, balance, chainId } = useWallet();
  const [data, setData] = useState<any>(null);
  const [contractBalance, setContractBalance] = useState<string | null>(null);
  const [totalCampaigns, setTotalCampaigns] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'donations'>('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!userAddress) return;
      setLoading(true);
      try {
        const result = await fetchDashboardData(userAddress);
        setData(result);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userAddress]);

  // Fetch on-chain analytics
  useEffect(() => {
    const loadOnChain = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, provider);
        const [bal, count] = await Promise.all([
          contract.getContractBalance(),
          contract.campaignCount(),
        ]);
        setContractBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
        setTotalCampaigns(Number(count));
      } catch { }
    };
    loadOnChain();
  }, [isConnected]);

  const copyAddress = () => {
    navigator.clipboard.writeText(userAddress || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInitializing || (loading && !data)) {
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
          <p className="text-muted-foreground mb-6">Please connect your MetaMask wallet to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const { myCampaigns = [], myDonations = [], totalDonated = 0, totalRaised = 0 } = data || {};

  const stats = [
    {
      label: 'My Campaigns',
      value: myCampaigns.length.toString(),
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-primary',
      bg: 'bg-primary/10',
      sub: 'created on-chain',
    },
    {
      label: 'Total Raised',
      value: `${formatEth(totalRaised.toString())} ETH`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-accent',
      bg: 'bg-accent/10',
      sub: 'across all campaigns',
    },
    {
      label: 'Donations Made',
      value: myDonations.length.toString(),
      icon: <Wallet className="w-5 h-5" />,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10',
      sub: 'campaigns backed',
    },
    {
      label: 'ETH Donated',
      value: `${Number(totalDonated).toFixed(4)} ETH`,
      icon: <Activity className="w-5 h-5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      sub: 'total contribution',
    },
  ];

  const chainName: Record<number, string> = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    31337: 'Hardhat Local',
    80001: 'Polygon Mumbai',
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground font-mono text-sm">
                {userAddress?.slice(0, 10)}...{userAddress?.slice(-8)}
              </span>
              <button
                onClick={copyAddress}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://sepolia.etherscan.io/address/${userAddress}`}
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary border border-border rounded-lg px-3 py-2 bg-secondary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Etherscan
            </a>
            <Link to="/create">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 glow-primary">
                <Plus className="w-4 h-4" /> New Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Wallet Info Bar */}
        <div className="rounded-xl bg-card border border-border p-4 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Wallet Balance</div>
            <div className="font-mono font-bold text-foreground">{balance ?? '—'} ETH</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Network</div>
            <div className="font-medium text-foreground">{chainId ? (chainName[chainId] || `Chain ${chainId}`) : '—'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Contract Balance</div>
            <div className="font-mono font-bold text-primary">{contractBalance ?? '—'} ETH</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Total Campaigns On-Chain</div>
            <div className="font-bold text-foreground">{totalCampaigns ?? '—'}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl bg-card border border-border p-5 hover:border-primary/30 transition-all">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color} mb-3`}>
                {s.icon}
              </div>
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-sm font-medium text-foreground mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6 w-fit">
          {(['overview', 'campaigns', 'donations'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Donations */}
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Recent Activity
              </h3>
              {myDonations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No donations yet.</p>
              ) : (
                <div className="space-y-3">
                  {myDonations.slice(0, 4).map((d: any) => (
                    <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        D
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{d.campaign?.title || 'Campaign'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(d.createdAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-mono text-primary">{Number(d.amount || 0).toFixed(3)} ETH</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contract Analytics */}
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> On-Chain Analytics
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Contract Address', value: `${CONTRACT_ADDRESS.slice(0, 10)}...`, link: `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}` },
                  { label: 'Total Campaigns', value: totalCampaigns?.toString() ?? '—', link: null },
                  { label: 'Locked in Contract', value: `${contractBalance ?? '—'} ETH`, link: null },
                  { label: 'Your Contributions', value: `${Number(totalDonated).toFixed(4)} ETH`, link: null },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    {row.link ? (
                      <a href={row.link} rel="noopener noreferrer" className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
                        {row.value} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs font-mono text-foreground">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div>
            {myCampaigns.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground bg-card rounded-xl border border-border border-dashed">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="mb-4">No campaigns created yet</p>
                <Link to="/create">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Create Your First Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCampaigns.map((c: any) => (
                  <CampaignCard key={c.id} campaign={{
                    ...c,
                    target: c.targetAmount,
                    owner: c.ngo?.wallet || c.ngoId,
                    donors: c.donations || [],
                    category: c.category || 'charity'
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Donations Tab */}
        {activeTab === 'donations' && (
          <div>
            {myDonations.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground bg-card rounded-xl border border-border">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="mb-4">No donations yet</p>
                <Link to="/explore">
                  <Button variant="outline" size="sm">Browse Campaigns</Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myDonations.map((d: any) => (
                  <CampaignCard key={d.id} campaign={{
                    ...d.campaign,
                    target: d.campaign?.targetAmount,
                    owner: d.campaign?.ngo?.wallet || d.campaign?.ngoId,
                    donors: d.campaign?.donations || [],
                    category: d.campaign?.category || 'charity'
                  }} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
