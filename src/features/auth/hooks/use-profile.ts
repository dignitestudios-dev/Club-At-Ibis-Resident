"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/auth.slice";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { profileSchema } from "@/features/auth/schemas/profile.schema";
import { useUpdateProfileMutation } from "@/features/auth/api/auth.mutations";

export function useProfile() {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation();
  const initialized = useRef(false);

  const form = useForm<ProfileFormData>({
    mode: "onChange",
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
    },
  });

  useEffect(() => {
    if (user && !initialized.current) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
      });
      initialized.current = true;
    }
  }, [user, form]);

  function onSubmit(data: ProfileFormData) {
    if (!user) return;
    updateProfile(
      { id: user.id, updates: data },
      {
        onSuccess: (updated) => {
          localStorage.setItem("auth-user", JSON.stringify(updated));
          dispatch(setUser(updated));
          form.reset({
            firstName: updated.firstName ?? "",
            lastName: updated.lastName ?? "",
            phone: updated.phone ?? "",
          });
          toast.success("Profile updated.");
        },
        onError: (err: any) => toast.error("Unable to update your profile.", err?.message),
      }
    );
  }

  return { form, onSubmit, isPending, user };
}
