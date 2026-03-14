---
name: feature-analysis
description: analyze the feature
---

# Feature Analysis

## Instructions

You are now executing this skill.
Use the conversation context as input.
Immediately perform the workflow described below using the user's request.

Goal: collect feature details from the user.

Do NOT invent final answers.
Instead propose possible options based on the feature description.

For each question:
- analyze the user's request
- generate 5–8 possible options
- allow the user to choose one or more
- allow the user to provide a custom answer

STOP after asking the questions.
Wait for the user answers before continuing.
Don't print question twice - just one time with proposals.

Ask the following one by one (it's important! one at the time) with proposals:

## Feature Goal
What is the main goal of this feature?

Generate several possible options based on the description.

## Primary Actor
Who primarily uses the feature?

Generate possible actor roles.

## Core Entity
What is the main entity of the feature?

Generate possible entities.

## Key Action
What is the primary action?

Generate possible actions.

## Complexity
What level of workflow complexity does this feature likely have?

Generate possible workflow types.

Ask the user to respond by:
- selecting option numbers
- or writing their own answer.

NEXT_SKILL: feature-spec