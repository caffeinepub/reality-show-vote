import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Tv2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfileMutation } from "../hooks/useQueries";

interface Props {
  open: boolean;
}

export default function ProfileSetupModal({ open }: Props) {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useSaveProfileMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await mutateAsync({ name: name.trim() });
      toast.success("Welcome! Your profile is set up.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open}>
          <DialogContent
            className="border-border bg-card max-w-md"
            data-ocid="profile.dialog"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Tv2 className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="font-display text-xl">
                  Welcome to the Stage
                </DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground">
                Tell us your name to complete your profile and start voting.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Your Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-secondary border-border"
                  autoFocus
                  data-ocid="profile.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!name.trim() || isPending}
                data-ocid="profile.submit_button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Enter the Show"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
