import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  MdVerified, 
  MdAdd,
  MdStar,
  MdPending
} from "react-icons/md";

import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";
import {
  getVerificationRequests,
  getVerificationStats,
  createVerificationRequest,
  cancelVerificationRequest,
  type VerificationRequest,
  type VerificationStats,
  type CreateVerificationPayload,
  VerificationStatus
} from "../../services/api/verification";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingState } from "../../components/ui/loading";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import VerificationCard from "../../components/verification/VerificationCard";
import VerificationRequestModal from "../../components/verification/VerificationRequestModal";

export default function VerificationPage() {
  const { success, error } = useToast();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState<string | null>(null);

  // Check if user is on BLAZE tier (required for verification)
  const userTier = user && typeof user === "object" && "subscription" in user 
    ? user.subscription as string 
    : "STARTER";
  const canRequestVerification = userTier === "BLAZE";

  // Load verification data
  const loadVerificationData = useCallback(async () => {
    try {
      setLoading(true);
      const [requestsData, statsData] = await Promise.all([
        getVerificationRequests(),
        getVerificationStats()
      ]);

      setRequests(requestsData.requests);
      setStats(statsData);
    } catch (err) {
      error("Failed to load verification data", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (canRequestVerification) {
      loadVerificationData();
    } else {
      setLoading(false);
    }
  }, [canRequestVerification, loadVerificationData]);

  const handleCreateRequest = async (data: CreateVerificationPayload) => {
    try {
      setSubmitting(true);
      const newRequest = await createVerificationRequest(data);
      setRequests(prev => [newRequest, ...prev]);
      success("Verification request submitted successfully!");
      setShowRequestModal(false);
      
      // Reload stats
      loadVerificationData();
    } catch (err) {
      error("Failed to submit verification request", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelVerificationRequest(requestId);
      setRequests(prev => prev.filter(req => req.id !== requestId));
      success("Verification request cancelled");
      setCancelRequestId(null);
      
      // Reload stats
      loadVerificationData();
    } catch (err) {
      error("Failed to cancel verification request", getErrorMessage(err));
    }
  };

  if (!canRequestVerification) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdStar size={32} className="text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Available on BLAZE Plan</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get verified badges for your profile by upgrading to our BLAZE plan. Stand out with official verification.
          </p>
          <Button>
            Upgrade to BLAZE
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState text="Loading verification data..." fullscreen />;
  }

  const pendingRequests = requests.filter(req => req.status === VerificationStatus.PENDING);
  const hasActiveRequest = pendingRequests.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MdVerified size={28} className="text-primary" />
            Verification Center
          </h1>
          <p className="text-gray-600">
            Get verified badges for your profile to build trust and credibility
          </p>
        </div>
        
        {!hasActiveRequest && (
          <Button onClick={() => setShowRequestModal(true)}>
            <MdAdd size={20} className="mr-2" />
            Request Verification
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MdVerified size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <MdPending size={24} className="text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <MdPending size={24} className="text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.rejectedRequests}</p>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MdVerified size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                  <p className="text-sm text-gray-600">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verification Badges */}
      {stats?.verificationBadges && stats.verificationBadges.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdVerified size={20} className="text-green-600" />
              Your Verification Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.verificationBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-full"
                >
                  <MdVerified size={16} />
                  <span className="text-sm font-medium">
                    {badge.type.charAt(0) + badge.type.slice(1).toLowerCase()} Verified
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Requests */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Verification Requests
        </h2>
        
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdVerified size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No verification requests yet</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Submit your first verification request to get started with building trust and credibility.
            </p>
            <Button onClick={() => setShowRequestModal(true)}>
              <MdAdd size={20} className="mr-2" />
              Request Verification
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <VerificationCard
                key={request.id}
                request={request}
                onCancel={(id) => setCancelRequestId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      <VerificationRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleCreateRequest}
        submitting={submitting}
      />

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={cancelRequestId !== null}
        onCancel={() => setCancelRequestId(null)}
        onConfirm={() => cancelRequestId && handleCancelRequest(cancelRequestId)}
        title="Cancel Verification Request"
        message="Are you sure you want to cancel this verification request? This action cannot be undone."
        confirmText="Cancel Request"
        type="danger"
      />
    </div>
  );
}
