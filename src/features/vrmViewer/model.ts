import * as THREE from "three";
import {
  MToonMaterial,
  MToonMaterialLoaderPlugin,
  VRM,
  VRMLoaderPlugin,
  VRMUtils,
} from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMAnimation } from "@/lib/VRMAnimation/VRMAnimation";
import { VRMLookAtSmootherLoaderPlugin } from "@/lib/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin";
import { LipSync } from "@/features/lipSync/lipSync";
import { EmoteController } from "@/features/emoteController/emoteController";
import { Screenplay } from "@/features/chat/messages";
import { config } from "@/utils/config";

/**
 * 3Dキャラクターを管理するクラス
 */
export class Model {
  public vrm?: VRM | null;
  public mixer?: THREE.AnimationMixer;
  public emoteController?: EmoteController;

  private _lookAtTargetParent: THREE.Object3D;
  private _lipSync?: LipSync;

  public _currentAction?: THREE.AnimationAction;

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent;
    this._lipSync = new LipSync(new AudioContext());
  }

  public async loadVRM(url: string, setLoadingProgress: (progress: string) => void): Promise<void> {
    const loader = new GLTFLoader();

    // used for debug rendering
    const helperRoot = new THREE.Group();
    helperRoot.renderOrder = 10000;

    // the type of material to use
    // should usually be MToonMaterial
    let materialType: any;
    switch (config("mtoon_material_type")) {
      case "mtoon":
        materialType = MToonMaterial;
        break;
      case "mtoon_node":
        // @ts-ignore
        const { MToonNodeMaterial } = await import('@pixiv/three-vrm/nodes');
        materialType = MToonNodeMaterial;
        break;
      case "meshtoon":
        materialType = THREE.MeshToonMaterial;
        break;
      case "basic":
        materialType = THREE.MeshBasicMaterial;
        break;
      case "depth":
        materialType = THREE.MeshDepthMaterial;
        break;
      case "normal":
        materialType = THREE.MeshNormalMaterial;
        break;
      default:
        console.error('mtoon_material_type not found');
        break;
    }

    if (config("use_webgpu") === "true") {
      // create a WebGPU compatible MToonMaterialLoaderPlugin
      // @ts-ignore
      // TODO currently MToonNodeMaterial is broken in amica
      // materialType = MTonNodeMaterial;
    }

    loader.register((parser) => {
      const options: any = {
        lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
        mtoonMaterialPlugin: new MToonMaterialLoaderPlugin(parser, {
          materialType,
        }),
      };

      if (config("debug_gfx") === "true") {
        options.helperRoot = helperRoot;
      }

      return new VRMLoaderPlugin(parser, options);
    });

    return new Promise((resolve, reject) => {
      loader.load(url, (gltf) => {
        setLoadingProgress("Processing VRM");

        const vrm = (this.vrm = gltf.userData.vrm);
        vrm.scene.name = "VRMRoot";

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);

        const mtoonDebugMode = config('mtoon_debug_mode');
        vrm.scene.traverse((obj: any) => {
          obj.frustumCulled = false;

          if (mtoonDebugMode !== 'none') {
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((mat: any) => {
                  if (mat.isMToonMaterial) {
                    mat.debugMode = mtoonDebugMode;
                  }
                });
              } else {
                if (obj.material.isMToonMaterial) {
                  obj.material.debugMode = mtoonDebugMode;
                }
              }
            }
          }
        });

        if (config("debug_gfx") === "true") {
          vrm.scene.add(helperRoot);
        }

        // TODO this causes helperRoot to be rendered to side
        // VRMUtils.rotateVRM0(vrm);
        // hacky fix
        if (vrm.meta?.metaVersion === '0') {
          vrm.scene.rotation.y = Math.PI;
          helperRoot.rotation.y = Math.PI;
        }


        this.mixer = new THREE.AnimationMixer(vrm.scene);

        this.emoteController = new EmoteController(vrm, this._lookAtTargetParent);

        resolve();
      }, (xhr) => {
        setLoadingProgress(`${Math.floor(xhr.loaded / xhr.total * 10000)/100}% loaded`);
      }, (error) => {
        reject(error);
      });
    });
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

  /**
   * 音声を再生し、リップシンクを行う
   */
  public async speak(buffer: ArrayBuffer, screenplay: Screenplay) {
    this.emoteController?.playEmotion(screenplay.expression);
    await new Promise((resolve) => {
      this._lipSync?.playFromArrayBuffer(buffer, () => {
        resolve(true);
      });
    });
  }

  public update(delta: number): void {
    if (this._lipSync) {
      const { volume } = this._lipSync.update();
      this.emoteController?.lipSync("aa", volume);
    }

    this.emoteController?.update(delta);
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }
}
