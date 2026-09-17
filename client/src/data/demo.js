/**
 * Offline fallback data.
 * Every page calls the real API first; if the server is not running yet
 * (or Mongo has not been seeded) these values keep the UI fully populated
 * so the design can be reviewed straight away.
 */

const av = (s) => `https://i.pravatar.cc/150?u=${s}`;
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

export const demoDashboard = {
  cards: {
    regInvestors: 500,
    regEntrepreneurs: 500,
    activeInvestors: 500,
    pending: 500,
    totalProjects: 500,
    rejectedProjects: 500,
    totalInvestment: 5000000,
  },
  investmentTrend: [
    { label: 'Jan', value: 2400000 },
    { label: 'Feb', value: 2150000 },
    { label: 'Mar', value: 2600000 },
    { label: 'Apr', value: 2300000 },
    { label: 'May', value: 2050000 },
    { label: 'Jun', value: 2900000 },
    { label: 'Jul', value: 3400000 },
    { label: 'Aug', value: 3900000 },
    { label: 'Sep', value: 4400000 },
    { label: 'Oct', value: 5000000 },
  ],
  projectStatus: { pending: 100, approved: 50, live: 10, closed: 40, rejected: 12 },
  systemStatus: { totalUsers: 2000, activeUsers: 1000, maintenanceMode: false, serverStatus: 'Online' },
  recentProjects: [
    { _id: 'p1', title: 'Organic Agro farming', budget: 150000, ownerName: 'Mr. Khaled Hasan', status: 'pending' },
    { _id: 'p2', title: 'Green Tech Solution', budget: 250000, ownerName: 'MD. Farid Chowdhury', status: 'pending' },
    { _id: 'p3', title: 'Bangladesh IT Institution for future', budget: 100000, ownerName: 'Mr. Badiul Alam', status: 'pending' },
    { _id: 'p4', title: 'Bangladesh Agriculture Association', budget: 500000, ownerName: 'Mrs. Tasmia Jaman', status: 'pending' },
  ],
  recentActivity: [
    { _id: 'a1', activity: 'new project has been approved', createdAt: daysAgo(2), highlight: 'been approved' },
    { _id: 'a2', activity: 'new transection 2 lac BDT has been made', createdAt: daysAgo(2), highlight: 'has been made' },
    { _id: 'a3', activity: 'new intrapreneur has been added by milan', createdAt: daysAgo(2), highlight: 'has been added by milan' },
    { _id: 'a4', activity: 'new project has been approved', createdAt: daysAgo(2), highlight: 'been approved' },
  ],
};

const applicantNames = ['Jacob Jones', 'Floyd Miles', 'Wade Warren', 'Courtney Henry'];

export const demoApplications = applicantNames.map((name, i) => ({
  _id: `ap${i}`,
  fullName: name,
  email: 'example@mail.com',
  phone: ['+880-1627441627', '+880-1734669586', '+880-1541608548', '+880-1819753642'][i],
  createdAt: daysAgo(i * 3),
  ref: ['9/4/12', '12/10/13', '1/15/12', '5/27/15'][i],
  avatar: av(name),
  status: 'pending',
}));

export const demoAccounts = ['Guy Hawkins', 'Micheal Kery', 'Arafat Hossain', 'Guy Hawkins'].map(
  (name, i) => ({ _id: `ac${i}`, fullName: name, email: 'example@mail.com', avatar: av(name + i) })
);

export const demoTopInvestors = [
  { _id: 't1', fullName: 'Jerome Bell', totalInvested: 95000, avatar: av('Jerome Bell') },
  { _id: 't2', fullName: 'Robert Fox', totalInvested: 75000, avatar: av('Robert Fox') },
  { _id: 't3', fullName: 'Eleanor Pena', totalInvested: 60000, avatar: av('Eleanor Pena') },
  { _id: 't4', fullName: 'Darlene Robertson', totalInvested: 45000, avatar: av('Darlene Robertson') },
];

