import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Eye, Coins, Blocks, Vote, FileText, Lock, Zap, ChevronRight } from 'lucide-react';
import CampaignCard from '@/components/CampaignCard';
import StatsBar, { defaultStats } from '@/components/StatsBar';
import { mockCampaigns } from '@/data/mockData';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { t } = useTranslation();
  const featured = mockCampaigns.filter(c => c.verified).slice(0, 3);

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
    { step: '01', title: t('home.how.step1.title'), desc: t('home.how.step1.desc') },
    { step: '02', title: t('home.how.step2.title'), desc: t('home.how.step2.desc') },
    { step: '03', title: t('home.how.step3.title'), desc: t('home.how.step3.desc') },
    { step: '04', title: t('home.how.step4.title'), desc: t('home.how.step4.desc') },
  ];

  return (
    <div className="min-h-screen pt-16 bg-background text-foreground transition-colors duration-300">
      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10 text-shadow-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold mb-6 tracking-wide uppercase shadow-sm">
              <Blocks className="w-3.5 h-3.5" />
              {t('home.hero.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-none tracking-tight">
              {t('home.hero.title')},{' '}
              <span className="text-primary glow-text drop-shadow-md">{t('home.hero.titleHighlight')}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('home.hero.desc')}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/explore">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary px-8 h-12 text-base gap-2 font-semibold shadow-xl shadow-primary/20">
                  {t('home.hero.explore')} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary h-12 px-8 text-base font-medium glassmorphism shadow-sm">
                  {t('home.hero.create')}
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
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full glassmorphism">
                  <span className="text-primary">{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <StatsBar stats={defaultStats()} />
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            <Zap className="w-3.5 h-3.5" /> {t('home.how.title')?.split(' ')[0]} It Works
          </div>
          <h2 className="text-3xl font-bold text-foreground drop-shadow-sm">{t('home.how.title')}</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto relative">
          <div className="absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden md:block shadow-sm" />
          {steps.map((s, i) => (
            <div key={i} className="relative text-center p-6 rounded-2xl bg-card border border-border/50 group hover:border-primary/40 transition-all hover:-translate-y-1 glassmorphism shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono font-bold text-sm mx-auto mb-4 group-hover:bg-primary/20 transition-colors shadow-inner">
                {s.step}
              </div>
              <h3 className="font-bold text-foreground mb-1.5">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className="container mx-auto px-4 py-6 pb-24 relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground drop-shadow-sm">{t('home.features.title')}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group glassmorphism shadow-sm hover:shadow-lg hover:shadow-primary/5">
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center border border-white/5 ${f.color} mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FEATURED CAMPAIGNS ───── */}
      <section className="container mx-auto px-4 pb-24 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground drop-shadow-sm">{t('home.featured.title')}</h2>
          </div>
          <Link to="/explore" className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline">
            {t('home.featured.viewAll')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map(c => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      </section>

    </div>
  );
}
