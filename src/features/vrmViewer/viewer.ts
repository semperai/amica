import * as THREE from "three";
import {
  computeBoundsTree,
  disposeBoundsTree,
  computeBatchedBoundsTree,
  disposeBatchedBoundsTree,
  acceleratedRaycast,
  MeshBVHHelper,
  CENTER,
  SAH,
  StaticGeometryGenerator,
} from 'three-mesh-bvh';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import GUI from 'lil-gui';
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

// Add the extension functions
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

THREE.BatchedMesh.prototype.computeBoundsTree = computeBatchedBoundsTree;
THREE.BatchedMesh.prototype.disposeBoundsTree = disposeBatchedBoundsTree;
THREE.BatchedMesh.prototype.raycast = acceleratedRaycast;


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
  private usingController1 = false;
  private usingController2 = false;
  private controllerGrip1: THREE.Group | null = null;
  private controllerGrip2: THREE.Group | null = null;
  private isPinching1 = false;
  private isPinching2 = false;
  private currentHandModel: number = 0;
  private handModels: { left: THREE.Object3D[], right: THREE.Object3D[] } = { left: [], right: [] };
  private igroup: InteractiveGroup | null = null;

  private gparams = {
    'y-offset': 0,
    'hands': 0,
    'bvh_ms': 0,
    'raycast_ms': 0,
  };

  private generator: StaticGeometryGenerator | null = null;
  private meshHelper: THREE.Mesh | null = null;
  private bvhHelper: MeshBVHHelper | null = null;
  private raycastTargets: THREE.Mesh[] = [];

  private mouse = new THREE.Vector2();

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

    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

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
    console.log('session', session);

    const canvas = this.getCanvas();
    // TODO this needs to be set to none to prevent double render breaking the compositing
    // except on desktop using emulator, then it should not be changed
    // canvas!.style.display = "none";

    this.cachedCameraPosition = this._camera?.position.clone() as THREE.Vector3;
    this.cachedCameraRotation = this._camera?.rotation.clone() as THREE.Euler;

    this._renderer.xr.setReferenceSpaceType('local');
    await this._renderer.xr.setSession(session);
    // this.model?.vrm?.scene.position.set(0.25, -1.5, -1.25);
    this.teleport(0, -1.2, 0);

    this.currentSession = session;
    this.currentSession.addEventListener('end', this.onSessionEnded);
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

  public teleport(x: number, y: number, z: number) {
    if (!this._renderer) {
      return;
    }
    if (!this._renderer.xr) {
      return;
    }
    if (!this._renderer.xr.isPresenting) {
      return;
    }
    const baseReferenceSpace = this._renderer.xr.getReferenceSpace();
    if (baseReferenceSpace) {
      const offsetPosition = { x, y, z, w: 1, };
      const offsetRotation = new THREE.Quaternion();
      // offsetRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
      const transform = new XRRigidTransform(offsetPosition, offsetRotation);
      const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);

      this._renderer.xr.setReferenceSpace(teleportSpaceOffset);
    }
  }

  public loadVrm(url: string) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }

    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    return this.model.loadVRM(url).then(async () => {
      if (!this.model?.vrm) return;

      // build bvh
      this.generator = new StaticGeometryGenerator(this.model.vrm.scene);

      // TODO show during debug mode
      const wireframeMaterial = new THREE.MeshBasicMaterial( {
        wireframe:   true,
        transparent: true,
        opacity:     0.05,
        depthWrite:  false,
      });
      this.meshHelper = new THREE.Mesh(new THREE.BufferGeometry(), wireframeMaterial);
      this._scene.add(this.meshHelper);

      this.bvhHelper = new MeshBVHHelper(this.meshHelper);
      this._scene.add(this.bvhHelper);

      this.buildRaycastTargets();

      this._scene.add(this.model.vrm.scene);

      const animation = config("animation_url").indexOf("vrma") > 0
        ? await loadVRMAnimation(config("animation_url"))
        : await loadMixamoAnimation(config("animation_url"), this.model?.vrm);
      if (animation) this.model.loadAnimation(animation);
      this.model.update(0.0001);

      this.regenerateBVHForModel();

      // HACK: Adjust the camera position after playback because the origin of the animation is offset
      requestAnimationFrame(() => {
        this.resetCamera();
      });
    });
  }

  public regenerateBVHForModel() {
    if (! this.meshHelper || ! this.generator || ! this.bvhHelper) {
      return;
    }

    this.generator.generate(this.meshHelper.geometry);

    if (! this.meshHelper.geometry.boundsTree) {
      this.meshHelper.geometry.computeBoundsTree();
    } else {
      this.meshHelper.geometry.boundsTree.refit();
    }

    this.bvhHelper.update();
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

      // build bvh
      this.room.room.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const geometry = child.geometry;
          geometry.computeBoundsTree();

          const helper = new MeshBVHHelper(child);
          helper.color.set(0xE91E63);
          this._scene.add(helper);
        }
      });

      this.room.room.position.set(0, 1.2, 0);
      this.buildRaycastTargets();
      this._scene.add(this.room.room);
    });
  }
  public loadSplat(url: string) {
    if (! this.room) {
      this.room = new Room();
    }
    return this.room.loadSplat(url).then(async () => {
      console.log('splat loaded', this.room?.splat);
      if (!this.room?.splat) return;

      this.room.splat.position.set(0, 4, 0);
      this.room.splat.rotation.set(0, 0, Math.PI);
      this._scene.add(this.room.splat);
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
    this._camera.position.set(0, -3, -3.5);
    this._cameraControls?.target.set(0, 4.3, 0);
    this._cameraControls?.update();
    // camera controls
    this._cameraControls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );

    this._cameraControls.screenSpacePanning = true;

    this._cameraControls.minDistance = 0.5;
    this._cameraControls.maxDistance = 8;

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

      // @ts-ignore
      this.controller1.addEventListener('connected', (event) => {
        this.usingController1 = true;
      });
      // @ts-ignore
      this.controller2.addEventListener('connected', (event) => {
        this.usingController2 = true;
      });

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
      this._scene.add(this.hand1);

      this.hand2 = this._renderer.xr.getHand(1);
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
          model.visible = i == this.currentHandModel;
          this.hand1.add(model);
        }

        {
          const model = this.handModels.right[i];
          model.visible = i == this.currentHandModel;
          this.hand2.add(model);
        }
      }

      // @ts-ignore
      this.hand1.addEventListener('pinchstart', () => {
        this.isPinching1 = true;
      });
      // @ts-ignore
      this.hand2.addEventListener('pinchstart', () => {
        this.isPinching2 = true;
      });

      // @ts-ignore
      this.hand1.addEventListener('pinchend', () => {
        this.isPinching1 = false;
      });
      // @ts-ignore
      this.hand2.addEventListener('pinchend', () => {
        this.isPinching2 = false;
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

    this.igroup = new InteractiveGroup();
    const igroup = this.igroup;
    igroup.listenToPointerEvents(this._renderer, this._camera);
    // @ts-ignore
    igroup.listenToXRControllerEvents(this.controller1);
    // @ts-ignore
    igroup.listenToXRControllerEvents(this.controller2);
    igroup.position.set(-0.25, 1.3, -0.8);
    igroup.rotation.set(0, Math.PI / 8, 0);
    this._scene.add(igroup);

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

    gui.add(this.gparams, 'hands', 0, 2, 1).onChange((value: number) => {
      this.handModels.left[this.currentHandModel].visible = false;
      this.handModels.right[this.currentHandModel].visible = false;

      this.currentHandModel = value;

      this.handModels.left[this.currentHandModel].visible = true;
      this.handModels.right[this.currentHandModel].visible = true;
    });
    gui.add(this.gparams, 'bvh_ms').listen();
    gui.add(this.gparams, 'raycast_ms').listen();

    // gui.domElement.style.visibility = 'hidden';

    const guiMesh = new HTMLMesh(gui.domElement);
    guiMesh.position.x = 0;
    guiMesh.position.y = 0;
    guiMesh.position.z = 0;
    guiMesh.scale.setScalar(2);
    igroup.add(guiMesh);


    // stats
    this._stats = new Stats();
    this._stats.dom.style.width = '80px';
    this._stats.dom.style.height = '48px';
    this._stats.dom.style.position = 'absolute';
    this._stats.dom.style.top = '0px';
    this._stats.dom.style.left = window.innerWidth - 80 + 'px';
    document.body.appendChild(this._stats.dom);

    this._statsMesh = new HTMLMesh(this._stats.dom);
    this._statsMesh.position.x = 0;
    this._statsMesh.position.y = 0.25;
    this._statsMesh.position.z = 0;
    this._statsMesh.scale.setScalar(2.5);
    igroup.add(this._statsMesh);


    window.addEventListener("resize", () => {
      this.resize();
    });

    canvas.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
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

  public doublePinchHandler() {
    if (! this.igroup || ! this._renderer || !this.controller1 || !this.controller2) {
      return;
    }

    const cam = this._renderer.xr.getCamera();

    const avgControllerPos = new THREE.Vector3()
      .addVectors(this.controller1.position, this.controller2.position)
      .multiplyScalar(0.5);

    const directionToControllers = new THREE.Vector3()
      .subVectors(avgControllerPos, cam.position)
      .normalize();

    const controller1Distance = cam.position.distanceTo(this.controller1.position);
    const controller2Distance = cam.position.distanceTo(this.controller2.position);
    const avgControllerDistance = (controller1Distance + controller2Distance) / 2;

    const distanceScale = 1;
    const d = 0.7 + (avgControllerDistance * distanceScale);

    const pos = new THREE.Vector3()
      .addVectors(cam.position, directionToControllers.multiplyScalar(d));

    this.igroup.position.copy(pos);
    this.igroup.lookAt(cam.position);
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

  public createBallAtPoint(point: THREE.Vector3) {
    const distance = point.distanceTo(this._camera?.position as THREE.Vector3);
    const s = 5;
    const h = (distance * s) - Math.floor(distance * s);
    console.log(h);
    const color = this.hslToRgb(h, 1, 0.5);

    const ballMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
    });

    const ballGeometry = new THREE.SphereGeometry(0.005, 16, 16);
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.copy(point);
    this._scene.add(ball);

    setTimeout(() => {
      this._scene.remove(ball);
    }, 10000);

  }

  public buildRaycastTargets() {
    const targets: THREE.Mesh[] = [];

    if (this.meshHelper) {
      targets.push(this.meshHelper);
    }

    if (this.room && this.room.room) {
      for (const child of this.room.room.children) {
        if (child instanceof THREE.Mesh) {
          targets.push(child);
        }
      }
    }

    this.raycastTargets = targets;
  }

  public updateRaycasts() {
    if (! this._camera || ! this.model || ! this.room) {
      return;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.firstHitOnly = true;
    const raycasterTempM = new THREE.Matrix4();

    if (! this.usingController1 && ! this.usingController2) {
      // apply mouse position
      const mouse = this.mouse;
      raycaster.setFromCamera(mouse, this._camera);

      const intersects = raycaster.intersectObjects(this.raycastTargets, true);

      if (intersects.length > 0) {
        this.createBallAtPoint(intersects[0].point);
      }
    }

    if (this.controller1) {
      raycasterTempM.identity().extractRotation(this.controller1.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(this.controller1.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(raycasterTempM);

      const intersects = raycaster.intersectObjects(this.raycastTargets, true);

      if (intersects.length > 0) {
        this.createBallAtPoint(intersects[0].point);
      }
    }

    if (this.controller2) {
      raycasterTempM.identity().extractRotation(this.controller2.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(this.controller2.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(raycasterTempM);

      // Perform raycasts
      const intersects = raycaster.intersectObjects(this.raycastTargets, true);


      if (intersects.length > 0) {
        this.createBallAtPoint(intersects[0].point);
      }
    }
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
      if (this.room?.splat) {
        // this.room.splat.update(this._renderer, this._camera);
        // this.room.splat.render();
      }

      if (this.isPinching1 && this.isPinching2) {
        this.doublePinchHandler();
      }

      let time = performance.now();
      this.regenerateBVHForModel();
      this.gparams['bvh_ms'] = performance.now() - time;
      time = performance.now();
      this.updateRaycasts();
      this.gparams['raycast_ms'] = performance.now() - time;

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
