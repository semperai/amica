import * as THREE from "three";
import {
  computeBoundsTree,
  disposeBoundsTree,
  computeBatchedBoundsTree,
  disposeBatchedBoundsTree,
  acceleratedRaycast,
  MeshBVHHelper,
  StaticGeometryGenerator,
} from 'three-mesh-bvh';
import { GenerateMeshBVHWorker } from '@/workers/bvh/GenerateMeshBVHWorker';
import { WorkerBase } from '@/workers/bvh/utils/WorkerBase';
import GUI from 'lil-gui';
import Stats from 'stats.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';

import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { loadMixamoAnimation } from "@/lib/VRMAnimation/loadMixamoAnimation";
import { config } from "@/utils/config";

import { XRControllerModelFactory } from './XRControllerModelFactory';
import { XRHandModelFactory } from './XRHandModelFactory';
import { Model } from "./model";
import { Room } from "./room";

// Add the extension functions
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BatchedMesh.prototype.raycast = acceleratedRaycast;

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

THREE.BatchedMesh.prototype.computeBoundsTree = computeBatchedBoundsTree;
THREE.BatchedMesh.prototype.disposeBoundsTree = disposeBatchedBoundsTree;

const joints = [
  'wrist',
  'thumb-metacarpal',
  'thumb-phalanx-proximal',
  'thumb-phalanx-distal',
  'thumb-tip',
  'index-finger-metacarpal',
  'index-finger-phalanx-proximal',
  'index-finger-phalanx-intermediate',
  'index-finger-phalanx-distal',
  'index-finger-tip',
  'middle-finger-metacarpal',
  'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-intermediate',
  'middle-finger-phalanx-distal',
  'middle-finger-tip',
  'ring-finger-metacarpal',
  'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-intermediate',
  'ring-finger-phalanx-distal',
  'ring-finger-tip',
  'pinky-finger-metacarpal',
  'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-intermediate',
  'pinky-finger-phalanx-distal',
  'pinky-finger-tip',
];


/**
 * three.jsを使った3Dビューワー
 *
 * setup()でcanvasを渡してから使う
 */
export class Viewer {
  public isReady: boolean = false;
  public model?: Model;
  public room?: Room;

  private _renderer?: THREE.WebGLRenderer;
  private _clock: THREE.Clock;
  private elapsedMsMid: number = 0;
  private elapsedMsSlow: number = 0;
  private _scene?: THREE.Scene;
  private _floor?: THREE.Mesh;
  private _camera?: THREE.PerspectiveCamera;
  private _cameraControls?: OrbitControls;
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
  private usingController1 = false;
  private usingController2 = false;
  private controllerGrip1: THREE.Group | null = null;
  private controllerGrip2: THREE.Group | null = null;
  private isPinching1 = false;
  private isPinching2 = false;
  private igroup: InteractiveGroup | null = null;

  private gparams = {
    'y-offset': 0,
  };
  private updateMsPanel: any = null;
  private renderMsPanel: any = null;
  private modelMsPanel: any = null;
  private bvhMsPanel: any = null;
  private raycastMsPanel: any = null;
  private statsMsPanel: any = null;

  private bvhWorker: WorkerBase | null = null;
  private modelBVHGenerator: StaticGeometryGenerator | null = null;
  private modelGeometry: THREE.BufferGeometry | null = null;
  private modelMeshHelper: THREE.Mesh | null = null;
  private modelBVHHelper: MeshBVHHelper | null = null;
  private roomBVHHelperGroup: THREE.Group = new THREE.Group();
  private modelTargets: THREE.Mesh[] = [];
  private roomTargets: THREE.Mesh[] = [];
  private raycaster = new THREE.Raycaster();
  private raycasterTempM = new THREE.Matrix4();
  private intersectsModel: THREE.Intersection[] = [];
  private intersectsRoom: THREE.Intersection[] = [];

  private jointMeshes1: THREE.Mesh[] = []; // controller1
  private jointMeshes2: THREE.Mesh[] = []; // controller2

  private mouse = new THREE.Vector2();

  constructor() {
    this.isReady = false;
    this.sendScreenshotToCallback = false;
    this.screenshotCallback = undefined;

    // animate
    this._clock = new THREE.Clock();
    this._clock.start();
  }

