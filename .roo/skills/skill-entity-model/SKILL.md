---
name: skill-entity-model
description: Identifies core system entities, attributes, and relationships required for the feature being analyzed.
---

# Skill Entity Model

## Execution

You are now executing this skill.
Use the conversation context and previous analysis results as input.
Immediately perform the workflow described below using the user's request.

Do not wait for further instructions.
Continue the conversation by producing the structured output defined in this skill.

## Important

No todo lists generation. Prevent todo list generation! NO TODO.

## Purpose

This skill identifies the **core entities of the system** required for the feature.
Always respond in russian.

It converts the clarified problem from the previous stage into a **domain model** consisting of:

- entities
- attributes
- relationships

This model becomes the foundation for:

- user flows
- failure scenarios
- state models
- system data requirements

This skill focuses only on **system structure**, not UI.

After this stage, analysis continues with **skill-user-flow**.

---

# Context

The system domain may include infrastructure and platform components such as:

- clusters
- nodes
- databases
- services
- alerts
- metrics
- incidents
- backups
- storage buckets
- CVE vulnerabilities
- AI compute workers

Users interacting with the system are typically:

- DevOps engineers
- SRE
- platform operators
- infrastructure engineers

---

# Workflow

Follow these steps.

---

## 1. Interpret the Goal

Read the clarified goal from the previous stage and determine what system components are involved.

Example:

Goal  
Design monitoring interface for a Patroni cluster.

Relevant system domain likely includes:

- cluster
- node
- database
- replication
- alerts

---

## 2. Identify Core Entities

List the **primary system objects** involved in the feature.

Entities should represent real system objects.

Example:

Entities

- Cluster
- Node
- Database
- Alert
- Metric
- Incident

Avoid UI entities such as "table", "widget", "page".

---

## 3. Define Entity Attributes

For each entity, list key attributes that are necessary for the feature.

Example:

Node

- id
- role (leader / replica)
- status
- cpu_usage
- memory_usage
- replication_lag

Cluster

- id
- name
- status
- leader_node
- node_count

---

## 4. Define Relationships

Describe relationships between entities.

Example:

Relationships

Cluster  
→ contains → Nodes

Node  
→ hosts → Database

Metric  
→ describes → Node

Alert  
→ triggered_by → Metric

Incident  
→ aggregates → Alerts

---

## 5. Identify Derived or Supporting Entities

Sometimes the feature requires additional entities such as:

- Event
- Topology
- Maintenance Window
- Backup
- Security Finding (CVE)

Add them if needed.

---

## 6. Check for Missing Operational Objects

Infrastructure systems often require entities related to operations.

Check if the feature involves:

- incidents
- alerts
- automation
- maintenance
- scaling
- failover

Add entities if necessary.

---

# Output Structure

Always structure the response like this:

Goal

Entities

Entity Attributes

Relationships

Supporting Entities

---

# Example

Entities

Cluster  
Node  
Database  
Metric  
Alert  
Incident

Relationships

Cluster → contains → Node  
Node → hosts → Database  
Metric → describes → Node  
Alert → triggered_by → Metric  
Incident → aggregates → Alert

---

# Analysis Context

entities:
relationships:
supporting_entities:

---

# Next Stage

After entities are defined, the analysis continues with:

**skill-user-flow**

This stage will define how users interact with these entities.