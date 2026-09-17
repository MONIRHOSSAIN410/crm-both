import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';

dotenv.config();

const avatar = (seed) => `https://i.pravatar.cc/150?u=${seed}`;
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

// Seeded accounts carry a gender so the dashboard, avatars and any
// gender-based filtering have real data to work with from the first run.
const femaleNames = new Set([
  'Eleanor Pena', 'Darlene Robertson', 'Courtney Henry', 'Jane Cooper', 'Daisy Russell',
  'Emma Hawkins', 'Sabina Khan', 'Mrs. Tasmia Jaman', 'Xoina Begum', 'Sanjida Akter',
  'Nusrat Jahan',
]);
const genderOf = (name) => (femaleNames.has(name) ? 'female' : 'male');

const investorNames = [
  'Jerome Bell', 'Robert Fox', 'Eleanor Pena', 'Darlene Robertson', 'Guy Hawkins',
  'Micheal Kery', 'Arafat Hossain', 'Floyd Miles', 'Wade Warren', 'Courtney Henry',
  'Jacob Jones', 'Marvin McKinney', 'Jane Cooper', 'Daisy Russell', 'Emma Hawkins',
  'Asif Karim', 'K. Rahman', 'Sabina Khan', 'Tawhidul Islam', 'Mojazzem Hossain',
];

const entrepreneurNames = [
  'Mr. Khaled Hasan', 'MD. Farid Chowdhury', 'Mr. Badiul Alam', 'Mrs. Tasmia Jaman',
  'Faruk Ahmed', 'Idris Bhuiya', 'Abdullah Al Mamun', 'Monirul Kabir', 'Xoina Begum',
  'Sanjida Akter', 'Rakib Hasan', 'Nusrat Jahan',
];

const projectSeeds = [
  { title: 'Organic Agro farming', budget: 150000, category: 'Agriculture' },
  { title: 'Green Tech Solution', budget: 250000, category: 'Technology' },
  { title: 'Bangladesh IT Institution for future', budget: 100000, category: 'Education' },
  { title: 'Bangladesh Agriculture Association', budget: 500000, category: 'Agriculture' },
  { title: 'Delta Tech Ltd', budget: 320000, category: 'Technology' },
  { title: 'Apex Agri', budget: 180000, category: 'Agriculture' },
  { title: 'GreenCo Dhaka', budget: 260000, category: 'E-Commerce' },
  { title: 'MediCare Plus', budget: 410000, category: 'Healthcare' },
  { title: 'EduSpark Online', budget: 220000, category: 'Education' },
  { title: 'Riverine Logistics', budget: 350000, category: 'Other' },
];

