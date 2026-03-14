import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, LogOut, Menu, Tv2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useAdminSession } from "./hooks/useAdminSession";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerUserProfile } from "./hooks/useQueries";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import ViewerPage from "./pages/ViewerPage";

function getIsAdminRoute() {
  return window.location.hash === "#/admin";
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(getIsAdminRoute);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { sessionId, setSession, clearSession, isAdminLoggedIn } =
    useAdminSession();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useCallerUserProfile();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminRoute(getIsAdminRoute());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleAdminLogout = () => {
    clearSession();
  };

  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  // Admin route: show login or admin panel (no main nav)
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AnimatePresence mode="wait">
          {isAdminLoggedIn && sessionId ? (
            <motion.div
              key="admin-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <AdminPage sessionId={sessionId} onLogout={handleAdminLogout} />
            </motion.div>
          ) : (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <AdminLoginPage onLoginSuccess={setSession} />
            </motion.div>
          )}
        </AnimatePresence>
        <footer className="border-t border-border bg-card py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground font-body text-sm">
              &copy; {currentYear}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  // Viewer / main route
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-2.5 font-display font-bold text-xl text-foreground hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Tv2 className="h-5 w-5 text-primary" />
              </div>
              <span className="hidden sm:block">
                Reality <span className="text-primary">Vote</span>
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-3">
              {isAuthenticated && userProfile && (
                <span className="text-sm text-muted-foreground font-body">
                  {userProfile.name}
                </span>
              )}

              <Button
                onClick={handleAuth}
                disabled={isLoggingIn || isInitializing}
                size="sm"
                className={`gap-2 font-body ${
                  isAuthenticated
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                data-ocid="nav.login_button"
              >
                {isLoggingIn || isInitializing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isAuthenticated ? (
                  <>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Login to Vote
                  </>
                )}
              </Button>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Nav */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-border py-3 space-y-2"
              >
                {isAuthenticated && userProfile && (
                  <div className="px-2 py-1 text-sm text-muted-foreground font-body">
                    Signed in as {userProfile.name}
                  </div>
                )}
                <Button
                  onClick={() => {
                    handleAuth();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoggingIn || isInitializing}
                  size="sm"
                  className={`w-full justify-start gap-2 font-body ${
                    isAuthenticated
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                  data-ocid="nav.login_button"
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isAuthenticated ? (
                    <>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Login to Vote
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <ViewerPage />
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-body text-sm">
            &copy; {currentYear}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Profile Setup Modal */}
      <ProfileSetupModal open={showProfileSetup} />

      <Toaster richColors position="top-right" />
    </div>
  );
}
