import * as THREE from "three";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader, GLTFParser } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMAnimation } from "@/lib/VRMAnimation/VRMAnimation";
import { VRMLookAtSmootherLoaderPlugin } from "@/lib/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin";
import { EmoteController } from "@/features/emoteController/emoteController";

/**
 * 3Dキャラクターを管理するクラス
 */
export class Model {
  public vrm?: VRM | null;
  public mixer?: THREE.AnimationMixer;
  public emoteController?: EmoteController;

  private _lookAtTargetParent: THREE.Object3D;

  public _currentAction?: THREE.AnimationAction;

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent;
  }

  public async loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader();

    // used for debug rendering
    const helperRoot = new THREE.Group();
    helperRoot.renderOrder = 10000;

    loader.register((parser: GLTFParser) => {
      const options: any = {
        lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
      };

      return new VRMLoaderPlugin(parser, options);
    });

    const gltf = await loader.loadAsync(url);

    const vrm = (this.vrm = gltf.userData.vrm);
    vrm.scene.name = "VRMRoot";

    this.mixer = new THREE.AnimationMixer(vrm.scene);

    this.emoteController = new EmoteController(vrm, this._lookAtTargetParent);

    // TODO this causes helperRoot to be rendered to side
    VRMUtils.rotateVRM0(vrm);
  }

  public unLoadVrm() {
    if (this.vrm) {
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
    }
  }

  /**
   * VRMアニメーションを読み込む
   *
   * https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md
   */
  public async loadAnimation(
    animation: VRMAnimation | THREE.AnimationClip,
  ): Promise<void> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error("You have to load VRM first");
    }

    const clip =
      animation instanceof THREE.AnimationClip
        ? animation
        : animation.createAnimationClip(vrm);
    mixer.stopAllAction();
    this._currentAction = mixer.clipAction(clip);
    this._currentAction.play();
  }

  private async fadeToAction( destAction: THREE.AnimationAction, duration: number) {
    let previousAction = this._currentAction;
    this._currentAction = destAction;

    if (previousAction !== this._currentAction) {
      previousAction?.fadeOut(duration);
    }

    this._currentAction
					.reset()
					.setEffectiveTimeScale( 1 )
					.setEffectiveWeight( 1 )
					.fadeIn( 0.5 )
					.play();
  }

  private async modifyAnimationPosition(clip: THREE.AnimationClip, weight: { [key: string]: number }) {
    const { vrm } = this;
    if (vrm == null) {
      throw new Error("You have to load VRM first");
    }

    // Find the hips bone
    const hipsBone = vrm.humanoid.getNormalizedBoneNode("hips");

    if (!hipsBone) {
      throw new Error("Bone not found in VRM model");
    }

    // Use the current hips bone position as the start position
    const currentHipsPosition = hipsBone!.getWorldPosition(new THREE.Vector3());

    // Extract the start position from the animation clip
    let clipStartPositionHips: THREE.Vector3 | null = null;
    
    for (const track of clip.tracks) {
      if (track.name.endsWith(".position") && track.name.includes("Hips")) {
        const values = (track as THREE.VectorKeyframeTrack).values;
        clipStartPositionHips = new THREE.Vector3(values[0], values[1], values[2]);
        break;
      }

    }

    if (clipStartPositionHips) {
      // Calculate the offset
      const offsetHipsPosition = currentHipsPosition.clone().sub(clipStartPositionHips);

      // Apply the offset to all keyframes
      for (const track of clip.tracks) {

        if (track.name.endsWith(".position") && track.name.includes("Hips")) {
          const values = (track as THREE.VectorKeyframeTrack).values;
          for (let i = 0; i < values.length; i += 3) {
            values[i] -= offsetHipsPosition.x / weight.x;
            values[i + 1] += offsetHipsPosition.y * weight.y;
            values[i + 2] += offsetHipsPosition.z * weight.z;
          }
        }
      }
    } else {
      console.warn("Could not determine start position from animation clip.");
    }
  }

  public async playAnimation(animation: VRMAnimation | THREE.AnimationClip, name: string): Promise<number> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error("You have to load VRM first");
    }

    const clip =
      animation instanceof THREE.AnimationClip
        ? animation
        : animation.createAnimationClip(vrm);

    // modify the initial position of the VRMA animation to be sync with idle animation
    let weight: { [key: string]: number } = { x: 1, y: 1, z: 1 };

    if (!(name === "idle_loop.vrma" || name === "greeting.vrma")) {
      if (name === "dance.vrma") {
        weight = { x:2 ,y:1.25 ,z:1.5 };
      } else {
        weight = { x:1 ,y:1 ,z:0 };
      } 
      this.modifyAnimationPosition(clip, weight);
    }

    
    const idleAction = this._currentAction!;
    const VRMAaction = mixer.clipAction(clip);
    VRMAaction.clampWhenFinished = true;
    VRMAaction.loop = THREE.LoopOnce;
    this.fadeToAction(VRMAaction,1);

    const restoreState = () => {
      mixer.removeEventListener( 'finished', restoreState );
      this.fadeToAction(idleAction,1);
    }

    mixer.addEventListener("finished", restoreState);
    return clip.duration + 1 + 0.5; // 1 = fade out time, 0.5 = fade in time
  }


  public async playEmotion(expression: string) {
    this.emoteController?.playEmotion(expression);
  }

  public update(delta: number): void {
    this.emoteController?.update(delta);
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }
}
