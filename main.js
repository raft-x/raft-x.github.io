// Extended Raft Visualization Demo

const svg = document.getElementById("raft-svg");

// State history for stepping - Extended Raft story with 35 states (0-34)
const stateHistory = [
  // Initial state
  {
    nodes: [
      { id: "S1", state: "Follower", term: 1, vote: null, commitIndex: 1, x: 250, y: 200 },
      { id: "S2", state: "Follower", term: 1, vote: null, commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }],
      S2: [{ term: 1, subterm: 0, index: 1 }],
    },
  },
  // Step 1 - S1 becomes candidate
  {
    nodes: [
      { id: "S1", state: "Candidate", term: 2, vote: "S1", commitIndex: 1, x: 250, y: 200 },
      { id: "S2", state: "Follower", term: 1, vote: null, commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }],
      S2: [{ term: 1, subterm: 0, index: 1 }],
    },
  },
  // Step 2 - S1 requests votes (self-vote + sends to S2)
  {
    nodes: [
      { id: "S1", state: "Candidate", term: 2, vote: "S1", commitIndex: 1, x: 250, y: 200, message: { to: "S2", label: "RequestVote\nt: 2\nlastLogIdx: 1\nlastLogTerm: 1" } },
      { id: "S2", state: "Follower", term: 1, vote: null, commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }],
      S2: [{ term: 1, subterm: 0, index: 1 }],
    },
  },
  // Step 3 - S2 grants vote
  {
    nodes: [
      { id: "S1", state: "Candidate", term: 2, vote: "S1", commitIndex: 1, x: 250, y: 200 },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200, message: { to: "S1", label: "VoteGranted\nt: 2" } },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }],
      S2: [{ term: 1, subterm: 0, index: 1 }],
    },
  },
  // Step 4 - S1 becomes leader
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 1, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }],
      S2: [{ term: 1, subterm: 0, index: 1 }],
    },
  },
  // Step 5 - S1 receives client write
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 1, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200, clientWrite: { data: "x" } },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
      S2: [{ term: 1, subterm: 0, index: 1 }],
    },
  },
  // Step 6 - S1 replicates to S2
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 1, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200, message: { to: "S2", label: "AppendEntries\nt: 2, st: 0\nlog: [2]" } },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
      S2: [{ term: 1, subterm: 0, index: 1 }],
    },
  },
  // Step 7 - S2 acknowledges
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 1, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200, message: { to: "S1", label: "AppendAck\nt: 2 | idx: 2" } },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 8 - S1 commits and responds to client
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 2, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200, clientResponse: { data: "x" } },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 9 - S2 is partitioned (replication set changes to S1+W, subterm increments)
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 2, subterm: 1, replicationSet: ["S1", "W"], x: 250, y: 200 },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 10 - S1 receives client write
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 2, subterm: 1, replicationSet: ["S1", "W"], x: 250, y: 200, clientWrite: { data: "y" } },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 1, vote: null, lastTerm: 0, lastSubterm: 0, replicationSet: [], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 11 - S1 writes to W
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 2, subterm: 1, replicationSet: ["S1", "W"], x: 250, y: 200, message: { to: "W", label: "AppendToWitness\nt: 2\nreplicationSet: {S1,W}\nlastLogTerm: 2\nlastLogSubterm: 1" } },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 12 - S1 commits and responds to client
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 3, subterm: 1, replicationSet: ["S1", "W"], x: 250, y: 200, clientResponse: { data: "y" } },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 13 - S1 receives client write
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 3, subterm: 1, replicationSet: ["S1", "W"], x: 250, y: 200, clientWrite: { data: "z" } },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 14 - S1 shortcut write to W (no actual message, just commit advance)
  {
    nodes: [
      { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 4, subterm: 1, replicationSet: ["S1", "W"], x: 250, y: 200, clientResponse: { data: "z" } },
      { id: "S2", state: "Follower", term: 2, vote: "S1", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 15 - S1 goes down, S2 becomes candidate
  {
    nodes: [
  { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 4, subterm: 1, replicationSet: ["S1", "W"], x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 16 - S2 requests vote from witness
  {
    nodes: [
  { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 4, subterm: 1, replicationSet: ["S1", "W"], x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200, message: { to: "W", label: "RequestWitnessVote\nt: 3\nlastLogTerm: 2\nlastLogSubterm: 0" } },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 17 - Witness rejects S2's vote request
  {
    nodes: [
  { id: "S1", state: "Leader", term: 2, vote: "S1", commitIndex: 4, subterm: 1, replicationSet: ["S1", "W"], x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500, message: { to: "S2", label: "VoteRejected\nt: 2" } },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 18 - S1 restarts
  {
    nodes: [
      { id: "S1", state: "Follower", term: 2, vote: null, commitIndex: 4, x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 19 - S1 becomes candidate
  {
    nodes: [
      { id: "S1", state: "Candidate", term: 3, vote: "S1", commitIndex: 4, x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 20 - S1 requests vote from witness
  {
    nodes: [
      { id: "S1", state: "Candidate", term: 3, vote: "S1", commitIndex: 4, x: 250, y: 200, message: { to: "W", label: "RequestWitnessVote\nt: 3\nlastLogTerm: 2\nlastLogSubterm: 1" } },
      { id: "S2", state: "Candidate", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 2, vote: null, lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 21 - Witness grants vote to S1
  {
    nodes: [
      { id: "S1", state: "Candidate", term: 3, vote: "S1", commitIndex: 4, x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 3, vote: "S1", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500, message: { to: "S1", label: "VoteGranted\nt: 3" } },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 22 - S1 becomes new leader
  {
    nodes: [
      { id: "S1", state: "Leader", term: 3, vote: "S1", commitIndex: 4, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 3, vote: "S1", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }],
    },
  },
  // Step 23 - Network recovers, S2 syncs with S1
  {
    nodes: [
      { id: "S1", state: "Leader", term: 3, vote: "S1", commitIndex: 4, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200, message: { to: "S2", label: "AppendEntries\nt: 3, st: 0\nlog: [1..4]" } },
      { id: "S2", state: "Follower", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 3, vote: "S1", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
    },
  },
  // Step 24 - S1 receives new client write
  {
    nodes: [
      { id: "S1", state: "Leader", term: 3, vote: "S1", commitIndex: 4, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200, clientWrite: { data: "w" } },
      { id: "S2", state: "Follower", term: 3, vote: "S2", commitIndex: 1, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 3, vote: "S1", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
    },
  },
  // Step 25 - S1 replicates log to S2
  {
    nodes: [
      { id: "S1", state: "Leader", term: 3, vote: "S1", commitIndex: 4, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200, message: { to: "S2", label: "AppendEntries\nt: 3, st: 0\nlog: [5]" } },
      { id: "S2", state: "Follower", term: 3, vote: "S2", commitIndex: 4, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 3, vote: "S1", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }],
    },
  },
  // Step 26 - S2 acknowledges
  {
    nodes: [
      { id: "S1", state: "Leader", term: 3, vote: "S1", commitIndex: 4, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Follower", term: 3, vote: "S2", commitIndex: 4, x: 550, y: 200, message: { to: "S1", label: "AppendAck\nt: 3\nidx: 5" } },
      { id: "W", state: "Witness", term: 3, vote: "S1", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
    },
  },
  // Step 27 - S1 commits
  {
    nodes: [
      { id: "S1", state: "Leader", term: 3, vote: "S1", commitIndex: 5, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200, clientResponse: { data: "w" } },
      { id: "S2", state: "Follower", term: 3, vote: "S2", commitIndex: 4, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 3, vote: "S1", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
    },
  },
  // Step 28 - S1 goes down, S2 becomes candidate
  {
    nodes: [
      { id: "S1", state: "Down", term: 3, vote: "S1", commitIndex: 5, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 4, vote: "S2", commitIndex: 4, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 3, vote: "S1", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
    },
  },
  // Step 29 - S2 requests vote from witness
  {
    nodes: [
      { id: "S1", state: "Down", term: 3, vote: "S1", commitIndex: 5, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 4, vote: "S2", commitIndex: 4, x: 550, y: 200, message: { to: "W", label: "RequestWitnessVote\nt: 4\nlastLogTerm: 3\nlastLogSubterm: 0" } },
      { id: "W", state: "Witness", term: 3, vote: "S1", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
    },
  },
  // Step 30 - Witness grants vote to S2
  {
    nodes: [
      { id: "S1", state: "Down", term: 3, vote: "S1", commitIndex: 5, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Candidate", term: 4, vote: "S2", commitIndex: 4, x: 550, y: 200 },
      { id: "W", state: "Witness", term: 4, vote: "S2", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500, message: { to: "S2", label: "VoteGranted\nt: 4" } },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
    },
  },
  // Step 31 - S2 becomes new leader
  {
    nodes: [
      { id: "S1", state: "Down", term: 3, vote: "S1", commitIndex: 5, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Leader", term: 4, vote: "S2", commitIndex: 4, subterm: 0, replicationSet: ["S1", "S2"], x: 550, y: 200 },
      { id: "W", state: "Witness", term: 4, vote: "S2", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
    },
  },
  // Step 32 - S2 adjusts replication set to {S2, W}
  {
    nodes: [
      { id: "S1", state: "Down", term: 3, vote: "S1", commitIndex: 5, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Leader", term: 4, vote: "S2", commitIndex: 4, subterm: 1, replicationSet: ["S2", "W"], x: 550, y: 200 },
      { id: "W", state: "Witness", term: 4, vote: "S2", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
    },
  },
  // Step 33 - S2 receives client write (v)
  {
    nodes: [
      { id: "S1", state: "Down", term: 3, vote: "S1", commitIndex: 5, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Leader", term: 4, vote: "S2", commitIndex: 4, subterm: 1, replicationSet: ["S2", "W"], x: 550, y: 200, clientRequest: { data: "v" } },
      { id: "W", state: "Witness", term: 4, vote: "S2", lastTerm: 2, lastSubterm: 1, replicationSet: ["S1", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }, { term: 4, subterm: 1, index: 6 }],
    },
  },
  // Step 34 - S2 replicates to witness
  {
    nodes: [
      { id: "S1", state: "Down", term: 3, vote: "S1", commitIndex: 5, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Leader", term: 4, vote: "S2", commitIndex: 4, subterm: 1, replicationSet: ["S2", "W"], x: 550, y: 200, message: { to: "W", label: "AppendToWitness\nt: 4\nreplicationSet: {S2,W}\nlastLogTerm: 4\nlastLogSubterm: 1" } },
      { id: "W", state: "Witness", term: 4, vote: "S2", lastTerm: 4, lastSubterm: 1, replicationSet: ["S2", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }, { term: 4, subterm: 1, index: 6 }],
    },
  },
  // Step 35 - S2 commits and responds
  {
    nodes: [
      { id: "S1", state: "Down", term: 3, vote: "S1", commitIndex: 5, subterm: 0, replicationSet: ["S1", "S2"], x: 250, y: 200 },
      { id: "S2", state: "Leader", term: 4, vote: "S2", commitIndex: 6, subterm: 1, replicationSet: ["S2", "W"], x: 550, y: 200, clientResponse: { data: "v" } },
      { id: "W", state: "Witness", term: 4, vote: "S2", lastTerm: 4, lastSubterm: 1, replicationSet: ["S2", "W"], x: 400, y: 500 },
    ],
    logs: {
      S1: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }],
      S2: [{ term: 1, subterm: 0, index: 1 }, { term: 2, subterm: 0, index: 2 }, { term: 2, subterm: 1, index: 3 }, { term: 2, subterm: 1, index: 4 }, { term: 3, subterm: 0, index: 5 }, { term: 4, subterm: 1, index: 6 }],
    },
  },
];
let currentStep = 0;
let nodes = JSON.parse(JSON.stringify(stateHistory[currentStep].nodes));
let nodeLogs = JSON.parse(JSON.stringify(stateHistory[currentStep].logs));

// Step topics (brief titles)
const stepTopics = [
  "0. Initial State",
  "1. Election Timeout",
  "2. Request Vote",
  "3. Vote Granted",
  "4. Leader Elected",
  "5. Client Write (x)",
  "6. Replicate to S2",
  "7. S2 Acknowledges",
  "8. Commit & Response",
  "9. Replication Set Adjustment",
  "10. Client Write (y)",
  "11. Replicate to Witness",
  "12. Commit & Response",
  "13. Client Write (z)",
  "14. Shortcut Replication",
  "15. S1 Goes Down, S2 Candidate",
  "16. S2 Requests Vote",
  "17. Witness Rejects Vote",
  "18. S1 Restarts",
  "19. S1 Becomes Candidate",
  "20. S1 Requests Witness Vote",
  "21. Witness Grants Vote",
  "22. S1 Becomes Leader",
  "23. Network Recovers, S2 Syncs",
  "24. Client Write (w)",
  "25. Replicate to S2",
  "26. S2 Acknowledges",
  "27. Commit & Response",
  "28. S1 Goes Down, S2 Candidate",
  "29. S2 Requests Witness Vote",
  "30. Witness Grants Vote",
  "31. S2 Becomes Leader",
  "32. Replication Set Adjustment",
  "33. Client Write (v)",
  "34. Replicate to Witness",
  "35. Commit & Response",
];

// Step descriptions
const stepDescriptions = [
  "The cluster consists of two ordinary Raft servers (S1, S2) as followers with one committed entry, and one witness server (W). The witness is a special server that never transitions to candidate or leader roles.",
  
  "Leader Election begins. S1 times out and transitions to candidate state for term 2. In Extended Raft, candidates follow the same election rules as standard Raft when interacting with regular servers.",
  
  "S1 votes for itself and sends a RequestVote message to S2 with its current term (2) and log metadata (lastLogIdx: 1, lastLogTerm: 1). The candidate does not request votes from the witness until it has received subquorum votes from regular servers.",
  
  "S2 receives the RequestVote, updates its term to 2 and records its vote, and grants its vote to S1 by responding with VoteGranted(t:2).",
  
  "S1 receives quorum votes and wins the election and becomes leader for term 2. It initializes its replication set to all regular servers {S1, S2} and sets subterm to 0. A subterm is a segment of a term during which the leader does not alter its replication set. Subterms start at 0 and increment when the replication set changes.",
  
  "The leader S1 receives a client write request (data: x). It appends the new log entry {term:2, subterm:0, index: 2, x} to its local log. Each log entry is associated with the leader's current subterm when appended.",
  
  "Log Replication to regular servers. S1 replicates the entry to S2 using AppendEntries message, identical to standard Raft. The message includes term, subterm, and the log entry metadata.",
  
  "S2 acknowledges the entry by sending AppendAck(t:2, idx:2) back to S1. S2 has successfully replicated and persisted the log entry locally.",
  
  "S1 receives acknowledgment from a quorum (S1 + S2) and immediately commits the entry. The leader advances its commitIndex to 2 and responds to the client confirming the write (x) is committed.",
  
  "Replication Set Adjustment. S2 becomes unreachable. S1 detects the failure after an election timeout with no response. The leader adjusts its replication set by swapping unreachable S2 with witness W: {S1, S2} → {S1, W}. It increments subterm from 0 to 1 to mark the subterm boundary. A leader's replication set must contain at least a subquorum of healthy regular servers if it includes the witness.",
  
  "S1 receives another client write request (data: y). It appends entry {term:2, subterm:1, index: 3, y} to its log. This entry belongs to the new subterm 1.",
  
  "Log Replication to witness. S1 sends AppendToWitness message to W with the current replication set and log entry metadata. The witness is contacted only after the entry has received subquorum acknowledgments from regular servers in the current replication set. The witness persists only the replication set and the term/subterm metadata of last log entry (not the full log), then responds with acknowledgment.",
  
  "S1 receives acknowledgment from the witness, completing a quorum (S1 + W). It immediately commits entry at index 3 and responds to the client confirming write (y) is committed.",
  
  "S1 receives a third client write request (data: z). It appends entry {term:2, subterm:1, index: 4, z} to its log within the same subterm.",
  
  "Shortcut Replication. Since the witness has already acknowledged an entry in the current subterm (condition: <term, subterm> = <witness's lastTerm, lastSubterm>), and the new entry belongs to the same term and subterm, S1 treats it as already acknowledged by the witness. The leader sends an AppendEntriesResponse to itself on behalf of the witness (shortcut), immediately commits the entry, and responds to the client confirming write (z) is committed. This optimization reduces witness traffic after the first acknowledgment in each subterm.",
  
  "S1 Goes Down, S2 Becomes Candidate. The leader S1 crashes or becomes unreachable. S2 times out without hearing from the leader and transitions to candidate state for term 3, voting for itself. S2 has obtained subquorum votes (just itself) but its log is outdated (only 2 entries). The witness remains available with knowledge of entries from subterm 1.",
  
  "S2 Requests Vote from Witness. Having obtained subquorum votes from regular servers (itself), S2 sends RequestWitnessVote to the witness with its last log entry metadata (term: 2, subterm: 0). In Extended Raft, candidates only request votes from the witness after receiving subquorum votes from regular servers.",
  
  "Witness Rejects Vote Request. The witness rejects S2's vote request because S2's log is not up-to-date. The witness compares: S2's last log has term=2 and subterm=0, but witness's lastSubterm=1 is greater (same term but more recent subterm), indicating the witness knows of more recent log entries. The witness votes for a candidate only if: (1) candidate's lastLogTerm > witnessLastLogTerm, OR (2) same term but candidate's lastLogSubterm > witnessLastLogSubterm, OR (3) same term and subterm AND all subquorum votes are from servers in witness's replication set. S2 fails all conditions (same term but older subterm: 0 < 1), so the witness rejects the vote (keeping its own term at 2), preventing S2 from becoming leader and ensuring safety.",
  
  "S1 Restarts. The previous leader S1 restarts and loses its volatile state (leadership role, replication set, subterm). Upon restart, S1 becomes a follower with its persisted state: term 2, no vote recorded, and all 4 committed log entries intact. S1's log contains the most recent entries including those from subterm 1.",
  
  "S1 Becomes Candidate. After restart, S1 times out waiting for messages from a leader and transitions to candidate state for term 3. S1 votes for itself, obtaining subquorum votes (just itself). Both S1 and S2 are now candidates in term 3.",
  
  "S1 Requests Vote from Witness. Having obtained subquorum votes from regular servers (itself), S1 sends RequestWitnessVote to the witness with its last log entry metadata (term: 2, subterm: 1). In Extended Raft, candidates only request votes from the witness after receiving subquorum votes from regular servers.",
  
  "Witness Grants Vote to S1. The witness evaluates S1's vote request and grants its vote. S1's lastLogTerm=2 and lastLogSubterm=1 match the witness's stored lastTerm=2 and lastSubterm=1. Since S1's log metadata matches the witness's knowledge (same term and subterm), and S1 is in the witness's replication set {S1, W}, the witness updates its term to 3, records its vote for S1, and responds with VoteGranted(t:3).",
  
  "S1 Becomes Leader. S1 receives the witness's vote, achieving quorum (S1 + W). S1 wins the election and becomes leader for term 3. Upon becoming leader, S1 initializes its replication set to {S1, S2} (restoring all regular servers) and sets subterm to 0 for the new term. However, the network partition between S1 and S2 is still active, preventing S1 from communicating with S2. The witness retains its previous replicationSet {S1, W} until it receives new AppendToWitness messages. S2 remains as a candidate but cannot win without the witness's vote.",
  
  "Network Recovers, S1 Replicates to S2. The network partition between S1 and S2 ends. S1 immediately sends AppendEntries to S2 to replicate its complete log and assert leadership. The message includes all 4 entries (indices 1-4) with term 3 and subterm 0. S2 receives the AppendEntries, recognizes S1's leadership, updates its log to match S1's, and transitions from candidate to follower state. S2's log is now synchronized with S1's.",
  
  "Client Write (w). The leader S1 receives a new client write request (data: w). S1 appends the new log entry {term:3, subterm:0, index:5, w} to its local log. This is the first entry in term 3. S2 is now a follower with a synchronized log.",
  
  "Replicate to S2. S1 replicates the new entry to S2 using AppendEntries message. The message includes term 3, subterm 0, and the new log entry at index 5. S2 has already caught up with the previous entries from the heartbeat in the previous step.",
  
  "S2 Acknowledges. S2 receives the AppendEntries, appends entry 5 to its log, and sends back AppendAck(t:3, idx:5) to S1. S2's log is now fully synchronized with S1's log.",
  
  "Commit & Response. S1 receives acknowledgment from a quorum (S1 + S2) and immediately commits the entry at index 5. The leader advances its commitIndex to 5 and responds to the client confirming the write (w) is committed. Both S1 and S2 now have identical logs with 5 entries.",
  
  "S1 Goes Down, S2 Becomes Candidate. The leader S1 crashes or becomes unreachable again. S2 times out without hearing from the leader and transitions to candidate state for term 4, voting for itself. This time S2 has a complete and up-to-date log (all 5 entries including the latest from term 3). S2 has obtained subquorum votes (just itself).",
  
  "S2 Requests Vote from Witness. Having obtained subquorum votes from regular servers (itself), S2 sends RequestWitnessVote to the witness with its last log entry metadata (lastLogTerm: 3, lastLogSubterm: 0). The witness has knowledge of entries up to term 3, subterm 0 from the previous leader S1.",
  
  "Witness Grants Vote to S2. The witness evaluates S2's vote request and grants its vote. S2's lastLogTerm=3 is greater than witness's lastTerm=3, and lastLogSubterm=0 matches. Since S2's log is at least as up-to-date as the witness's knowledge, the witness updates its term to 4, records its vote for S2, and responds with VoteGranted(t:4). S2 now has quorum with just itself and the witness.",
  
  "S2 Becomes Leader. S2 receives the witness's vote, achieving quorum (S2 + W). S2 wins the election and becomes leader for term 4. Upon becoming leader, S2 initializes its replication set to {S1, S2} (expecting all regular servers) and sets subterm to 0 for the new term. S2 is now ready to serve client requests and replicate to S1 when it returns.",
  
  "Replication Set Adjustment. S1 remains unreachable. S2 detects the continued unavailability and adjusts its replication set by replacing unreachable S1 with witness W: {S1, S2} → {S2, W}. S2 increments subterm from 0 to 1 to mark the subterm boundary. The leader can include the witness in its replication set as long as it maintains at least a subquorum of healthy regular servers (in this case, S2 itself).",
  
  "Client Write (v). The leader S2 receives a client write request (data: v). S2 appends the new log entry {term:4, subterm:1, index:6, v} to its local log. This is the first entry in subterm 1 of term 4. S2 has already obtained subquorum acknowledgments from regular servers (just itself as the only available regular server).",
  
  "Replicate to Witness. S2 sends AppendToWitness message to W with the current replication set {S2, W} and log entry metadata (term:4, subterm:1, index:6). The witness is contacted after the entry has received subquorum acknowledgments from regular servers. The witness persists the replication set and the term/subterm metadata of the last log entry (not the full log), then responds with acknowledgment. The witness updates its lastTerm to 4, lastSubterm to 1, and replicationSet to {S2, W}.",
  
  "Commit & Response. S2 receives acknowledgment from the witness, completing a quorum (S2 + W). S2 immediately commits the entry at index 6, advances its commitIndex to 6, and responds to the client confirming the write (v) is committed. S2 is now operating successfully as leader with the witness in its replication set, demonstrating Extended Raft's ability to maintain availability even when only one regular server and the witness are available.",
];

function updateStepInfo() {
  const topicElement = document.getElementById("step-topic");
  const descElement = document.getElementById("step-description");
  if (topicElement) {
    topicElement.textContent = stepTopics[currentStep] || "";
  }
  if (descElement) {
    descElement.textContent = stepDescriptions[currentStep] || "";
  }
}

// Track which fields/logs changed from previous step
function getChanges() {
  if (currentStep === 0) return { nodes: {}, logs: { S1: 0, S2: 0 } };
  
  const prevState = stateHistory[currentStep - 1];
  const currState = stateHistory[currentStep];
  const changes = { nodes: {}, logs: { S1: 0, S2: 0 } };
  
  // Compare node states
  currState.nodes.forEach((currNode) => {
    const prevNode = prevState.nodes.find(n => n.id === currNode.id);
    if (!prevNode) return;
    
    changes.nodes[currNode.id] = {
      state: currNode.state !== prevNode.state,
      term: currNode.term !== prevNode.term,
      vote: currNode.vote !== prevNode.vote,
      commitIndex: currNode.commitIndex !== prevNode.commitIndex,
      subterm: currNode.subterm !== prevNode.subterm,
      replicationSet: JSON.stringify(currNode.replicationSet || []) !== JSON.stringify(prevNode.replicationSet || []),
      lastTerm: currNode.lastTerm !== prevNode.lastTerm,
      lastSubterm: currNode.lastSubterm !== prevNode.lastSubterm,
    };
  });
  
  // Compare log counts to determine which entries are new
  const prevLogCounts = {
    S1: prevState.logs.S1.length,
    S2: prevState.logs.S2.length,
  };
  const currLogCounts = {
    S1: currState.logs.S1.length,
    S2: currState.logs.S2.length,
  };
  
  // Store count of new entries
  changes.logs.S1 = currLogCounts.S1 - prevLogCounts.S1;
  changes.logs.S2 = currLogCounts.S2 - prevLogCounts.S2;
  
  return changes;
}

function drawReplicationSetCircle() {
  // Find the leader node
  const leader = nodes.find((n) => n.state === "Leader");
  if (!leader || !leader.replicationSet) return;

  // Get nodes in the replication set
  const repSetNodes = nodes.filter((n) => 
    leader.replicationSet.includes(n.id)
  );
  
  if (repSetNodes.length === 0) return;

  // Calculate center and bounding box
  const xs = repSetNodes.map((n) => n.x);
  const ys = repSetNodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  // Calculate dimensions with padding
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Calculate the distance between nodes for ellipse sizing
  const maxDistance = Math.max(...repSetNodes.map(n1 => 
    Math.max(...repSetNodes.map(n2 => 
      Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2)
    ))
  ));
  
  // Major axis along the connection line, minor axis perpendicular
  const rx = (maxDistance / 2) + 70; // Major radius (along connection)
  const ry = 70; // Minor radius (perpendicular to connection)
  
  // Calculate rotation angle to align major axis with line connecting nodes
  let rotationAngle = 0;
  if (repSetNodes.length >= 2) {
    // Use first two nodes to determine the connection line
    const node1 = repSetNodes[0];
    const node2 = repSetNodes[1];
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    // Calculate angle in degrees (atan2 returns radians)
    rotationAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  }

  // Draw the ellipse
  const ellipse = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "ellipse"
  );
  ellipse.setAttribute("cx", centerX);
  ellipse.setAttribute("cy", centerY);
  ellipse.setAttribute("rx", rx);
  ellipse.setAttribute("ry", ry);
  ellipse.setAttribute("transform", `rotate(${rotationAngle} ${centerX} ${centerY})`);
  ellipse.setAttribute("fill", "none");
  ellipse.setAttribute("stroke", "#888888");
  ellipse.setAttribute("stroke-width", 2);
  ellipse.setAttribute("stroke-dasharray", "5,5");
  ellipse.setAttribute("opacity", "0.6");
  svg.appendChild(ellipse);
}

function drawNodes(changes) {
  nodes.forEach((node) => {
    const nodeChange = changes.nodes[node.id] || {};
    const stateChanged = nodeChange.state;
    
    // Draw node circle
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", 40);
    
    // Determine base colors
    let strokeColor, strokeWidth, fillColor;
    if (node.state === "Down") {
      strokeColor = "#ccc";
      strokeWidth = 2;
      fillColor = "#f5f5f5";
    } else if (node.state === "Leader") {
      strokeColor = "#1abc9c";
      strokeWidth = 5;
      fillColor = stateChanged ? "#c8f7dc" : "#eafff7";
    } else if (node.state === "Candidate") {
      strokeColor = "#3498db";
      strokeWidth = 4;
      fillColor = stateChanged ? "#bbdefb" : "#e3f2fd";
    } else if (node.id === "W") {
      strokeColor = "#e67e22";
      strokeWidth = 3;
      fillColor = stateChanged ? "#ffd89b" : "#f9e79f";
    } else {
      strokeColor = "#333";
      strokeWidth = 3;
      fillColor = stateChanged ? "#fff9c4" : "#fff";
    }
    
    circle.setAttribute("stroke", strokeColor);
    circle.setAttribute("stroke-width", strokeWidth);
    circle.setAttribute("fill", fillColor);
    svg.appendChild(circle);

    // Node label (inside circle)
    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    label.setAttribute("x", node.x);
    label.setAttribute("y", node.y + 5);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "node-label");
    if (node.state === "Down") {
      label.setAttribute("fill", "#999");
    }
    label.textContent = node.id;
    svg.appendChild(label);

    // Arrange state labels
    const stateLabels = [];
    const leaderRightLabels = []; // Leader-specific labels to the right
    // For witness, place states below; for others, above
    const isWitness = node.id === "W";
    const isLeader = node.state === "Leader";
    
    // State label at the top/bottom
    stateLabels.push(["state:", node.state]);
    stateLabels.push(["term:", `${node.term}`]);
    stateLabels.push(["vote:", `${node.vote === null ? "-" : node.vote}`]);
    // Show commit index for non-witness nodes
    if (!isWitness && node.commitIndex !== undefined) {
      stateLabels.push(["commit:", `${node.commitIndex}`]);
    }
    // Only show subterm and replication set for leader (to the right)
    if (isLeader) {
      leaderRightLabels.push(["subterm:", `${node.subterm}`]);
      leaderRightLabels.push([
        "repl. set:",
        `{${node.replicationSet.join(", ")}}`,
      ]);
    }
    // Only show witness-specific states for witness
    if (isWitness) {
      stateLabels.push(["lastTerm:", `${node.lastTerm}`]);
      stateLabels.push(["lastSubterm:", `${node.lastSubterm}`]);
      stateLabels.push([
        "repl. set:",
        `{${node.replicationSet && node.replicationSet.length > 0 ? node.replicationSet.join(", ") : ""}}`,
      ]);
    }
    
    // Position labels
    const lineHeight = 16;
    let startY;
    if (isWitness) {
      // Place witness states below the node
      startY = node.y + 60; // Start below the node
    } else {
      // Place regular node states above the node (going upward)
      const baseY = node.y - 60; // Start above the node with more space
      startY = baseY - (stateLabels.length * lineHeight);
    }
    const labelX = node.x - 30; // right of node, reduced margin
    const valueX = node.x - 25; // left of node, reduced margin
    
    // Leader right side labels positioning
    const rightLabelX = node.x + 50; // left of right labels
    const rightValueX = node.x + 110; // right values start position, reduced margin
    
    // Get changes for highlighting
    const nodeChanges = changes.nodes[node.id] || {};
    
    // Map label names to change flags
    const changeMap = {
      "term:": nodeChanges.term,
      "vote:": nodeChanges.vote,
      "commit:": nodeChanges.commitIndex,
      "subterm:": nodeChanges.subterm,
      "repl. set:": nodeChanges.replicationSet,
      "lastTerm:": nodeChanges.lastTerm,
      "lastSubterm:": nodeChanges.lastSubterm,
    };
    
    stateLabels.forEach(([labelText, valueText], i) => {
      const isChanged = changeMap[labelText] || (labelText === "state:" && nodeChanges.state);
      const yPos = startY + i * lineHeight;
      
      // Draw highlight background if changed
      if (isChanged) {
        const bgRect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        bgRect.setAttribute("x", labelX - 5);
        bgRect.setAttribute("y", yPos - 12);
        bgRect.setAttribute("width", 90);
        bgRect.setAttribute("height", 14);
        bgRect.setAttribute("fill", "#fff9c4");
        bgRect.setAttribute("opacity", "0.8");
        bgRect.setAttribute("rx", "2");
        svg.appendChild(bgRect);
      }
      
      // Right-aligned label
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", labelX);
      label.setAttribute("y", yPos);
      label.setAttribute("text-anchor", "end");
      label.setAttribute("font-size", "13px");
      label.setAttribute("fill", "#2d3a4a");
      label.textContent = labelText;
      svg.appendChild(label);
      // Left-aligned value
      const value = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      value.setAttribute("x", valueX);
      value.setAttribute("y", yPos);
      value.setAttribute("text-anchor", "start");
      value.setAttribute("font-size", "13px");
      value.setAttribute("fill", "#2d3a4a");
      value.textContent = valueText;
      svg.appendChild(value);
    });
    
    // Draw leader-specific labels to the right of the node
    if (isLeader && leaderRightLabels.length > 0) {
      leaderRightLabels.forEach(([labelText, valueText], i) => {
        const isChanged = changeMap[labelText] || false;
        const yPos = startY + i * lineHeight;
        
        // Draw highlight background if changed
        if (isChanged) {
          const bgRect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          bgRect.setAttribute("x", rightLabelX - 5);
          bgRect.setAttribute("y", yPos - 12);
          bgRect.setAttribute("width", 140);
          bgRect.setAttribute("height", 14);
          bgRect.setAttribute("fill", "#fff9c4");
          bgRect.setAttribute("opacity", "0.8");
          bgRect.setAttribute("rx", "2");
          svg.appendChild(bgRect);
        }
        
        // Right-aligned label
        const label = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        label.setAttribute("x", rightLabelX);
        label.setAttribute("y", yPos);
        label.setAttribute("text-anchor", "start");
        label.setAttribute("font-size", "13px");
        label.setAttribute("fill", "#2d3a4a");
        label.textContent = labelText;
        svg.appendChild(label);
        
        // Left-aligned value
        const value = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        value.setAttribute("x", rightValueX);
        value.setAttribute("y", yPos);
        value.setAttribute("text-anchor", "start");
        value.setAttribute("font-size", "13px");
        value.setAttribute("fill", "#2d3a4a");
        value.textContent = valueText;
        svg.appendChild(value);
      });
    }
  });
}

function drawLog(node, log, changes) {
  const blockWidth = 24,
    blockHeight = 30,
    gap = 0;
  const rowHeight = blockHeight / 3;
  // Place log above the state labels (which are above the node for S1/S2)
  const totalWidth = log.length * blockWidth + (log.length - 1) * gap;
  const baseX = node.x - totalWidth / 2;
  const baseY = node.y - 180; // Position above state labels with more space
  
  // Determine which entries are new (count, not array)
  const newEntriesCount = changes.logs[node.id] || 0;

  // Draw term/subterm/index labels on the left, compact
  const labelX = baseX - 8;
  const termLabel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  termLabel.setAttribute("x", labelX);
  termLabel.setAttribute("y", baseY + rowHeight / 1.3);
  termLabel.setAttribute("text-anchor", "end");
  termLabel.setAttribute("font-size", "12px");
  termLabel.setAttribute("fill", "#2d3a4a");
  termLabel.textContent = "term";
  svg.appendChild(termLabel);
  const subtermLabel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  subtermLabel.setAttribute("x", labelX);
  subtermLabel.setAttribute("y", baseY + rowHeight + rowHeight / 1.3);
  subtermLabel.setAttribute("text-anchor", "end");
  subtermLabel.setAttribute("font-size", "11px");
  subtermLabel.setAttribute("fill", "#2d3a4a");
  subtermLabel.textContent = "subterm";
  svg.appendChild(subtermLabel);
  const idxLabel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  idxLabel.setAttribute("x", labelX);
  idxLabel.setAttribute("y", baseY + 2 * rowHeight + rowHeight / 1.3);
  idxLabel.setAttribute("text-anchor", "end");
  idxLabel.setAttribute("font-size", "11px");
  idxLabel.setAttribute("fill", "#2d3a4a");
  idxLabel.textContent = "index";
  svg.appendChild(idxLabel);

  log.forEach((entry, i) => {
    const x = baseX + i * (blockWidth + gap);
    const y = baseY;
    
    // Check if this is a new entry (among the last entries added)
    const isNewEntry = i >= log.length - newEntriesCount;
    
    // Adjust colors for highlighting
    const termFill = isNewEntry ? "#fff9c4" : "#e3eafc";
    const subtermFill = isNewEntry ? "#fff9c4" : "#f0f6ff";
    const indexFill = isNewEntry ? "#fff9c4" : "#f7fafd";
    const strokeColor = isNewEntry ? "#f9a825" : "#5b7fa6";
    const strokeWidth = isNewEntry ? 2 : 1;
    
    // Block top (term)
    const rectTerm = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    rectTerm.setAttribute("x", x);
    rectTerm.setAttribute("y", y);
    rectTerm.setAttribute("width", blockWidth);
    rectTerm.setAttribute("height", rowHeight);
    rectTerm.setAttribute("rx", 0);
    rectTerm.setAttribute("fill", termFill);
    rectTerm.setAttribute("stroke", strokeColor);
    rectTerm.setAttribute("stroke-width", strokeWidth);
    svg.appendChild(rectTerm);
    // Block middle (subterm)
    const rectSub = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    rectSub.setAttribute("x", x);
    rectSub.setAttribute("y", y + rowHeight);
    rectSub.setAttribute("width", blockWidth);
    rectSub.setAttribute("height", rowHeight);
    rectSub.setAttribute("rx", 0);
    rectSub.setAttribute("fill", subtermFill);
    rectSub.setAttribute("stroke", strokeColor);
    rectSub.setAttribute("stroke-width", strokeWidth);
    svg.appendChild(rectSub);
    // Block bottom (index)
    const rectIdx = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    rectIdx.setAttribute("x", x);
    rectIdx.setAttribute("y", y + 2 * rowHeight);
    rectIdx.setAttribute("width", blockWidth);
    rectIdx.setAttribute("height", rowHeight);
    rectIdx.setAttribute("rx", 0);
    rectIdx.setAttribute("fill", indexFill);
    rectIdx.setAttribute("stroke", strokeColor);
    rectIdx.setAttribute("stroke-width", strokeWidth);
    svg.appendChild(rectIdx);
    // Term label (top)
    const txtTerm = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    txtTerm.setAttribute("x", x + blockWidth / 2);
    txtTerm.setAttribute("y", y + rowHeight / 1.3);
    txtTerm.setAttribute("text-anchor", "middle");
    txtTerm.setAttribute("font-size", "12px");
    txtTerm.setAttribute("fill", "#2d3a4a");
    txtTerm.textContent = entry.term;
    svg.appendChild(txtTerm);
    // Subterm label (middle)
    const txtSub = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    txtSub.setAttribute("x", x + blockWidth / 2);
    txtSub.setAttribute("y", y + rowHeight + rowHeight / 1.3);
    txtSub.setAttribute("text-anchor", "middle");
    txtSub.setAttribute("font-size", "11px");
    txtSub.setAttribute("fill", "#2d3a4a");
    txtSub.textContent = entry.subterm;
    svg.appendChild(txtSub);
    // Index label (bottom)
    const txtIdx = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    txtIdx.setAttribute("x", x + blockWidth / 2);
    txtIdx.setAttribute("y", y + 2 * rowHeight + rowHeight / 1.3);
    txtIdx.setAttribute("text-anchor", "middle");
    txtIdx.setAttribute("font-size", "11px");
    txtIdx.setAttribute("fill", "#2d3a4a");
    txtIdx.textContent = entry.index;
    svg.appendChild(txtIdx);
  });
}



function drawAll() {
  // Clear SVG
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  
  // Add arrow marker definitions
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  
  // Blue arrowhead for messages
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", "0 0, 10 3, 0 6");
  polygon.setAttribute("fill", "#3498db");
  marker.appendChild(polygon);
  defs.appendChild(marker);
  
  // Purple arrowhead for client writes
  const markerClient = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  markerClient.setAttribute("id", "arrowhead-client");
  markerClient.setAttribute("markerWidth", "10");
  markerClient.setAttribute("markerHeight", "10");
  markerClient.setAttribute("refX", "9");
  markerClient.setAttribute("refY", "3");
  markerClient.setAttribute("orient", "auto");
  const polygonClient = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygonClient.setAttribute("points", "0 0, 10 3, 0 6");
  polygonClient.setAttribute("fill", "#9c27b0");
  markerClient.appendChild(polygonClient);
  defs.appendChild(markerClient);
  
  // Green arrowhead for client responses
  const markerResponse = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  markerResponse.setAttribute("id", "arrowhead-response");
  markerResponse.setAttribute("markerWidth", "10");
  markerResponse.setAttribute("markerHeight", "10");
  markerResponse.setAttribute("refX", "9");
  markerResponse.setAttribute("refY", "3");
  markerResponse.setAttribute("orient", "auto");
  const polygonResponse = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygonResponse.setAttribute("points", "0 0, 10 3, 0 6");
  polygonResponse.setAttribute("fill", "#4caf50");
  markerResponse.appendChild(polygonResponse);
  defs.appendChild(markerResponse);
  
  svg.appendChild(defs);
  
  // Calculate changes once to avoid circular dependencies
  const changes = getChanges();
  
  // Draw replication set circle first (background layer)
  drawReplicationSetCircle();
  // Draw network partition if applicable
  drawNetworkPartition();
  
  
  drawNodes(changes);
  nodes.forEach((node) => {
    if (node.id !== "W") {
      drawLog(node, nodeLogs[node.id] || [], changes);
    }
  });
  
  // Draw client writes if present
  nodes.forEach((node) => {
    if (node.clientWrite) {
      drawClientWrite(node);
    }
  });
  
  // Draw client requests if present
  nodes.forEach((node) => {
    if (node.clientRequest) {
      drawClientRequest(node);
    }
  });
  
  // Draw client responses if present
  nodes.forEach((node) => {
    if (node.clientResponse) {
      drawClientResponse(node);
    }
  });
  
  // Draw messages if present
  nodes.forEach((node) => {
    if (node.message) {
      drawMessage(node.id, node.message.to, node.message.label);
    }
  });
  
  // Draw network partition if active
  drawNetworkPartition();
}

// Draw network partition visualization
function drawNetworkPartition() {
  // Network partition is active from step 9 to step 21
  if (currentStep < 9 || currentStep > 22) return;
  
  // Find S1 and S2 positions
  const s1 = nodes.find(n => n.id === "S1");
  const s2 = nodes.find(n => n.id === "S2");
  if (!s1 || !s2) return;
  
  // Draw a red dashed line between S1 and S2 to indicate partition
  const midX = (s1.x + s2.x) / 2;
  const midY = (s1.y + s2.y) / 2;
  
  // Vertical line
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", midX);
  line.setAttribute("y1", midY - 80);
  line.setAttribute("x2", midX);
  line.setAttribute("y2", midY + 80);
  line.setAttribute("stroke", "#e74c3c");
  line.setAttribute("stroke-width", "3");
  line.setAttribute("stroke-dasharray", "10,5");
  line.setAttribute("opacity", "0.7");
  svg.appendChild(line);
  
  // Add label
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", midX);
  label.setAttribute("y", midY - 90);
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("font-size", "12px");
  label.setAttribute("fill", "#e74c3c");
  label.setAttribute("font-weight", "bold");
  label.textContent = "Network Partition";
  svg.appendChild(label);
}

drawAll();

// Initialize step info
updateStepInfo();

// Step controls
document.getElementById("step-forward").onclick = function () {
  if (currentStep < stateHistory.length - 1) {
    currentStep++;
    nodes = JSON.parse(JSON.stringify(stateHistory[currentStep].nodes));
    nodeLogs = JSON.parse(JSON.stringify(stateHistory[currentStep].logs));
    drawAll();
    updateStepInfo();
  }
};
document.getElementById("step-backward").onclick = function () {
  if (currentStep > 0) {
    currentStep--;
    nodes = JSON.parse(JSON.stringify(stateHistory[currentStep].nodes));
    nodeLogs = JSON.parse(JSON.stringify(stateHistory[currentStep].logs));
    drawAll();
    updateStepInfo();
  }
};

// Draw client write arrow coming from outside into the leader
function drawClientWrite(node) {
  if (!node.clientWrite) return;
  
  // Arrow comes from the left side of the canvas
  const startX = 50;
  const startY = node.y;
  const endX = node.x - 40 - 5; // node radius + 5px offset
  const endY = node.y;
  
  // Draw arrow line
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", endX);
  line.setAttribute("y2", endY);
  line.setAttribute("stroke", "#9c27b0");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("stroke-dasharray", "4,2");
  line.setAttribute("marker-end", "url(#arrowhead-client)");
  svg.appendChild(line);
  
  // Add label
  const labelX = (startX + endX) / 2;
  const labelY = startY - 12;
  
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", labelX);
  label.setAttribute("y", labelY);
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("font-size", "11px");
  label.setAttribute("fill", "#9c27b0");
  label.setAttribute("font-weight", "bold");
  const dataArg = typeof node.clientWrite === 'object' ? node.clientWrite.data : '';
  label.textContent = dataArg ? `Client Write(${dataArg})` : "Client Write";
  svg.appendChild(label);
}

// Draw client request arrow coming from the right side of the canvas (for S2)
function drawClientRequest(node) {
  if (!node.clientRequest) return;
  
  // Arrow comes from the right side of the canvas
  const startX = 750; // Right side (canvas is 800px wide)
  const startY = node.y;
  const endX = node.x + 40 + 5; // node radius + 5px offset
  const endY = node.y;
  
  // Draw arrow line
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", endX);
  line.setAttribute("y2", endY);
  line.setAttribute("stroke", "#9c27b0");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("stroke-dasharray", "4,2");
  line.setAttribute("marker-end", "url(#arrowhead-client)");
  svg.appendChild(line);
  
  // Add label
  const labelX = (startX + endX) / 2;
  const labelY = startY - 12;
  
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", labelX);
  label.setAttribute("y", labelY);
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("font-size", "11px");
  label.setAttribute("fill", "#9c27b0");
  label.setAttribute("font-weight", "bold");
  const dataArg = typeof node.clientRequest === 'object' ? node.clientRequest.data : '';
  label.textContent = dataArg ? `Client Write(${dataArg})` : "Client Write";
  svg.appendChild(label);
}

// Draw client response arrow going from leader back to outside (opposite of request)
function drawClientResponse(node) {
  if (!node.clientResponse) return;
  
  // Determine direction based on node position (S1 on left, S2 on right)
  const isRightSide = node.x > 400; // Middle of canvas
  
  let startX, startY, endX, endY;
  
  if (isRightSide) {
    // Arrow goes to the right side
    startX = node.x + 40 + 5; // node radius + 5px offset
    startY = node.y; // middle aligned with node
    endX = 750;
    endY = node.y;
  } else {
    // Arrow goes to the left side (original behavior for S1)
    startX = node.x - 40 - 5; // node radius + 5px offset
    startY = node.y; // middle aligned with node
    endX = 50;
    endY = node.y;
  }
  
  // Draw arrow line
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", endX);
  line.setAttribute("y2", endY);
  line.setAttribute("stroke", "#4caf50");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("stroke-dasharray", "4,2");
  line.setAttribute("marker-end", "url(#arrowhead-response)");
  svg.appendChild(line);
  
  // Add label
  const labelX = (startX + endX) / 2;
  const labelY = startY + 15; // below the line
  
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", labelX);
  label.setAttribute("y", labelY);
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("font-size", "11px");
  label.setAttribute("fill", "#4caf50");
  label.setAttribute("font-weight", "bold");
  const dataArg = typeof node.clientResponse === 'object' ? node.clientResponse.data : '';
  label.textContent = dataArg ? `Client Response(${dataArg})` : "Client Response";
  svg.appendChild(label);
}

// Draw message arrow from source to destination
function drawMessage(from, to, label) {
  const start = nodes.find((n) => n.id === from);
  const end = nodes.find((n) => n.id === to);
  if (!start || !end) return;
  
  // Calculate direction vector
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Normalize and calculate start/end points (offset from node centers)
  const nodeRadius = 40;
  const offsetStart = nodeRadius + 5;
  const offsetEnd = nodeRadius + 5;
  
  const startX = start.x + (dx / distance) * offsetStart;
  const startY = start.y + (dy / distance) * offsetStart;
  const endX = end.x - (dx / distance) * offsetEnd;
  const endY = end.y - (dy / distance) * offsetEnd;
  
  // Draw arrow line
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", endX);
  line.setAttribute("y2", endY);
  line.setAttribute("stroke", "#3498db");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("marker-end", "url(#arrowhead)");
  line.setAttribute("class", "message");
  svg.appendChild(line);

  // Add label at midpoint
  if (label) {
    const mx = (startX + endX) / 2;
    const my = (startY + endY) / 2;
    
    // Calculate perpendicular offset for label
    const perpX = -dy / distance * 15;
    const perpY = dx / distance * 15;
    
    // Split label by newlines for multi-line rendering
    const lines = label.split('\n');
    
    lines.forEach((line, index) => {
      const msgLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      msgLabel.setAttribute("x", mx + perpX);
      msgLabel.setAttribute("y", my + perpY + (index * 13)); // 13px line height
      msgLabel.setAttribute("text-anchor", "middle");
      msgLabel.setAttribute("font-size", index === 0 ? "11px" : "10px"); // First line (title) slightly larger
      msgLabel.setAttribute("fill", "#2c3e50");
      msgLabel.setAttribute("font-weight", index === 0 ? "bold" : "normal"); // First line bold
      msgLabel.textContent = line;
      svg.appendChild(msgLabel);
    });
  }
}

// Example usage:
// drawMessage("S1", "S2", "RequestVote");


















