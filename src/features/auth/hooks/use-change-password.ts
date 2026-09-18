"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { changePasswordSchema } from "@/features/auth/schemas/change-password.schema";
import { useChangePasswordMutation } from "@/features/auth/api/auth.mutations";

export function useChangePassword() {
  const user = useCurrentUser();
  const toast = useToast();
  const { mutate: changePass, isPending } = useChangePasswordMutation();

  const form = useForm<ChangePasswordPayload>({
    mode: "onChange",
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  function onSubmit(data: ChangePasswordPayload) {
    if (!user) return;
    changePass(
      { id: user.id, payload: data },
      {
        onSuccess: () => {
          toast.success("Password updated successfully.");
          form.reset({
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          });
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to update password.");
        },
      }
    );
  }

  return {
    form,
    onSubmit,
    isPending,
  };
}
