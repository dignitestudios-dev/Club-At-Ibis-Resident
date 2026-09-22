import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  changePassword,
  deleteAccount,
  confirmEmailVerification,
  resendEmailVerification,
} from "./auth.service";
import { authKeys } from "./auth.queries";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.currentUser, user);
    },
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
    mutationFn: (payload: { token: string; password: string }) => resetPassword(payload),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProfileFormData }) =>
      updateProfile(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(authKeys.currentUser, updated);
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { currentPassword: string }) => deleteAccount(payload),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.currentUser, null);
    },
  });
}

export function useConfirmEmailVerificationMutation() {
  return useMutation({
    mutationFn: (payload: { token: string }) => confirmEmailVerification(payload),
  });
}

export function useResendEmailVerificationMutation() {
  return useMutation({
    mutationFn: (payload: { email: string }) => resendEmailVerification(payload),
  });
}
