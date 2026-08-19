# Product and Agent Pipeline

## User-Visible Flow

Keep the conversation deliberately small:

1. The user provides a query and one or more requirement sources.
2. Human + Agent confirm the activity boundary if the source does not already fix it.
3. Human + Agent confirm the gameplay mainline if it remains unresolved.
4. The Agent creates the full runnable gray model without another approval gate.
5. Human + Agent choose one of three Brand Kit joint samples when visual direction is unresolved; otherwise the Agent extracts the approved visual source.
6. The Agent produces assets, composes the page, audits it, repairs it, and delivers from Preview.

This is at most three human decision categories, not a fixed number of clicks and not a narration of every internal production step. Record source-resolved decisions without asking the user to confirm what is already explicit.

## Internal Agent Stages

The agent may run more stages internally without asking for more approvals:

1. Parse source documents and embedded content.
2. Separate facts, inferences, constraints, and unresolved product choices.
3. Model the primary user loop and terminal states.
4. Create semantic slots and a component tree.
5. Build a runnable gray model.
6. Produce comparable Brand Kit joint samples.
7. Build the asset BOM and generate final art.
8. Compose code and assets into editable modules.
9. Test behavior, inspect visuals, repair failures, and deliver.

## Artifact Timing

| Milestone | Artifact surface | Rule |
| --- | --- | --- |
| Source received | Documents | Preserve the original source; never overwrite it with a summary. |
| Boundary confirmed | Documents | Append a page-requirements document and the selected boundary. |
| Gameplay confirmed | Gameplay | Append gameplay information and create gameplay configuration. Do not show this tab earlier. |
| Gray model built | Page | Create the runnable page and component tree. This is agent-owned. |
| Brand Kit sampled | Assets | Show three joint samples and the planned asset BOM. |
| QA passed | Preview | Deliver the working page and switch to Preview. |

Progressive tab appearance is a replay storytelling device only. In normal steady state, use the product's standard tabs.

## Confirmation Card Contract

Each unresolved decision card must contain:

- one sentence describing what the choice changes;
- one recommended option with a reason;
- two meaningfully different alternatives;
- one free-form option;
- visible consequences, not internal implementation language;
- the existing confirmed context needed to decide without searching elsewhere.

On selection, append the answer to the decision log and update the relevant document. Do not replace earlier turns. A later correction should be a new entry linked to the superseded choice.

## What Each Gate Decides

### Boundary

Decide audience, campaign scope, primary business goal, platform entry, required sections, and what is explicitly out of scope.

### Gameplay Mainline

Decide the core action, feedback loop, progress/reward structure, and the user's repeat reason. Secondary modules can be inferred if they do not change the mainline.

### Brand Kit

Decide the visual system through comparable joint samples, not adjectives alone. The chosen kit controls imagery, art-title treatment, color roles, typography, depth, shape, icon language, motion, and generation prompts.
