---
title: How Amica Works
order: 1
---

Read the [Local Setup](../getting-started/installation.md) guide if you are interested in getting everything running locally quickly.

## Overview of Amica

Amica is composed of a few different components:

* Chat System
* Voice System
* Avatar System
* Transcription System
* Expression System
* Visual System

These work together to create a virtual assistant that can be used to interact with the world. The chat system is the core of Amica, and the other systems are built on top of it.

## Chat System

The chat system is the core of Amica. It is responsible for processing messages and generating responses. It is also responsible for managing the other systems. Detected emotions will cause the expression system to change the avatar's expression. Detected intents will cause the voice system to generate speech.

## Voice System

The voice system is responsible for generating speech from text. The voice system can accept emotion to generate speech with different intonation. It can also accept a voice to generate speech with a specific voice.

## Avatar System

The avatar system is responsible for displaying the avatar. It is composed of a few different components. The avatar system can accept emotion to change the avatar's expression. It can also accept a voice to change the avatar's lip sync.

## Transcription System

The transcription system is responsible for transcribing speech to text. This is what is used when you speak to Amica. Part of this is voice activity detection, which is used to detect when you begin and stop speaking.

## Expression System

The expression system is responsible for changing the avatar's expression. This is done by changing the avatar's blendshapes. The expression system can accept emotion to change the avatar's expression.

## Visual System

The visual system is how Amica sees the world. It is responsible for detecting faces and emotions. It is also responsible for detecting objects and text. This uses the camera of the device that Amica is running on.
