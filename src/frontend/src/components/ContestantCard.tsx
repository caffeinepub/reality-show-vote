import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ThumbsUp, Trophy } from "lucide-react";
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

  const initials = contestant.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.09 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`relative rounded-xl overflow-hidden shadow-2xl flex flex-col cursor-pointer group ${
        isMyVote ? "voted-card" : "border border-border"
      }`}
      style={{ aspectRatio: "3/4" }}
      data-ocid={`viewer.contestant.item.${ocidIndex}`}
    >
      {/* === FULL-BLEED MEDIA === */}
      <div className="absolute inset-0">
        {videoSrc ? (
          // biome-ignore lint/a11y/useMediaCaption: captions not applicable for contestant performance videos
          <video
            src={videoSrc}
            className="w-full h-full object-cover"
            preload="metadata"
            loop
            muted
            playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center contestant-placeholder">
            <span className="contestant-initial">{initials}</span>
          </div>
        )}

        <div className="absolute inset-0 contestant-vignette" />
        <div className="absolute inset-0 contestant-gradient" />
      </div>

      {/* === TOP BADGE === */}
      {isMyVote && (
        <div className="absolute top-3 right-3 z-20">
          <Badge className="bg-primary text-primary-foreground text-xs font-semibold gap-1 shadow-lg">
            <Trophy className="h-3 w-3" />
            Your Vote
          </Badge>
        </div>
      )}

      {videoSrc && (
        <div className="absolute top-3 left-3 z-20 opacity-60 group-hover:opacity-0 transition-opacity duration-300">
          <div className="p-1.5 rounded-full bg-black/40 backdrop-blur-sm">
            <Play className="h-3.5 w-3.5 text-white fill-white" />
          </div>
        </div>
      )}

      {/* === BOTTOM CONTENT OVERLAY === */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 flex flex-col gap-3">
        {/* Name & description */}
        <div>
          <h3 className="font-display font-bold text-xl leading-tight text-white drop-shadow-lg tracking-wide">
            {contestant.name}
          </h3>
          {contestant.description && (
            <p className="text-white/70 text-xs mt-0.5 line-clamp-2 font-body leading-relaxed">
              {contestant.description}
            </p>
          )}
        </div>

        {/* Vote bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-body">
              {voteCount.toString()} vote{voteCount !== 1n ? "s" : ""}
            </span>
            <span className="font-bold text-accent font-body drop-shadow">
              {pct}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className="h-full vote-bar rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: 0.9,
                ease: "easeOut",
                delay: index * 0.09 + 0.35,
              }}
            />
          </div>
        </div>

        {/* === VOTE BUTTON === */}
        {isAuthenticated ? (
          <Button
            className={`w-full font-display font-bold tracking-widest uppercase transition-all duration-200 shadow-xl py-5 text-base ${
              isMyVote
                ? "bg-primary/30 text-primary border border-primary/60 backdrop-blur-md hover:bg-primary/40"
                : hasVoted
                  ? "bg-white/10 text-white/40 border border-white/20 backdrop-blur-md cursor-not-allowed text-sm"
                  : "vote-cta-button"
            }`}
            disabled={hasVoted || isVoting}
            onClick={() => !hasVoted && onVote(contestant.id)}
            data-ocid={`viewer.vote_button.${ocidIndex}`}
          >
            {isVoting && !hasVoted ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Casting Vote...
              </>
            ) : isMyVote ? (
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <span className="text-lg">✅ YOUR VOTE</span>
                </div>
              </div>
            ) : hasVoted ? (
              <span className="text-sm opacity-60">Voted</span>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ThumbsUp className="h-6 w-6" />
                <span className="text-lg font-black tracking-widest">
                  TAP TO VOTE
                </span>
              </div>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full border-white/20 text-white/50 font-body text-sm backdrop-blur-sm bg-black/20 py-5"
            disabled
            data-ocid={`viewer.vote_button.${ocidIndex}`}
          >
            Login to Vote
          </Button>
        )}
      </div>
    </motion.div>
  );
}