export const demoInvestorStats = { total: 5000, active: 500, pending: 500 };
export const demoEntrepreneurStats = { total: 5000, active: 500, activeInvestors: 500, pending: 500 };

export const demoPayments = {
  summary: { totalFundsInEscrow: 1245000, totalMilestonePayouts: 620000, commission: 38200 },
  ledger: [
    { _id: 'l1', date: '2026-07-12', dealId: '#1082', investorName: 'Asif Karim', entrepreneurName: 'Delta Tech Ltd', amount: 25000, status: 'Refunded' },
    { _id: 'l2', date: '2026-07-03', dealId: '#1085', investorName: 'K. Rahman', entrepreneurName: 'Apex Agri', amount: 15000, status: 'Released' },
    { _id: 'l3', date: '2026-06-28', dealId: '#1091', investorName: 'Sabina Khan', entrepreneurName: 'Delta Tech Ltd', amount: 25000, status: 'In Escrow' },
    { _id: 'l4', date: '2026-07-04', dealId: '#1081', investorName: 'Sabina Khan', entrepreneurName: 'GreenCo Dhaka', amount: 130000, status: 'Refunded' },
    { _id: 'l5', date: '2026-07-12', dealId: '#1092', investorName: 'K. Rahman', entrepreneurName: 'Delta Tech Ltd', amount: 150000, status: 'In Escrow' },
    { _id: 'l6', date: '2026-07-12', dealId: '#1092', investorName: 'Asif Karim', entrepreneurName: 'Apex Agri', amount: 25000, status: 'In Escrow' },
    { _id: 'l7', date: '2026-06-28', dealId: '#1080', investorName: 'K. Rahman', entrepreneurName: 'GreenCo Dhaka', amount: 130000, status: 'Released' },
  ],
  projectWise: [
    { projectName: 'Delta Tech Ltd', totalFundsRaised: 200000, totalInvestors: 3, currentStatus: 'In Escrow' },
    { projectName: 'Apex Agri', totalFundsRaised: 40000, totalInvestors: 2, currentStatus: 'Released' },
    { projectName: 'GreenCo Dhaka', totalFundsRaised: 260000, totalInvestors: 2, currentStatus: 'Refunded' },
  ],
  investorWise: [
    { investorName: 'Asif Karim', totalInvestedAmount: 50000, fundedProjects: 2, lastPaymentDate: daysAgo(20) },
    { investorName: 'K. Rahman', totalInvestedAmount: 295000, fundedProjects: 3, lastPaymentDate: daysAgo(9) },
    { investorName: 'Sabina Khan', totalInvestedAmount: 155000, fundedProjects: 2, lastPaymentDate: daysAgo(14) },
  ],
};

export const demoNotifications = [
  { _id: 'n1', title: 'Action Required: Your bank balance is below 30 days of burn rate.', createdAt: daysAgo(2.25), read: false },
  { _id: 'n2', title: 'New Lead: [Name] submitted a contact form via the website.', createdAt: daysAgo(1.6), read: false },
  { _id: 'n3', title: 'Milestone Delayed: "Q3 Marketing Launch" missed the deadline with 3 open tasks.', createdAt: daysAgo(0.7), read: false },
  { _id: 'n4', title: 'Payment Failed: Invoice #2036-BDA was rejected by the gateway.', createdAt: daysAgo(0.95), read: true },
  { _id: 'n5', title: 'Task Complete: [Member] marked "Update Copy" as done.', createdAt: daysAgo(1.05), read: true },
  { _id: 'n6', title: 'Payout Sent: Stripe initiated a transfer of [Amount] to your bank.', createdAt: daysAgo(1.5), read: true },
  { _id: 'n7', title: 'New investor application received for review.', createdAt: daysAgo(3), read: false },
  { _id: 'n8', title: 'Escrow released for deal #1094.', createdAt: daysAgo(4), read: true },
];

