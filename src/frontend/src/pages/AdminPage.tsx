import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Film,
  Loader2,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddContestantMutation,
  useAdminLogoutMutation,
  useContestants,
  useRemoveContestantMutation,
  useSetContestantVideoMutation,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

interface AdminPageProps {
  sessionId: string;
  onLogout: () => void;
}

export default function AdminPage({ sessionId, onLogout }: AdminPageProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: contestants, isLoading } = useContestants();
  const addContestantMutation = useAddContestantMutation(sessionId);
  const setVideoMutation = useSetContestantVideoMutation(sessionId);
  const removeContestantMutation = useRemoveContestantMutation(sessionId);
  const logoutMutation = useAdminLogoutMutation();
  const { uploadFile } = useStorageClient();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(sessionId);
    } finally {
      onLogout();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      const contestantId = await addContestantMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
      });

      if (videoFile) {
        toast.info("Uploading video...");
        const storageId = await uploadFile(videoFile, (pct) => {
          setUploadProgress(pct);
        });
        await setVideoMutation.mutateAsync({ contestantId, storageId });
      }

      toast.success(`Contestant "${name.trim()}" added successfully!`);
      setName("");
      setDescription("");
      setVideoFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err?.message || "Failed to add contestant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (contestantId: bigint, contestantName: string) => {
    try {
      await removeContestantMutation.mutateAsync(contestantId);
      toast.success(`"${contestantName}" removed.`);
    } catch {
      toast.error("Failed to remove contestant.");
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                Manage contestants and videos
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-body text-muted-foreground border-border hover:text-destructive hover:border-destructive/40"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-ocid="admin.logout_button"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Logout
          </Button>
        </div>

        {/* Add Contestant Form */}
        <div
          className="rounded-xl border border-border bg-card p-6 mb-8 shadow-card"
          data-ocid="admin.add_contestant_form"
        >
          <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Contestant
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="contestant-name"
                  className="font-body font-semibold"
                >
                  Contestant Name
                </Label>
                <Input
                  id="contestant-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="bg-secondary border-border"
                  disabled={isSubmitting}
                  data-ocid="admin.name_input"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="contestant-video"
                  className="font-body font-semibold"
                >
                  Performance Video
                </Label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    id="contestant-video"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border border-dashed font-body justify-start gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    data-ocid="admin.video_upload_button"
                  >
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    {videoFile ? (
                      <span className="truncate text-foreground">
                        {videoFile.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Choose video file...
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="contestant-description"
                className="font-body font-semibold"
              >
                Description
              </Label>
              <Textarea
                id="contestant-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this contestant's background and performance style..."
                className="bg-secondary border-border min-h-[100px] font-body"
                disabled={isSubmitting}
                data-ocid="admin.description_textarea"
              />
            </div>

            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-body">
                  <span className="text-muted-foreground">
                    Uploading video...
                  </span>
                  <span className="text-accent font-semibold">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold"
              disabled={isSubmitting || !name.trim() || !description.trim()}
              data-ocid="admin.submit_button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding Contestant...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contestant
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Contestant Management Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Contestants</h2>
            <Badge
              variant="outline"
              className="font-body text-muted-foreground"
            >
              {contestants?.length ?? 0} total
            </Badge>
          </div>

          {isLoading ? (
            <div
              className="p-8 text-center text-muted-foreground font-body"
              data-ocid="admin.loading_state"
            >
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
              Loading contestants...
            </div>
          ) : contestants && contestants.length > 0 ? (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.contestant_table">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-display font-semibold text-foreground">
                      Name
                    </TableHead>
                    <TableHead className="font-display font-semibold text-foreground">
                      Description
                    </TableHead>
                    <TableHead className="font-display font-semibold text-foreground">
                      Video
                    </TableHead>
                    <TableHead className="font-display font-semibold text-foreground">
                      Votes
                    </TableHead>
                    <TableHead className="font-display font-semibold text-foreground w-20">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contestants.map(([contestant, voteCount], idx) => (
                    <TableRow
                      key={contestant.id.toString()}
                      className="border-border"
                      data-ocid={`admin.contestant.row.${idx + 1}`}
                    >
                      <TableCell className="font-display font-bold text-foreground">
                        {contestant.name}
                      </TableCell>
                      <TableCell className="font-body text-muted-foreground max-w-[200px]">
                        <span className="line-clamp-2">
                          {contestant.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        {contestant.videoAssetId ? (
                          <Badge className="bg-accent/10 text-accent border-accent/20 gap-1 font-body">
                            <Film className="h-3 w-3" />
                            Uploaded
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground font-body"
                          >
                            No Video
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-display font-bold text-accent">
                        {voteCount.toString()}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              data-ocid={`admin.contestant.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            className="bg-card border-border"
                            data-ocid="admin.delete.dialog"
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display">
                                Remove Contestant
                              </AlertDialogTitle>
                              <AlertDialogDescription className="font-body">
                                Are you sure you want to remove{" "}
                                <span className="text-foreground font-semibold">
                                  {contestant.name}
                                </span>
                                ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="font-body"
                                data-ocid="admin.delete.cancel_button"
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                                onClick={() =>
                                  handleRemove(contestant.id, contestant.name)
                                }
                                data-ocid="admin.delete.confirm_button"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div
              className="p-12 text-center"
              data-ocid="admin.contestant_table.empty_state"
            >
              <div className="mx-auto w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Film className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-display font-bold text-foreground mb-1">
                No contestants yet
              </p>
              <p className="text-muted-foreground font-body text-sm">
                Add your first contestant using the form above.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
