import { useState, useEffect } from "react";
import {
  MdSettings,
  MdPerson,
  MdSecurity,
  MdNotifications,
  MdPalette,
  MdDelete,
  MdVisibility,
  MdCreditCard,
} from "react-icons/md";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import { 
  getCurrentSubscription, 
  cancelSubscription,
  CurrentSubscription,
} from "../../services/api/subscription";
import { deleteAccount } from "../../services/api/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import ConfirmDialog from "../../components/common/ConfirmDialog";

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingsSection({ title, description, icon, children }: SettingsSectionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Subscription data
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  
  // Form states
  const [notifications, setNotifications] = useState({
    email: true,
    marketing: false,
    security: true,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showLastSeen: false,
    allowIndexing: true,
  });

  const [deleteAccountInput, setDeleteAccountInput] = useState("");

  // Load subscription data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const subscriptionData = await getCurrentSubscription();
        setCurrentSubscription(subscriptionData);
      } catch (err) {
        console.error('Failed to load subscription data:', err);
        error('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [error]);

  const handleCancelSubscription = async () => {
    try {
      setActionLoading(true);
      await cancelSubscription();
      success('Subscription cancelled successfully');
      // Refresh subscription data
      const subscriptionData = await getCurrentSubscription();
      setCurrentSubscription(subscriptionData);
    } catch {
      error('Failed to cancel subscription');
    } finally {
      setActionLoading(false);
      setShowCancelConfirm(false);
    }
  };

  useEffect(() => {
    // Load user settings from API when implemented
  }, []);

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    success("Notification settings updated");
  };

  const handlePrivacyChange = async (key: keyof typeof privacy, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    success("Privacy settings updated");
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountInput !== "DELETE") {
      error("Please type DELETE to confirm");
      return;
    }

    try {
      setLoading(true);
      await deleteAccount();
      success("Account deleted successfully");
      logout();
    } catch {
      error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <MdSettings size={28} className="text-primary" />
          Settings
        </h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <SettingsSection
          title="Account Information"
          description="Update your basic account information"
          icon={<MdPerson size={20} className="text-primary" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={(user as { firstName?: string })?.firstName || ""}
                  placeholder="First name"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={(user as { lastName?: string })?.lastName || ""}
                  placeholder="Last name"
                  disabled
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                To change your email, please contact support
              </p>
            </div>
            <p className="text-sm text-blue-600">
              Edit your profile information in the{" "}
              <a href="/dashboard/profile" className="underline">Profile section</a>
            </p>
          </div>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection
          title="Security & Authentication"
          description="Manage your password and security preferences"
          icon={<MdSecurity size={20} className="text-primary" />}
        >
          <div className="space-y-4">
            <div>
              <Button variant="outline">
                Change Password
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                Last changed 3 months ago
              </p>
            </div>
            <div>
              <Button variant="outline">
                Enable Two-Factor Authentication
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Subscription Management */}
        <SettingsSection
          title="Subscription Management"
          description="Manage your subscription plan and billing"
          icon={<MdCreditCard size={20} className="text-primary" />}
        >
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading subscription data...</p>
            </div>
          ) : currentSubscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Current Plan</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {currentSubscription.plan?.name || "Not available"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    currentSubscription.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : currentSubscription.status === 'canceled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentSubscription.status}
                  </span>
                </div>
                {currentSubscription.currentPeriodEnd && (
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {currentSubscription.status === 'active' ? 'Next Billing' : 'Expires'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">Amount</h3>
                  <p className="text-sm text-gray-600">
                    {currentSubscription.plan?.monthlyPrice 
                      ? `₵${currentSubscription.plan.monthlyPrice.toLocaleString()}/monthly` 
                      : "Not available"}
                  </p>
                </div>
              </div>
              
              {currentSubscription.status === 'active' && (
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={actionLoading}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You don't have an active subscription</p>
              <Button onClick={() => window.location.href = '/dashboard/subscription'}>
                View Plans
              </Button>
            </div>
          )}
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          title="Notifications"
          description="Choose what notifications you'd like to receive"
          icon={<MdNotifications size={20} className="text-primary" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email notifications</p>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <button
                onClick={() => handleNotificationChange('email', !notifications.email)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.email ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Marketing emails</p>
                <p className="text-sm text-gray-600">Receive product updates and tips</p>
              </div>
              <button
                onClick={() => handleNotificationChange('marketing', !notifications.marketing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.marketing ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.marketing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Security alerts</p>
                <p className="text-sm text-gray-600">Get notified about account security</p>
              </div>
              <button
                onClick={() => handleNotificationChange('security', !notifications.security)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.security ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.security ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Privacy Settings */}
        <SettingsSection
          title="Privacy & Visibility"
          description="Control who can see your profile and information"
          icon={<MdVisibility size={20} className="text-primary" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Profile visibility</p>
                <p className="text-sm text-gray-600">Make your profile public</p>
              </div>
              <button
                onClick={() => handlePrivacyChange('profileVisible', !privacy.profileVisible)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy.profileVisible ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.profileVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Search engine indexing</p>
                <p className="text-sm text-gray-600">Allow search engines to index your portfolio</p>
              </div>
              <button
                onClick={() => handlePrivacyChange('allowIndexing', !privacy.allowIndexing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy.allowIndexing ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.allowIndexing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Appearance Settings */}
        <SettingsSection
          title="Appearance"
          description="Customize the look and feel of your dashboard"
          icon={<MdPalette size={20} className="text-primary" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection
          title="Danger Zone"
          description="Irreversible and destructive actions"
          icon={<MdDelete size={20} className="text-red-600" />}
        >
          <div className="space-y-4">
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
              <p className="text-sm text-red-700 mb-4">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="deleteConfirm" className="text-red-900">
                      Type "DELETE" to confirm
                    </Label>
                    <Input
                      id="deleteConfirm"
                      value={deleteAccountInput}
                      onChange={(e) => setDeleteAccountInput(e.target.value)}
                      placeholder="Type DELETE"
                      className="border-red-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountInput !== "DELETE" || loading}
                    >
                      {loading ? "Deleting..." : "Delete Account"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteAccountInput("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Subscription Cancellation Confirmation */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onCancel={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period."
        confirmText="Cancel Subscription"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}
