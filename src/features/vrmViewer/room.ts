import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { config } from "@/utils/config";

export class Room {
  public room?: THREE.Group;

  constructor() {
  }

  public async loadRoom(url: string): Promise<void> {
    const loader = new GLTFLoader();

    const gltf = await loader.loadAsync(url);
    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh
        m.receiveShadow = true
        m.castShadow = true
      }
      if ((child as THREE.Light).isLight) {
        const l = child as THREE.SpotLight
        l.castShadow = true
        l.shadow.bias = -0.003
        l.shadow.mapSize.width = 2048
        l.shadow.mapSize.height = 2048
      }
    });

    this.room = gltf.scene;
  }
}
