import { useOAuth } from "../../hooks/useOAuth";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function OAuthCallback() {
  const { isProcessing, error, success } = useOAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Processing State */}
        {isProcessing && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Completing authentication...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we sign you in.
              </p>
            </div>
          </>
        )}

        {/* Success State */}
        {success && !isProcessing && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Error State */}
        {error && !isProcessing && (
          <>
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
