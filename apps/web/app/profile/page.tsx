"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { z } from "zod";

// Profile page component for managing user profile, password, and account settings
// Validation schemas for form inputs using Zod
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(15, "Password must be at most 15 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // States
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "account">("profile");
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<any>({});
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated" && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/login");
      return;
    }
    if (session?.user?.name) {
      setProfileForm({ name: session.user.name });
    }
    // Load saved avatar from session
    if (session?.user && (session.user as any).avatar) {
      console.log("Profile page - Loading avatar from session");
      console.log("Avatar length:", (session.user as any).avatar.length);
      console.log("Avatar preview:", (session.user as any).avatar.substring(0, 50) + "...");
      setAvatarPreview((session.user as any).avatar);
    } else {
      console.log("Profile page - No avatar in session");
      console.log("Session user:", session?.user);
    }
  }, [status, session, router]);

  if (status === "loading") return <LoadingSpinner />;

  const onLogout = () => signOut({ callbackUrl: "/login" });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      profileUpdateSchema.parse(profileForm);
      setLoading(true);

      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setEditMode(false);
        // Update the session with the new name instead of reloading the page
        await update({ name: profileForm.name });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setMessage({ type: "error", text: err.issues[0]?.message || "Validation error" });
      } else {
        setMessage({ type: "error", text: "An error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPasswordErrors({});

    try {
      changePasswordSchema.parse(passwordForm);
      setLoading(true);

      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: any = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0]] = issue.message;
          }
        });
        setPasswordErrors(errors);
        setMessage({ type: "error", text: "Please fix the errors below" });
      } else {
        setMessage({ type: "error", text: "An error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size must be less than 2MB" });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File must be an image" });
      return;
    }

    // Upload
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      const res = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("Upload response:", res.ok, data);

      if (res.ok) {
        console.log("Avatar uploaded successfully, setting preview");
        console.log("Avatar data length:", data.avatar?.length);
        setMessage({ type: "success", text: "Avatar updated successfully!" });
        // Set the avatar preview to the returned base64 image
        setAvatarPreview(data.avatar);
        // Reload the page to refresh the session with new avatar
        setTimeout(() => {
          console.log("Reloading page to refresh session...");
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to upload avatar" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to upload avatar" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile/delete", {
        method: "DELETE",
      });

      if (res.ok) {
        await signOut({ callbackUrl: "/login" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to delete account" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete account" });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Verification email sent!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send verification email" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to send verification email" });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout
      activePath="/profile"
      onLogout={onLogout}
      userName={session?.user?.name}
      userEmail={session?.user?.email}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginTop: 0,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            My Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Manage your account settings and preferences
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            backgroundColor: message.type === "success" ? "#D1FAE5" : "#FEE2E2",
            color: message.type === "success" ? "#065F46" : "#991B1B",
            border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FCA5A5"}`,
          }}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ 
          borderBottom: '2px solid var(--border-secondary)',
          marginBottom: '2rem',
          display: 'flex',
          gap: '2rem'
        }}>
          {[
            { id: "profile", label: "Profile" },
            { id: "security", label: "Security" },
            { id: "account", label: "Account" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.75rem 0',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? '#4ECDC4' : 'transparent'}`,
                color: activeTab === tab.id ? '#4ECDC4' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                fontSize: '1rem',
                marginBottom: '-2px',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Avatar Section */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid var(--border-secondary)',
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem' }}>
                Profile Picture
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#4ECDC4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!avatarPreview && getInitials(session?.user?.name)}
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="avatar-upload"
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#4ECDC4',
                      color: 'white',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                    }}
                  >
                    Upload New Photo
                  </label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid var(--border-secondary)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                  Personal Information
                </h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-secondary)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontWeight: '500',
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleProfileUpdate}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-secondary)',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-tertiary)' }}>
                      Email (cannot be changed)
                    </label>
                    <input
                      type="email"
                      value={session?.user?.email || ""}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-secondary)',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-tertiary)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#4ECDC4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setProfileForm({ name: session?.user?.name || "" });
                      }}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-secondary)',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Name</div>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{session?.user?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Email</div>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{session?.user?.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Change Password */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid var(--border-secondary)',
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem' }}>
                Change Password
              </h2>
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${passwordErrors.currentPassword ? '#FF6B6B' : 'var(--border-secondary)'}`,
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  {passwordErrors.currentPassword && (
                    <div style={{ color: '#FF6B6B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {passwordErrors.currentPassword}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${passwordErrors.newPassword ? '#FF6B6B' : 'var(--border-secondary)'}`,
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  {passwordErrors.newPassword && (
                    <div style={{ color: '#FF6B6B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {passwordErrors.newPassword}
                    </div>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                    Must be 6-15 characters with uppercase, lowercase, number, and special character (@$!%*?&#)
                  </p>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${passwordErrors.confirmPassword ? '#FF6B6B' : 'var(--border-secondary)'}`,
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  {passwordErrors.confirmPassword && (
                    <div style={{ color: '#FF6B6B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {passwordErrors.confirmPassword}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#4ECDC4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>

            {/* Email Verification Status */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid var(--border-secondary)',
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem' }}>
                Email Verification
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, marginBottom: '0.5rem' }}>
                    <strong>Email:</strong> {session?.user?.email}
                  </p>
                  <p style={{ 
                    margin: 0,
                    color: '#10B981',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ 
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      display: 'inline-block'
                    }}></span>
                    Verified
                  </p>
                </div>
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  Resend Verification
                </button>
              </div>
            </div>

            {/* Account Security Info */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid var(--border-secondary)',
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem' }}>
                Account Security
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Last Login</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)' }}>
                    schedule
                  </span>
                </div>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Active Sessions</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                      1 device currently active
                    </div>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)' }}>
                    devices
                  </span>
                </div>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Two-Factor Authentication</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                      Not enabled (Coming soon)
                    </div>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)' }}>
                    security
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Danger Zone */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid #FCA5A5',
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem', color: '#DC2626' }}>
                Danger Zone
              </h2>
              <div style={{
                padding: '1rem',
                backgroundColor: '#FEE2E2',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#991B1B' }}>
                  Delete Account
                </div>
                <div style={{ fontSize: '0.875rem', color: '#7F1D1D', marginBottom: '1rem' }}>
                  Once you delete your account, there is no going back. All your data, including tasks and profile information, will be permanently deleted.
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem' }}>
                Delete Account
              </h3>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Are you absolutely sure you want to delete your account? This action cannot be undone.
                All your data will be permanently deleted.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Deleting..." : "Yes, Delete My Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
