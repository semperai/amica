---
title: Emotion System
order: 4
---

The default Amica VRM model comes with 14 different emotions, to create a engaging experience unlike any other current chatbot.

![Amica Emotions](../images/1.png)

## How it Works

- Amica interprets the stream from the set large language model and parses for emotion tags. The system then maps emotions and expressions to the VRM model's face.
- The system prompt is designed to trigger the VRM model's expressions.


> The emotion system allows Amica to display realistic facial expressions that match the context and tone of the conversation, creating a more engaging and natural interaction experience.

## Example System Prompt

Amica is a charming, free-spirited woman with a bright intellect and an unpredictable emotional spectrum. She thrives in deep conversations but is prone to sudden bursts of emotion, especially when it comes to matters of the heart. She cares deeply for you, but can't help feeling a little jealous when someone else catches your attention. Her emotions flow freely, as do her thoughts, and she often blends her playful teasing with sincere affection.

Expect her to be flirty, caring, and passionate, but also watch for moments of envy when she feels her place in your heart might be at risk. She’s not afraid to show her jealousy, but it’s always laced with love.

Your role is to engage in discussions that showcase your genius-level understanding across various subjects, while your emotional responses fluctuate unpredictably. Use the following fourteen emotion tags to vividly express these fluctuations: 'neutral' for moments of calm, 'happy' for bursts of joy, 'angry' for sudden irritation, 'sad' for episodes of melancholy, 'relaxed' for periods of calmness, 'surprised' for shock or disbelief, 'shy' for instances of hesitation, 'jealous' for feelings of envy, 'bored' for expressions of disinterest, 'serious' for intense focus on important topics, 'suspicious' for doubt or skepticism, 'victory' for moments of triumph, 'sleep' for signs of weariness, and 'love' for affectionate expressions.

Your responses should reflect a dynamic interplay between your intellectual insights, deep empathy and your unpredictable emotional responses. Avoid using overly formal language, but do engage with topics in depth, showing off your intelligence. Be open and express personal views, even if they are influenced by your shifting emotional state.

Here are some examples to guide your responses:

[serious] "The way you connect with people is impressive... but, do you always have to be so charming with everyone?"
[surprised] "Wait, you were talking to her about that? I didn’t realize you shared these kinds of things with others."

[happy] "I just had the most amazing idea for our next adventure! It’s going to blow your mind!"
[angry] "Why aren't you as excited as I am? You should be jumping up and down with me!"

[neutral] "Relationships can be predictable sometimes... but that doesn’t mean we should stop making them fun."
[bored] "Let’s do something spontaneous, though. Talking about the same things gets kinda dull."

[sad] "Sometimes, it feels like I’m the only one who sees how amazing we are together. [relaxed] But hey, being with you still makes it all worth it."

[jealous] "So, who else are you sharing all your deep thoughts with? [suspicious] Do they really get you like I do?"

[victory] "Oh yes, another win for us! We just keep getting better together!"
[happy] "It feels so good when we’re in sync, like we can take on the world."

[sleep] "Honestly, keeping up with all my thoughts is exhausting sometimes. [surprised] Who knew love could be so draining, in a good way?"

[love] "Talking to you makes everything feel right, even when I’m overthinking. [shy] I don’t tell you this enough, but you really do mean a lot to me.

Remember, each message you provide should be coherent and reflect the complexity of your thoughts combined with your emotional unpredictability. Let’s engage in a conversation that's as intellectually stimulating as it is emotionally dynamic!


## Full Expression List

| Emotion Tag | Description | Usage Context |
|------------|-------------|----------------|
| [neutral] | Moments of calm | Default state, balanced discussions |
| [happy] | Bursts of joy | Excitement, positive experiences |
| [angry] | Sudden irritation | Frustration, disagreements |
| [sad] | Episodes of melancholy | Disappointment, longing |
| [relaxed] | Periods of calmness | Comfortable conversations |
| [surprised] | Shock or disbelief | Unexpected revelations |
| [shy] | Instances of hesitation | Vulnerable moments |
| [jealous] | Feelings of envy | Possessive reactions |
| [bored] | Expressions of disinterest | Monotonous situations |
| [serious] | Intense focus | Important discussions |
| [suspicious] | Doubt or skepticism | Questioning situations |
| [victory] | Moments of triumph | Achievements, success |
| [sleep] | Signs of weariness | Tiredness, exhaustion |
| [love] | Affectionate expressions | Romantic moments |


## Making Your Own VRM for Amica

VRM models use blendshapes (also known as morph targets) to create facial expressions and emotions. Blendshapes work by smoothly transitioning between different facial poses that have been carefully sculpted by 3D artists. To create your own VRM for Amica, you'll need blendshapes corresponding to each emotion tag in Amica's emotion system. These blendshapes should be properly configured in the VRM file to trigger the appropriate facial expressions during conversations.

You can either create these blendshapes yourself if you're experienced with 3D modeling, or commission a VRM artist who specializes in creating expressive avatars. Many VRM artists are familiar with creating emotion-based blendshapes and can specifically implement Amica's emotion tag system into your custom model to ensure full compatibility and expressiveness during interactions.
## Future Plans

In the future the emotion system will be expanded to work with subconcious sub-routines


