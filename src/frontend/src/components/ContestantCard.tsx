import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Trophy, Vote } from "lucide-react";
import { motion } from "motion/react";
import type { Contestant } from "../backend";

interface Props {
  contestant: Contestant;
  voteCount: bigint;
  totalVotes: bigint;
  hasVoted: boolean;
  votedContestantId: bigint | null;
  isAuthenticated: boolean;
  onVote: (id: bigint) => void;
  isVoting: boolean;
  index: number;
}

export default function ContestantCard({
  contestant,
  voteCount,
  totalVotes,
  hasVoted,
  votedContestantId,
  isAuthenticated,
  onVote,
  isVoting,
  index,
}: Props) {
  const isMyVote = votedContestantId === contestant.id;
  const pct = totalVotes > 0n ? Number((voteCount * 100n) / totalVotes) : 0;
  const ocidIndex = index + 1;
  const videoSrc = contestant.videoUrl?.getDirectURL() ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className={`card-spotlight rounded-lg border bg-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col ${
        isMyVote ? "voted-card" : "border-border"
      }`}
      data-ocid={`viewer.contestant.item.${ocidIndex}`}
    >
      {/* Video / Placeholder */}
      <div className="relative aspect-video bg-secondary flex items-center justify-center overflow-hidden">
        {videoSrc ? (
          // biome-ignore lint/a11y/useMediaCaption: captions not applicable for contestant performance videos
          <video
            src={videoSrc}
            controls
            className="w-full h-full object-cover"
            preload="metadata"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="p-4 rounded-full bg-muted/50">
              <Play className="h-8 w-8" />
            </div>
            <span className="text-sm font-body">Video coming soon</span>
          </div>
        )}
        {isMyVote && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary text-primary-foreground text-xs font-semibold gap-1">
              <Trophy className="h-3 w-3" />
              Your Vote
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1 relative z-10">
        <div>
          <h3 className="font-display font-bold text-lg leading-tight text-foreground">
            {contestant.name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2 font-body">
            {contestant.description}
          </p>
        </div>

        {/* Vote count */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">
              {voteCount.toString()} vote{voteCount !== 1n ? "s" : ""}
            </span>
            <span className="font-semibold text-accent font-body">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full vote-bar rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: index * 0.08 + 0.3,
              }}
            />
          </div>
        </div>

        {/* Vote button */}
        <div className="mt-auto pt-1">
          {isAuthenticated ? (
            <Button
              className={`w-full font-display font-semibold transition-all duration-200 ${
                isMyVote
                  ? "bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20"
                  : hasVoted
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow"
              }`}
              disabled={hasVoted || isVoting}
              onClick={() => !hasVoted && onVote(contestant.id)}
              data-ocid={`viewer.vote_button.${ocidIndex}`}
            >
              {isVoting && !hasVoted ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Casting Vote...
                </>
              ) : isMyVote ? (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Voted!
                </>
              ) : hasVoted ? (
                "Already Voted"
              ) : (
                <>
                  <Vote className="h-4 w-4 mr-2" />
                  Vote Now
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full border-border text-muted-foreground font-body text-sm"
              disabled
              data-ocid={`viewer.vote_button.${ocidIndex}`}
            >
              Login to Vote
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
