import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Info, ArrowLeft, Paperclip } from 'lucide-react';
import api from '../api/axios';
import { Avatar, Tabs } from '../components/ui/Bits';
import { demoContacts, demoThread } from '../data/demo';

const time = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const Messages = () => {
  const [role, setRole] = useState('entrepreneur');
  const [q, setQ] = useState('');
  const [contacts, setContacts] = useState(demoContacts);
  const [active, setActive] = useState(demoContacts[0]);
  const [thread, setThread] = useState(demoThread);
  const [draft, setDraft] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/messages/contacts?role=${role}`)
      .then(({ data }) => {
        if (cancelled || !data.contacts?.length) return;
        setContacts(data.contacts);
        setActive(data.contacts[0]);
      })
      .catch(() => setContacts(demoContacts.filter((c) => c.role === role)));
    return () => {
      cancelled = true;
    };
  }, [role]);

  useEffect(() => {
    if (!active?._id) return;
    api
      .get(`/messages/${active._id}`)
      .then(({ data }) => setThread(data.messages?.length ? data.messages : demoThread))
      .catch(() => setThread(demoThread));
  }, [active]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const filtered = useMemo(
    () => contacts.filter((c) => c.fullName?.toLowerCase().includes(q.toLowerCase())),
    [contacts, q]
  );

  const send = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const optimistic = { _id: `tmp-${Date.now()}`, text, fromAdmin: true, createdAt: new Date().toISOString() };
    setThread((t) => [...t, optimistic]);
    setDraft('');
    try {
      await api.post(`/messages/${active._id}`, { text });
    } catch {
      /* offline demo — optimistic message stays */
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight text-ink">Contacts</h1>

      <div className="card grid h-[calc(100vh-190px)] min-h-[520px] grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
        {/* Contact list */}
        <div
          className={`flex flex-col border-line/70 md:border-r ${
            mobileOpen ? 'hidden' : 'flex'
          } md:flex`}
        >
          <div className="space-y-3 border-b border-line/70 p-4">
            <Tabs
              tabs={[
                { value: 'entrepreneur', label: 'Entrepreneur' },
                { value: 'investor', label: 'Investor' },
              ]}
              value={role}
              onChange={setRole}
            />
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="input h-9 rounded-xl pl-9 text-[13px]"
                placeholder="Search contacts"
              />
            </div>
          </div>

          <ul className="flex-1 space-y-0.5 overflow-y-auto p-2 scroll-thin">
            {filtered.map((c, i) => (
              <motion.li
                key={c._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => {
                    setActive(c);
                    setMobileOpen(true);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${
                    active?._id === c._id ? 'bg-brand-100/70' : 'hover:bg-brand-50/60'
                  }`}
                >
                  <div className="relative">
                    <Avatar src={c.avatar} name={c.fullName} gender={c.gender} size={36} />
                    {c.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">{c.fullName}</p>
                    <p className="truncate text-[11.5px] text-ink-muted">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </button>
              </motion.li>
            ))}
            {!filtered.length && (
              <li className="py-8 text-center text-sm text-ink-soft">No contacts</li>
            )}
          </ul>
          <p className="border-t border-line/70 py-2 text-center text-[11px] text-ink-soft">
            Scroll down to see more
          </p>
        </div>

        {/* Chat */}
        <div className={`flex flex-col ${mobileOpen ? 'flex' : 'hidden'} md:flex`}>
          <header className="flex items-center gap-3 border-b border-line/70 px-4 py-3">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Back to contacts"
              className="grid h-8 w-8 place-items-center rounded-lg border border-line md:hidden"
            >
              <ArrowLeft size={16} />
            </button>
            <Avatar src={active?.avatar} name={active?.fullName} gender={active?.gender} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">{active?.fullName}</p>
              <p className="flex items-center gap-1.5 text-[11.5px] text-brand-600">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Online
              </p>
            </div>
            <button className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-canvas">
              <Info size={17} />
            </button>
          </header>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-canvas/40 p-4 scroll-thin">
            <AnimatePresence initial={false}>
              {thread.map((m) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22 }}
                  className={`flex ${m.fromAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-soft sm:max-w-[65%] ${
                      m.fromAdmin
                        ? 'rounded-br-md bg-sun-200 text-ink'
                        : 'rounded-bl-md bg-brand-100 text-ink'
                    }`}
                  >
                    {m.text}
                    <span className="mt-1 block text-right text-[10px] text-ink-muted/70">
                      {time(m.createdAt)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-line/70 p-3">
            <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-muted hover:bg-canvas">
              <Paperclip size={17} />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="input h-10 rounded-full text-[13px]"
              placeholder="Type something…"
            />
            <motion.button whileTap={{ scale: 0.94 }} type="submit" className="btn-primary shrink-0 rounded-full px-4 py-2.5">
              Send <Send size={14} />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
