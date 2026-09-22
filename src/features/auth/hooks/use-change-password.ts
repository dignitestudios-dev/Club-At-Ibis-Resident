"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { changePasswordSchema } from "@/features/auth/schemas/change-password.schema";
import { useChangePasswordMutation } from "@/features/auth/api/auth.mutations";

export function useChangePassword() {
  const user = useCurrentUser();
  const router = useRouter();
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
    changePass(data, {
      onSuccess: () => {
        toast.success("Password updated", "Please sign in with your new password.");
        localStorage.removeItem("auth-token");
        localStorage.removeItem("auth-user");
        localStorage.setItem("cai.logged-out", "true");
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
        router.push("/auth/login");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update password.");
      },
    });
  }

  return {
    form,
    onSubmit,
    isPending,
  };
}
