import { relations } from 'drizzle-orm';
import { sqliteTable, int, integer, index, text } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { MailboxForUser, Mailbox } from './mailbox';

// The User
export const User = sqliteTable("users", {
    id: text("id", { length: 24 }).unique().$defaultFn(() => createId()).primaryKey(),
    createdAt: int('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    username: text("username", { length: 20 }).notNull(),
    password: text("password", { length: 200 }).notNull(),
    admin: int("admin", { mode: "boolean" }).default(false),
    email: text("email").notNull()
}, (table) => ({
    usernameIdx: index("user_username").on(table.username),
}));

export const UserRelations = relations(User, ({ many, one }) => ({
    notifications: many(UserNotification),
    mailboxes: many(MailboxForUser),
}));


// Notifications
export const UserNotification = sqliteTable("user_notifications", {
    id: text("id", { length: 24 }).primaryKey().unique().$defaultFn(() => createId()),
    endpoint: text("endpoint", { length: 512 }).notNull().unique(),
    userId: text("user_id", { length: 24 }).notNull()
        .references(() => User.id, { onDelete: 'cascade' }),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
}, (table) => {
    return {
        userIdx: index("notification_user_id").on(table.userId),
    }
})

export const UserNotificationRelations = relations(UserNotification, ({ many, one }) => ({
    user: one(User, {
        fields: [UserNotification.userId],
        references: [User.id],
    })
}));


// Invite codes
export const InviteCode = sqliteTable("invite_codes", {
    code: text("code", { length: 24 }).primaryKey().unique().$defaultFn(() => createId()),
    createdBy: text("created_by", { length: 24 }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    usedBy: text("code", { length: 24 }),
    usedAt: integer('created_at', { mode: 'timestamp' })
})