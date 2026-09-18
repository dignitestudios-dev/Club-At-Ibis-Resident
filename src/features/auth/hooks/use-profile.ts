"use client";

import { useEffect } from "react";
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
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function onSubmit(data: ProfileFormData) {
    if (!user) return;
    updateProfile(
      { id: user.id, updates: data },
      {
        onSuccess: (updated) => {
          localStorage.setItem("auth-user", JSON.stringify(updated));
          dispatch(setUser(updated));
          toast.success("Profile updated.");
        },
        onError: () => toast.error("Unable to update your profile."),
      }
    );
  }

  return { form, onSubmit, isPending, user };
}
