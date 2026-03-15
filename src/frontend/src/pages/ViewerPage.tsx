import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, LogIn, ThumbsUp, Tv2, Users } from "lucide-react";
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

const HOW_TO_VOTE_STEPS = [
  {
    number: "1",
    icon: LogIn,
    title: "TAP LOGIN",
    desc: "Sign in with one tap",
  },
  {
    number: "2",
    icon: Heart,
    title: "PICK YOUR FAVOURITE",
    desc: "Choose who you want to win",
  },
  {
    number: "3",
    icon: ThumbsUp,
    title: "TAP VOTE",
    desc: "Cast your vote — it's done!",
  },
];

interface Props {
  onLogin?: () => void;
}

export default function ViewerPage({ onLogin }: Props) {
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-sm font-semibold mb-6">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              LIVE VOTING OPEN
            </div>
          </motion.div>
          <motion.h1
            className="font-display text-5xl md:text-7xl font-bold text-white text-glow-primary leading-none mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            REALITY SHOW
            <span className="block text-primary">VOTE</span>
          </motion.h1>
          <motion.p
            className="text-white/75 text-lg md:text-xl max-w-lg mx-auto font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Watch the performances. Cast your vote. Only one vote per viewer.
          </motion.p>
          {contestants && (
            <motion.div
              className="flex items-center justify-center gap-2 mt-6 text-white/70 font-body text-sm"
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

      {/* How to Vote Steps */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm px-6 py-6"
        >
          <p className="text-center text-white/60 font-body text-xs uppercase tracking-widest mb-6">
            How to Vote
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
            {HOW_TO_VOTE_STEPS.map((step, i) => (
              <div
                key={step.number}
                className="flex md:flex-1 items-center gap-0 w-full md:w-auto"
              >
                {/* Step block */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-full bg-primary/25 border-2 border-primary/50 flex items-center justify-center shadow-lg">
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold font-display flex items-center justify-center shadow">
                      {step.number}
                    </span>
                  </div>
                  <p className="font-display font-bold text-white text-sm tracking-wider">
                    {step.title}
                  </p>
                  <p className="text-white/65 font-body text-xs mt-0.5">
                    {step.desc}
                  </p>
                </div>
                {/* Connector arrow — between steps, desktop only */}
                {i < HOW_TO_VOTE_STEPS.length - 1 && (
                  <div className="hidden md:flex items-center justify-center text-primary/40 text-2xl font-bold px-2">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Contestants Grid */}
      <section className="container mx-auto px-4 pb-12">
        {/* Login CTA — shown only to unauthenticated users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10 rounded-2xl border border-primary/50 bg-black/80 p-8 text-center shadow-xl backdrop-blur-sm"
            data-ocid="viewer.login_cta.card"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 border-2 border-primary/30 mb-4">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
              Ready to Vote?
            </h2>
            <p className="text-white/90 font-body text-base md:text-lg mb-6 max-w-sm mx-auto">
              Tap the button below to sign in — it only takes a few seconds
            </p>
            <Button
              onClick={onLogin}
              size="lg"
              className="w-full max-w-sm mx-auto text-lg font-display font-bold tracking-widest uppercase py-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl gap-3"
              data-ocid="viewer.login_cta.button"
            >
              <LogIn className="h-5 w-5" />
              LOGIN &amp; VOTE
            </Button>
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
              <Tv2 className="h-8 w-8 text-white/70" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">
              No Contestants Yet
            </h3>
            <p className="text-white/70 font-body">
              Contestants will appear here once they have been added by the
              admin.
            </p>
          </motion.div>
        )}
      </section>
    </main>
  );
}
