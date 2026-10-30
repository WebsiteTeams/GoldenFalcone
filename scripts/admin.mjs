#!/usr/bin/env node
/**
 * Goldenfalcone admin CLI — the only way to create administrators or reset passwords.
 * There is deliberately no web endpoint for either.
 *
 *   npm run admin:create -- --email owner@example.com --name "Jane Doe" [--role admin|editor]
 *   npm run admin:reset-password -- --email owner@example.com
 *
 * The password is read from a hidden prompt, or from ADMIN_PASSWORD for non-interactive deployments.
 * It is never accepted as a command-line argument (those end up in shell history).
 */
import readline from "node:readline";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const [command, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith("--")) args[rest[i].slice(2)] = rest[i + 1]?.startsWith("--") ? true : rest[++i];
}

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

function prompt(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Echo "*" instead of the typed characters.
      rl._writeToOutput = (s) => rl.output.write(s.includes(question) ? s : s.replace(/[^\r\n]/g, "*"));
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function readPassword() {
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (!process.stdin.isTTY) fail("No terminal available. Set ADMIN_PASSWORD for non-interactive use.");
    password = await prompt("Password (min 12 characters): ", true);
    const confirm = await prompt("Confirm password: ", true);
    if (password !== confirm) fail("Passwords do not match.");
  }
  if (password.length < 12) fail("Password must be at least 12 characters.");
  if (Buffer.byteLength(password, "utf8") > 72) fail("Password must be 72 bytes or fewer.");
  return password;
}

const email = String(args.email ?? "").trim().toLowerCase();
if (!["create", "reset-password"].includes(command)) fail("Usage: admin.mjs <create|reset-password> --email <email> [--name <name>] [--role admin|editor]");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Provide a valid --email.");

const uri = process.env.MONGODB_URI;
if (!uri) fail("MONGODB_URI is not set. Add it to .env.local or .env, or export it in your shell.");

await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || undefined, serverSelectionTimeoutMS: 10000 });
const admins = mongoose.connection.collection("admins");
const sessions = mongoose.connection.collection("sessions");
await admins.createIndex({ email: 1 }, { unique: true });

try {
  const existing = await admins.findOne({ email });

  if (command === "create") {
    if (existing) fail(`An administrator with ${email} already exists. Use reset-password instead.`);
    const name = String(args.name ?? "").trim();
    if (name.length < 2) fail('Provide --name "Full Name".');
    const role = args.role ?? "admin";
    if (!["admin", "editor"].includes(role)) fail("--role must be admin or editor.");
    const passwordHash = await bcrypt.hash(await readPassword(), 12);
    const now = new Date();
    await admins.insertOne({ email, name, passwordHash, role, active: true, createdAt: now, updatedAt: now, __v: 0 });
    console.log(`\n✔ Created ${role} ${name} <${email}>. Sign in at /admin/login\n`);
  } else {
    if (!existing) fail(`No administrator found for ${email}.`);
    const passwordHash = await bcrypt.hash(await readPassword(), 12);
    const now = new Date();
    await admins.updateOne({ _id: existing._id }, { $set: { passwordHash, passwordChangedAt: now, updatedAt: now, active: true } });
    const { deletedCount } = await sessions.deleteMany({ admin: existing._id });
    console.log(`\n✔ Password reset for ${email}. ${deletedCount} active session(s) signed out.\n`);
  }
} finally {
  await mongoose.disconnect();
}
