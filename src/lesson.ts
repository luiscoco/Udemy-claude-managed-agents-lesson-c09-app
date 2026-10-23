import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 9,
  title: "Stream Recovery without Lost Events",
  description: "The live event stream has no replay. If your application sends a prompt before establishing its stream, early events can be missed by real-time handling.",
  concepts: ["Stream before history", "Persisted-ID deduplication", "Recovery does not replay mutations"],
  scope: "Executes a recovery reducer over authored history/live records. No reconnect or remote mutation is claimed by the local experiment. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Recover overlapping delivery", "input": {"historyIds": ["e1", "e2"], "liveIds": ["e2", "e3"], "previewChunks": ["Hello", " world"]}, "expected": "passed", "checks": {"duplicates": 1, "delivered": 3}}, {"id": "1", "label": "Deduplicate repeated live delivery", "input": {"historyIds": ["e1"], "liveIds": ["e1", "e1"], "previewChunks": ["A", "B"]}, "expected": "passed", "checks": {"duplicates": 2, "delivered": 1}}],
  async run(input) {

const seen = new Set<string>(), delivered: string[] = [], trace: string[] = [];
let duplicates = 0;
trace.push("Open and buffer live observation before reading history");
for (const id of [...list(input,"historyIds"), ...list(input,"liveIds")]) {
  if (typeof id !== "string" || !id) throw new Error("Every persisted record needs an ID");
  if (seen.has(id)) { duplicates++; continue; }
  delivered.push(id); seen.add(id);
}
const preview = list(input,"previewChunks").map(String).join("");
return report("passed","Recovered records without replaying session creation or user input",{duplicates,delivered:delivered.length,ids:delivered,preview,mutationReplays:0},[...trace,"Process previews separately from persisted identities","Deduplicate canonical records after successful handling"]);

  }
};
