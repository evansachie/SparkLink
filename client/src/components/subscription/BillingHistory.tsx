import { useState, useEffect } from "react";
import { MdHistory, MdDownload, MdCheck, MdClose } from "react-icons/md";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/useToast";

interface Transaction {
  id: string;
  amount: number;
  status: "completed" | "failed" | "pending";
  date: string;
  description: string;
  invoiceUrl?: string;
}

interface BillingHistoryProps {
  subscriptionId: string;
}

export default function BillingHistory({ subscriptionId }: BillingHistoryProps) {
  const { error } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBillingHistory = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await getBillingHistory(subscriptionId);
        // setTransactions(response.transactions);
        
        // Mock data for now
        setTransactions([
          {
            id: "1",
            amount: 15000,
            status: "completed",
            date: new Date().toISOString(),
            description: "RISE Plan - Monthly"
          },
          {
            id: "2",
            amount: 15000,
            status: "completed",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            description: "RISE Plan - Monthly"
          }
        ]);
      } catch {
        error("Failed to load billing history");
      } finally {
        setLoading(false);
      }
    };

    if (subscriptionId) {
      loadBillingHistory();
    }
  }, [subscriptionId, error]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <MdCheck className="text-green-600" size={20} />;
      case 'failed':
        return <MdClose className="text-red-600" size={20} />;
      default:
        return <div className="w-5 h-5 rounded-full bg-yellow-500 animate-pulse" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100';
      case 'failed':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-yellow-800 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MdHistory className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">Billing History</h2>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading billing history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <MdHistory className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Billing History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(transaction.status)}
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                  <p className="font-semibold text-gray-900">
                    ₦{transaction.amount.toLocaleString()}
                  </p>
                  {transaction.invoiceUrl && transaction.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(transaction.invoiceUrl, '_blank')}
                    >
                      <MdDownload size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
