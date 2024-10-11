import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {
  reversePainterSortStable,
  Container,
  Root,
} from '@pmndrs/uikit'
import { Model } from "./model";
import { Room } from "./room";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { loadMixamoAnimation } from "@/lib/VRMAnimation/loadMixamoAnimation";
import { config } from "@/utils/config";

/**
 * three.jsを使った3Dビューワー
 *
 * setup()でcanvasを渡してから使う
 */
export class Viewer {
  public isReady: boolean;
  public model?: Model;
  public room?: Room;

  private _renderer?: THREE.WebGLRenderer;
  private _clock: THREE.Clock;
  private _scene: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _cameraControls?: OrbitControls;
  private _uiroot?: Root;
  private _stats?: Stats;
  private _statsMesh?: THREE.Mesh;


  private sendScreenshotToCallback: boolean;
  private screenshotCallback: BlobCallback | undefined;

  // XR
  public currentSession: XRSession | null = null;
  private cachedCameraPosition: THREE.Vector3 | null = null;
  private cachedCameraRotation: THREE.Euler | null = null;
  private hand1: THREE.Group | null = null;
  private hand2: THREE.Group | null = null;
  private controller1: THREE.Group | null = null;
  private controller2: THREE.Group | null = null;
  private controllerGrip1: THREE.Group | null = null;
  private controllerGrip2: THREE.Group | null = null;
  private handModels: { left: THREE.Object3D[], right: THREE.Object3D[] } = { left: [], right: [] };

  constructor() {
    this.isReady = false;
    this.sendScreenshotToCallback = false;
    this.screenshotCallback = undefined;

    // scene
    const scene = new THREE.Scene();
    this._scene = scene;

    // light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.);
    scene.add(ambientLight);

    // animate
    this._clock = new THREE.Clock();
    this._clock.start();
  }

  public getCanvas() {
    return this._renderer?.domElement?.parentElement?.getElementsByTagName("canvas")[0];
  }

  public async onSessionStarted(session: XRSession) {
    if (! this._renderer) {
      return;
    }

    const canvas = this.getCanvas();
    canvas!.style.display = "none";

    this.cachedCameraPosition = this._camera?.position.clone() as THREE.Vector3;
    this.cachedCameraRotation = this._camera?.rotation.clone() as THREE.Euler;

    this._renderer.xr.setReferenceSpaceType('local');
    await this._renderer.xr.setSession(session);
    this.model?.vrm?.scene.position.set(0.25, -1.5, -1.25);

    this.currentSession = session;
    this.currentSession.addEventListener('end', this.onSessionEnded);
    this.currentSession.addEventListener('select', this.onSelect);
  }

  public onSessionEnded(/*event*/) {
    if (! this.currentSession) {
      return;
    }

    // reset camera
    this._camera?.position.copy(this.cachedCameraPosition as THREE.Vector3);
    this._camera?.rotation.copy(this.cachedCameraRotation as THREE.Euler);

    const canvas = this.getCanvas();
    canvas!.style.display = "inline";

    this.currentSession.removeEventListener('end', this.onSessionEnded);
    this.currentSession = null;
    this.model?.vrm?.scene.position.set(0, 0, 0);
    requestAnimationFrame(() => {
      this.resetCamera();
    });
  }

