import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Used as session identifier (UUID generated on creation) */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 64 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  cedula: varchar("cedula", { length: 20 }).unique(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Panama"),
  status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  assignedLawyerId: int("assignedLawyerId").references(() => users.id),
  caseNumber: varchar("caseNumber", { length: 50 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  caseType: varchar("caseType", { length: 100 }),
  status: mysqlEnum("status", ["open", "pending", "closed", "archived"]).default("open"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  openDate: timestamp("openDate").defaultNow().notNull(),
  closeDate: timestamp("closeDate"),
  budget: int("budget"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").references(() => cases.id),
  clientId: int("clientId").references(() => clients.id),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  storageUrl: text("storageUrl"),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  status: mysqlEnum("status", ["draft", "pending_signature", "signed", "archived"]).default("draft"),
  isSigned: int("isSigned").default(0),
  signedBy: int("signedBy").references(() => users.id),
  signedAt: timestamp("signedAt"),
  signatureMetadata: text("signatureMetadata"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export const timeEntries = mysqlTable("timeEntries", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull().references(() => cases.id),
  lawyerId: int("lawyerId").notNull().references(() => users.id),
  description: text("description"),
  hours: int("hours"),
  hourlyRate: int("hourlyRate"),
  totalAmount: int("totalAmount"),
  billable: int("billable").default(1),
  entryDate: timestamp("entryDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull().references(() => cases.id),
  clientId: int("clientId").notNull().references(() => clients.id),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).unique().notNull(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("PAB"),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  issueDate: timestamp("issueDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  description: text("description"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").references(() => cases.id),
  clientId: int("clientId").references(() => clients.id),
  lawyerId: int("lawyerId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  location: varchar("location", { length: 255 }),
  type: varchar("type", { length: 100 }),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "rescheduled"]).default("scheduled"),
  notificationSent: int("notificationSent").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

export const documentTemplates = mysqlTable("documentTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  content: text("content"),
  fields: text("fields"),
  isActive: int("isActive").default(1),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = typeof documentTemplates.$inferInsert;

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export const privacyConsents = mysqlTable("privacyConsents", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  consentType: varchar("consentType", { length: 100 }).notNull(),
  consentGiven: int("consentGiven").notNull(),
  consentDate: timestamp("consentDate").defaultNow().notNull(),
  expiryDate: timestamp("expiryDate"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PrivacyConsent = typeof privacyConsents.$inferSelect;
export type InsertPrivacyConsent = typeof privacyConsents.$inferInsert;
