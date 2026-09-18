import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  changePassword,
} from "./auth.service";
import { authKeys } from "./auth.queries";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser, user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser, user);
    },
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
    mutationFn: ({ id, payload }: { id: string; payload: ChangePasswordPayload }) =>
      changePassword(id, payload),
  });
}

