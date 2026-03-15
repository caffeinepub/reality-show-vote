import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";

interface AdminAccessPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export default function AdminAccessPage({
  onLogin,
  isLoggingIn,
}: AdminAccessPageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Admin Access
          </h1>
          <p className="text-muted-foreground font-body text-sm">
            Sign in with your Internet Identity to access the admin panel
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body text-center">
              Admin access is controlled by your Internet Computer identity.
              Only designated admins can manage contestants.
            </p>

            <Button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold h-11"
              data-ocid="admin-access.login_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body mt-6">
          This area is restricted to platform administrators only.
        </p>
      </motion.div>
    </main>
  );
}