const run = async () => {
  await connectDB();
  console.log('→ Clearing collections…');
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Payment.deleteMany({}),
    Activity.deleteMany({}),
    Notification.deleteMany({}),
    Message.deleteMany({}),
  ]);

  console.log('→ Creating admin…');
  const admin = await User.create({
    fullName: 'Arghya Biswas',
    email: 'admin@muldhon.com',
    password: '123456',
    gender: 'male',
    role: 'admin',
    status: 'active',
    verified: true,
    online: true,
    phone: '+880 1627441627',
    organization: 'Muldhon',
    avatar: avatar('admin'),
  });

  // Two accounts for checking that login returns the right profile:
  // a male account and a female account, same password.
  await User.create([
    {
      fullName: 'Rakib Hasan',
      email: 'male@muldhon.com',
      password: '123456',
      gender: 'male',
      role: 'investor',
      status: 'active',
      verified: true,
      organization: 'Delta Capital',
      location: 'Dhaka, Bangladesh',
      bio: 'Demo male investor account.',
    },
    {
      fullName: 'Nusrat Jahan',
      email: 'female@muldhon.com',
      password: '123456',
      gender: 'female',
      role: 'investor',
      status: 'active',
      verified: true,
      organization: 'BD Ventures',
      location: 'Dhaka, Bangladesh',
      bio: 'Demo female investor account.',
    },
  ]);

  console.log('→ Creating investors & entrepreneurs…');
  const statuses = ['pending', 'accepted', 'rejected', 'live', 'active'];

  const investors = await Promise.all(
    investorNames.map((name, i) =>
      User.create({
        fullName: name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@mail.com`,
        password: '123456',
        gender: genderOf(name),
        role: 'investor',
        status: i < 8 ? 'active' : pick(statuses),
        phone: `+880 16${rand(10000000, 99999999)}`,
        organization: pick(['Delta Capital', 'BD Ventures', 'Padma Group', 'Investment group']),
        focusArea: pick(['Agriculture, clean energy', 'Technology', 'Healthcare', 'E-Commerce']),
        avatar: avatar(name),
        verified: i % 3 !== 0,
        online: i % 2 === 0,
        totalInvested: rand(15, 95) * 1000,
        fundedProjects: rand(1, 6),
        lastPaymentDate: daysAgo(rand(1, 60)),
        bio: 'Long term investor focused on sustainable Bangladeshi ventures.',
      })
    )
  );

  const entrepreneurs = await Promise.all(
    entrepreneurNames.map((name, i) =>
      User.create({
        fullName: name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@mail.com`,
        password: '123456',
        gender: genderOf(name),
        role: 'entrepreneur',
        status: i < 6 ? 'active' : pick(statuses),
        phone: `+880 17${rand(10000000, 99999999)}`,
        organization: pick(['Delta Tech Ltd', 'Apex Agri', 'GreenCo Dhaka', 'Business name']),
        focusArea: pick(['Agro processing', 'SaaS', 'Renewable energy', 'Logistics']),
        avatar: avatar(name),
        verified: i % 2 === 0,
        online: i % 3 === 0,
        bio: 'Building a scalable venture from Dhaka.',
      })
    )
  );

  console.log('→ Creating projects…');
  const projects = await Promise.all(
    projectSeeds.map((p, i) => {
      const owner = entrepreneurs[i % entrepreneurs.length];
      return Project.create({
        ...p,
        owner: owner._id,
        ownerName: owner.fullName,
        description: `${p.title} is seeking funding to scale operations across Bangladesh.`,
        raised: Math.round(p.budget * (rand(20, 90) / 100)),
        totalInvestors: rand(2, 12),
        status: i < 4 ? 'pending' : pick(['approved', 'live', 'closed', 'rejected']),
        deadline: new Date(Date.now() + rand(30, 240) * 86400000),
      });
    })
  );

  console.log('→ Creating escrow payments…');
  const payStatuses = ['In Escrow', 'Released', 'Refunded'];
  const payments = [];
  for (let i = 0; i < 60; i += 1) {
    const investor = pick(investors);
    const project = pick(projects);
    const entrepreneur = entrepreneurs.find((e) => String(e._id) === String(project.owner)) || pick(entrepreneurs);
    const amount = rand(5, 40) * 5000;
    payments.push({
      dealId: `#${1080 + i}`,
      date: daysAgo(rand(0, 180)),
      investor: investor._id,
      investorName: investor.fullName,
      entrepreneur: entrepreneur._id,
      entrepreneurName: entrepreneur.organization || entrepreneur.fullName,
      project: project._id,
      projectName: project.title,
      amount,
      commission: Math.round(amount * 0.03),
      status: pick(payStatuses),
      method: pick(['BRAC Bank', 'bKash', 'Nagad', 'City Bank']),
      reference: `TRX-${rand(100000, 999999)}`,
    });
  }
  await Payment.insertMany(payments);

  console.log('→ Creating activity logs…');
  const modules = ['Projects', 'Payments', 'Accounts', 'Messages', 'System', 'Reports'];
  const actions = [
    'Updated project', 'Project changed', 'Failed project', 'Released escrow',
    'Approved application', 'Rejected application', 'Sent message', 'Exported report',
  ];
  const activities = [];
  for (let i = 0; i < 90; i += 1) {
    const u = pick([...investors, ...entrepreneurs, admin]);
    const failed = i % 11 === 0;
    activities.push({
      user: u._id,
      userName: u.fullName,
      userEmail: u.email,
      userAvatar: u.avatar,
      activity: pick(actions),
      module: pick(modules),
      projectId: `TI-${rand(10, 99)}`,
      status: failed ? 'Failed' : pick(['Success', 'Success', 'Success', 'Pending']),
      isAdminAction: i % 4 === 0,
      description: 'Project details & investment target updated. All requirements are matched.',
      createdAt: daysAgo(rand(0, 20)),
      changes: {
        paymentStatus: { from: 'Pending', to: 'Active' },
        investmentTarget: { from: 500000, to: 750000 },
        deadline: { from: 'Aug 20, 2026', to: 'Sep 05, 2026' },
      },
      comments: i % 7 === 0 ? [{ author: 'Admin', text: 'Verified and approved.' }] : [],
    });
  }
  await Activity.insertMany(activities);

  console.log('→ Creating notifications…');
  await Notification.insertMany([
    { title: 'Action Required: Your bank balance is below 30 days of burn rate.', type: 'action', read: false, createdAt: daysAgo(2) },
    { title: 'New Lead: [Name] submitted a contact form via the website.', type: 'lead', read: false, createdAt: daysAgo(1) },
    { title: 'Milestone Delayed: "Q3 Marketing Launch" missed the deadline with 3 open tasks.', type: 'milestone', read: false, createdAt: daysAgo(1) },
    { title: 'Payment Failed: Invoice #2036-BDA was rejected by the gateway.', type: 'payment', read: true, createdAt: daysAgo(1) },
    { title: 'Task Complete: [Member] marked "Update Copy" as done.', type: 'task', read: true, createdAt: daysAgo(1) },
    { title: 'Payout Sent: Stripe initiated a transfer of [Amount] to your bank.', type: 'payout', read: true, createdAt: daysAgo(2) },
    { title: 'New investor application received for review.', type: 'system', read: false, createdAt: daysAgo(3) },
    { title: 'Escrow released for deal #1094.', type: 'payment', read: true, createdAt: daysAgo(4) },
  ]);

  console.log('→ Creating chat messages…');
  const chatWith = [...entrepreneurs.slice(0, 6), ...investors.slice(0, 6)];
  const msgs = [];
  chatWith.forEach((u) => {
    msgs.push(
      { conversation: String(u._id), sender: u._id, senderName: u.fullName, receiver: admin._id, text: 'Hello,', fromAdmin: false, createdAt: daysAgo(2) },
      { conversation: String(u._id), sender: u._id, senderName: u.fullName, receiver: admin._id, text: 'can I get some help here?', fromAdmin: false, createdAt: daysAgo(2) },
      { conversation: String(u._id), sender: admin._id, senderName: admin.fullName, receiver: u._id, text: 'Hello sir!', fromAdmin: true, createdAt: daysAgo(2) },
      { conversation: String(u._id), sender: admin._id, senderName: admin.fullName, receiver: u._id, text: 'How may I help you?', fromAdmin: true, createdAt: daysAgo(2) },
      { conversation: String(u._id), sender: u._id, senderName: u.fullName, receiver: admin._id, text: 'I am facing some issue while submitting my documents, can you help me to complete the process.', fromAdmin: false, createdAt: daysAgo(1) },
      { conversation: String(u._id), sender: admin._id, senderName: admin.fullName, receiver: u._id, text: 'Sure, sir… can you tell me specific the exact problem?', fromAdmin: true, createdAt: daysAgo(1) },
      { conversation: String(u._id), sender: u._id, senderName: u.fullName, receiver: admin._id, text: 'When I try to upload the document nothing happens. I checked the file size too.', fromAdmin: false, read: false, createdAt: daysAgo(0) }
    );
  });
  await Message.insertMany(msgs);

  console.log('\n\x1b[32m✔ Seed complete\x1b[0m');
  console.log('  Admin login  → admin@muldhon.com  / 123456');
  console.log('  Male login   → male@muldhon.com   / 123456');
  console.log('  Female login → female@muldhon.com / 123456');
  console.log(`  ${investors.length} investors, ${entrepreneurs.length} entrepreneurs, ${projects.length} projects, ${payments.length} payments`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
