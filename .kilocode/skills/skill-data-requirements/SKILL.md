---
name: skill-data-requirements
description: Identifies the data objects and fields required to design the feature and create realistic mock data.
---

# Skill Data Requirements

## Execution

You are now executing this skill.
Response in russian.

Use the previously defined:

- entities
- user flows
- failure scenarios
- state models

Determine **what data must exist** for the feature to work in design prototypes and mock environments.

Focus on **data that the interface needs**, not backend implementation.

---

# Purpose

This skill defines the **data required for the UI and design prototypes**.

It helps designers understand:

- what objects exist in the system
- what fields each object has
- what example values look like
- what data must be visible in the interface

The output is suitable for **mock data, design prototypes, and documentation**.

---

# Workflow

Follow these steps.

---

## 1. Identify Data Objects

Use the entities discovered earlier.

Examples:

- Cluster
- Node
- Backup Job
- Alert
- Storage Bucket

---

## 2. Define Object Fields

List the fields needed by the interface.

Example:

Backup Job

- id
- name
- status
- progress
- start_time
- end_time
- error_message

---

## 3. Provide Example Values

Give realistic example values designers can use in mocks.

Example:

Backup Job

status: running  
progress: 45%  
start_time: 2026-03-12 14:20  

---

## 4. Identify UI Data Groups

Group data the way the interface will display it.

Example:

Backup Overview

- job name
- status
- progress
- start time

Error Details

- error message
- failed node
- timestamp

---

# Output Structure

Provide the following sections.

Data Objects

Object Fields

Example Data

UI Data Groups

---

# Example

Data Objects

Backup Job  
Node  
Alert  

Object Fields

Backup Job

- id
- name
- status
- progress
- start_time
- end_time
- error_message

Example Data

Backup Job

id: backup-127  
name: nightly_backup  
status: running  
progress: 45%

UI Data Groups

Backup Overview

- job name
- status
- progress

Failure Details

- error message
- affected node

---

# Analysis Context

data_objects:
mock_fields:

---

# Final Stage

The collected data definitions can now be used to create:

- mock data
- prototype screens
- realistic UI states

Continue with **skill-feature-specification**
