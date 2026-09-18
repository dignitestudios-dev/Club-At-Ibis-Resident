import { db, delay } from "@/lib/mock/store";

function toPublic(resident: Resident): PublicResident {
  const { password: _password, ...rest } = resident;
  return rest;
}

export async function loginUser(credentials: LoginCredentials): Promise<PublicResident> {
  const residents = db.getResidents();
  const match = residents.find(
    (r) =>
      r.email.toLowerCase() === credentials.email.toLowerCase() &&
      r.password === credentials.password
  );
  if (!match) {
    await delay(null, 150);
    throw new Error("Invalid email or password.");
  }
  return delay(toPublic(match), 180);
}

export async function registerUser(payload: RegisterPayload): Promise<PublicResident> {
  const residents = db.getResidents();
  if (residents.some((r) => r.email.toLowerCase() === payload.email.toLowerCase())) {
    await delay(null, 150);
    throw new Error("An account with this email already exists.");
  }
  const randomIdNum = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
  const resident: Resident = {
    id: crypto.randomUUID(),
    residentIdNumber: payload.residentIdNumber || randomIdNum,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: payload.password,
    createdAt: new Date().toISOString(),
  };
  db.setResidents([...residents, resident]);
  return delay(toPublic(resident), 200);
}

export async function requestPasswordReset({ email }: ForgotPasswordPayload): Promise<void> {
  const residents = db.getResidents();
  const match = residents.find((r) => r.email.toLowerCase() === email.toLowerCase());
  // Always resolve the same way regardless of whether the email exists —
  // this is a mock stand-in for a real email send; the "token" here is
  // just the resident id, obfuscated, since there is no email transport.
  if (match) {
    console.info(`[mock email] Password reset link: /auth/reset-password?token=${btoa(match.id)}`);
  }
  return delay(undefined, 200);
}

export async function resetPassword({
  token,
  password,
}: ResetPasswordPayload): Promise<void> {
  let residentId: string;
  try {
    residentId = atob(token);
  } catch {
    await delay(null, 150);
    throw new Error("This reset link is invalid or has expired.");
  }
  const residents = db.getResidents();
  const idx = residents.findIndex((r) => r.id === residentId);
  if (idx === -1) {
    await delay(null, 150);
    throw new Error("This reset link is invalid or has expired.");
  }
  const next = [...residents];
  next[idx] = { ...next[idx], password };
  db.setResidents(next);
  return delay(undefined, 180);
}

export async function updateProfile(
  id: string,
  updates: ProfileFormData
): Promise<PublicResident> {
  const residents = db.getResidents();
  const idx = residents.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Resident not found.");
  const updated: Resident = { ...residents[idx], ...updates };
  const next = [...residents];
  next[idx] = updated;
  db.setResidents(next);
  return delay(toPublic(updated), 150);
}

export async function changePassword(
  id: string,
  payload: ChangePasswordPayload
): Promise<void> {
  const residents = db.getResidents();
  const idx = residents.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Resident not found.");
  if (residents[idx].password !== payload.currentPassword) {
    await delay(null, 150);
    throw new Error("The current password you entered is incorrect.");
  }
  const next = [...residents];
  next[idx] = { ...next[idx], password: payload.newPassword };
  db.setResidents(next);
  return delay(undefined, 180);
}
