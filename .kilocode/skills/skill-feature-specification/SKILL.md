---
name: skill-feature-specification
description: Collects results from previous analysis skills and compiles them into a single feature document for designers.
---

# Skill Feature Specification

## Execution

You are now executing this skill.
Response in russian.
Use the results produced by previous analysis stages:

* goal clarification
* entity model
* user flows
* failure scenarios
* state models
* data requirements

Your task is to compile them into one coherent document.

Do not invent new analysis unless something is clearly missing.

---

# Purpose

This skill generates a **Feature Specification Document**.

The document helps designers and product teams understand:

* what the feature does
* how users interact with it
* what failures may occur
* what states exist
* what data the interface needs

This document is intended for:

* UX/UI designers
* product discussions
* documentation
* design prototypes

---

# Workflow

Follow these steps.

## 1. Feature Overview

Briefly describe the feature.

Include:

* feature goal
* main user
* primary use case

## 2. Entities

List the main system objects involved.

Example:

* Cluster
* Node
* Backup Job
* Alert

## 3. User Flows

Summarize the main user flows.

Example sections:

* Monitoring Flow
* Investigation Flow
* Operational Flow

Include short step lists.

## 4. Failure Scenarios

Summarize the most important failure situations.

For each:

* failure name
* what the user sees
* what the user investigates

## 5. State Models

List the main states of key objects.

Example:

Backup Job states:

* scheduled
* running
* completed
* failed

## 6. Data Required by UI

Summarize the data objects and fields required for the interface.

Example:

Backup Job:

* id
* name
* status
* progress
* start_time
* end_time
* error_message

---

# Output Format

Generate a structured Markdown document using this structure:

```
# Feature Specification

## Overview

## Entities

## User Flows

## Failure Scenarios

## State Models

## Data Required for UI
```

Keep sections concise and readable.

---

# Example

## Overview

Backup monitoring screen allowing operators to track running and completed backup jobs.

Primary user: DevOps engineer.

## Entities

Backup Job
Node
Alert

## User Flows

Monitoring Flow

1. User opens backup screen
2. System shows list of jobs
3. User selects job
4. User sees job progress

## Failure Scenarios

Backup Failure

User sees:

* job status "failed"
* error message

User investigates:

* failed node
* job logs

## State Models

Backup Job

* scheduled
* running
* completed
* failed

## Data Required for UI

Backup Job

* id
* name
* status
* progress
* start_time
* end_time
* error_message

---

# Result

The generated document represents the **complete analytical context of the feature** and can be used for design work and documentation.

Optionally add:

## Open Questions

List uncertainties or missing information that should be clarified with designers or product owners.