  public loadVrm(url: string) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }

    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    return this.model.loadVRM(url).then(async () => {
      if (!this.model?.vrm) return;

      this._scene.add(this.model.vrm.scene);

      const animation = config("animation_url").indexOf("vrma") > 0
        ? await loadVRMAnimation(config("animation_url"))
        : await loadMixamoAnimation(config("animation_url"), this.model?.vrm);
      if (animation) this.model.loadAnimation(animation);

      // HACK: Adjust the camera position after playback because the origin of the animation is offset
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

  public loadRoom(url: string) {
    this.room = new Room();
    return this.room.loadRoom(url).then(async () => {
      if (!this.room?.room) return;

      this.room.room.position.set(0, -0.3, 0);
      this._scene.add(this.room.room);
    });
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
    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setTransparentSort(reversePainterSortStable)
    this._renderer.localClippingEnabled = true
    this._renderer.shadowMap.enabled = true;
    this._renderer.xr.enabled = true;
    this._renderer.xr.setFoveation(0);

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

    this._uiroot = new Root(this._camera, this._renderer, {
      flexDirection: 'row',
      padding: 10,
      gap: 10,
      width: 500,
      height: 250,
      // display: 'none', // change to 'flex' to show in AR mode
      /*
      This._uiroot.setStyle({
        display: 'none',
      });
      */
    });
    this._scene.add(this._uiroot);


    /*
    const c1 = new Container({
      flexGrow: 1,
      backgroundOpacity: 0.5,
      hover: { backgroundOpacity: 1 },
      backgroundColor: "red"
    })
    this._uiroot.add(c1)
    const c2 = new Container({
        flexGrow: 1,
        backgroundOpacity: 0.5,
        hover: { backgroundOpacity: 1 },
        backgroundColor: "blue"
    })
    this._uiroot.add(c2)

    c2.dispatchEvent({
      type: 'pointerover',
      distance: 0,
      nativeEvent: {} as any,
      object: c1,
      point: new THREE.Vector3(),
      pointerId: -1,
    });
    */


    // check if controller is available
    try {
      this.controller1 = this._renderer.xr.getController(0);
      this._scene.add(this.controller1);
      this.controller2 = this._renderer.xr.getController(1);
      this._scene.add(this.controller2);

      console.log('controller1', this.controller1);
      console.log('controller2', this.controller2);

      const controllerModelFactory = new XRControllerModelFactory();
      const handModelFactory = new XRHandModelFactory();

      this.controllerGrip1 = this._renderer.xr.getControllerGrip(0);
      this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1));
      this._scene.add(this.controllerGrip1);

      this.controllerGrip2 = this._renderer.xr.getControllerGrip(1);
      this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2));
      this._scene.add(this.controllerGrip2);

      this.hand1 = this._renderer.xr.getHand(0);
      this.hand1.userData.currentHandModel = 0;
      this._scene.add(this.hand1);

      this.hand2 = this._renderer.xr.getHand(1);
      this.hand2.userData.currentHandModel = 0;
      this._scene.add(this.hand2);

      this.handModels.left = [
        handModelFactory.createHandModel(this.hand1, 'boxes'),
        handModelFactory.createHandModel(this.hand1, 'spheres'),
        handModelFactory.createHandModel(this.hand1, 'mesh')
      ];

      this.handModels.right = [
        handModelFactory.createHandModel(this.hand2, 'boxes'),
        handModelFactory.createHandModel(this.hand2, 'spheres'),
        handModelFactory.createHandModel(this.hand2, 'mesh')
      ];

      for (let i=0; i<3; ++i) {
        {
          const model = this.handModels.left[i];
          model.visible = i == 0;
          this.hand1.add(model);
        }

        {
          const model = this.handModels.right[i];
          model.visible = i == 0;
          this.hand2.add(model);
        }
      }

      // TODO fix the ts-ignore
      const that = this;
      // @ts-ignore
      this.hand1.addEventListener('pinchend', function () {
        // @ts-ignore
        that.handModels.left[this.userData.currentHandModel].visible = false;
        // @ts-ignore
        this.userData.currentHandModel = (this.userData.currentHandModel + 1) % 3;
        // @ts-ignore
        that.handModels.left[this.userData.currentHandModel].visible = true;
      });
      // @ts-ignore
      this.hand2.addEventListener('pinchend', function () {
        // @ts-ignore
        that.handModels.right[this.userData.currentHandModel].visible = false;
        // @ts-ignore
        this.userData.currentHandModel = (this.userData.currentHandModel + 1) % 3;
        // @ts-ignore
        that.handModels.right[this.userData.currentHandModel].visible = true;
      });

      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
      ]);

      const line = new THREE.Line(geometry);
      line.name = 'line';
      line.scale.z = 5;

      this.controller1.add(line.clone());
      this.controller2.add(line.clone());

    } catch (e) {
      console.log("No controller available", e);
    }

    const igroup = new InteractiveGroup();
    igroup.listenToPointerEvents(this._renderer, this._camera);
    // @ts-ignore
    igroup.listenToXRControllerEvents(this.controller1);
    // @ts-ignore
    igroup.listenToXRControllerEvents(this.controller2);
    this._scene.add(igroup);


    // stats
    this._stats = new Stats();
    this._stats.dom.style.width = '80px';
    this._stats.dom.style.height = '48px';
    this._stats.dom.style.position = 'absolute';
    this._stats.dom.style.top = '0px';
    this._stats.dom.style.left = window.innerWidth - 80 + 'px';
    document.body.appendChild(this._stats.dom);

    this._statsMesh = new HTMLMesh(this._stats.dom);
    this._statsMesh.position.x = -0.5;
    this._statsMesh.position.y = 1.5;
    this._statsMesh.position.z = -0.6;
    this._statsMesh.rotation.y = Math.PI / 4;
    this._statsMesh.scale.setScalar( 2.5 );
    igroup.add(this._statsMesh);


    window.addEventListener("resize", () => {
      this.resize();
    });

    this.isReady = true;
    this._renderer.setAnimationLoop(() => {
      this.update();
    });
  }

  public onSelect(event: XRInputSourceEvent) {
    console.log('onSelect', event);
    console.log('onSelect', event.inputSource);
    console.log('onSelect', event.inputSource.hand);
    console.log('onSelect', event.inputSource.handedness);
    console.log('onSelect', event.inputSource.gripSpace);
    console.log('onSelect', event.inputSource.targetRayMode);
    console.log('onSelect', event.inputSource.targetRaySpace);
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

  public resizeChatMode(on: boolean){
    if (!this._renderer) return;

    const parentElement = this._renderer.domElement.parentElement;
    if (!parentElement) return;

    this._renderer.setPixelRatio(window.devicePixelRatio);

    let width = parentElement.clientWidth;
    let height = parentElement.clientHeight;
    if (on) {width = width/2; height = height/2; }

    this._renderer.setSize(
      width,
      height
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

  public resetCameraLerp() {
    // y = 1.3 is from initial setup position of camera
    const newPosition = new THREE.Vector3(
      this._camera?.position.x,
      1.3,
      this._camera?.position.z
    );
    this._camera?.position.lerpVectors(this._camera?.position,newPosition,0);
    // this._cameraControls?.target.lerpVectors(this._cameraControls?.target,headWPos,0.5);
    // this._cameraControls?.update();
  }

  public update(time?: DOMHighResTimeStamp, frame?: XRFrame) {
    const delta = this._clock.getDelta();
    // update vrm components
    if (this.model) {
      this.model.update(delta);
    }

    if (this._renderer && this._camera) {

      if (this._uiroot) {
        this._uiroot.update(delta);
      }
      this._renderer.render(this._scene, this._camera);
      if (this._stats) {
        this._stats.update();
      }
      if (this._statsMesh) {
        // @ts-ignore
        this._statsMesh.material.map.update();
      }
      if (this.sendScreenshotToCallback && this.screenshotCallback) {
        this._renderer.domElement.toBlob(this.screenshotCallback, "image/jpeg");
        this.sendScreenshotToCallback = false;

      }
    }
  }

  public getScreenshotBlob = (callback: BlobCallback) => {
    this.screenshotCallback = callback;
    this.sendScreenshotToCallback = true;
  };
}
