import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type ContestantId = Nat;

  type Contestant = {
    id : ContestantId;
    name : Text;
    description : Text;
    videoAssetId : ?Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  var nextContestantId = 1;

  let contestants = Map.empty<ContestantId, Contestant>();
  let votes = Map.empty<Principal, ContestantId>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Admin-only function: Add Contestant
  public shared ({ caller }) func addContestant(name : Text, description : Text) : async ContestantId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add contestants");
    };

    let contestantId = nextContestantId;
    nextContestantId += 1;

    let contestant : Contestant = {
      id = contestantId;
      name;
      description;
      videoAssetId = null;
      createdAt = Time.now();
    };

    contestants.add(contestantId, contestant);
    contestantId;
  };

  // Admin-only function: Remove Contestant
  public shared ({ caller }) func removeContestant(contestantId : ContestantId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove contestants");
    };

    if (not contestants.containsKey(contestantId)) {
      Runtime.trap("Contestant does not exist");
    };

    contestants.remove(contestantId);
  };

  // Admin-only function: Associate video with contestant
  public shared ({ caller }) func setContestantVideo(contestantId : ContestantId, storageId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set contestant videos");
    };

    let contestant = switch (contestants.get(contestantId)) {
      case (null) { Runtime.trap("Contestant not found") };
      case (?c) { c };
    };

    let updatedContestant = {
      id = contestant.id;
      name = contestant.name;
      description = contestant.description;
      videoAssetId = ?storageId;
      createdAt = contestant.createdAt;
    };

    contestants.add(contestantId, updatedContestant);
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Voting - Users only (Internet Identity authenticated viewers)
  public shared ({ caller }) func vote(contestantId : ContestantId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can vote");
    };

    if (votes.containsKey(caller)) {
      Runtime.trap("User has already voted");
    };

    if (not contestants.containsKey(contestantId)) {
      Runtime.trap("Contestant does not exist");
    };

    votes.add(caller, contestantId);
  };

  // Query: Get all contestants with vote counts - Public (no authentication required)
  public query func getAllContestantsWithVotes() : async [(Contestant, Nat)] {
    let voteCounts = Map.empty<ContestantId, Nat>();

    for ((_, contestantId) in votes.entries()) {
      let current = switch (voteCounts.get(contestantId)) {
        case (null) { 0 };
        case (?count) { count };
      };
      voteCounts.add(contestantId, current + 1);
    };

    let resultList = List.empty<(Contestant, Nat)>();

    for ((id, contestant) in contestants.entries()) {
      let count = switch (voteCounts.get(id)) {
        case (null) { 0 };
        case (?c) { c };
      };
      resultList.add((contestant, count));
    };

    resultList.toArray();
  };

  // Query: Get single contestant - Public (no authentication required)
  public query func getContestant(contestantId : ContestantId) : async ?Contestant {
    contestants.get(contestantId);
  };

  // Query: Check if caller has voted and for whom - User only
  public query ({ caller }) func checkVote() : async ?ContestantId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check their vote");
    };
    votes.get(caller);
  };
};
