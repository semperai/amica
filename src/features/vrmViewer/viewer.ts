import * as THREE from "three";
import { Model } from "./model";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { loadMixamoAnimation } from "@/lib/VRMAnimation/loadMixamoAnimation";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { config } from "@/utils/config";

/**
 * three.jsを使った3Dビューワー
 *
 * setup()でcanvasを渡してから使う
 */
export class Viewer {
  public isReady: boolean;
  public model?: Model;

  private _renderer?: THREE.WebGLRenderer;
  private _clock: THREE.Clock;
  private _scene: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _cameraControls?: OrbitControls;

  private _raycaster?: THREE.Raycaster;
  private _mouse?: THREE.Vector2;

  private sendScreenshotToCallback: boolean;
  private screenshotCallback: BlobCallback | undefined;

  constructor() {
    this.isReady = false;
    this.sendScreenshotToCallback = false;
    this.screenshotCallback = undefined;

    // scene
    const scene = new THREE.Scene();
    this._scene = scene;

    // light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // animate
    this._clock = new THREE.Clock();
    this._clock.start();
  }

  public loadVrm(url: string) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }

    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    return this.model.loadVRM(url).then(async () => {
      if (!this.model?.vrm) return;

      // Disable frustum culling
      this.model.vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      this._scene.add(this.model.vrm.scene);

      const animation = config("animation_url").indexOf("vrma") > 0
        ? await loadVRMAnimation(config("animation_url"))
        : await loadMixamoAnimation(config("animation_url"), this.model?.vrm);
      if (animation) this.model.loadAnimation(animation);

      // HACK: アニメーションの原点がずれているので再生後にカメラ位置を調整する
      requestAnimationFrame(() => {
        this.resetCamera();
      });
    });
  }

  public unloadVRM(): void {
    if (this.model?.vrm) {
      this._scene.remove(this.model.vrm.scene);
      this.model?.unLoadVrm();
    }
  }

  /**
   * Reactで管理しているCanvasを後から設定する
   */
  public setup(canvas: HTMLCanvasElement) {
    const parentElement = canvas.parentElement;
    const width = parentElement?.clientWidth || canvas.width;
    const height = parentElement?.clientHeight || canvas.height;
    // renderer
    this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(window.devicePixelRatio);

    // camera
    this._camera = new THREE.PerspectiveCamera(20.0, width / height, 0.1, 20.0);
    this._camera.position.set(0, 1.3, 1.5);
    this._cameraControls?.target.set(0, 1.3, 0);
    this._cameraControls?.update();
    // camera controls
    this._cameraControls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );

    this._cameraControls.screenSpacePanning = true;

    this._cameraControls.minDistance = 0.5;
    this._cameraControls.maxDistance = 4;

    this._cameraControls.update();

    // raycaster and mouse
    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    window.addEventListener("resize", () => {
      this.resize();
    });

    this.isReady = true;
    this.update();
  }

  /**
   * canvasの親要素を参照してサイズを変更する
   */
  public resize() {
    if (!this._renderer) return;

    const parentElement = this._renderer.domElement.parentElement;
    if (!parentElement) return;

    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(
      parentElement.clientWidth,
      parentElement.clientHeight
    );

    if (!this._camera) return;
    this._camera.aspect =
      parentElement.clientWidth / parentElement.clientHeight;
    this._camera.updateProjectionMatrix();
  }

  /**
   * VRMのheadノードを参照してカメラ位置を調整する
   */
  public resetCamera() {
    const headNode = this.model?.vrm?.humanoid.getNormalizedBoneNode("head");

    if (headNode) {
      const headWPos = headNode.getWorldPosition(new THREE.Vector3());
      this._camera?.position.set(
        this._camera.position.x,
        headWPos.y,
        this._camera.position.z
      );
      this._cameraControls?.target.set(headWPos.x, headWPos.y, headWPos.z);
      this._cameraControls?.update();
    }
  }

  public update = () => {
    requestAnimationFrame(this.update);
    const delta = this._clock.getDelta();
    // update vrm components
    if (this.model) {
      this.model.update(delta);
    }

    if (this._renderer && this._camera) {
      this._renderer.render(this._scene, this._camera);
      if (this.sendScreenshotToCallback && this.screenshotCallback) {
        this._renderer.domElement.toBlob(this.screenshotCallback, "image/jpeg");
        this.sendScreenshotToCallback = false;

      }
    }
  };

  public onMouseClick(event: MouseEvent): boolean {
    if (!this._renderer || !this._camera || !this.model?.vrm) return false;

    const rect = this._renderer.domElement.getBoundingClientRect();

    // calculate mouse position in normalized device coordinates
    this._mouse!.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse!.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // update the picking ray with the camera and mouse position
    this._raycaster!.setFromCamera(this._mouse!, this._camera);

    // calculate objects intersecting the picking ray
    const intersects = this._raycaster!.intersectObject(this.model.vrm.scene, true);

    if (intersects.length > 0) {
      return true;
    }
    return false;
  }

  public getScreenshotBlob = (callback: BlobCallback) => {
    this.screenshotCallback = callback;
    this.sendScreenshotToCallback = true;
  };
}
