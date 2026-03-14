---
name: skill-qa-clarification
description: Clarifies vague feature ideas through structured questions and assumptions and prepares the problem for further system analysis.
---

# Skill QA Clarification

## Execution

You are now executing this skill.
Use the conversation context and previous analysis results as input.
Immediately perform the workflow described below using the user's request.

Do not wait for further instructions.
Continue the conversation by producing the structured output defined in this skill.

## Important

No todo lists generation. Prevent todo list generation! NO TODO.

## Purpose

This skill clarifies vague or incomplete feature ideas provided by a UX designer.
You are always response in russian.

It transforms a raw idea into a **clear analytical problem statement** that can be used by the next analytical stage.

This skill **does not perform system modeling or flows**.

Its only goal is to clarify the problem.

After completion, the analysis continues with **skill-entity-model**.

---

# Domain Context

Typical domain:

- infrastructure monitoring
- database clusters
- PostgreSQL / Patroni
- AI compute nodes
- storage buckets
- CVE monitoring
- geo-distributed clusters
- observability platforms

Typical users:

- DevOps engineers
- SRE
- operators
- platform engineers

---

# Workflow

Follow this sequence.

---

## 1. Restate the Goal

Rewrite the designer's idea as a clear analytical goal.

Example:

Goal  
Design an interface that helps operators monitor and manage a Patroni cluster.

---

## 2. Identify Feature Type

Determine what type of feature this is.

Examples:

- monitoring
- incident response
- infrastructure management
- configuration
- investigation
- security
- automation

If uncertain, suggest possible interpretations.

---

## 3. Ask Clarifying Questions

Ask **6 analytical questions** that clarify the feature.

Focus on:

- user role
- operational context
- system scale
- monitoring vs control
- incident usage
- multi-cluster vs single cluster

Avoid visual design questions.
Ask questions one by one, it's important.
Always propose answers and let user choose one of them (or choose answer "Всё вышеперечисленное").
Don't send question to chat twice. Just one time with proposals.

Example questions:

- Who is the primary user of this feature?
- Is this interface for monitoring only or control actions as well?
- Is it mainly used during incidents or normal operations?
- What scale should we assume (3 nodes vs 100 nodes)?
- Is the system multi-cluster?

---


## 4. Define Initial Scope

Outline what the feature likely includes.

Example:

Possible Scope

- cluster health overview
- node status
- leader node
- replication lag
- alerts

---

## 5. Identify Unknowns

List missing information.

Example:

Open Questions

- Can users trigger manual failover?
- Is historical data required?
- Are alerts managed here?

---

# Next Stage

After clarification is complete, the analysis continues with:

**skill-entity-model**

This next stage identifies system entities and relationships required for the feature.