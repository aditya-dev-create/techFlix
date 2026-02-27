import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Eye, Coins, Blocks, Vote, FileText, Lock, Zap, ChevronRight } from 'lucide-react';
import CampaignCard from '@/components/CampaignCard';
import StatsBar, { defaultStats } from '@/components/StatsBar';
import { mockCampaigns } from '@/data/mockData';

const features = [
  {
    icon: <Coins className="w-5 h-5" />,
    title: 'Donate Trustlessly',
    desc: 'ETH goes directly into a smart contract. Zero middlemen, zero hidden fees.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: 'Full Transparency',
    desc: 'Every donation is permanently recorded on Ethereum. Anyone can verify.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Milestone Locked Funds',
    desc: 'Funds release only after donors vote to approve each project milestone.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: <Vote className="w-5 h-5" />,
    title: 'DAO Governance',
    desc: 'Donors vote on milestone approvals. Your ETH gives you voting power.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'IPFS Document Proofs',
    desc: 'NGOs upload receipts and proofs permanently to IPFS for each milestone.',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Automatic Refunds',
    desc: 'If the target is not met, donors can claim a full refund on-chain.',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
];

const steps = [
  { step: '01', title: 'Connect MetaMask', desc: 'Link your Ethereum wallet with a single click.' },
  { step: '02', title: 'Browse or Create', desc: 'Explore verified campaigns or launch your own.' },
  { step: '03', title: 'Donate On-Chain', desc: 'Send ETH directly to the smart contract treasury.' },
  { step: '04', title: 'Vote on Milestones', desc: 'Approve fund releases when proofs are provided.' },
];

export default function Index() {
  const featured = mockCampaigns.filter(c => c.verified).slice(0, 3);

  return (
    <div className="min-h-screen pt-16">
      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
              <Blocks className="w-3.5 h-3.5" />
              Blockchain-Powered Transparency
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-none tracking-tight">
              Fund the Future,{' '}
              <span className="text-primary glow-text">Trustlessly</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Every donation is immutable. Every withdrawal is transparent. Smart contracts lock funds until your community votes to release them — no trust required.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/explore">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary px-8 h-12 text-base gap-2">
                  Explore Campaigns <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary h-12 px-8 text-base">
                  Launch a Campaign
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
              {[
                { label: 'Smart Contract Secured', icon: <Shield className="w-3.5 h-3.5" /> },
                { label: 'IPFS Proof Storage', icon: <FileText className="w-3.5 h-3.5" /> },
                { label: 'DAO Voting', icon: <Vote className="w-3.5 h-3.5" /> },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-primary">{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <StatsBar stats={defaultStats()} />
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            <Zap className="w-3.5 h-3.5" /> How It Works
          </div>
          <h2 className="text-3xl font-bold text-foreground">Four Steps to Trustless Giving</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto relative">
          <div className="absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden md:block" />
          {steps.map((s, i) => (
            <div key={i} className="relative text-center p-6 rounded-xl bg-card border border-border group hover:border-primary/40 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono font-bold text-sm mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                {s.step}
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className="container mx-auto px-4 py-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground">Why FundChain?</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Every feature is built to solve a real trust problem in traditional crowdfunding.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FEATURED CAMPAIGNS ───── */}
      <section className="container mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured Campaigns</h2>
            <p className="text-muted-foreground text-sm mt-1">Verified by our admin smart contract</p>
          </div>
          <Link to="/explore" className="flex items-center gap-1 text-primary text-sm hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map(c => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative rounded-2xl bg-card border border-primary/20 p-10 text-center overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-foreground mb-3">Ready to make an impact?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Deploy your campaign in minutes. Your donors will see every transaction on the blockchain.</p>
            <Link to="/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12 px-8 text-base gap-2">
                Create Campaign <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">FundChain — Decentralized Crowdfunding</p>
          <p className="text-xs">Built on Ethereum • IPFS Storage • DAO Governance • Hackathon Demo</p>
        </div>
      </footer>
    </div>
  );
}
