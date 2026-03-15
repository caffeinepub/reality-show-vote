import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, LogOut, Menu, Shield, Tv2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerUserProfile } from "./hooks/useQueries";
import AdminAccessPage from "./pages/AdminAccessPage";
import AdminPage from "./pages/AdminPage";
import ViewerPage from "./pages/ViewerPage";

const BG_IMAGES = [
  "/assets/generated/reality-bg-1.dim_1920x1080.jpg",
  "/assets/generated/reality-bg-2.dim_1920x1080.jpg",
  "/assets/generated/reality-bg-3.dim_1920x1080.jpg",
];

function BackgroundSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BG_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={current}
          src={BG_IMAGES[current]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      </AnimatePresence>
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/65" />
    </div>
  );
}

function getIsAdminRoute() {
  return (
    window.location.hash === "#/admin" ||
    window.location.hash.startsWith("#/admin")
  );
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(getIsAdminRoute);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

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

  const handleGoAdmin = () => {
    window.location.hash = "#/admin";
  };

  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AnimatePresence mode="wait">
          {isAuthenticated ? (
            <motion.div
              key="admin-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <AdminPage
                onLogout={() => {
                  clear();
                  queryClient.clear();
                }}
              />
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
              <AdminAccessPage
                onLogin={login}
                isLoggingIn={isLoggingIn || isInitializing}
              />
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

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background slideshow — fixed, behind all content */}
      <BackgroundSlideshow />

      {/* Main content above background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <a
                href="#/"
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

              <nav className="hidden md:flex items-center gap-3">
                {isAuthenticated && userProfile && (
                  <span className="text-sm text-muted-foreground font-body">
                    {userProfile.name}
                  </span>
                )}

                <Button
                  onClick={handleGoAdmin}
                  variant="outline"
                  size="sm"
                  className="gap-2 font-body border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                  data-ocid="nav.admin_panel_button"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Button>

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
                      handleGoAdmin();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 font-body border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                    data-ocid="nav.admin_panel_button"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Button>
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

        <div className="flex-1">
          <ViewerPage onLogin={handleAuth} />
        </div>

        <footer className="border-t border-border bg-background/70 backdrop-blur-sm py-6 mt-auto">
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
      </div>

      <ProfileSetupModal open={showProfileSetup} />
      <Toaster richColors position="top-right" />
    </div>
  );
}
