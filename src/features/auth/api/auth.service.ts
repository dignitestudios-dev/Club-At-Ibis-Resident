import axiosInstance from "@/lib/axios";

/** Shape the backend's `publicUser` presenter returns for a RESIDENT account. */
interface ResidentApiUser {
  _id: string;
  residentId?: string;
  firstName: string;
  lastName?: string;
  email: string;
  accountStatus: string;
  credentialStatus: string;
  phone?: string;
  address?: string;
  lotNo?: string;
  createdAt: string;
  lastLoginAt?: string | null;
}

function toPublicResident(u: ResidentApiUser): PublicResident {
  return {
    id: u._id,
    residentIdNumber: u.residentId || "",
    firstName: u.firstName,
    lastName: u.lastName || "",
    email: u.email,
    phone: u.phone,
    address: u.address,
    lotNo: u.lotNo,
    createdAt: u.createdAt,
  };
}

export async function getCurrentUser(): Promise<PublicResident | null> {
  if (typeof window === "undefined") return null;
  if (!localStorage.getItem("auth-token")) return null;
  try {
    const { data } = await axiosInstance.get("/auth/me");
    return toPublicResident(data.data.user);
  } catch {
    return null;
  }
}

export async function getResidentById(_id: string): Promise<PublicResident | null> {
  // Direct resident lookup delegates to getCurrentUser for self
  return getCurrentUser();
}

/**
 * Log in as a resident. Callers store `token` in localStorage and Redux.
 */
export async function loginUser(credentials: LoginCredentials): Promise<{ token: string; user: PublicResident }> {
  const { data } = await axiosInstance.post("/auth/login", {
    ...credentials,
    role: "RESIDENT",
  });
  return {
    token: data.data.token,
    user: toPublicResident(data.data.user),
  };
}

/**
 * Register a new resident account.
 * Note: Backend creates account in PENDING_EMAIL_VERIFICATION state.
 */
export async function registerUser(payload: RegisterPayload): Promise<{ user: PublicResident; message: string }> {
  const { data } = await axiosInstance.post("/auth/residents", {
    residentId: payload.residentId.trim(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });
  return {
    user: toPublicResident(data.data.user),
    message: data.message || "Registration accepted. Verify your email before logging in.",
  };
}

export async function logoutUser(): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
  if (!token) return;
  try {
    await axiosInstance.post("/auth/logout", null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Best-effort — the caller clears local storage regardless
  }
}

export async function requestPasswordReset({ email }: ForgotPasswordPayload): Promise<void> {
  await axiosInstance.post("/auth/password-reset-requests", {
    email: email.trim().toLowerCase(),
    role: "RESIDENT",
  });
}

export async function resetPassword({
  token,
  password,
}: {
  token: string;
  password: string;
}): Promise<void> {
  await axiosInstance.post("/auth/password-resets", {
    token,
    newPassword: password,
  });
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await axiosInstance.post("/auth/password-changes", {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
  });
}

export async function updateProfile(
  _id: string,
  updates: ProfileFormData
): Promise<PublicResident> {
  // In v1, profile details are saved and cached in user session
  const current = await getCurrentUser();
  const updated: PublicResident = {
    id: current?.id || _id,
    residentIdNumber: current?.residentIdNumber || "",
    email: current?.email || "",
    firstName: updates.firstName,
    lastName: updates.lastName || "",
    phone: updates.phone,
    address: current?.address,
    lotNo: current?.lotNo,
    createdAt: current?.createdAt || new Date().toISOString(),
  };
  localStorage.setItem("auth-user", JSON.stringify(updated));
  return updated;
}

export async function deleteAccount({ currentPassword }: { currentPassword: string }): Promise<void> {
  await axiosInstance.delete("/auth/account", {
    data: { currentPassword },
  });
}

/** Verify/preview an email-verification link without consuming the token. */
export async function inspectEmailVerification(token: string): Promise<TokenInspectionResult> {
  const { data } = await axiosInstance.get("/auth/email-verifications", {
    params: { token },
  });
  return data.data;
}

/** Confirm email verification with the single-use token. */
export async function confirmEmailVerification({ token }: { token: string }): Promise<{ user: PublicResident }> {
  const { data } = await axiosInstance.post("/auth/email-verifications/confirm", {
    token,
  });
  return { user: toPublicResident(data.data.user) };
}

/** Request another verification email to be sent. */
export async function resendEmailVerification({ email }: { email: string }): Promise<void> {
  await axiosInstance.post("/auth/email-verifications", {
    email: email.trim().toLowerCase(),
  });
}
