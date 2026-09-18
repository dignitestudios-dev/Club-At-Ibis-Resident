"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/auth.slice";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_REDIRECT } from "@/config/routes";
import { registerSchema } from "@/features/auth/schemas/register.schema";
import { useRegisterMutation } from "@/features/auth/api/auth.mutations";

export function useRegister() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { mutate: register, isPending } = useRegisterMutation();

  const form = useForm<RegisterPayload>({
    mode: "onChange",
    resolver: zodResolver(registerSchema),
  });

  function onSubmit(data: RegisterPayload) {
    register(data, {
      onSuccess: (user) => {
        const token = crypto.randomUUID();
        localStorage.removeItem("cai.logged-out");
        localStorage.setItem("auth-token", token);
        localStorage.setItem("auth-user", JSON.stringify(user));
        document.cookie = `auth-token=${token}; path=/; max-age=1209600; SameSite=Lax`;
        dispatch(setUser(user));
        toast.success("Account created.", "Welcome to Club At Ibis.");
        window.location.href = DEFAULT_REDIRECT;
      },
      onError: (error: Error) => {
        toast.error(error.message || "Unable to create account.");
      },
    });
  }

  return { form, onSubmit, isPending };
}
