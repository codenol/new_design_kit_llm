---
name: feature-state
description: define lifecycle of the main entity.
---

# Feature State

## Instructions

You are now executing this skill.
Use the conversation context and previous analysis results as input.
Immediately perform the workflow described below using the user's request.

Do not invent new entities.
Use Actors, Entities and Interaction Flows from the previous step.

Goal: define lifecycle, flows and edge cases of the main entity.

Tasks:
1. Identify the main entity
2. Define 4–6 lifecycle states
3. Define transitions
4. Define trigger events
5. Identify edge cases
6. Describe UI implication proposals (we have sandbox without backend, no API needed)
7. Generate diagrams

Output:

## Main Entity
...

## States
- ...

## Transitions
- ...

## Trigger Events
- ...

## Edge Cases
- validation error
- permission denied
- network failure
- concurrent update
- empty state
- unexpected system error

## UI Implications
- ...

---

## State Diagram

```mermaid
stateDiagram-v2
[*] --> Created
Created --> Processing
Processing --> Completed
Processing --> Failed
Failed --> Retrying
Retrying --> Processing
Completed --> Archived
```

---

## Happy Path User Flow

```mermaid
flowchart TD
Start["User opens feature"]
Start --> List["System shows entity list"]
List --> Create["User creates entity"]
Create --> Validate["System validates data"]
Validate --> Save["System saves entity"]
Save --> Success["Entity created"]
Success --> End["User continues work"]
```

---

## Error Flow

```mermaid
flowchart TD
Start["User submits data"]
Start --> Validation["System validates input"]
Validation -->|Invalid| Error["Validation error shown"]
Error --> Edit["User edits data"]
Edit --> Validation
Validation -->|Valid| Save["System saves entity"]
Save --> Success
```

---

## Permission Flow

```mermaid
flowchart TD
Start["User attempts action"]
Start --> Check["System checks permissions"]
Check -->|Allowed| Action["Action executed"]
Check -->|Denied| Error["Access denied message"]
```

---

## Edge Case Flow

```mermaid
flowchart TD
Start["User performs action"]
Start --> Request["Request sent to server"]
Request --> Network{"Network available?"}
Network -->|No| Retry["Retry / show offline state"]
Network -->|Yes| Process["Server processes request"]
Process --> Result["Return response"]
```

Everything in russian should be in Markdown file with name related to task.

END_WORKFLOW