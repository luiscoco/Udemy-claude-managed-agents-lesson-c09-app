# C09 · Stream Recovery without Lost Events

Executes a recovery reducer over authored history/live records. No reconnect or remote mutation is claimed by the local experiment. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Stream before history
- Persisted-ID deduplication
- Recovery does not replay mutations

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3009`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3009
```

## How the app was build

### 1. Merge the history and live observation windows

The reducer walks authored history IDs before the buffered live IDs. A Set rejects repeat delivery, and an ID is recorded only after it is added to the delivered list. This models recovery ordering; it does not open a network stream.

Source: [src/lesson.ts](src/lesson.ts#L16)

```typescript
for (const id of [...list(input, "historyIds"), ...list(input, "liveIds")]) {
  if (typeof id !== "string" || !id)
    throw new Error("Every persisted record needs an ID");
  if (seen.has(id)) {
    duplicates++;
    continue;
  }
  delivered.push(id);
  seen.add(id);
}
```

### 2. Keep previews separate from persisted identity

Preview chunks are concatenated as display text. They do not enter the persisted-ID Set, so a preview cannot suppress a canonical history record.

Source: [src/lesson.ts](src/lesson.ts#L21)

```typescript
const preview = list(input, "previewChunks").map(String).join("");
```

### 3. Prove that recovery did not replay a mutation

Inspect duplicates, delivered IDs and mutationReplays. The zero mutation count expresses the local recovery contract: reconstruct observations without creating another session or resending a prompt.

Source: [src/lesson.ts](src/lesson.ts#L22)

```typescript
return report(
  "passed",
  "Recovered records without replaying session creation or user input",
  {
    duplicates,
    delivered: delivered.length,
    ids: delivered,
    preview,
    mutationReplays: 0,
  },
  [
    ...trace,
    "Process previews separately from persisted identities",
    "Deduplicate canonical records after successful handling",
  ],
);
```

### Check your understanding

Run **Recover overlapping delivery** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "historyIds": [
      "e1",
      "e2"
    ],
    "liveIds": [
      "e2",
      "e3"
    ],
    "previewChunks": [
      "Hello",
      " world"
    ]
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "duplicates": 1,
    "delivered": 3
  }
}
```

Then try **Deduplicate repeated live delivery**. Its expected outcome is `passed`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
