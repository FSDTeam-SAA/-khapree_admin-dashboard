"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CardsSkeleton } from "@/components/shared/loading-blocks";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { getProfile, queryKeys, updateProfile, changePassword } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const defaultPasswordForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { update } = useSession();
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(defaultPasswordForm);

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });

  const displayName = useMemo(() => {
    if (nameTouched) return name;
    return profileQuery.data?.name || "";
  }, [name, nameTouched, profileQuery.data?.name]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data) => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      await update({
        name: data.name,
        avatar: data.avatar,
      });
      setName(data.name || "");
      setNameTouched(false);
      setAvatarFile(null);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswordForm(defaultPasswordForm);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : profileQuery.data?.avatar?.url;

  const submitProfile = () => {
    const normalizedName = displayName.trim();

    if (!normalizedName) {
      toast.error("Name is required");
      return;
    }

    const payload = new FormData();
    payload.append("name", normalizedName);
    if (avatarFile) payload.append("avatar", avatarFile);

    updateProfileMutation.mutate(payload);
  };

  const submitPassword = () => {
    if (
      !passwordForm.currentPassword.trim() ||
      !passwordForm.newPassword.trim() ||
      !passwordForm.confirmPassword.trim()
    ) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Password confirmation does not match");
      return;
    }

    changePasswordMutation.mutate(passwordForm);
  };

  return (
    <div className="fade-up">
      <PageHeader title="Setting" subtitle="Edit your personal information" />

      {profileQuery.isLoading ? <CardsSkeleton count={2} /> : null}

      {!profileQuery.isLoading ? (
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-4 rounded-md border border-app-border bg-app-soft/40 p-4 sm:flex-row sm:items-center">
                <Avatar
                  src={avatarPreview}
                  name={profileQuery.data?.name}
                  className="h-[92px] w-[92px] border border-app-border"
                />
                <div>
                  <p className="text-3xl font-semibold text-app-heading">{profileQuery.data?.name}</p>
                  <p className="text-app-muted">@{profileQuery.data?.role || "admin"}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(event) => {
                      setNameTouched(true);
                      setName(event.target.value);
                    }}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={92}
                  height={92}
                  className="h-[92px] w-[92px] rounded-md border border-app-border object-cover"
                />
              ) : null}

              <Button onClick={submitProfile} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <PasswordInput
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: event.target.value,
                      }))
                    }
                    placeholder="****************"
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <PasswordInput
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                    placeholder="****************"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <PasswordInput
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
                    placeholder="****************"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={submitPassword} disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
