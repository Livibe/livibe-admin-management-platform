export type ClientStatus = 'cold_lead' | 'warm_lead' | 'active_opportunity' | 'client' | 'past_client';
export type Industry = 'concert_organizer' | 'brand' | 'agency' | 'venue' | 'festival' | 'corporate' | 'other';
export type DealStage = 'lead_identified' | 'contacted' | 'meeting_scheduled' | 'proposal_sent' | 'negotiation' | 'confirmed' | 'completed' | 'lost';
export type ActivityType = 'meeting' | 'email' | 'call' | 'proposal' | 'whatsapp' | 'note' | 'task';
export type TaskStatus = 'pending' | 'done' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'viewer';
  avatar?: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface Client {
  id: string;
  companyName: string;
  industry: Industry;
  country: string;
  city: string;
  website?: string;
  status: ClientStatus;
  tags: string[];
  ownerId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  clientId: string;
  contactId: string;
  ownerId: string;
  eventName: string;
  eventDate: string;
  eventCountry: string;
  eventCity: string;
  audienceSize: number;
  wristbandQty: number;
  dealValue: number;
  currency: string;
  probability: number;
  stage: DealStage;
  lostReason?: string;
  expectedClose: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  clientId: string;
  dealId?: string;
  ownerId: string;
  type: ActivityType;
  subject: string;
  body: string;
  occurredAt: string;
}

