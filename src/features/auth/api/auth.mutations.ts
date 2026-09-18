import { useMutation } from "@tanstack/react-query";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  changePassword,
} from "./auth.service";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => requestPasswordReset(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
}

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProfileFormData }) =>
      updateProfile(id, updates),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangePasswordPayload }) =>
      changePassword(id, payload),
  });
}

