import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { downscaleModelTextures, logTextureInfo } from '@/utils/textureDownscaler';
import { OptimizedGLTFLoader } from '@/utils/gltfOptimizer';
import { GLTFAnalyzer } from '@/utils/gltfAnalyzer';
import { TransparencyOptimizer, checkAndOptimizeTransparency } from '@/utils/transparencyOptimizer';
import { config } from "@/utils/config";

export class Room {
  public room?: THREE.Group;
  public splat?: any;

  public async loadRoom(
    url: string,
    setLoadingProgress: (progress: string) => void,
  ): Promise<void> {
    const loader = new GLTFLoader();
    /*
    const loader = new OptimizedGLTFLoader({
      // Texture optimizations
      skipTextures: true,          // Skip loading textures completely
      maxTextureSize: 512,         // Maximum texture size
      generateMipmaps: false,      // Disable mipmaps

      // Geometry optimizations
      skipDraco: true,            // Skip Draco decoder setup
      preserveIndices: false,     // Remove index buffers

      // Animation/Material optimizations
      skipAnimations: true,       // Skip loading animations
      simplifyMaterials: true,    // Use simplified materials
      disableNormalMaps: true,    // Disable normal maps

      // Performance optimizations
      disposeSourceData: true,    // Clear source data after load

      // Optional callbacks for fine-tuning
      onMesh: (mesh) => {
        // Custom mesh optimizations
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      },
      onMaterial: (material) => {
        // Custom material optimizations
        if (material instanceof THREE.MeshStandardMaterial) {
          material.envMapIntensity = 0;
        }
      },
      onTexture: (texture) => {
        // Custom texture optimizations
        texture.encoding = THREE.LinearEncoding;
      },
    });
    */
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        async (gltf) => {
          setLoadingProgress('Room fully 100% loaded');
          /*
          {
            const analyzer = new GLTFAnalyzer();
            const stats = analyzer.analyzeModel(gltf);
            console.log('Model Statistics:', stats);
            const suggestions = analyzer.suggestOptimizations(stats);
            console.log('Optimization Suggestions:', suggestions);
          }
          {
          // Or for more control:
            const optimizer = new TransparencyOptimizer();
            const stats = optimizer.analyzeTransparency(gltf);
            console.log('Transparency analysis:', stats);
            // Check for issues
            const issues = optimizer.logTransparencyIssues();
            console.log('Transparency issues:', issues);

            // Apply optimizations
            optimizer.optimizeTransparency(gltf, {
              disableTransparency: true,     // Completely disable all transparency
              minAlphaThreshold: 0.9,        // Convert nearly opaque materials to fully opaque
              convertToAlphaTest: false,      // Convert transparency to alphaTest where possible
              alphaTestThreshold: 0.5        // Threshold for alphaTest conversion
            });
          }
          */

          // await downscaleModelTextures(gltf, 128);
          /*
          gltf.scene.traverse((obj: any) => {
            obj.frustumCulled = false;
          });
          */
          this.room = gltf.scene;

          resolve();
        },
        (xhr) => {
          setLoadingProgress(
            `${Math.floor((xhr.loaded / xhr.total) * 10000) / 100}% loaded`,
          );
        },
        (error) => {
          reject(error);
        },
      );
    });
  }

  public async loadSplat(url: string): Promise<void> {
    this.splat = new GaussianSplats3D.DropInViewer({
      progressiveLoad: true,
      // freeIntermediateSplatData: true,
      // https://github.com/mkkellogg/GaussianSplats3D?tab=readme-ov-file#cors-issues-and-sharedarraybuffer
      sharedMemoryForWorkers: false,
      gpuAcceleratedSort: false,
    });
    return this.splat.addSplatScene(url, {
      // splatAlphaRemovalThreshold: 5,
      splatAlphaRemovalThreshold: 20,
      // scale: [3, 3, 3],
      // position: [0, -1, 0],
    });
  }
}