  public async setup(canvas: HTMLCanvasElement) {
    console.log('setup canvas');
    const parentElement = canvas.parentElement;
    const width = parentElement?.clientWidth || canvas.width;
    const height = parentElement?.clientHeight || canvas.height;


    let WebRendererType = THREE.WebGLRenderer;
    if (config('use_webgpu') === 'true') {
      // @ts-ignore
      WebRendererType = (await import("three/src/renderers/webgpu/WebGPURenderer.js")).default;
    }

    const renderer = new WebRendererType({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    }) as THREE.WebGLRenderer;
    this._renderer = renderer;

    renderer.shadowMap.enabled = false;

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    // TODO should this be enabled for only the quest3?
    renderer.xr.setFramebufferScaleFactor(2.0); // reduce pixelation with minimal performance hit on quest 3
    // webgpu does not support foveation yet
    if (config('use_webgpu') !== 'true') {
      renderer.xr.setFoveation(0);
    }

    const scene = new THREE.Scene();
    this._scene = scene;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    directionalLight.castShadow = false;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.);
    scene.add(ambientLight);

    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this._floor = floor;

    floor.rotation.x = Math.PI / 2;
    floor.visible = false;
    scene.add(floor);

    scene.add(this.roomBVHHelperGroup);

    // camera
    const camera = new THREE.PerspectiveCamera(20.0, width / height, 0.1, 20.0);
    this._camera = camera;

    camera.position.set(0, -3, -3.5);

    const cameraControls = new OrbitControls(
      camera,
      renderer.domElement
    );
    this._cameraControls = cameraControls;

    cameraControls.screenSpacePanning = true;
    cameraControls.minDistance = 0.5;
    cameraControls.maxDistance = 8;
    cameraControls.update();

    const igroup = new InteractiveGroup();
    this.igroup = igroup;

    igroup.position.set(-0.25, 1.3, -0.8);
    igroup.rotation.set(0, Math.PI / 8, 0);
    scene.add(igroup);

    igroup.listenToPointerEvents(renderer, camera);

