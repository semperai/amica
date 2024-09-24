---
title: Creating New Avatars
order: 12
---

## Designing new Avatars

You can use [VRoid Studio](https://vroid.com/en/studio) to design your own avatar. You can also use [VRM](https://vrm.dev/en/) to convert your 3D model to VRM format.

## Designing custom expressions

Amica supports custom expressions from VRM models. To design and implement these expressions:

* Use VRoid Studio to design various facial expressions for your avatar.
* Ensure that your custom expressions are included in the VRM file when exporting.

## Downloading Avatars

Here are some websites where you can download avatars:

* [VRCMods](https://vrcmods.com/)
* [VRoid Hub](https://hub.vroid.com)
* [Booth](https://booth.pm)

## Making Avatars Available

Place your `.vrm` files into `./public/vrm/.private` and run `npm run generate:paths` to show your avatars in the settings selector.
