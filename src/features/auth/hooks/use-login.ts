"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/auth.slice";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_REDIRECT } from "@/config/routes";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { useLoginMutation } from "@/features/auth/api/auth.mutations";

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { mutate: login, isPending } = useLoginMutation();

  const form = useForm<LoginCredentials>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "avery.collins@example.com", password: "password123" },
  });

  function onSubmit(data: LoginCredentials) {
    login(data, {
      onSuccess: (user) => {
        const token = crypto.randomUUID();
        localStorage.removeItem("cai.logged-out");
        localStorage.setItem("auth-token", token);
        localStorage.setItem("auth-user", JSON.stringify(user));
        document.cookie = `auth-token=${token}; path=/; max-age=1209600; SameSite=Lax`;
        dispatch(setUser(user));
        toast.success(`Welcome back, ${user.firstName}.`);
        window.location.href = DEFAULT_REDIRECT;
      },
      onError: (error: Error) => {
        toast.error(error.message || "Unable to sign in.");
      },
    });
  }

  return { form, onSubmit, isPending };
}
