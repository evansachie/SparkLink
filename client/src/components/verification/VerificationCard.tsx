import { motion } from "framer-motion";
import { 
  MdVerified, 
  MdPending, 
  MdClose,
  MdBusiness,
  MdPerson,
  MdStar,
  MdGroup,
  MdPublic
} from "react-icons/md";
import { VerificationRequest, VerificationType, VerificationStatus } from "../../services/api/verification";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { formatDate } from "../../utils/format";

interface VerificationCardProps {
  request: VerificationRequest;
  onCancel?: (id: string) => void;
  onViewDetails?: (request: VerificationRequest) => void;
  loading?: boolean;
}

const getVerificationIcon = (type: VerificationType) => {
  switch (type) {
    case VerificationType.IDENTITY:
      return <MdPerson size={20} className="text-blue-600" />;
    case VerificationType.BUSINESS:
      return <MdBusiness size={20} className="text-green-600" />;
    case VerificationType.SOCIAL:
      return <MdPublic size={20} className="text-purple-600" />;
    case VerificationType.CELEBRITY:
      return <MdStar size={20} className="text-yellow-600" />;
    case VerificationType.ORGANIZATION:
      return <MdGroup size={20} className="text-indigo-600" />;
    default:
      return <MdVerified size={20} className="text-gray-600" />;
  }
};

const getStatusColor = (status: VerificationStatus) => {
  switch (status) {
    case VerificationStatus.APPROVED:
      return "bg-green-100 text-green-800";
    case VerificationStatus.REJECTED:
      return "bg-red-100 text-red-800";
    case VerificationStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: VerificationStatus) => {
  switch (status) {
    case VerificationStatus.APPROVED:
      return <MdVerified size={16} className="text-green-600" />;
    case VerificationStatus.REJECTED:
      return <MdClose size={16} className="text-red-600" />;
    case VerificationStatus.PENDING:
      return <MdPending size={16} className="text-yellow-600" />;
    default:
      return null;
  }
};

export default function VerificationCard({
  request,
  onCancel,
  onViewDetails,
  loading = false
}: VerificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {getVerificationIcon(request.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {request.type.charAt(0) + request.type.slice(1).toLowerCase()} Verification
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  Submitted {formatDate(request.submittedAt)}
                </p>
                
                {request.reviewedAt && (
                  <p className="text-sm text-gray-600">
                    Reviewed {formatDate(request.reviewedAt)}
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  Documents: {request.documents.length}
                </p>

                {request.notes && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">Notes:</span> {request.notes}
                  </p>
                )}

                {request.adminNotes && request.status === VerificationStatus.REJECTED && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Admin Notes:</span> {request.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(request)}
                  disabled={loading}
                >
                  View Details
                </Button>
              )}

              {request.status === VerificationStatus.PENDING && onCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(request.id)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
