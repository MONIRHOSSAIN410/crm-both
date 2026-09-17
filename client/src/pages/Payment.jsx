import { motion } from 'framer-motion';
import { Wallet, Banknote, Percent, CheckCircle2 } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { Card, SectionHead, Pill, bdt, fmtDate } from '../components/ui/Bits';
import useFetch from '../hooks/useFetch';
import { demoPayments } from '../data/demo';

const Table = ({ head, children, minWidth = 640 }) => (
  <div className="-mx-1 overflow-x-auto scroll-thin">
    <table className="w-full border-collapse text-left" style={{ minWidth }}>
      <thead>
        <tr className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
          {head.map((h) => (
            <th key={h} className="whitespace-nowrap px-3 py-2.5">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-[13px]">{children}</tbody>
    </table>
  </div>
);

const instructions = [
  {
    title: 'Check Platform Bank Statement:',
    body: 'Every escrow transaction should match a real deposit. Verify the investor sent the money to the platform account before marking a deal as funded.',
  },
  {
    title: 'Verify Identity Match:',
    body: 'Ensure the sender name on the bank statement matches the investor name on file. Mismatched senders must be confirmed before release.',
  },
  {
    title: 'Update Escrow Status Below:',
    body: 'If the money has cleared, click "Confirm Receipt" to lock it in escrow. If the money has not arrived after 48 hours, click "Flag / Reject".',
  },
];

const Payment = () => {
  const { data } = useFetch('/payments/summary', { fallback: demoPayments });
  const { data: ledgerRes } = useFetch('/payments?limit=12', { fallback: { payments: demoPayments.ledger } });

  const summary = data?.summary || demoPayments.summary;
  const ledger = ledgerRes?.payments?.length ? ledgerRes.payments : demoPayments.ledger;
  const projectWise = data?.projectWise?.length ? data.projectWise : demoPayments.projectWise;
  const investorWise = data?.investorWise?.length ? data.investorWise : demoPayments.investorWise;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight text-ink">Payment</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Funds in Escrow" value={summary.totalFundsInEscrow} suffix=" BDT" delta="+12% this month" tone="green" icon={Wallet} index={0} />
        <StatCard label="Total Milestone Payouts" value={summary.totalMilestonePayouts} suffix=" BDT" delta="-2% this month" deltaTone="down" tone="lav" icon={Banknote} index={1} />
        <StatCard label="Your Commission (5%)" value={summary.commission} suffix=" BDT" tone="sun" icon={Percent} index={2} />
      </div>

      <Card delay={0.1}>
        <SectionHead title="Master Escrow Ledger" sub="Every investor deposit held by the platform" />
        <Table head={['Date', 'Deal ID', 'Investor (Payer)', 'Entrepreneur (Receiver)', 'Amount', 'Status']} minWidth={720}>
          {ledger.map((r, i) => (
            <motion.tr
              key={r._id || i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={i % 2 === 0 ? 'bg-brand-50/60' : 'bg-white'}
            >
              <td className="whitespace-nowrap px-3 py-2.5 text-ink-muted">{fmtDate(r.date)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-ink">{r.dealId}</td>
              <td className="whitespace-nowrap px-3 py-2.5">{r.investorName}</td>
              <td className="whitespace-nowrap px-3 py-2.5">{r.entrepreneurName}</td>
              <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{bdt(r.amount)}</td>
              <td className="whitespace-nowrap px-3 py-2.5">
                <Pill status={r.status} />
              </td>
            </motion.tr>
          ))}
        </Table>
      </Card>

      <div className="grid gap-5 2xl:grid-cols-2">
        <Card delay={0.16}>
          <SectionHead title="Project-Wise Total Investment" />
          <Table head={['Project Name', 'Total Funds Raised', 'Total Investors', 'Current Status']} minWidth={520}>
            {projectWise.map((p, i) => (
              <tr key={p.projectName || i} className="border-t border-line/70">
                <td className="px-3 py-2.5 font-medium">{p.projectName}</td>
                <td className="px-3 py-2.5">{bdt(p.totalFundsRaised)}</td>
                <td className="px-3 py-2.5">{p.totalInvestors}</td>
                <td className="px-3 py-2.5">
                  <Pill status={p.currentStatus} />
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card delay={0.2}>
          <SectionHead title="Investor-Wise Total Investment" />
          <Table head={['Investor Name', 'Total Invested Amount', 'Funded Projects', 'Last Payment Date']} minWidth={520}>
            {investorWise.map((p, i) => (
              <tr key={p.investorName || i} className="border-t border-line/70">
                <td className="px-3 py-2.5 font-medium">{p.investorName}</td>
                <td className="px-3 py-2.5">{bdt(p.totalInvestedAmount)}</td>
                <td className="px-3 py-2.5">{p.fundedProjects}</td>
                <td className="px-3 py-2.5 text-ink-muted">{fmtDate(p.lastPaymentDate)}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <Card delay={0.26}>
        <SectionHead title="Step-by-Step Admin Instructions" sub="Follow in order" />
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <ol className="space-y-4">
            {instructions.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex gap-3"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">{s.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{s.body}</p>
                </div>
              </motion.li>
            ))}
            <li className="flex flex-wrap gap-2 pt-1">
              <button className="btn-primary py-2 text-xs">
                <CheckCircle2 size={14} /> Confirm Receipt
              </button>
              <button className="btn-ghost py-2 text-xs text-rose-600">Flag / Reject</button>
            </li>
          </ol>

          <div className="hidden place-items-center overflow-hidden rounded-2xl bg-brand-50 p-6 lg:grid">
            <svg viewBox="0 0 200 200" role="img" aria-label="Escrow verification checklist" className="w-full max-w-[200px]">
              <circle cx="100" cy="100" r="86" fill="#D7F4E1" />
              <rect x="52" y="40" width="96" height="120" rx="12" fill="#fff" stroke="#B0E8C5" strokeWidth="2" />
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(0 ${i * 30})`}>
                  <circle cx="72" cy="72" r="8" fill="#12904D" />
                  <path d="M68 72l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="88" y="66" width="46" height="5" rx="2.5" fill="#0E5A34" opacity="0.8" />
                  <rect x="88" y="76" width="30" height="4" rx="2" fill="#9AA8A1" opacity="0.6" />
                </g>
              ))}
              <circle cx="146" cy="150" r="24" fill="#F5D547" />
              <path d="M137 150l6 6 12-13" stroke="#0B3D24" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Payment;