export const demoContacts = [
  'Tawhidul Islam', 'Mojazzem', 'Sanjoy Ghosh', 'Sanjida Akter', 'Faruk Ahmed',
  'Idris Bhuiya', 'Abdullah Al Mamun', 'Monirul Kabir', 'Xoina Begum', 'Xoina Begum',
].map((name, i) => ({
  _id: `c${i}`,
  fullName: name,
  avatar: av(name + i),
  role: i % 2 ? 'investor' : 'entrepreneur',
  online: i < 4,
  lastMessage: 'Can you help me with the upload?',
  unread: i === 0 ? 2 : 0,
}));

export const demoThread = [
  { _id: 'm1', text: 'Hello,', fromAdmin: false, createdAt: daysAgo(1) },
  { _id: 'm2', text: 'can I get some help here?', fromAdmin: false, createdAt: daysAgo(1) },
  { _id: 'm3', text: 'Hello sir!', fromAdmin: true, createdAt: daysAgo(1) },
  { _id: 'm4', text: 'How may I help you?', fromAdmin: true, createdAt: daysAgo(1) },
  { _id: 'm5', text: 'I am facing some issue while submitting my documents, can you help me to complete the process.', fromAdmin: false, createdAt: daysAgo(0.5) },
  { _id: 'm6', text: 'Sure, sir … can you tell me exactly the problem?', fromAdmin: true, createdAt: daysAgo(0.4) },
  { _id: 'm7', text: "When I try to upload the document nothing happens. I've checked the file size and format already, but it still won't go through — can you guide me through the whole process?", fromAdmin: false, createdAt: daysAgo(0.2) },
];

export const demoActivityStats = { total: 12842, today: 284, adminActions: 86, canceled: 17 };

export const demoActivities = [
  'Marvin McKinney', 'Jane Cooper', 'Robert Fox', 'Tawhidul Islam', 'Daisy Russell',
  'Darlene Robertson', 'Emma Hawkins',
].map((name, i) => ({
  _id: `lg${i}`,
  userName: name,
  userEmail: ['marvin', 'debbie', 'felicia', 'tawhidul', 'daisy', 'kenzi', 'kenzi'][i] + '@example.com',
  userAvatar: av(name),
  activity: i === 3 ? 'Project changed' : i === 6 ? 'Failed project' : 'Updated project',
  module: i === 3 ? 'Payments' : 'Projects',
  projectId: 'TI-11',
  createdAt: daysAgo(i * 0.4),
  status: i === 6 ? 'Failed' : 'Success',
  description: 'Project details & investment target updated. All requirements are matched.',
  changes: {
    paymentStatus: { from: 'Pending', to: 'Active' },
    investmentTarget: { from: 500000, to: 750000 },
    deadline: { from: 'Aug 20, 2026', to: 'Sep 05, 2026' },
  },
  comments: [],
}));

export const demoReports = {
  cards: { totalInvestment: 12800000, activeInvestors: 248, totalEntrepreneurs: 184, successfulProjects: 27 },
  topClients: [
    { fullName: 'ID - TP', totalInvested: 790000 },
    { fullName: 'ID - IRB', totalInvested: 550000 },
    { fullName: 'ID - QBZ', totalInvested: 380000 },
  ],
  donutTotal: 5824213,
  activePercentage: { online: 179, offline: 294, total: 594 },
  byCategory: [
    { category: 'Technology', percent: 80 },
    { category: 'Agriculture', percent: 65 },
    { category: 'E-Commerce', percent: 61 },
    { category: 'Healthcare', percent: 51 },
    { category: 'Education', percent: 38 },
  ],
  visits: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 140 + Math.round(70 * Math.sin(i / 3.1) + 45 * Math.sin(i / 1.6) + i * 1.4),
    prev: 130 + Math.round(55 * Math.cos(i / 2.6) + 30 * Math.sin(i / 2.1)),
  })),
};
