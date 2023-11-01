import * as THREE from "three";
import { VRM, VRMExpressionManager, VRMHumanBoneName } from "@pixiv/three-vrm";

export class VRMAnimation {
  public duration: number;
  public restHipsPosition: THREE.Vector3;

  public humanoidTracks: {
    translation: Map<VRMHumanBoneName, THREE.VectorKeyframeTrack>;
    rotation: Map<VRMHumanBoneName, THREE.VectorKeyframeTrack>;
  };
  public expressionTracks: Map<string, THREE.NumberKeyframeTrack>;
  public lookAtTrack: THREE.QuaternionKeyframeTrack | null;

  public constructor() {
    this.duration = 0.0;
    this.restHipsPosition = new THREE.Vector3();

    this.humanoidTracks = {
      translation: new Map(),
      rotation: new Map(),
    };

    this.expressionTracks = new Map();
    this.lookAtTrack = null;
  }

  public createAnimationClip(vrm: VRM): THREE.AnimationClip {
    const tracks: THREE.KeyframeTrack[] = [];

    tracks.push(...this.createHumanoidTracks(vrm));

    if (vrm.expressionManager != null) {
      tracks.push(...this.createExpressionTracks(vrm.expressionManager));
    }

    if (vrm.lookAt != null) {
      const track = this.createLookAtTrack("lookAtTargetParent.quaternion");

      if (track != null) {
        tracks.push(track);
      }
    }

    return new THREE.AnimationClip("Clip", this.duration, tracks);
  }

  public createHumanoidTracks(vrm: VRM): THREE.KeyframeTrack[] {
    const humanoid = vrm.humanoid;
    const metaVersion = vrm.meta.metaVersion;
    const tracks: THREE.KeyframeTrack[] = [];

    for (const [name, origTrack] of this.humanoidTracks.rotation.entries()) {
      const nodeName = humanoid.getNormalizedBoneNode(name)?.name;

      if (nodeName != null) {
        const newValues: number[] = [];
        const metaVersionZero = metaVersion === "0";
        let sign = metaVersionZero ? -1 : 1;
        let opposite = metaVersionZero ? 1 : 1;
        let prevQuaternion = new THREE.Quaternion();

        if (origTrack.values.length % 4 !== 0) {
          throw new Error("Invalid origTrack values length");
        }

        for (let i = 0; i < origTrack.values.length; i += 4) {
          const quaternion = new THREE.Quaternion(
            origTrack.values[i],
            origTrack.values[i + 1],
            origTrack.values[i + 2],
            origTrack.values[i + 3]
          );
          if (prevQuaternion.dot(quaternion) < 0 && metaVersionZero) {
            sign *= -1;
            opposite *= -1;
          }
          newValues.push(
            sign * origTrack.values[i],
            opposite * origTrack.values[i + 1],
            sign * origTrack.values[i + 2],
            opposite * origTrack.values[i + 3]
          );
          prevQuaternion = quaternion;
        }
        const track = origTrack.clone();
        track.values = new Float32Array(newValues);
        track.name = `${nodeName}.quaternion`;

          /*
          const track = new THREE.VectorKeyframeTrack(
          `${nodeName}.quaternion`,
          origTrack.times,
          origTrack.values.map((v, i) =>
            metaVersion === "0" && i % 2 === 0 ? -v : v
          )
       );
       */
        tracks.push(track);
      }
    }

    for (const [name, origTrack] of this.humanoidTracks.translation.entries()) {
      const nodeName = humanoid.getNormalizedBoneNode(name)?.name;

      if (nodeName != null) {
        const animationY = this.restHipsPosition.y;
        const humanoidY =
          humanoid.getNormalizedAbsolutePose().hips!.position![1];
        const scale = humanoidY / animationY;

        const track = origTrack.clone();
        track.values = track.values.map(
          (v, i) => (metaVersion === "0" && i % 3 !== 1 ? -v : v) * scale
        );
        track.name = `${nodeName}.position`;
        tracks.push(track);
      }
    }

    return tracks;
  }

  public createExpressionTracks(
    expressionManager: VRMExpressionManager
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = [];

    for (const [name, origTrack] of this.expressionTracks.entries()) {
      const trackName = expressionManager.getExpressionTrackName(name);

      if (trackName != null) {
        const track = origTrack.clone();
        track.name = trackName;
        tracks.push(track);
      }
    }

    return tracks;
  }

  public createLookAtTrack(trackName: string): THREE.KeyframeTrack | null {
    if (this.lookAtTrack == null) {
      return null;
    }

    const track = this.lookAtTrack.clone();
    track.name = trackName;
    return track;
  }
}
