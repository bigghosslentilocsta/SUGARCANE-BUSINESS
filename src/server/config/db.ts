import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { CarouselImageModel } from '../models/CarouselImage.ts';
import { ClientModel } from '../models/Client.ts';
import { ExpenditureModel } from '../models/Expenditure.ts';
import {
  InquiryModel,
  type IInquiry,
  type QuoteStatus,
} from '../models/Inquiry.ts';
import {
  TransactionModel,
  type SettlementStatus,
} from '../models/Transaction.ts';
import { UserModel } from '../models/User.ts';

export interface UserRecord {
  _id: string;
  username: string;
  passwordHash: string;
  tokenVersion: number;
  fullName: string;
  businessName: string;
  role: string;
  phone: string;
  email: string;
  warehouseAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRecord {
  _id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRecord {
  _id: string;
  clientId: string;
  clientName: string;
  quantity: number;
  unit: string;
  amount: number;
  paidAmount: number;
  status: SettlementStatus;
  date: string;
  settledAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenditureRecord {
  _id: string;
  date: string;
  truckNumber: string;
  driverName: string;
  description: string;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarouselImageRecord {
  _id: string;
  url: string;
  publicId: string;
  caption: string;
  captionTe: string;
  captionHi: string;
  uploadedAt: string;
  createdAt: string;
}

export interface InquiryRecord {
  _id: string;
  name: string;
  phone: string;
  company: string;
  message: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

interface LocalDatabase {
  users: UserRecord[];
  clients: ClientRecord[];
  transactions: TransactionRecord[];
  expenditures: ExpenditureRecord[];
  carouselImages: CarouselImageRecord[];
  inquiries: InquiryRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

let usingMongo = false;

function daysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
}

function buildSeedData(): LocalDatabase {
  const now = new Date().toISOString();
  const defaultHash = bcrypt.hashSync('sugarcane2026', 10);

  const c1 = 'cli_shri_renuka';
  const c2 = 'cli_nandi_jaggery';
  const c3 = 'cli_krishna_distillery';
  const c4 = 'cli_siddheshwar_mills';
  const c5 = 'cli_cauvery_organic';
  const c6 = 'cli_bhima_agro';

  return {
    users: [
      {
        _id: 'usr_owner_1',
        username: 'owner',
        passwordHash: defaultHash,
        tokenVersion: 0,
        fullName: 'Mallikarjuna Gowda',
        businessName: 'Mallikarjuna Sugarcane Suppliers',
        role: 'Managing Owner',
        phone: '+91 9392457024',
        email: 'pavankumar111205@gmail.com',
        warehouseAddress:
          'Mallikarjuna Sugarcane Suppliers, Market, Tara Nagar, Lingampally, Serilingampalle (M), Telangana 500019',
        createdAt: daysAgo(120),
        updatedAt: now,
      },
    ],
    clients: [
      {
        _id: c1,
        name: 'Shri Renuka Agro Mills',
        phone: '9845011234',
        address: 'Munavalli Sugar Belt, Belagavi District, Karnataka',
        createdAt: daysAgo(90),
        updatedAt: daysAgo(90),
      },
      {
        _id: c2,
        name: 'Nandi Jaggery Works',
        phone: '9448122390',
        address: 'Sankeshwar Industrial Estate, Hukkeri, Karnataka',
        createdAt: daysAgo(75),
        updatedAt: daysAgo(75),
      },
      {
        _id: c3,
        name: 'Krishna Valley Distilleries',
        phone: '9900456120',
        address: 'Athani Highway Yard, Vijayapura Road, Karnataka',
        createdAt: daysAgo(60),
        updatedAt: daysAgo(60),
      },
      {
        _id: c4,
        name: 'Siddheshwar Co-op Sugar Unit',
        phone: '9741288901',
        address: 'Gokak Falls Road, Belagavi District, Karnataka',
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        _id: c5,
        name: 'Cauvery Organic Khandsari',
        phone: '9611340982',
        address: 'Mandya Main Road, Maddur Taluk, Karnataka',
        createdAt: daysAgo(30),
        updatedAt: daysAgo(30),
      },
      {
        _id: c6,
        name: 'Bhima River Cane Crushers',
        phone: '9880715432',
        address: 'Indi Cross, Vijayapura District, Karnataka',
        createdAt: daysAgo(18),
        updatedAt: daysAgo(18),
      },
    ],
    transactions: [
      {
        _id: 'txn_1001',
        clientId: c1,
        clientName: 'Shri Renuka Agro Mills',
        quantity: 28.5,
        unit: 'Tons',
        amount: 96900,
        paidAmount: 96900,
        status: 'Paid',
        date: daysAgo(0, 9),
        settledAt: daysAgo(0, 11),
        notes: 'Morning weighbridge batch #A14 — CO-86032 variety',
        createdAt: daysAgo(0, 9),
        updatedAt: daysAgo(0, 11),
      },
      {
        _id: 'txn_1002',
        clientId: c2,
        clientName: 'Nandi Jaggery Works',
        quantity: 16.0,
        unit: 'Tons',
        amount: 54400,
        paidAmount: 0,
        status: 'Not Paid',
        date: daysAgo(0, 11),
        settledAt: null,
        notes: 'Afternoon dispatch — 2 tractor-trailer loads',
        createdAt: daysAgo(0, 11),
        updatedAt: daysAgo(0, 11),
      },
      {
        _id: 'txn_1003',
        clientId: c4,
        clientName: 'Siddheshwar Co-op Sugar Unit',
        quantity: 34.2,
        unit: 'Tons',
        amount: 116280,
        paidAmount: 116280,
        status: 'Paid',
        date: daysAgo(1, 14),
        settledAt: daysAgo(1, 17),
        notes: 'High-brix fresh cut cane',
        createdAt: daysAgo(1, 14),
        updatedAt: daysAgo(1, 17),
      },
      {
        _id: 'txn_1004',
        clientId: c3,
        clientName: 'Krishna Valley Distilleries',
        quantity: 22.0,
        unit: 'Tons',
        amount: 74800,
        paidAmount: 0,
        status: 'Not Paid',
        date: daysAgo(2, 10),
        settledAt: null,
        notes: '7-day credit terms approved',
        createdAt: daysAgo(2, 10),
        updatedAt: daysAgo(2, 10),
      },
      {
        _id: 'txn_1005',
        clientId: c5,
        clientName: 'Cauvery Organic Khandsari',
        quantity: 19.5,
        unit: 'Tons',
        amount: 68250,
        paidAmount: 68250,
        status: 'Paid',
        date: daysAgo(3, 15),
        settledAt: daysAgo(2, 12),
        notes: 'Clean stripped cane stalks',
        createdAt: daysAgo(3, 15),
        updatedAt: daysAgo(2, 12),
      },
      {
        _id: 'txn_1006',
        clientId: c6,
        clientName: 'Bhima River Cane Crushers',
        quantity: 25.0,
        unit: 'Tons',
        amount: 85000,
        paidAmount: 0,
        status: 'Not Paid',
        date: daysAgo(5, 9),
        settledAt: null,
        notes: 'Gate receipt #409',
        createdAt: daysAgo(5, 9),
        updatedAt: daysAgo(5, 9),
      },
      {
        _id: 'txn_1007',
        clientId: c1,
        clientName: 'Shri Renuka Agro Mills',
        quantity: 31.0,
        unit: 'Tons',
        amount: 105400,
        paidAmount: 105400,
        status: 'Paid',
        date: daysAgo(7, 13),
        settledAt: daysAgo(6, 16),
        notes: 'Weekly contract lot #2',
        createdAt: daysAgo(7, 13),
        updatedAt: daysAgo(6, 16),
      },
      {
        _id: 'txn_1008',
        clientId: c2,
        clientName: 'Nandi Jaggery Works',
        quantity: 14.5,
        unit: 'Tons',
        amount: 49300,
        paidAmount: 49300,
        status: 'Paid',
        date: daysAgo(10, 11),
        settledAt: daysAgo(9, 10),
        notes: 'Settled via RTGS',
        createdAt: daysAgo(10, 11),
        updatedAt: daysAgo(9, 10),
      },
    ],
    expenditures: [
      {
        _id: 'exp_2001',
        date: daysAgo(0, 10),
        truckNumber: 'KA-22-C-4821',
        driverName: 'Basavaraj Patil',
        description: 'Warehouse unloading & cane harvest haulage (28.5 Tons)',
        amountPaid: 14500,
        createdAt: daysAgo(0, 10),
        updatedAt: daysAgo(0, 10),
      },
      {
        _id: 'exp_2002',
        date: daysAgo(1, 15),
        truckNumber: 'KA-22-B-9104',
        driverName: 'Ramesh Naik',
        description: 'Diesel advance & unloading labour payout at Yard 2',
        amountPaid: 18200,
        createdAt: daysAgo(1, 15),
        updatedAt: daysAgo(1, 15),
      },
      {
        _id: 'exp_2003',
        date: daysAgo(2, 16),
        truckNumber: 'MH-09-EM-3318',
        driverName: 'Shankar Jadhav',
        description: 'Inter-district freight & weighbridge slip charges',
        amountPaid: 12800,
        createdAt: daysAgo(2, 16),
        updatedAt: daysAgo(2, 16),
      },
      {
        _id: 'exp_2004',
        date: daysAgo(4, 12),
        truckNumber: 'KA-28-A-7720',
        driverName: 'Prakash Kulkarni',
        description: 'Night shift loader crew & tractor trip settlement',
        amountPaid: 9600,
        createdAt: daysAgo(4, 12),
        updatedAt: daysAgo(4, 12),
      },
      {
        _id: 'exp_2005',
        date: daysAgo(7, 11),
        truckNumber: 'KA-22-D-6055',
        driverName: 'Mahesh Desai',
        description: 'Full truckload freight payout — Athani route',
        amountPaid: 15400,
        createdAt: daysAgo(7, 11),
        updatedAt: daysAgo(7, 11),
      },
    ],
    carouselImages: [
      {
        _id: 'img_seed_1',
        url: '/assets/aistudio/image_5fcf53d7.png',
        publicId: 'seed:depot_shed',
        caption: 'Covered Depot Stock — Clean Bundled Sugarcane Ready for Dispatch',
        captionTe: 'డిపో స్టాక్ — పంపిణీకి సిద్ధంగా ఉన్న శుభ్రమైన చెరకు కట్టలు',
        captionHi: 'डिपो स्टॉक — डिस्पैच के लिए तैयार साफ और बंधे हुए गन्ने के बंडल',
        uploadedAt: daysAgo(0, 9),
        createdAt: daysAgo(0, 9),
      },
      {
        _id: 'img_seed_2',
        url: '/assets/aistudio/image_6b0fe2f5.png',
        publicId: 'seed:field_check',
        caption: 'Direct Field Inspection — Checking Stalk Height & Sweetness Before Harvest',
        captionTe: 'పొలంలో ప్రత్యక్ష తనిఖీ — కోతకు ముందు గడ ఎత్తు & తీపి పరిశీలన',
        captionHi: 'खेत में सीधी जांच — कटाई से पहले गन्ने की ऊंचाई और मिठास की परख',
        uploadedAt: daysAgo(1, 10),
        createdAt: daysAgo(1, 10),
      },
      {
        _id: 'img_seed_3',
        url: '/assets/aistudio/image_535ce9fa.png',
        publicId: 'seed:warehouse_stack',
        caption: 'Bulk Warehouse Stack — Year-Round 12-Month Supply Reserve',
        captionTe: 'బల్క్ గోదాము నిల్వ — ఏడాది పొడవునా 12 నెలల సరఫరా రిజర్వ్',
        captionHi: 'थोक गोदाम स्टॉक — पूरे 12 महीने सप्लाई के लिए सुरक्षित भंडार',
        uploadedAt: daysAgo(2, 11),
        createdAt: daysAgo(2, 11),
      },
      {
        _id: 'img_seed_4',
        url: '/assets/aistudio/image_c0dbed69.png',
        publicId: 'seed:fresh_stalks',
        caption: 'Freshly Cut Golden-Green Cane Selected from Maharashtra & Karnataka Farms',
        captionTe: 'మహారాష్ట్ర & కర్ణాటక పొలాల నుండి తాజాగా కోసిన బంగారు-పచ్చ చెరకు',
        captionHi: 'महाराष्ट्र और कर्नाटक के खेतों से ताज़ा कटा सुनहरा-हरा गन्ना',
        uploadedAt: daysAgo(3, 12),
        createdAt: daysAgo(3, 12),
      },
      {
        _id: 'img_seed_5',
        url: '/assets/aistudio/image_0c3698c9.png',
        publicId: 'seed:local_delivery',
        caption: 'Trimmed High-Sweetness Cane Loaded for Customer Unit Delivery',
        captionTe: 'వినియోగదారుల యూనిట్లకు పంపడానికి సిద్ధం చేసిన తియ్యని చెరకు',
        captionHi: 'ग्राहक यूनिट डिलीवरी के लिए लोड किया गया छिला हुआ मीठा गन्ना',
        uploadedAt: daysAgo(4, 14),
        createdAt: daysAgo(4, 14),
      },
      {
        _id: 'img_seed_6',
        url: '/assets/aistudio/image_ae3db5ef.png',
        publicId: 'seed:market_yard',
        caption: 'Wholesale Market Yard Supply — Supporting 50+ Active & 100+ Seasonal Units',
        captionTe: 'మార్కెట్ యార్డ్ హోల్‌సేల్ సరఫరా — 50+ యాక్టివ్ & 100+ సీజనల్ యూనిట్లకు సేవ',
        captionHi: 'थोक मंडी यार्ड सप्लाई — 50+ सक्रिय और 100+ सीज़नल यूनिट्स की सेवा',
        uploadedAt: daysAgo(5, 11),
        createdAt: daysAgo(5, 11),
      },
    ],
    inquiries: [],
  };
}

function ensureLocalStore(): LocalDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const seed = buildSeedData();
    fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as LocalDatabase;
    const hasLegacyImages = parsed.carouselImages?.some((img) =>
      img.url.startsWith('/src/assets/images/')
    );
    if (hasLegacyImages) {
      const seed = buildSeedData();
      const nonLegacy = parsed.carouselImages.filter(
        (img) => !img.url.startsWith('/src/assets/images/')
      );
      parsed.carouselImages =
        nonLegacy.length > 0 ? nonLegacy : seed.carouselImages;
      fs.writeFileSync(STORE_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch {
    const seed = buildSeedData();
    fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
}

function saveLocalStore(db: LocalDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
}

function hasDatabaseInUri(uri: string): boolean {
  const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+)/i);
  return Boolean(match && match[1]);
}

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.startsWith('mongodb')) {
    try {
      const options: mongoose.ConnectOptions = {
        serverSelectionTimeoutMS: 5000,
        ...(hasDatabaseInUri(uri) ? {} : { dbName: 'mallikarjuna_sugarcane' }),
      };
      await mongoose.connect(uri, options);
      usingMongo = true;
      console.log(
        `Connected to MongoDB (${mongoose.connection.name}) via Mongoose`
      );
      await seedMongoIfEmpty();
      return;
    } catch (err) {
      console.warn(
        'MongoDB connection failed, using local persistent JSON store:',
        (err as Error).message
      );
    }
  } else {
    console.log(
      'MONGODB_URI not configured; running with local persistent JSON store (./data/store.json)'
    );
  }
  usingMongo = false;
  ensureLocalStore();
}

async function seedMongoIfEmpty(): Promise<void> {
  const seed = buildSeedData();

  const existingOwner = await UserModel.findOne({
    username: { $exists: true, $ne: null },
  }).lean();
  if (!existingOwner) {
    await UserModel.create({
      username: seed.users[0].username,
      passwordHash: seed.users[0].passwordHash,
      fullName: seed.users[0].fullName,
      businessName: seed.users[0].businessName,
      role: seed.users[0].role,
      phone: seed.users[0].phone,
      email: seed.users[0].email,
      warehouseAddress: seed.users[0].warehouseAddress,
    });
  } else if (existingOwner.email === 'operations@mallikarjunasugarcane.in') {
    await UserModel.findByIdAndUpdate(existingOwner._id, {
      email: 'pavankumar111205@gmail.com',
    });
  }

  const clientCount = await ClientModel.countDocuments();
  const clientMap = new Map<string, string>();
  if (clientCount === 0) {
    for (const c of seed.clients) {
      const doc = await ClientModel.create({
        name: c.name,
        phone: c.phone,
        address: c.address,
      });
      clientMap.set(c._id, String(doc._id));
    }

    const txnCount = await TransactionModel.countDocuments();
    if (txnCount === 0) {
      for (const t of seed.transactions) {
        await TransactionModel.create({
          clientId: clientMap.get(t.clientId) || t.clientId,
          clientName: t.clientName,
          quantity: t.quantity,
          unit: t.unit,
          amount: t.amount,
          paidAmount: t.paidAmount,
          status: t.status,
          date: new Date(t.date),
          settledAt: t.settledAt ? new Date(t.settledAt) : null,
          notes: t.notes,
        });
      }
    }
  }

  const expCount = await ExpenditureModel.countDocuments();
  if (expCount === 0) {
    for (const e of seed.expenditures) {
      await ExpenditureModel.create({
        date: new Date(e.date),
        truckNumber: e.truckNumber,
        driverName: e.driverName,
        description: e.description,
        amountPaid: e.amountPaid,
      });
    }
  }

  await CarouselImageModel.deleteMany({
    url: { $regex: '^/src/assets/images/' },
  });

  const imgCount = await CarouselImageModel.countDocuments();
  if (imgCount === 0) {
    for (const img of seed.carouselImages) {
      await CarouselImageModel.create({
        url: img.url,
        publicId: img.publicId,
        caption: img.caption,
        captionTe: img.captionTe,
        captionHi: img.captionHi,
        uploadedAt: new Date(img.uploadedAt),
      });
    }
  }
}

export function isMongoConnected(): boolean {
  return usingMongo;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Repository helper layer supporting both Mongoose (MongoDB) and local JSON persistence

export const repo = {
  // --- Users ---
  async findUserByUsername(username: string): Promise<UserRecord | null> {
    const clean = username.trim().toLowerCase();
    if (usingMongo) {
      const u = await UserModel.findOne({ username: clean }).lean();
      return u
        ? {
            ...u,
            _id: String(u._id),
            tokenVersion: typeof u.tokenVersion === 'number' ? u.tokenVersion : 0,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          }
        : null;
    }
    const db = ensureLocalStore();
    const found = db.users.find((u) => u.username.toLowerCase() === clean);
    return found ? { ...found, tokenVersion: found.tokenVersion ?? 0 } : null;
  },

  async findUserById(id: string): Promise<UserRecord | null> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const u = await UserModel.findById(id).lean();
      return u
        ? {
            ...u,
            _id: String(u._id),
            tokenVersion: typeof u.tokenVersion === 'number' ? u.tokenVersion : 0,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          }
        : null;
    }
    const db = ensureLocalStore();
    const found = db.users.find((u) => u._id === id);
    return found ? { ...found, tokenVersion: found.tokenVersion ?? 0 } : null;
  },

  async updateUserProfile(
    id: string,
    patch: Partial<Pick<UserRecord, 'fullName' | 'businessName' | 'role' | 'phone' | 'email' | 'warehouseAddress'>>
  ): Promise<UserRecord | null> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const u = await UserModel.findByIdAndUpdate(id, patch, { new: true }).lean();
      return u
        ? {
            ...u,
            _id: String(u._id),
            tokenVersion: typeof u.tokenVersion === 'number' ? u.tokenVersion : 0,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          }
        : null;
    }
    const db = ensureLocalStore();
    const idx = db.users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    db.users[idx] = {
      ...db.users[idx],
      ...patch,
      tokenVersion: db.users[idx].tokenVersion ?? 0,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(db);
    return db.users[idx];
  },

  async updateUserPassword(
    id: string,
    passwordHash: string
  ): Promise<{ updated: boolean; tokenVersion: number }> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { updated: false, tokenVersion: 0 };
      }
      const res = await UserModel.findByIdAndUpdate(
        id,
        { passwordHash, $inc: { tokenVersion: 1 } },
        { new: true }
      ).lean();
      return res
        ? {
            updated: true,
            tokenVersion: typeof res.tokenVersion === 'number' ? res.tokenVersion : 1,
          }
        : { updated: false, tokenVersion: 0 };
    }
    const db = ensureLocalStore();
    const idx = db.users.findIndex((u) => u._id === id);
    if (idx === -1) return { updated: false, tokenVersion: 0 };
    const nextVersion = (db.users[idx].tokenVersion ?? 0) + 1;
    db.users[idx].passwordHash = passwordHash;
    db.users[idx].tokenVersion = nextVersion;
    db.users[idx].updatedAt = new Date().toISOString();
    saveLocalStore(db);
    return { updated: true, tokenVersion: nextVersion };
  },

  async incrementTokenVersion(id: string): Promise<number | null> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const res = await UserModel.findByIdAndUpdate(
        id,
        { $inc: { tokenVersion: 1 } },
        { new: true }
      ).lean();
      return res ? (typeof res.tokenVersion === 'number' ? res.tokenVersion : 1) : null;
    }
    const db = ensureLocalStore();
    const idx = db.users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    const nextVersion = (db.users[idx].tokenVersion ?? 0) + 1;
    db.users[idx].tokenVersion = nextVersion;
    db.users[idx].updatedAt = new Date().toISOString();
    saveLocalStore(db);
    return nextVersion;
  },

  // --- Clients ---
  async listClients(query?: string): Promise<ClientRecord[]> {
    const q = (query || '').trim().toLowerCase();
    if (usingMongo) {
      const safeQ = q ? escapeRegex(q) : '';
      const filter = safeQ
        ? {
            $or: [
              { name: { $regex: safeQ, $options: 'i' } },
              { phone: { $regex: safeQ, $options: 'i' } },
            ],
          }
        : {};
      const rows = await ClientModel.find(filter).sort({ createdAt: -1 }).lean();
      return rows.map((r) => ({
        _id: String(r._id),
        name: r.name,
        phone: r.phone,
        address: r.address,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
    const db = ensureLocalStore();
    let rows = [...db.clients].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (q) {
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
      );
    }
    return rows;
  },

  async getClientById(id: string): Promise<ClientRecord | null> {
    if (usingMongo) {
      const r = await ClientModel.findById(id).lean();
      return r
        ? {
            _id: String(r._id),
            name: r.name,
            phone: r.phone,
            address: r.address,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          }
        : null;
    }
    const db = ensureLocalStore();
    return db.clients.find((c) => c._id === id) || null;
  },

  async createClient(input: {
    name: string;
    phone: string;
    address: string;
  }): Promise<ClientRecord> {
    if (usingMongo) {
      const doc = await ClientModel.create(input);
      return {
        _id: String(doc._id),
        name: doc.name,
        phone: doc.phone,
        address: doc.address,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    }
    const db = ensureLocalStore();
    const now = new Date().toISOString();
    const created: ClientRecord = {
      _id: genId('cli'),
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      createdAt: now,
      updatedAt: now,
    };
    db.clients.unshift(created);
    saveLocalStore(db);
    return created;
  },

  async updateClient(
    id: string,
    input: Partial<{ name: string; phone: string; address: string }>
  ): Promise<ClientRecord | null> {
    if (usingMongo) {
      const doc = await ClientModel.findByIdAndUpdate(id, input, {
        new: true,
      }).lean();
      if (!doc) return null;
      if (input.name) {
        await TransactionModel.updateMany(
          { clientId: id },
          { clientName: input.name.trim() }
        );
      }
      return {
        _id: String(doc._id),
        name: doc.name,
        phone: doc.phone,
        address: doc.address,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    }
    const db = ensureLocalStore();
    const idx = db.clients.findIndex((c) => c._id === id);
    if (idx === -1) return null;
    db.clients[idx] = {
      ...db.clients[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    if (input.name) {
      db.transactions = db.transactions.map((t) =>
        t.clientId === id ? { ...t, clientName: input.name!.trim() } : t
      );
    }
    saveLocalStore(db);
    return db.clients[idx];
  },

  async deleteClient(id: string): Promise<boolean> {
    if (usingMongo) {
      const res = await ClientModel.findByIdAndDelete(id);
      return Boolean(res);
    }
    const db = ensureLocalStore();
    const before = db.clients.length;
    db.clients = db.clients.filter((c) => c._id !== id);
    if (db.clients.length === before) return false;
    saveLocalStore(db);
    return true;
  },

  // --- Transactions ---
  async listTransactions(filters?: {
    clientId?: string;
    date?: string;
    status?: string;
    limit?: number;
  }): Promise<{ rows: TransactionRecord[]; totalCount: number }> {
    if (usingMongo) {
      const query: Record<string, unknown> = {};
      if (filters?.clientId) query.clientId = filters.clientId;
      if (filters?.status === 'Paid' || filters?.status === 'Not Paid') {
        query.status = filters.status;
      }
      if (filters?.date) {
        const start = new Date(`${filters.date}T00:00:00.000Z`);
        const end = new Date(`${filters.date}T23:59:59.999Z`);
        query.date = { $gte: start, $lte: end };
      }
      const totalCount = await TransactionModel.countDocuments(query);
      let cursor = TransactionModel.find(query).sort({ date: -1, createdAt: -1 });
      if (filters?.limit && filters.limit > 0) {
        cursor = cursor.limit(filters.limit);
      }
      const docs = await cursor.lean();
      return {
        totalCount,
        rows: docs.map((d) => ({
          _id: String(d._id),
          clientId: d.clientId,
          clientName: d.clientName,
          quantity: d.quantity,
          unit: d.unit,
          amount: d.amount,
          paidAmount:
            typeof d.paidAmount === 'number'
              ? d.paidAmount
              : d.status === 'Paid'
              ? d.amount
              : 0,
          status: d.status,
          date: d.date.toISOString(),
          settledAt: d.settledAt ? d.settledAt.toISOString() : null,
          notes: d.notes || '',
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        })),
      };
    }

    const db = ensureLocalStore();
    let rows = [...db.transactions]
      .map((t) => ({
        ...t,
        paidAmount:
          typeof t.paidAmount === 'number'
            ? t.paidAmount
            : t.status === 'Paid'
            ? t.amount
            : 0,
      }))
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    if (filters?.clientId) {
      rows = rows.filter((t) => t.clientId === filters.clientId);
    }
    if (filters?.status === 'Paid' || filters?.status === 'Not Paid') {
      rows = rows.filter((t) => t.status === filters.status);
    }
    if (filters?.date) {
      rows = rows.filter((t) => t.date.slice(0, 10) === filters.date);
    }
    const totalCount = rows.length;
    if (filters?.limit && filters.limit > 0) {
      rows = rows.slice(0, filters.limit);
    }
    return { rows, totalCount };
  },

  async createTransaction(input: {
    clientId: string;
    clientName: string;
    quantity: number;
    unit?: string;
    amount: number;
    paidAmount?: number;
    status: SettlementStatus;
    date?: string;
    notes?: string;
  }): Promise<TransactionRecord> {
    const dateVal = input.date ? new Date(input.date) : new Date();
    const resolvedPaid =
      input.status === 'Paid'
        ? input.amount
        : Math.min(input.amount, Math.max(0, input.paidAmount ?? 0));
    const resolvedStatus: SettlementStatus =
      resolvedPaid >= input.amount && input.amount > 0 ? 'Paid' : input.status;
    const settledAtVal = resolvedStatus === 'Paid' ? new Date() : null;
    if (usingMongo) {
      const doc = await TransactionModel.create({
        clientId: input.clientId,
        clientName: input.clientName,
        quantity: input.quantity,
        unit: input.unit || 'Tons',
        amount: input.amount,
        paidAmount: resolvedPaid,
        status: resolvedStatus,
        date: dateVal,
        settledAt: settledAtVal,
        notes: input.notes || '',
      });
      return {
        _id: String(doc._id),
        clientId: doc.clientId,
        clientName: doc.clientName,
        quantity: doc.quantity,
        unit: doc.unit,
        amount: doc.amount,
        paidAmount: doc.paidAmount,
        status: doc.status,
        date: doc.date.toISOString(),
        settledAt: doc.settledAt ? doc.settledAt.toISOString() : null,
        notes: doc.notes || '',
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    }
    const db = ensureLocalStore();
    const now = new Date().toISOString();
    const created: TransactionRecord = {
      _id: genId('txn'),
      clientId: input.clientId,
      clientName: input.clientName,
      quantity: input.quantity,
      unit: input.unit || 'Tons',
      amount: input.amount,
      paidAmount: resolvedPaid,
      status: resolvedStatus,
      date: dateVal.toISOString(),
      settledAt: settledAtVal ? settledAtVal.toISOString() : null,
      notes: input.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    db.transactions.unshift(created);
    saveLocalStore(db);
    return created;
  },

  async updateTransaction(
    id: string,
    patch: Partial<{
      clientId: string;
      clientName: string;
      quantity: number;
      unit: string;
      amount: number;
      paidAmount: number;
      status: SettlementStatus;
      date: string;
      notes: string;
    }>
  ): Promise<TransactionRecord | null> {
    if (usingMongo) {
      const existing = await TransactionModel.findById(id).lean();
      if (!existing) return null;

      const nextAmount = patch.amount ?? existing.amount;
      const currentPaid =
        typeof existing.paidAmount === 'number'
          ? existing.paidAmount
          : existing.status === 'Paid'
          ? existing.amount
          : 0;
      let nextPaid =
        patch.paidAmount !== undefined ? patch.paidAmount : currentPaid;
      let nextStatus = patch.status ?? existing.status;

      if (patch.status === 'Paid') {
        nextPaid = nextAmount;
      } else if (patch.status === 'Not Paid' && patch.paidAmount === undefined) {
        nextPaid = existing.status === 'Paid' ? 0 : Math.min(currentPaid, nextAmount);
      }

      if (nextPaid >= nextAmount && nextAmount > 0) {
        nextPaid = nextAmount;
        nextStatus = 'Paid';
      }

      const update: Record<string, unknown> = {
        ...patch,
        paidAmount: Math.max(0, nextPaid),
        status: nextStatus,
      };
      if (patch.date) update.date = new Date(patch.date);
      if (nextStatus === 'Paid') {
        update.settledAt = existing.settledAt || new Date();
      } else {
        update.settledAt = null;
      }

      const doc = await TransactionModel.findByIdAndUpdate(id, update, {
        new: true,
      }).lean();
      if (!doc) return null;
      return {
        _id: String(doc._id),
        clientId: doc.clientId,
        clientName: doc.clientName,
        quantity: doc.quantity,
        unit: doc.unit,
        amount: doc.amount,
        paidAmount: doc.paidAmount,
        status: doc.status,
        date: doc.date.toISOString(),
        settledAt: doc.settledAt ? doc.settledAt.toISOString() : null,
        notes: doc.notes || '',
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    }
    const db = ensureLocalStore();
    const idx = db.transactions.findIndex((t) => t._id === id);
    if (idx === -1) return null;
    const prev = db.transactions[idx];
    const nextAmount = patch.amount ?? prev.amount;
    const prevPaid =
      typeof prev.paidAmount === 'number'
        ? prev.paidAmount
        : prev.status === 'Paid'
        ? prev.amount
        : 0;
    let nextPaid = patch.paidAmount !== undefined ? patch.paidAmount : prevPaid;
    let nextStatus = patch.status ?? prev.status;

    if (patch.status === 'Paid') {
      nextPaid = nextAmount;
    } else if (patch.status === 'Not Paid' && patch.paidAmount === undefined) {
      nextPaid = prev.status === 'Paid' ? 0 : Math.min(prevPaid, nextAmount);
    }
    if (nextPaid >= nextAmount && nextAmount > 0) {
      nextPaid = nextAmount;
      nextStatus = 'Paid';
    }

    db.transactions[idx] = {
      ...prev,
      ...patch,
      paidAmount: Math.max(0, nextPaid),
      status: nextStatus,
      date: patch.date ? new Date(patch.date).toISOString() : prev.date,
      settledAt:
        nextStatus === 'Paid'
          ? prev.settledAt || new Date().toISOString()
          : null,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(db);
    return db.transactions[idx];
  },

  async recordPartialPayment(
    id: string,
    paymentAmount: number
  ): Promise<TransactionRecord | null> {
    if (usingMongo) {
      const existing = await TransactionModel.findById(id).lean();
      if (!existing) return null;
      const currentPaid =
        typeof existing.paidAmount === 'number'
          ? existing.paidAmount
          : existing.status === 'Paid'
          ? existing.amount
          : 0;
      const nextPaid = Math.min(existing.amount, currentPaid + paymentAmount);
      const isNowPaid = nextPaid >= existing.amount;
      return this.updateTransaction(id, {
        paidAmount: nextPaid,
        status: isNowPaid ? 'Paid' : 'Not Paid',
      });
    }
    const db = ensureLocalStore();
    const existing = db.transactions.find((t) => t._id === id);
    if (!existing) return null;
    const currentPaid =
      typeof existing.paidAmount === 'number'
        ? existing.paidAmount
        : existing.status === 'Paid'
        ? existing.amount
        : 0;
    const nextPaid = Math.min(existing.amount, currentPaid + paymentAmount);
    const isNowPaid = nextPaid >= existing.amount;
    return this.updateTransaction(id, {
      paidAmount: nextPaid,
      status: isNowPaid ? 'Paid' : 'Not Paid',
    });
  },

  async settleTransaction(id: string): Promise<TransactionRecord | null> {
    return this.updateTransaction(id, { status: 'Paid' });
  },

  async deleteTransaction(id: string): Promise<boolean> {
    if (usingMongo) {
      const res = await TransactionModel.findByIdAndDelete(id);
      return Boolean(res);
    }
    const db = ensureLocalStore();
    const before = db.transactions.length;
    db.transactions = db.transactions.filter((t) => t._id !== id);
    if (db.transactions.length === before) return false;
    saveLocalStore(db);
    return true;
  },

  // --- Expenditures ---
  async listExpenditures(): Promise<ExpenditureRecord[]> {
    if (usingMongo) {
      const docs = await ExpenditureModel.find()
        .sort({ date: -1, createdAt: -1 })
        .lean();
      return docs.map((d) => ({
        _id: String(d._id),
        date: d.date.toISOString(),
        truckNumber: d.truckNumber || '',
        driverName: d.driverName || '',
        description: d.description || '',
        amountPaid: d.amountPaid,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      }));
    }
    const db = ensureLocalStore();
    return [...db.expenditures].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  async createExpenditure(input: {
    date?: string;
    truckNumber?: string;
    driverName?: string;
    description?: string;
    amountPaid: number;
  }): Promise<ExpenditureRecord> {
    const dateVal = input.date ? new Date(input.date) : new Date();
    const truckNumber = (input.truckNumber || '').trim();
    const driverName = (input.driverName || '').trim();
    const description = (input.description || '').trim();
    if (usingMongo) {
      const doc = await ExpenditureModel.create({
        date: dateVal,
        truckNumber,
        driverName,
        description,
        amountPaid: input.amountPaid,
      });
      return {
        _id: String(doc._id),
        date: doc.date.toISOString(),
        truckNumber: doc.truckNumber || '',
        driverName: doc.driverName || '',
        description: doc.description || '',
        amountPaid: doc.amountPaid,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    }
    const db = ensureLocalStore();
    const now = new Date().toISOString();
    const created: ExpenditureRecord = {
      _id: genId('exp'),
      date: dateVal.toISOString(),
      truckNumber,
      driverName,
      description,
      amountPaid: input.amountPaid,
      createdAt: now,
      updatedAt: now,
    };
    db.expenditures.unshift(created);
    saveLocalStore(db);
    return created;
  },

  async updateExpenditure(
    id: string,
    patch: Partial<{
      date: string;
      truckNumber: string;
      driverName: string;
      description: string;
      amountPaid: number;
    }>
  ): Promise<ExpenditureRecord | null> {
    if (usingMongo) {
      const update: Record<string, unknown> = { ...patch };
      if (patch.date) update.date = new Date(patch.date);
      const doc = await ExpenditureModel.findByIdAndUpdate(id, update, {
        new: true,
      }).lean();
      if (!doc) return null;
      return {
        _id: String(doc._id),
        date: doc.date.toISOString(),
        truckNumber: doc.truckNumber,
        driverName: doc.driverName,
        description: doc.description,
        amountPaid: doc.amountPaid,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    }
    const db = ensureLocalStore();
    const idx = db.expenditures.findIndex((e) => e._id === id);
    if (idx === -1) return null;
    db.expenditures[idx] = {
      ...db.expenditures[idx],
      ...patch,
      date: patch.date
        ? new Date(patch.date).toISOString()
        : db.expenditures[idx].date,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(db);
    return db.expenditures[idx];
  },

  async deleteExpenditure(id: string): Promise<boolean> {
    if (usingMongo) {
      const res = await ExpenditureModel.findByIdAndDelete(id);
      return Boolean(res);
    }
    const db = ensureLocalStore();
    const before = db.expenditures.length;
    db.expenditures = db.expenditures.filter((e) => e._id !== id);
    if (db.expenditures.length === before) return false;
    saveLocalStore(db);
    return true;
  },

  // --- Carousel Images (Max 10 Rotation Rule) ---
  async listCarouselImages(): Promise<CarouselImageRecord[]> {
    if (usingMongo) {
      const docs = await CarouselImageModel.find()
        .sort({ uploadedAt: -1, createdAt: -1 })
        .lean();
      return docs.map((d) => ({
        _id: String(d._id),
        url: d.url,
        publicId: d.publicId,
        caption: d.caption,
        captionTe: d.captionTe || '',
        captionHi: d.captionHi || '',
        uploadedAt: d.uploadedAt.toISOString(),
        createdAt: d.createdAt.toISOString(),
      }));
    }
    const db = ensureLocalStore();
    return [...db.carouselImages]
      .map((img) => ({
        ...img,
        captionTe: img.captionTe || '',
        captionHi: img.captionHi || '',
      }))
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
  },

  async getCarouselImageById(id: string): Promise<CarouselImageRecord | null> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const doc = await CarouselImageModel.findById(id).lean();
      if (!doc) return null;
      return {
        _id: String(doc._id),
        url: doc.url,
        publicId: doc.publicId,
        caption: doc.caption,
        captionTe: doc.captionTe || '',
        captionHi: doc.captionHi || '',
        uploadedAt: doc.uploadedAt.toISOString(),
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const db = ensureLocalStore();
    const found = db.carouselImages.find((img) => img._id === id);
    return found
      ? {
          ...found,
          captionTe: found.captionTe || '',
          captionHi: found.captionHi || '',
        }
      : null;
  },

  async addCarouselImageAndRotate(input: {
    url: string;
    publicId: string;
    caption: string;
    captionTe?: string;
    captionHi?: string;
  }): Promise<{
    created: CarouselImageRecord;
    removedOldest: CarouselImageRecord[];
  }> {
    const MAX_IMAGES = 10;
    const removedOldest: CarouselImageRecord[] = [];
    const cleanCaption = input.caption || 'Sugarcane Supply Highlight';
    const cleanTe = (input.captionTe || '').trim();
    const cleanHi = (input.captionHi || '').trim();

    if (usingMongo) {
      const doc = await CarouselImageModel.create({
        url: input.url,
        publicId: input.publicId,
        caption: cleanCaption,
        captionTe: cleanTe,
        captionHi: cleanHi,
        uploadedAt: new Date(),
      });

      const allNewestFirst = await CarouselImageModel.find()
        .sort({ uploadedAt: -1, createdAt: -1 })
        .lean();

      if (allNewestFirst.length > MAX_IMAGES) {
        const overflow = allNewestFirst.slice(MAX_IMAGES);
        for (const oldImg of overflow) {
          await CarouselImageModel.findByIdAndDelete(oldImg._id);
          removedOldest.push({
            _id: String(oldImg._id),
            url: oldImg.url,
            publicId: oldImg.publicId,
            caption: oldImg.caption,
            captionTe: oldImg.captionTe || '',
            captionHi: oldImg.captionHi || '',
            uploadedAt: oldImg.uploadedAt.toISOString(),
            createdAt: oldImg.createdAt.toISOString(),
          });
        }
      }

      return {
        created: {
          _id: String(doc._id),
          url: doc.url,
          publicId: doc.publicId,
          caption: doc.caption,
          captionTe: doc.captionTe || '',
          captionHi: doc.captionHi || '',
          uploadedAt: doc.uploadedAt.toISOString(),
          createdAt: doc.createdAt.toISOString(),
        },
        removedOldest,
      };
    }

    const db = ensureLocalStore();
    const now = new Date().toISOString();
    const created: CarouselImageRecord = {
      _id: genId('img'),
      url: input.url,
      publicId: input.publicId,
      caption: cleanCaption,
      captionTe: cleanTe,
      captionHi: cleanHi,
      uploadedAt: now,
      createdAt: now,
    };

    db.carouselImages.unshift(created);
    db.carouselImages.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    while (db.carouselImages.length > MAX_IMAGES) {
      const oldest = db.carouselImages.pop();
      if (oldest) {
        removedOldest.push({
          ...oldest,
          captionTe: oldest.captionTe || '',
          captionHi: oldest.captionHi || '',
        });
      }
    }

    saveLocalStore(db);
    return { created, removedOldest };
  },

  async updateCarouselImageCaptions(
    id: string,
    input: {
      caption?: string;
      captionTe?: string;
      captionHi?: string;
    }
  ): Promise<CarouselImageRecord | null> {
    const updatePayload: Record<string, string> = {};
    if (typeof input.caption === 'string') {
      updatePayload.caption = input.caption.trim();
    }
    if (typeof input.captionTe === 'string') {
      updatePayload.captionTe = input.captionTe.trim();
    }
    if (typeof input.captionHi === 'string') {
      updatePayload.captionHi = input.captionHi.trim();
    }

    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const doc = await CarouselImageModel.findByIdAndUpdate(
        id,
        { $set: updatePayload },
        { new: true }
      ).lean();
      if (!doc) return null;
      return {
        _id: String(doc._id),
        url: doc.url,
        publicId: doc.publicId,
        caption: doc.caption,
        captionTe: doc.captionTe || '',
        captionHi: doc.captionHi || '',
        uploadedAt: doc.uploadedAt.toISOString(),
        createdAt: doc.createdAt.toISOString(),
      };
    }

    const db = ensureLocalStore();
    const index = db.carouselImages.findIndex((img) => img._id === id);
    if (index === -1) return null;

    const current = db.carouselImages[index];
    const updated: CarouselImageRecord = {
      ...current,
      caption:
        typeof updatePayload.caption === 'string' && updatePayload.caption
          ? updatePayload.caption
          : current.caption,
      captionTe:
        typeof updatePayload.captionTe === 'string'
          ? updatePayload.captionTe
          : current.captionTe || '',
      captionHi:
        typeof updatePayload.captionHi === 'string'
          ? updatePayload.captionHi
          : current.captionHi || '',
    };
    db.carouselImages[index] = updated;
    saveLocalStore(db);
    return updated;
  },

  async deleteCarouselImage(id: string): Promise<CarouselImageRecord | null> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const doc = await CarouselImageModel.findByIdAndDelete(id).lean();
      if (!doc) return null;
      return {
        _id: String(doc._id),
        url: doc.url,
        publicId: doc.publicId,
        caption: doc.caption,
        captionTe: doc.captionTe || '',
        captionHi: doc.captionHi || '',
        uploadedAt: doc.uploadedAt.toISOString(),
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const db = ensureLocalStore();
    const target = db.carouselImages.find((img) => img._id === id) || null;
    if (!target) return null;
    db.carouselImages = db.carouselImages.filter((img) => img._id !== id);
    saveLocalStore(db);
    return {
      ...target,
      captionTe: target.captionTe || '',
      captionHi: target.captionHi || '',
    };
  },

  // --- Public Quotes & Inquiries ---
  async createInquiry(input: {
    name: string;
    phone: string;
    company?: string;
    message: string;
  }): Promise<InquiryRecord> {
    if (usingMongo) {
      const doc = await InquiryModel.create({
        name: input.name.trim(),
        phone: input.phone.trim(),
        company: (input.company || '').trim(),
        message: input.message.trim(),
        status: 'New',
      });
      return {
        _id: String(doc._id),
        name: doc.name,
        phone: doc.phone,
        company: doc.company,
        message: doc.message,
        status: doc.status || 'New',
        createdAt: doc.createdAt.toISOString(),
        updatedAt: (doc.updatedAt || doc.createdAt).toISOString(),
      };
    }
    const db = ensureLocalStore();
    const now = new Date().toISOString();
    const created: InquiryRecord = {
      _id: genId('inq'),
      name: input.name.trim(),
      phone: input.phone.trim(),
      company: (input.company || '').trim(),
      message: input.message.trim(),
      status: 'New',
      createdAt: now,
      updatedAt: now,
    };
    db.inquiries.unshift(created);
    saveLocalStore(db);
    return created;
  },

  async listInquiries(): Promise<InquiryRecord[]> {
    if (usingMongo) {
      const docs = await InquiryModel.find().sort({ createdAt: -1 }).lean();
      return docs.map((d: IInquiry & { _id: unknown; updatedAt?: Date }) => ({
        _id: String(d._id),
        name: d.name,
        phone: d.phone,
        company: d.company,
        message: d.message,
        status: d.status || 'New',
        createdAt: d.createdAt.toISOString(),
        updatedAt: (d.updatedAt || d.createdAt).toISOString(),
      }));
    }
    const db = ensureLocalStore();
    return [...db.inquiries]
      .map((d) => ({
        ...d,
        status: d.status || ('New' as QuoteStatus),
        updatedAt: d.updatedAt || d.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  async updateInquiryStatus(
    id: string,
    status: QuoteStatus
  ): Promise<InquiryRecord | null> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const d = await InquiryModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).lean();
      if (!d) return null;
      return {
        _id: String(d._id),
        name: d.name,
        phone: d.phone,
        company: d.company,
        message: d.message,
        status: d.status || 'New',
        createdAt: d.createdAt.toISOString(),
        updatedAt: (d.updatedAt || d.createdAt).toISOString(),
      };
    }
    const db = ensureLocalStore();
    const idx = db.inquiries.findIndex((i) => i._id === id);
    if (idx === -1) return null;
    db.inquiries[idx] = {
      ...db.inquiries[idx],
      status,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(db);
    return db.inquiries[idx];
  },

  async deleteInquiry(id: string): Promise<boolean> {
    if (usingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const res = await InquiryModel.findByIdAndDelete(id);
      return Boolean(res);
    }
    const db = ensureLocalStore();
    const before = db.inquiries.length;
    db.inquiries = db.inquiries.filter((i) => i._id !== id);
    if (db.inquiries.length === before) return false;
    saveLocalStore(db);
    return true;
  },
};