    canvas.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // check if controller is available
    try {
      const controller1 = renderer.xr.getController(0);
      this.controller1 = controller1;

      const controller2 = renderer.xr.getController(1);
      this.controller2 = controller2;

      scene.add(controller1);
      scene.add(controller2);

      // @ts-ignore
      controller1.addEventListener('connected', (event) => {
        this.usingController1 = true;
      });
      // @ts-ignore
      controller2.addEventListener('connected', (event) => {
        this.usingController2 = true;
      });

      console.log('controller1', controller1);
      console.log('controller2', controller2);

      const controllerModelFactory = new XRControllerModelFactory();

      const controllerGrip1 = renderer.xr.getControllerGrip(0);
      this.controllerGrip1 = controllerGrip1;

      controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
      scene.add(controllerGrip1);

      const controllerGrip2 = renderer.xr.getControllerGrip(1);
      this.controllerGrip2 = controllerGrip2;

      controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
      scene.add(controllerGrip2);

      const hand1 = renderer.xr.getHand(0);
      this.hand1 = hand1;
      scene.add(hand1);

      const hand2 = renderer.xr.getHand(1);
      this.hand2 = hand2;
      scene.add(hand2);

      // @ts-ignore
      hand1.addEventListener('pinchstart', () => {
        this.isPinching1 = true;
      });
      // @ts-ignore
      hand2.addEventListener('pinchstart', () => {
        this.isPinching2 = true;
      });

      // @ts-ignore
      hand1.addEventListener('pinchend', () => {
        this.isPinching1 = false;
      });
      // @ts-ignore
      hand2.addEventListener('pinchend', () => {
        this.isPinching2 = false;
      });

      {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -1)
        ]);

        const line = new THREE.Line(geometry);
        line.scale.z = 5;

        controller1.add(line.clone());
        controller2.add(line.clone());
      }

      // webgpu does not support xr controller events yet
      if (config('use_webgpu') !== 'true') {
        // @ts-ignore
        igroup.listenToXRControllerEvents(controller1);
        // @ts-ignore
        igroup.listenToXRControllerEvents(controller2);
      }
    } catch (e) {
      console.log("No controller available", e);
    }

    // gui
    const gui = new GUI();
    let updateDebounceId: ReturnType<typeof setTimeout>|null = null;
    gui.add(this.gparams, 'y-offset', -0.2, 0.2).onChange((value: number) => {
      if (updateDebounceId) {
        clearTimeout(updateDebounceId);
      }

      updateDebounceId = setTimeout(() => {
        this.teleport(0, value, 0);
        this.gparams['y-offset'] = 0;
      }, 1000);
    });

    // gui.domElement.style.visibility = 'hidden';

    const guiMesh = new HTMLMesh(gui.domElement);
    guiMesh.position.x = 0;
    guiMesh.position.y = 0;
    guiMesh.position.z = 0;
    guiMesh.scale.setScalar(2);
    igroup.add(guiMesh);


    // stats
    const stats = new Stats();
    this._stats = stats;
    stats.dom.style.width = '80px';
    stats.dom.style.height = '48px';
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0px';
    stats.dom.style.left = window.innerWidth - 80 + 'px';
    document.body.appendChild(stats.dom);

    this.updateMsPanel  = stats.addPanel(new Stats.Panel('update_ms', '#fff', '#221'));
    this.renderMsPanel  = stats.addPanel(new Stats.Panel('render_ms', '#ff8', '#221'));
    this.modelMsPanel   = stats.addPanel(new Stats.Panel('model_ms', '#f8f', '#212'));
    this.bvhMsPanel     = stats.addPanel(new Stats.Panel('bvh_ms', '#8ff', '#122'));
    this.raycastMsPanel = stats.addPanel(new Stats.Panel('raycast_ms', '#f8f', '#212'));
    this.statsMsPanel   = stats.addPanel(new Stats.Panel('stats_ms', '#8f8', '#212'));

    const statsMesh = new HTMLMesh(stats.dom);
    this._statsMesh = statsMesh;

    statsMesh.position.x = 0;
    statsMesh.position.y = 0.25;
    statsMesh.position.z = 0;
    statsMesh.scale.setScalar(2.5);
    igroup.add(statsMesh);

    this.bvhWorker = new GenerateMeshBVHWorker();
    this.raycaster.firstHitOnly = true;

    // add joint / hand meshes
    {
      const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1.0,
        metalness: 0.0,
      });

      const mesh = new THREE.Mesh(geometry, material);

      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -1, 0)
      ]);

      const line = new THREE.Line(lineGeometry);
      line.scale.z = 5;

      for (const _ of joints) {
        this.jointMeshes1.push(mesh.clone());
        this.jointMeshes2.push(mesh.clone());
        this.jointMeshes1[this.jointMeshes1.length - 1].add(line.clone());
        this.jointMeshes2[this.jointMeshes2.length - 1].add(line.clone());

        scene.add(this.jointMeshes1[this.jointMeshes1.length - 1]);
        scene.add(this.jointMeshes2[this.jointMeshes2.length - 1]);
      }
    }

    window.addEventListener("resize", () => {
      this.resize();
    });

    this.isReady = true;
    renderer.setAnimationLoop(() => {
      this.update();
    });
  }

  public getCanvas() {
    return this._renderer?.domElement?.parentElement?.getElementsByTagName("canvas")[0];
  }

  public async onSessionStarted(session: XRSession, immersiveType: XRSessionMode) {
    if (! this._renderer) return;
    console.log('session', session);

    const canvas = this.getCanvas();
    // TODO this needs to be set to none to prevent double render breaking the compositing
    // except on desktop using emulator, then it should not be changed
    // canvas!.style.display = "none";

    this.cachedCameraPosition = this._camera?.position.clone() as THREE.Vector3;
    this.cachedCameraRotation = this._camera?.rotation.clone() as THREE.Euler;

    this._renderer.xr.setReferenceSpaceType('local');
    await this._renderer.xr.setSession(session);

    this.teleport(0, -1.2, 0);

    if (immersiveType === 'immersive-vr') {
      this._floor!.visible = true;
    }

    this.currentSession = session;
    this.currentSession.addEventListener('end', () => this.onSessionEnded());
  }

  public onSessionEnded(/*event*/) {
    // TODO investigate this
    if (! this) {
      console.error('onSessionEnded called without this');
      return;
    }
    if (! this.currentSession) return;

    // reset camera
    this._camera?.position.copy(this.cachedCameraPosition as THREE.Vector3);
    this._camera?.rotation.copy(this.cachedCameraRotation as THREE.Euler);

    const canvas = this.getCanvas();
    canvas!.style.display = "inline";

    this.currentSession.removeEventListener('end', this.onSessionEnded);
    this.currentSession = null;

    this._floor!.visible = false;
    this.resetCamera();
  }

  public teleport(x: number, y: number, z: number) {
    if (! this._renderer?.xr?.isPresenting) return;

    const baseReferenceSpace = this._renderer!.xr.getReferenceSpace();
    if (! baseReferenceSpace) {
      console.warn('baseReferenceSpace not found');
      return;
    }

    const offsetPosition = { x, y, z, w: 1, };
    const offsetRotation = new THREE.Quaternion();
    // offsetRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    const transform = new XRRigidTransform(offsetPosition, offsetRotation);
    const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);

    this._renderer!.xr.setReferenceSpace(teleportSpaceOffset);
  }

  public async loadVrm(url: string) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }

    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    await this.model.loadVRM(url);
    if (!this.model?.vrm) return;

    // build bvh
    this.modelBVHGenerator = new StaticGeometryGenerator(this.model.vrm.scene);

    // TODO show during debug mode
    const wireframeMaterial = new THREE.MeshBasicMaterial( {
      wireframe:   true,
      transparent: true,
      opacity:     0.05,
      depthWrite:  false,
    });
    this.modelMeshHelper = new THREE.Mesh(new THREE.BufferGeometry(), wireframeMaterial);
    this.modelTargets = [this.modelMeshHelper];

    if (config("debug_gfx") === "true") {
      this._scene!.add(this.modelMeshHelper);
    }

    this.modelBVHHelper = new MeshBVHHelper(this.modelMeshHelper);
    if (config("debug_gfx") === "true") {
      this._scene!.add(this.modelBVHHelper);
    }

    this._scene!.add(this.model.vrm.scene);

    const animation = config("animation_url").indexOf("vrma") > 0
      ? await loadVRMAnimation(config("animation_url"))
      : await loadMixamoAnimation(config("animation_url"), this.model?.vrm);
    if (animation) {
      await this.model.loadAnimation(animation);
      this.model.update(0);
    }

    await this.regenerateBVHForModel();

    // HACK: Adjust the camera position after playback because the origin of the animation is offset
    this.resetCamera();
  }

  public unloadVRM(): void {
    if (this.model?.vrm) {
      this._scene!.remove(this.model.vrm.scene);
      // TODO if we don't dispose and create a new geometry then it seems like the performance gets slower
      {
        const geometry = this.modelMeshHelper?.geometry;
        geometry?.dispose();
        for (const key in geometry?.attributes) {
          geometry?.deleteAttribute(key);
        }
        this._scene!.remove(this.modelMeshHelper as THREE.Object3D);
        this._scene!.remove(this.modelBVHHelper as THREE.Object3D);
      }
      this.model?.unLoadVrm();
    }
  }

  public loadRoom(url: string) {
    if (this.room?.room) {
      this.unloadRoom();
    }

    this.room = new Room();
    return this.room.loadRoom(url).then(async () => {
      if (!this.room?.room) return;

      const roomYOffset = 1.2;

      this.room.room.position.set(0, roomYOffset, 0);
      this._scene!.add(this.room.room);

      // build bvh
      this.roomTargets = [];
      for (let child of this.room.room.children) {
        if (child instanceof THREE.Mesh) {
          // this must be cloned because the worker breaks rendering for some reason
          this.roomTargets.push(child);
          const geometry = child.geometry.clone() as THREE.BufferGeometry;
          const bvh = await this.bvhWorker!.generate(geometry, { maxLeafTris: 1 })!;
          child.geometry.boundsTree = bvh;

          if (config("debug_gfx") === "true") {
            const helper = new MeshBVHHelper(child, bvh);
            helper.color.set(0xE91E63);
            this.roomBVHHelperGroup.add(helper)
          }
        }
      }

      this._scene!.add(this.roomBVHHelperGroup);
    });
  }

  public unloadRoom(): void {
    if (this.room?.room) {
      this._scene!.remove(this.room.room);
      // TODO if we don't dispose and create a new geometry then it seems like the performance gets slower
      for (const item of this.roomBVHHelperGroup.children) {
        if (item instanceof MeshBVHHelper) {
          try {
            // @ts-ignore
            const geometry = item.geometry;
            geometry?.dispose();
            for (const key in geometry?.attributes) {
              geometry?.deleteAttribute(key);
            }
          } catch (e) {
            console.error('error disposing room geometry', e);
          }
        }
      }
      this._scene!.remove(this.roomBVHHelperGroup);
    }
  }

  // probably too slow to use
  // but fun experiment. maybe some use somewhere for tiny splats ?
  public loadSplat(url: string) {
    if (! this.room) {
      this.room = new Room();
    }
    return this.room.loadSplat(url).then(async () => {
      console.log('splat loaded');
      if (!this.room?.splat) return;

      this.room.splat.position.set(0, 4, 0);
      this.room.splat.rotation.set(0, 0, Math.PI);
      this._scene!.add(this.room.splat);
    });
  }

  // TODO use the bvh worker to generate the bvh / bounds tree
  // TODO run this in its own loop to keep the bvh in sync with animation
  // TODO investigate if we can get speedup using parallel bvh generation
  public async regenerateBVHForModel() {
    if (! this.modelMeshHelper) return;

    this.modelBVHGenerator!.generate(this.modelMeshHelper!.geometry);

    if (! this.modelMeshHelper!.geometry.boundsTree) {
      this.modelMeshHelper!.geometry.computeBoundsTree();
    } else {
      this.modelMeshHelper!.geometry.boundsTree.refit();
    }

    this.modelBVHHelper!.update();
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

  public doublePinchHandler() {
    const cam = this._renderer!.xr.getCamera();

    const avgControllerPos = new THREE.Vector3()
      .addVectors(this.controller1!.position, this.controller2!.position)
      .multiplyScalar(0.5);

    const directionToControllers = new THREE.Vector3()
      .subVectors(avgControllerPos, cam.position)
      .normalize();

    const controller1Distance = cam.position.distanceTo(this.controller1!.position);
    const controller2Distance = cam.position.distanceTo(this.controller2!.position);
    const avgControllerDistance = (controller1Distance + controller2Distance) / 2;

    const distanceScale = 1;
    const d = 0.7 + (avgControllerDistance * distanceScale);

    const pos = new THREE.Vector3()
      .addVectors(cam.position, directionToControllers.multiplyScalar(d));

    this.igroup!.position.copy(pos);
    this.igroup!.lookAt(cam.position);
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

    this._camera!.aspect =
      parentElement.clientWidth / parentElement.clientHeight;
    this._camera!.updateProjectionMatrix();
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
    this._camera?.position.lerpVectors(this._camera?.position, newPosition, 0);
    // this._cameraControls?.target.lerpVectors(this._cameraControls?.target,headWPos,0.5);
    // this._cameraControls?.update();
  }

  public hslToRgb(h: number, s: number, l: number) {
    let r, g, b;

    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p: number, q: number, t: number) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return parseInt(`0x`+[r * 255, g * 255, b * 255 ].map(Math.floor).map(v => v.toString(16).padStart(2, '0')).join(''));
  }

  // itype: 0 = amica, 1 = room
  public createBallAtPoint(point: THREE.Vector3, itype: number = 0) {
    return;
    const distance = point.distanceTo(this._camera?.position as THREE.Vector3);
    const s = 5;
    const h = (distance * s) - Math.floor(distance * s);

    const getAmicaColor = () => {
      return this.hslToRgb(h, 1, 0.5);
    }
    const getRoomColor = () => {
      return this.hslToRgb(h, 0.1, 0.4);
    }

    const color = itype == 0 ? getAmicaColor() : getRoomColor();

    const ballMaterial = new THREE.MeshBasicMaterial({
      color,
    });

    const ballGeometry = new THREE.SphereGeometry(0.005, 16, 16);
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.copy(point);
    this._scene!.add(ball);

    setTimeout(() => {
      this._scene!.remove(ball);
    }, 10000);
  }

  public updateRaycasts() {
    const checkIntersection = () => {
      try {
        if (this.modelTargets.length > 0) {
          this.intersectsModel = this.raycaster.intersectObjects(this.modelTargets, true);
        }
        if (this.roomTargets.length > 0) {
          this.intersectsRoom = this.raycaster.intersectObjects(this.roomTargets, true);
        }
      } catch (e) {
        // if the models get removed from scene during raycast then this will throw an error
        console.error('intersectObjects error', e);
        return;
      }

      // check which object is closer
      // TODO clean this up
      if (this.intersectsModel.length > 0 && this.intersectsRoom.length > 0) {
        if (this.intersectsModel[0].distance < this.intersectsRoom[0].distance) {
          this.createBallAtPoint(this.intersectsModel[0].point, 0);
        } else {
          this.createBallAtPoint(this.intersectsRoom[0].point, 1);
        }
      } else if (this.intersectsModel.length > 0) {
        this.createBallAtPoint(this.intersectsModel[0].point, 0);
      } else if (this.intersectsRoom.length > 0) {
        this.createBallAtPoint(this.intersectsRoom[0].point, 1);
      }
    }

    if (! this.usingController1 && ! this.usingController2) {
      this.raycaster.setFromCamera(this.mouse, this._camera!);
      checkIntersection();
    }

    const handleController = (controller: THREE.Group) => {
      this.raycasterTempM.identity().extractRotation(controller.matrixWorld);
      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.raycasterTempM);
      checkIntersection();
    }

    const handleHand = (joints: THREE.Mesh[]) => {
      for (const joint of joints) {
        const m = joint.matrixWorld;
        this.raycasterTempM.identity().extractRotation(m);
        this.raycaster.ray.origin.setFromMatrixPosition(m);
        this.raycaster.ray.direction.set(0, -1, 0).applyMatrix4(this.raycasterTempM);

        checkIntersection();
      }
    }

    if (this.hand1) {
      handleHand(this.jointMeshes1);
    } else if (this.controller1) {
      handleController(this.controller1);
    }
    if (this.hand2) {
      handleHand(this.jointMeshes2);
    } else if (this.controller2) {
      handleController(this.controller2);
    }
  }

  // thx @ke456-png :)
  public applyWind(dir: THREE.Vector3, strength: number) {
    this.model?.vrm?.springBoneManager?.joints.forEach(e => {
      // console.log('e', e.bone.name);
      // console.log('e', e);
      e.settings.gravityDir = dir;
      e.settings.gravityPower = strength;
    });
  }

  public update(time?: DOMHighResTimeStamp, frame?: XRFrame) {
    let utime = performance.now(); // count total update time

    // quick exit until setup finishes
    if (! this.isReady) return;

    const delta = this._clock.getDelta();

    this.elapsedMsSlow += delta;
    this.elapsedMsMid += delta;

    // @ts-ignore
    if (this.hand1 && this.hand1.joints) {
      let i=0; for (const name of joints) {
        // @ts-ignore // TODO fix this
        const joint = this.hand1?.joints[name];
        if (! joint) continue;
        const mesh = this.jointMeshes1[i];
        mesh.position.copy(joint.position);
        mesh.quaternion.copy(joint.quaternion);
        console.log('joint', joint);
        ++i;
      }
    }
    // @ts-ignore
    if (this.hand2 && this.hand2.joints) {
      let i=0; for (const name of joints) {
        // @ts-ignore // TODO fix this
        const joint = this.hand2?.joints[name];
        if (! joint) continue;
        const mesh = this.jointMeshes2[i];
        mesh.position.copy(joint.position);
        mesh.quaternion.copy(joint.quaternion);
        console.log('joint', joint);
        ++i;
      }
    }

    this._stats!.update();

    let ptime = performance.now();

    ptime = performance.now();
    this._renderer!.render(this._scene!, this._camera!);
    this.renderMsPanel.update(performance.now() - ptime, 100);

    this.room?.splat?.update(this._renderer, this._camera);
    this.room?.splat?.render();

    if (this.isPinching1 && this.isPinching2) {
      this.doublePinchHandler();
    }

    if (this.elapsedMsMid > 1 / 30) {
      {
        this.applyWind(
          new THREE.Vector3(1, 0, -1),
          (Math.sin(this._clock.elapsedTime * Math.PI / 3) + 1) * 0.1
        );
      }

      ptime = performance.now();
      this.model?.update(this.elapsedMsMid);
      this.modelMsPanel.update(performance.now() - ptime, 40);

      ptime = performance.now();
      this.updateRaycasts();
      this.raycastMsPanel.update(performance.now() - ptime, 100);

      this.elapsedMsMid = 0;
    }

    if (this.elapsedMsSlow > 1) {
      // updating the texture for this is very slow
      ptime = performance.now();
      // @ts-ignore
      this._statsMesh!.material.map.update();
      this.statsMsPanel.update(performance.now() - ptime, 100);

      // TODO run this in a web worker
      // ideally parallel version
      ptime = performance.now();
      // this.regenerateBVHForModel();
      this.bvhMsPanel.update(performance.now() - ptime, 100);

      this.elapsedMsSlow = 0;
    }

    if (this.sendScreenshotToCallback && this.screenshotCallback) {
      this._renderer!.domElement.toBlob(this.screenshotCallback, "image/jpeg");
      this.sendScreenshotToCallback = false;

    }

    this.updateMsPanel.update(performance.now() - utime, 40);
  }

  public getScreenshotBlob = (callback: BlobCallback) => {
    this.screenshotCallback = callback;
    this.sendScreenshotToCallback = true;
  };
}
