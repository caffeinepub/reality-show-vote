import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAdminLoginMutation } from "../hooks/useQueries";

interface AdminLoginPageProps {
  onLoginSuccess: (sessionId: string) => void;
}

export default function AdminLoginPage({
  onLoginSuccess,
}: AdminLoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useAdminLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await loginMutation.mutateAsync({ username, password });
      if ("ok" in result && result.ok) {
        onLoginSuccess(result.ok);
      } else if ("err" in result) {
        setError(result.err || "Invalid credentials. Please try again.");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Admin Access
          </h1>
          <p className="text-muted-foreground font-body text-sm">
            Sign in to manage the Reality Vote platform
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="admin-username"
                className="font-body font-semibold text-foreground"
              >
                Login ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your login ID"
                  className="pl-9 bg-secondary border-border font-body"
                  disabled={loginMutation.isPending}
                  autoComplete="username"
                  data-ocid="admin-login.input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="admin-password"
                className="font-body font-semibold text-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-9 bg-secondary border-border font-body"
                  disabled={loginMutation.isPending}
                  autoComplete="current-password"
                  data-ocid="admin-login.input"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-body"
                data-ocid="admin-login.error_state"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold h-11"
              disabled={
                loginMutation.isPending || !username.trim() || !password.trim()
              }
              data-ocid="admin-login.submit_button"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Subtle credential hint */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground font-body text-center">
              Default credentials:{" "}
              <span className="font-mono text-muted-foreground/80">admin</span>{" "}
              /{" "}
              <span className="font-mono text-muted-foreground/80">
                admin123
              </span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body mt-6">
          This area is restricted to platform administrators only.
        </p>
      </motion.div>
    </main>
  );
}
