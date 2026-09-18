interface Resident {
  id: string;
  residentIdNumber: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  lotNo?: string;
  createdAt: string;
}

type PublicResident = Omit<Resident, "password">;

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  residentIdNumber?: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ProfileFormData {
  firstName: string;
  lastName?: string;
  phone?: string;
}

interface AuthState {
  user: PublicResident | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
