/**
 * MongoDB connection checker — `npm run check:db` in the server folder.
 *
 * "Could not connect" has four very different causes that all look identical
 * from the app: a typo in the URI, DNS not resolving the cluster, the network
 * blocking port 27017, and Atlas refusing this IP or these credentials. This
 * walks the layers one at a time and stops at the first one that fails, so the
 * answer is the thing you actually have to fix.
 *
 * The password is never printed.
 */
import dns from 'node:dns/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../.env') });

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};
const ok = (m) => console.log(`${c.green}  ✔${c.reset} ${m}`);
const bad = (m) => console.log(`${c.red}  ✘${c.reset} ${m}`);
const info = (m) => console.log(`${c.dim}    ${m}${c.reset}`);
const head = (m) => console.log(`\n${c.bold}${m}${c.reset}`);

const verdict = (title, ...lines) => {
  console.log(`\n${c.red}${c.bold}  ${title}${c.reset}`);
  lines.forEach((l) => console.log(`  ${l}`));
  console.log('');
  process.exit(1);
};

const uri = process.env.MONGO_URI;

console.log(`\n${c.bold}${c.cyan}Muldhon — database connection check${c.reset}`);

/* ---------- 1. Is MONGO_URI set and parseable? ---------- */
head('1. MONGO_URI');

if (!uri) {
  bad('MONGO_URI is not set.');
  verdict(
    'MONGO_URI নেই।',
    'server/.env ফাইলে MONGO_URI লাইনটা যোগ করুন, তারপর আবার চালান।',
    `${c.dim}server/.env.example ফাইলে উদাহরণ আছে।${c.reset}`
  );
}

const isSrv = uri.startsWith('mongodb+srv://');
let host;
let user;
try {
  const after = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const credentials = after.includes('@') ? after.split('@')[0] : '';
  user = credentials.split(':')[0] || '(none)';
  host = after.split('@').pop().split('/')[0].split('?')[0];
} catch {
  verdict('MONGO_URI পড়া গেল না।', 'ফরম্যাট ঠিক আছে কিনা দেখুন।');
}

ok(`Type: ${isSrv ? 'Atlas (mongodb+srv)' : 'standard (mongodb://)'}`);
ok(`Host: ${host}`);
ok(`User: ${user}`);

const rawPassword = (() => {
  const after = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  if (!after.includes('@')) return '';
  return after.split('@')[0].split(':').slice(1).join(':');
})();

if (/[@:/?#]/.test(decodeURIComponent(rawPassword || ''))
    && rawPassword === decodeURIComponent(rawPassword || '')) {
  console.log(`${c.yellow}  !${c.reset} পাসওয়ার্ডে @ : / ? বা # আছে কিন্তু URL-encode করা নেই — এটা কানেকশন ভাঙতে পারে।`);
}

/* ---------- 2. Does the hostname resolve? ---------- */
head('2. DNS');

let hosts = [];
try {
  if (isSrv) {
    const srv = await dns.resolveSrv(`_mongodb._tcp.${host}`);
    hosts = srv.map((s) => ({ host: s.name, port: s.port }));
    ok(`SRV রেকর্ড পাওয়া গেছে — ${hosts.length} টা সার্ভার`);
    hosts.forEach((h) => info(`${h.host}:${h.port}`));
  } else {
    const [name, port = '27017'] = host.split(':');
    const addrs = await dns.lookup(name, { all: true });
    hosts = [{ host: name, port: Number(port) }];
    ok(`${name} → ${addrs.map((a) => a.address).join(', ')}`);
  }
} catch (error) {
  bad(`DNS ব্যর্থ: ${error.code || error.message}`);
  verdict(
    'ক্লাস্টারের নাম DNS-এ পাওয়া যাচ্ছে না।',
    `হোস্টনেমে টাইপো আছে কিনা দেখুন: ${c.bold}${host}${c.reset}`,
    'অথবা এই মেশিনের DNS কাজ করছে না (ইন্টারনেট কানেকশন দেখুন)।'
  );
}

/* ---------- 3. Is port 27017 reachable at all? ---------- */
head('3. নেটওয়ার্ক (পোর্ট 27017)');

const tryTcp = ({ host: h, port }) =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host: h, port, timeout: 8000 });
    socket.on('connect', () => { socket.destroy(); resolve('open'); });
    socket.on('timeout', () => { socket.destroy(); resolve('timeout'); });
    socket.on('error', (e) => resolve(e.code || 'error'));
  });

