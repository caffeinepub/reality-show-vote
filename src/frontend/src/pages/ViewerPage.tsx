import { Skeleton } from "@/components/ui/skeleton";
import { Tv2, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import ContestantCard from "../components/ContestantCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCheckVote,
  useContestants,
  useVoteMutation,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];

export default function ViewerPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: contestants, isLoading } = useContestants();
  const { data: votedContestantId } = useCheckVote();
  const voteMutation = useVoteMutation();

  const hasVoted =
    votedContestantId !== null && votedContestantId !== undefined;
  const totalVotes = contestants
    ? contestants.reduce((sum, [, count]) => sum + count, 0n)
    : 0n;

  const handleVote = async (contestantId: bigint) => {
    try {
      await voteMutation.mutateAsync(contestantId);
      toast.success("Your vote has been cast! 🎉");
    } catch {
      toast.error("Failed to cast vote. Please try again.");
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden grain-overlay">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-reality-show.dim_1400x500.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              LIVE VOTING OPEN
            </div>
          </motion.div>
          <motion.h1
            className="font-display text-5xl md:text-7xl font-bold text-foreground text-glow-primary leading-none mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            REALITY SHOW
            <span className="block text-primary">VOTE</span>
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Watch the performances. Cast your vote. Only one vote per viewer.
          </motion.p>
          {contestants && (
            <motion.div
              className="flex items-center justify-center gap-2 mt-6 text-muted-foreground font-body text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Users className="h-4 w-4" />
              <span>
                {totalVotes.toString()} total vote{totalVotes !== 1n ? "s" : ""}{" "}
                &bull; {contestants.length} contestant
                {contestants.length !== 1 ? "s" : ""}
              </span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contestants Grid */}
      <section className="container mx-auto px-4 py-12">
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-lg border border-primary/20 bg-primary/5 text-center"
          >
            <p className="text-foreground font-body">
              <span className="text-primary font-semibold">Login</span> using
              the button in the header to cast your vote.
            </p>
          </motion.div>
        )}

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="viewer.loading_state"
          >
            {SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-lg border border-border overflow-hidden"
              >
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-full mt-2" />
                  <Skeleton className="h-10 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : contestants && contestants.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="viewer.contestant_list"
          >
            {contestants.map(([contestant, voteCount], index) => (
              <ContestantCard
                key={contestant.id.toString()}
                contestant={contestant}
                voteCount={voteCount}
                totalVotes={totalVotes}
                hasVoted={hasVoted}
                votedContestantId={votedContestantId ?? null}
                isAuthenticated={isAuthenticated}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
            data-ocid="viewer.empty_state"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Tv2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              No Contestants Yet
            </h3>
            <p className="text-muted-foreground font-body">
              Contestants will appear here once they have been added by the
              admin.
            </p>
          </motion.div>
        )}
      </section>
    </main>
  );
}