export interface Task {
  id: string;
  dealId?: string;
  clientId?: string;
  assignedTo: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export const users: User[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah@livibe.co', role: 'admin' },
  { id: 'u2', name: 'James Park', email: 'james@livibe.co', role: 'sales' },
  { id: 'u3', name: 'Ming Wei', email: 'ming@livibe.co', role: 'sales' },
  { id: 'u4', name: 'Aisha Tanaka', email: 'aisha@livibe.co', role: 'sales' },
];

export const clients: Client[] = [
  {
    id: 'c1', companyName: 'AEG Presents Asia', industry: 'concert_organizer',
    country: 'Japan', city: 'Tokyo', website: 'aegpresents.jp',
    status: 'active_opportunity', tags: ['Concert Promoter', 'Festival Organizer'],
    ownerId: 'u1', createdAt: '2025-11-01', updatedAt: '2026-03-10',
  },
  {
    id: 'c2', companyName: 'Live Nation Korea', industry: 'concert_organizer',
    country: 'South Korea', city: 'Seoul', website: 'livenation.kr',
    status: 'client', tags: ['Concert Promoter'],
    ownerId: 'u2', createdAt: '2025-09-15', updatedAt: '2026-03-08',
  },
  {
    id: 'c3', companyName: 'Ultra Music Festival', industry: 'festival',
    country: 'South Korea', city: 'Seoul', website: 'ultrakorea.com',
    status: 'active_opportunity', tags: ['Festival Organizer', 'Concert Promoter'],
    ownerId: 'u2', createdAt: '2025-10-20', updatedAt: '2026-03-05',
  },
  {
    id: 'c4', companyName: 'Dentsu Creative Asia', industry: 'agency',
    country: 'Japan', city: 'Tokyo', website: 'dentsu.com',
    status: 'warm_lead', tags: ['Brand Activation', 'Corporate Event'],
    ownerId: 'u3', createdAt: '2026-01-10', updatedAt: '2026-03-09',
  },
  {
    id: 'c5', companyName: 'Marina Bay Sands', industry: 'venue',
    country: 'Singapore', city: 'Singapore', website: 'marinabaysands.com',
    status: 'client', tags: ['Venue', 'Corporate Event'],
    ownerId: 'u1', createdAt: '2025-08-01', updatedAt: '2026-02-20',
  },
  {
    id: 'c6', companyName: 'ONE Championship', industry: 'corporate',
    country: 'Singapore', city: 'Singapore', website: 'onefc.com',
    status: 'warm_lead', tags: ['Corporate Event', 'Brand Activation'],
    ownerId: 'u3', createdAt: '2026-01-25', updatedAt: '2026-03-01',
  },
  {
    id: 'c7', companyName: 'GMM Grammy Live', industry: 'concert_organizer',
    country: 'Thailand', city: 'Bangkok', website: 'gmmgrammy.com',
    status: 'active_opportunity', tags: ['Concert Promoter', 'Event Organizer'],
    ownerId: 'u4', createdAt: '2025-12-01', updatedAt: '2026-03-11',
  },
  {
    id: 'c8', companyName: 'Samsung Electronics', industry: 'brand',
    country: 'South Korea', city: 'Seoul', website: 'samsung.com',
    status: 'cold_lead', tags: ['Brand Activation'],
    ownerId: 'u2', createdAt: '2026-02-15', updatedAt: '2026-02-15',
  },
  {
    id: 'c9', companyName: 'Rajamangala Stadium', industry: 'venue',
    country: 'Thailand', city: 'Bangkok', website: 'rajamangala.com',
    status: 'past_client', tags: ['Venue'],
    ownerId: 'u4', createdAt: '2025-06-01', updatedAt: '2025-12-01',
  },
  {
    id: 'c10', companyName: 'NEON Music Festival', industry: 'festival',
    country: 'Singapore', city: 'Singapore', website: 'neonsg.com',
    status: 'active_opportunity', tags: ['Festival Organizer'],
    ownerId: 'u1', createdAt: '2026-02-01', updatedAt: '2026-03-10',
  },
];

export const contacts: Contact[] = [
  { id: 'ct1', clientId: 'c1', name: 'Kenji Yamamoto', position: 'VP Events', email: 'k.yamamoto@aeg.jp', phone: '+81-3-1234-5678', isPrimary: true },
  { id: 'ct2', clientId: 'c2', name: 'Ji-ho Kim', position: 'Head of Production', email: 'jiho@livenation.kr', phone: '+82-2-987-6543', isPrimary: true },
  { id: 'ct3', clientId: 'c3', name: 'Park Soo-jin', position: 'Festival Director', email: 'soojin@ultrakorea.com', phone: '+82-10-555-1234', isPrimary: true },
  { id: 'ct4', clientId: 'c4', name: 'Hiroshi Nakamura', position: 'Creative Director', email: 'h.nakamura@dentsu.com', phone: '+81-3-9876-5432', isPrimary: true },
  { id: 'ct5', clientId: 'c5', name: 'Rachel Tan', position: 'Events Manager', email: 'rachel.tan@marinabaysands.com', phone: '+65-6688-8888', isPrimary: true },
  { id: 'ct6', clientId: 'c6', name: 'Alistair Ng', position: 'Head of Fan Engagement', email: 'alistair@onefc.com', phone: '+65-9123-4567', isPrimary: true },
  { id: 'ct7', clientId: 'c7', name: 'Ploy Chatchawal', position: 'Event Producer', email: 'ploy@gmmgrammy.com', phone: '+66-2-345-6789', isPrimary: true },
  { id: 'ct8', clientId: 'c8', name: 'David Lee', position: 'Brand Marketing Manager', email: 'david.lee@samsung.com', phone: '+82-2-2255-0114', isPrimary: true },
  { id: 'ct9', clientId: 'c9', name: 'Somchai Rattana', position: 'Stadium Operations', email: 's.rattana@rajamangala.co.th', phone: '+66-2-888-1234', isPrimary: true },
  { id: 'ct10', clientId: 'c10', name: 'Marcus Lim', position: 'Festival Co-Founder', email: 'marcus@neonsg.com', phone: '+65-8765-4321', isPrimary: true },
];

export const deals: Deal[] = [
  {
    id: 'd1', clientId: 'c1', contactId: 'ct1', ownerId: 'u1',
    eventName: 'Summer Sonic 2026', eventDate: '2026-08-15',
    eventCountry: 'Japan', eventCity: 'Tokyo',
    audienceSize: 30000, wristbandQty: 30000, dealValue: 42000,
    currency: 'USD', probability: 60, stage: 'proposal_sent',
    expectedClose: '2026-04-01', createdAt: '2026-01-10', updatedAt: '2026-03-05',
  },
  {
    id: 'd2', clientId: 'c1', contactId: 'ct1', ownerId: 'u1',
    eventName: 'Brand Night Tokyo', eventDate: '2026-03-25',
    eventCountry: 'Japan', eventCity: 'Tokyo',
    audienceSize: 5000, wristbandQty: 5000, dealValue: 18000,
    currency: 'USD', probability: 30, stage: 'meeting_scheduled',
    expectedClose: '2026-03-20', createdAt: '2026-02-15', updatedAt: '2026-03-09',
  },
  {
    id: 'd3', clientId: 'c2', contactId: 'ct2', ownerId: 'u2',
    eventName: 'K-Pop World Tour Seoul', eventDate: '2026-05-20',
    eventCountry: 'South Korea', eventCity: 'Seoul',
    audienceSize: 50000, wristbandQty: 50000, dealValue: 95000,
    currency: 'USD', probability: 90, stage: 'confirmed',
    expectedClose: '2026-03-15', createdAt: '2025-11-01', updatedAt: '2026-03-01',
  },
  {
    id: 'd4', clientId: 'c3', contactId: 'ct3', ownerId: 'u2',
    eventName: 'Ultra Korea 2026', eventDate: '2026-05-05',
    eventCountry: 'South Korea', eventCity: 'Seoul',
    audienceSize: 40000, wristbandQty: 40000, dealValue: 67000,
    currency: 'USD', probability: 65, stage: 'negotiation',
    expectedClose: '2026-03-30', createdAt: '2025-12-01', updatedAt: '2026-03-10',
  },
  {
    id: 'd5', clientId: 'c5', contactId: 'ct5', ownerId: 'u1',
    eventName: 'New Year Countdown MBS', eventDate: '2026-12-31',
    eventCountry: 'Singapore', eventCity: 'Singapore',
    audienceSize: 12000, wristbandQty: 12000, dealValue: 28000,
    currency: 'USD', probability: 100, stage: 'completed',
    expectedClose: '2026-11-01', createdAt: '2025-10-01', updatedAt: '2026-01-05',
  },
  {
    id: 'd6', clientId: 'c7', contactId: 'ct7', ownerId: 'u4',
    eventName: 'Big Mountain Music Festival', eventDate: '2026-11-28',
    eventCountry: 'Thailand', eventCity: 'Bangkok',
    audienceSize: 20000, wristbandQty: 20000, dealValue: 35000,
    currency: 'USD', probability: 40, stage: 'proposal_sent',
    expectedClose: '2026-09-01', createdAt: '2026-01-20', updatedAt: '2026-03-08',
  },
  {
    id: 'd7', clientId: 'c10', contactId: 'ct10', ownerId: 'u1',
    eventName: 'NEON Fest Singapore 2026', eventDate: '2026-06-12',
    eventCountry: 'Singapore', eventCity: 'Singapore',
    audienceSize: 8000, wristbandQty: 8000, dealValue: 22000,
    currency: 'USD', probability: 25, stage: 'contacted',
    expectedClose: '2026-04-30', createdAt: '2026-02-10', updatedAt: '2026-03-07',
  },
  {
    id: 'd8', clientId: 'c4', contactId: 'ct4', ownerId: 'u3',
    eventName: 'Toyota Brand Activation', eventDate: '2026-07-01',
    eventCountry: 'Japan', eventCity: 'Tokyo',
    audienceSize: 3000, wristbandQty: 3000, dealValue: 12000,
    currency: 'USD', probability: 15, stage: 'contacted',
    expectedClose: '2026-05-01', createdAt: '2026-02-20', updatedAt: '2026-03-02',
  },
  {
    id: 'd9', clientId: 'c6', contactId: 'ct6', ownerId: 'u3',
    eventName: 'ONE Championship Fight Night', eventDate: '2026-09-15',
    eventCountry: 'Singapore', eventCity: 'Singapore',
    audienceSize: 15000, wristbandQty: 15000, dealValue: 31000,
    currency: 'USD', probability: 20, stage: 'lead_identified',
    expectedClose: '2026-07-01', createdAt: '2026-02-28', updatedAt: '2026-03-06',
  },
  {
    id: 'd10', clientId: 'c8', contactId: 'ct8', ownerId: 'u2',
    eventName: 'Samsung Galaxy Launch Event', eventDate: '2026-10-01',
    eventCountry: 'South Korea', eventCity: 'Seoul',
    audienceSize: 2000, wristbandQty: 2000, dealValue: 8500,
    currency: 'USD', probability: 5, stage: 'lead_identified',
    expectedClose: '2026-08-01', createdAt: '2026-02-18', updatedAt: '2026-02-18',
  },
];

export const activities: Activity[] = [
  { id: 'a1', clientId: 'c1', dealId: 'd1', ownerId: 'u1', type: 'call', subject: 'Budget discussion for Summer Sonic', body: 'Discussed LED wristband budget. Kenji confirmed 30,000 units minimum. Waiting on finance approval.', occurredAt: '2026-03-10T10:00:00' },
  { id: 'a2', clientId: 'c1', dealId: 'd1', ownerId: 'u1', type: 'email', subject: 'Sent LED wristband spec sheet', body: 'Sent full technical spec sheet and pricing deck for Summer Sonic 2026.', occurredAt: '2026-03-05T14:30:00' },
  { id: 'a3', clientId: 'c1', dealId: 'd1', ownerId: 'u1', type: 'meeting', subject: 'Initial intro call – 30 min', body: 'First call with Kenji. He was impressed with Coachella case study. Requested formal proposal.', occurredAt: '2026-02-28T09:00:00' },
  { id: 'a4', clientId: 'c2', dealId: 'd3', ownerId: 'u2', type: 'meeting', subject: 'Contract review meeting', body: 'Reviewed final contract terms. Ji-ho confirmed 50,000 units. Payment 50% upfront.', occurredAt: '2026-03-08T11:00:00' },
  { id: 'a5', clientId: 'c3', dealId: 'd4', ownerId: 'u2', type: 'email', subject: 'Counter-proposal sent', body: 'Sent revised pricing with 5% discount for 40,000+ units. Awaiting response.', occurredAt: '2026-03-10T16:00:00' },
  { id: 'a6', clientId: 'c7', dealId: 'd6', ownerId: 'u4', type: 'proposal', subject: 'Proposal sent for Big Mountain Festival', body: 'Sent full proposal deck including interactive wristband features and custom RFID options.', occurredAt: '2026-03-08T10:00:00' },
  { id: 'a7', clientId: 'c10', dealId: 'd7', ownerId: 'u1', type: 'call', subject: 'Discovery call with Marcus', body: 'NEON Fest is planning 8,000 attendees. Marcus is interested in color-sync capability. Will share demo video.', occurredAt: '2026-03-07T15:00:00' },
  { id: 'a8', clientId: 'c4', dealId: 'd8', ownerId: 'u3', type: 'whatsapp', subject: 'Intro via WhatsApp', body: 'Connected with Hiroshi via WhatsApp. Shared company profile and Dentsu case study.', occurredAt: '2026-03-02T12:00:00' },
];

export const tasks: Task[] = [
  { id: 't1', dealId: 'd1', clientId: 'c1', assignedTo: 'u1', title: 'Follow up on Summer Sonic proposal', dueDate: '2026-03-15', priority: 'high', status: 'pending', createdAt: '2026-03-10' },
  { id: 't2', dealId: 'd1', clientId: 'c1', assignedTo: 'u1', title: 'Send Coachella case study deck', dueDate: '2026-03-20', priority: 'medium', status: 'pending', createdAt: '2026-03-10' },
  { id: 't3', dealId: 'd3', clientId: 'c2', assignedTo: 'u2', title: 'Finalize contract and get signature', dueDate: '2026-03-14', priority: 'high', status: 'pending', createdAt: '2026-03-08' },
  { id: 't4', dealId: 'd4', clientId: 'c3', assignedTo: 'u2', title: 'Follow up on counter-proposal', dueDate: '2026-03-13', priority: 'high', status: 'overdue', createdAt: '2026-03-10' },
  { id: 't5', dealId: 'd7', clientId: 'c10', assignedTo: 'u1', title: 'Send NEON demo video link', dueDate: '2026-03-12', priority: 'medium', status: 'overdue', createdAt: '2026-03-07' },
  { id: 't6', dealId: 'd8', clientId: 'c4', assignedTo: 'u3', title: 'Schedule meeting with Hiroshi', dueDate: '2026-03-18', priority: 'medium', status: 'pending', createdAt: '2026-03-02' },
  { id: 't7', dealId: 'd9', clientId: 'c6', assignedTo: 'u3', title: 'Prepare ONE Championship deck', dueDate: '2026-03-25', priority: 'low', status: 'pending', createdAt: '2026-03-06' },
  { id: 't8', dealId: 'd2', clientId: 'c1', assignedTo: 'u1', title: 'Confirm meeting time for Brand Night', dueDate: '2026-03-14', priority: 'high', status: 'pending', createdAt: '2026-03-09' },
];

// Helper functions
export function getClient(id: string): Client | undefined {
  return clients.find(c => c.id === id);
}

export function getContact(id: string): Contact | undefined {
  return contacts.find(c => c.id === id);
}

export function getUser(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function getClientContacts(clientId: string): Contact[] {
  return contacts.filter(c => c.clientId === clientId);
}

export function getClientDeals(clientId: string): Deal[] {
  return deals.filter(d => d.clientId === clientId);
}

export function getClientActivities(clientId: string): Activity[] {
  return activities.filter(a => a.clientId === clientId).sort((a, b) =>
    new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

export function getClientTasks(clientId: string): Task[] {
  return tasks.filter(t => t.clientId === clientId);
}

export function getDealTasks(dealId: string): Task[] {
  return tasks.filter(t => t.dealId === dealId);
}

export function getUserTasks(userId: string): Task[] {
  return tasks.filter(t => t.assignedTo === userId);
}

export const STAGE_LABELS: Record<DealStage, string> = {
  lead_identified: 'Lead Identified',
  contacted: 'Contacted',
  meeting_scheduled: 'Meeting Scheduled',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  confirmed: 'Confirmed',
  completed: 'Completed',
  lost: 'Lost',
};

export const STAGE_PROBABILITIES: Record<DealStage, number> = {
  lead_identified: 5,
  contacted: 15,
  meeting_scheduled: 25,
  proposal_sent: 40,
  negotiation: 65,
  confirmed: 90,
  completed: 100,
  lost: 0,
};

export const STATUS_LABELS: Record<ClientStatus, string> = {
  cold_lead: 'Cold Lead',
  warm_lead: 'Warm Lead',
  active_opportunity: 'Active Opportunity',
  client: 'Client',
  past_client: 'Past Client',
};

export const INDUSTRY_LABELS: Record<Industry, string> = {
  concert_organizer: 'Concert Organizer',
  brand: 'Brand',
  agency: 'Agency',
  venue: 'Venue',
  festival: 'Festival',
  corporate: 'Corporate',
  other: 'Other',
};
