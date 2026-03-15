import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Contestants ---
  type ContestantId = Nat;

  type Contestant = {
    id : ContestantId;
    name : Text;
    description : Text;
    videoUrl : ?Storage.ExternalBlob;
    createdAt : Time.Time;
  };

  var contestantsState = Map.empty<ContestantId, Contestant>();
  var nextContestantId = 1;

  // --- User profiles (II-based) ---
  public type UserProfile = {
    name : Text;
  };
  var userProfilesState = Map.empty<Principal, UserProfile>();

  // --- Voting (II-based) ---
  var votesState = Map.empty<Principal, ContestantId>();

  // --- User Profile Functions ---
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to access profiles");
    };
    userProfilesState.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfilesState.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to save profiles");
    };
    userProfilesState.add(caller, profile);
  };

  // --- Voting Functions ---
  public shared ({ caller }) func vote(contestantId : ContestantId) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to vote");
    };
    if (votesState.containsKey(caller)) {
      Runtime.trap("User has already voted");
    };
    if (not contestantsState.containsKey(contestantId)) {
      Runtime.trap("Contestant does not exist");
    };
    votesState.add(caller, contestantId);
  };

  public query ({ caller }) func checkVote() : async ?ContestantId {
    if (caller.isAnonymous()) { return null };
    votesState.get(caller);
  };

  // --- Public Query Functions (No auth required) ---
  public query func getAllContestantsWithVotes() : async [(Contestant, Nat)] {
    let voteCounts = Map.empty<ContestantId, Nat>();
    for ((_, contestantId) in votesState.entries()) {
      let current = switch (voteCounts.get(contestantId)) {
        case (null) { 0 };
        case (?count) { count };
      };
      voteCounts.add(contestantId, current + 1);
    };
    let resultList = List.empty<(Contestant, Nat)>();
    for ((id, contestant) in contestantsState.entries()) {
      let count = switch (voteCounts.get(id)) {
        case (null) { 0 };
        case (?c) { c };
      };
      resultList.add((contestant, count));
    };
    resultList.toArray();
  };

  public query func getAllContestants() : async [Contestant] {
    contestantsState.toArray().map(func((_, c)) { c });
  };

  public query func getContestant(contestantId : ContestantId) : async ?Contestant {
    contestantsState.get(contestantId);
  };

  // --- Admin Functions ---
  public shared ({ caller }) func addContestant(
    name : Text,
    description : Text,
    externalBlob : ?Storage.ExternalBlob,
  ) : async ContestantId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add contestants");
    };

    let contestantId = nextContestantId;
    nextContestantId += 1;

    let contestant : Contestant = {
      id = contestantId;
      name;
      description;
      videoUrl = externalBlob;
      createdAt = Time.now();
    };
    contestantsState.add(contestantId, contestant);

    contestantId;
  };

  public shared ({ caller }) func removeContestant(contestantId : ContestantId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove contestants");
    };

    if (not contestantsState.containsKey(contestantId)) {
      Runtime.trap("Contestant does not exist");
    };

    contestantsState.remove(contestantId);
  };

  public shared ({ caller }) func updateContestant(
    contestantId : ContestantId,
    name : Text,
    description : Text,
    externalBlob : ?Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update contestants");
    };

    let existingContestant = switch (contestantsState.get(contestantId)) {
      case (null) { Runtime.trap("Contestant does not exist") };
      case (?c) { c };
    };

    let updatedContestant : Contestant = {
      id = contestantId;
      name;
      description;
      videoUrl = externalBlob;
      createdAt = existingContestant.createdAt;
    };

    contestantsState.add(contestantId, updatedContestant);
  };
};