const results = await Promise.all(hosts.map(tryTcp));
const reachable = results.some((r) => r === 'open');

hosts.forEach((h, i) => {
  const r = results[i];
  (r === 'open' ? ok : bad)(`${h.host}:${h.port} → ${r}`);
});

if (!reachable) {
  const allTimeout = results.every((r) => r === 'timeout');
  verdict(
    'পোর্ট 27017-এ পৌঁছানো যাচ্ছে না।',
    allTimeout
      ? 'সব কানেকশন টাইমআউট হয়েছে। দুইটা কারণ হতে পারে:'
      : 'কানেকশন রিফিউজড হয়েছে। দুইটা কারণ হতে পারে:',
    '',
    `  ${c.bold}ক)${c.reset} Atlas → Network Access-এ এই IP অ্যালাউ করা নেই।`,
    `     Atlas খুলে "Add IP Address" → "Allow Access from Anywhere (0.0.0.0/0)" দিন।`,
    '',
    `  ${c.bold}খ)${c.reset} আপনার ইন্টারনেট কানেকশন আউটগোয়িং পোর্ট 27017 ব্লক করছে।`,
    `     কিছু অফিস, ক্যাম্পাস আর মোবাইল নেটওয়ার্ক এটা করে।`,
    `     অন্য নেটওয়ার্কে (যেমন মোবাইল হটস্পট) চেষ্টা করে দেখুন — কাজ করলে`,
    `     এটাই কারণ।`
  );
}

/* ---------- 4. Does the driver authenticate and connect? ---------- */
head('4. MongoDB লগইন');

try {
  mongoose.set('strictQuery', true);
  const started = Date.now();
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });
  ok(`কানেক্ট হয়েছে — ${conn.connection.host}/${conn.connection.name} (${Date.now() - started}ms)`);

  const names = (await conn.connection.db.listCollections().toArray()).map((x) => x.name);
  ok(`কালেকশন: ${names.length ? names.join(', ') : '(খালি — npm run seed চালাতে পারেন)'}`);

  const users = await conn.connection.db.collection('users').countDocuments().catch(() => 0);
  ok(`ইউজার সংখ্যা: ${users}`);

  await mongoose.disconnect();

  console.log(`\n${c.green}${c.bold}  সব ঠিক আছে। ডেটাবেস কাজ করছে।${c.reset}`);
  console.log(`  ${c.dim}এখন server ফোল্ডারে npm run dev চালান।${c.reset}\n`);
  process.exit(0);
} catch (error) {
  bad(error.message);

  if (/bad auth|Authentication failed|auth failed|SCRAM/i.test(error.message)) {
    verdict(
      'ইউজারনেম বা পাসওয়ার্ড ভুল।',
      `নেটওয়ার্ক ঠিক আছে — সার্ভারে পৌঁছেছে, কিন্তু লগইন নেয়নি।`,
      '',
      `Atlas → ${c.bold}Database Access${c.reset} খুলুন।`,
      `  • "${user}" নামে ইউজার আছে কিনা দেখুন।`,
      `  • "Edit" → "Edit Password" → নতুন পাসওয়ার্ড দিন।`,
      `  • পাসওয়ার্ডে @ : / ? # না রাখাই ভালো — রাখলে URL-encode করতে হবে।`,
      `  • নতুন পাসওয়ার্ড দিয়ে server/.env-এর MONGO_URI আপডেট করুন।`
    );
  }

  verdict(
    'ড্রাইভার কানেক্ট করতে পারেনি।',
    `উপরের এরর মেসেজটাই মূল সূত্র।`,
    `Atlas ব্যবহার করলে Network Access-এ 0.0.0.0/0 অ্যালাউ আছে কিনা দেখুন।`
  );
}
