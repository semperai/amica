import * as THREE from 'three';
import { GLTF, GLTFLoader, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Type for the extension callback
type ExtensionCallback = (parser: GLTFParser) => Promise<void> | void;

interface OptimizationOptions {
  // Texture options
  skipTextures?: boolean;
  maxTextureSize?: number;
  generateMipmaps?: boolean;
  
  // Geometry options
  skipDraco?: boolean;
  preserveIndices?: boolean;
  
  // Animation options
  skipAnimations?: boolean;
  
  // Material options
  simplifyMaterials?: boolean;
  disableNormalMaps?: boolean;
  
  // Performance options
  disposeSourceData?: boolean;
  
  // Custom optimization callbacks
  onMesh?: (mesh: THREE.Mesh) => void;
  onMaterial?: (material: THREE.Material) => void;
  onTexture?: (texture: THREE.Texture) => void;
}

class OptimizedGLTFLoader {
  private loader: GLTFLoader;
  private dracoLoader: DRACOLoader | null = null;
  private options: OptimizationOptions;
  private extensions: ExtensionCallback[] = [];

  constructor(options: OptimizationOptions = {}) {
    this.options = {
      skipTextures: false,
      maxTextureSize: 1024,
      generateMipmaps: false,
      skipDraco: false,
      preserveIndices: false,
      skipAnimations: false,
      simplifyMaterials: false,
      disableNormalMaps: false,
      disposeSourceData: true,
      ...options
    };

    this.loader = new GLTFLoader();
    this.setupLoader();
  }

  private setupLoader() {
    // Setup Draco if not skipped
    if (!this.options.skipDraco) {
      this.dracoLoader = new DRACOLoader();
      this.dracoLoader.setDecoderPath('/draco/');  // Adjust path as needed
      this.loader.setDRACOLoader(this.dracoLoader);
    }
  }

  /**
   * Register a custom extension or processor
   * @param callback Function that receives the GLTFParser
   * @returns The loader instance for chaining
   */
  public register(callback: ExtensionCallback): this {
    // Add to our extensions array
    this.extensions.push(callback);
    
    // Register with the underlying loader
    this.loader.register(callback as any);
    
    return this;
  }


  private optimizeTexture(texture: THREE.Texture) {
    if (!texture) return;

    // Apply texture optimizations
    texture.generateMipmaps = this.options.generateMipmaps || false;
    texture.minFilter = this.options.generateMipmaps ? 
      THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 1; // Disable anisotropic filtering

    // Optional texture callback
    if (this.options.onTexture) {
      this.options.onTexture(texture);
    }
  }

  private optimizeMaterial(material: THREE.Material) {
    if (!material) return;

    if (this.options.simplifyMaterials) {
      // Simplify material settings
      // @ts-ignore
      material.fog = false;
      material.dithering = false;
      // @ts-ignore
      material.flatShading = true;
      
      if (material instanceof THREE.MeshStandardMaterial) {
        material.roughness = 1;
        material.metalness = 0;
        material.envMapIntensity = 0;
        
        if (this.options.disableNormalMaps) {
          material.normalMap = null;
        }
      }
    }

    // Optional material callback
    if (this.options.onMaterial) {
      this.options.onMaterial(material);
    }
  }

  private optimizeMesh(mesh: THREE.Mesh) {
    if (!mesh) return;

    // Optimize geometry
    if (mesh.geometry) {
      mesh.geometry.computeBoundingSphere();
      
      if (!this.options.preserveIndices) {
        // Only remove indices if it won't affect the geometry
        const geometry = mesh.geometry;
        if (geometry.index && geometry.attributes.position) {
          if (geometry.index.count === geometry.attributes.position.count) {
            geometry.setIndex(null);
          }
        }
      }
      
      // Disable frustum culling for static objects
      mesh.frustumCulled = false;
    }

    // Optimize materials
    const materials = Array.isArray(mesh.material) ? 
      mesh.material : [mesh.material];
    
    materials.forEach(material => {
      this.optimizeMaterial(material);
      
      // Optimize textures in material
      if (material) {
        Object.entries(material).forEach(([_, value]) => {
          if (value instanceof THREE.Texture) {
            this.optimizeTexture(value);
          }
        });
      }
    });

    // Disable shadows if not needed
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    // Optional mesh callback
    if (this.options.onMesh) {
      this.options.onMesh(mesh);
    }
  }

  private async optimizeScene(gltf: GLTF): Promise<void> {
    // Skip animations if requested
    if (this.options.skipAnimations) {
      gltf.animations = [];
    }

    // Traverse and optimize all meshes
    gltf.scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        this.optimizeMesh(node as THREE.Mesh);
      }
    });

    // Dispose of source data if requested
    if (this.options.disposeSourceData && gltf.parser) {
      // Clean up parser data
      if ((gltf.parser as any).json) {
        delete (gltf.parser as any).json.accessors;
        delete (gltf.parser as any).json.meshes;
      }
    }
  }

  public async loadAsync(url: string): Promise<GLTF> {
    try {
      const gltf = await this.loader.loadAsync(url);
      await this.optimizeScene(gltf);
      return gltf;
    } catch (error) {
      console.error('Error loading GLTF:', error);
      throw error;
    }
  }

  public load(
    url: string,
    onLoad?: (gltf: GLTF) => void,
    onProgress?: (event: ProgressEvent<EventTarget>) => void,
    onError?: (error: ErrorEvent) => void
  ): void {
    this.loader.load(
      url,
      async (gltf) => {
        try {
          await this.optimizeScene(gltf);
          if (onLoad) onLoad(gltf);
        } catch (error) {
          if (onError) onError(error as ErrorEvent);
        }
      },
      onProgress,
      onError as any
    );
  }

  public dispose(): void {
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
    }
  }
}

export { OptimizedGLTFLoader, type OptimizationOptions };
