import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface MaterialStats {
  name: string;
  type: string;
  textureCount: number;
  textures: {
    type: string;
    size: { width: number; height: number };
    format: string;
    generateMipmaps: boolean;
  }[];
}

interface MeshStats {
  name: string;
  vertexCount: number;
  triangleCount: number;
  materialCount: number;
  materials: MaterialStats[];
  drawCalls: number;
  frustumCulled: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
}

interface ModelStats {
  totalMeshes: number;
  totalVertices: number;
  totalTriangles: number;
  totalMaterials: number;
  totalTextures: number;
  totalDrawCalls: number;
  meshes: MeshStats[];
  unusedMaterials: string[];
  unusedTextures: string[];
  performanceIssues: string[];
}

class GLTFAnalyzer {
  public analyzeModel(gltf: GLTF): ModelStats {
    const stats: ModelStats = {
      totalMeshes: 0,
      totalVertices: 0,
      totalTriangles: 0,
      totalMaterials: 0,
      totalTextures: 0,
      totalDrawCalls: 0,
      meshes: [],
      unusedMaterials: [],
      unusedTextures: [],
      performanceIssues: []
    };

    const materialsUsed = new Set<THREE.Material>();
    const texturesUsed = new Set<THREE.Texture>();

    // Analyze each mesh in the model
    gltf.scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        stats.totalMeshes++;

        const meshStats = this.analyzeMesh(mesh, materialsUsed, texturesUsed);
        stats.meshes.push(meshStats);

        stats.totalVertices += meshStats.vertexCount;
        stats.totalTriangles += meshStats.triangleCount;
        stats.totalMaterials += meshStats.materialCount;
        stats.totalDrawCalls += meshStats.drawCalls;
      }
    });

    // Find performance issues
    this.analyzePerformanceIssues(stats);

    return stats;
  }

  private analyzeMesh(
    mesh: THREE.Mesh,
    materialsUsed: Set<THREE.Material>,
    texturesUsed: Set<THREE.Texture>
  ): MeshStats {
    const geometry = mesh.geometry;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    const vertexCount = geometry.attributes.position?.count || 0;
    const triangleCount = geometry.index ? 
      geometry.index.count / 3 : 
      vertexCount / 3;

    const materialStats = materials.map(material => {
      materialsUsed.add(material);
      return this.analyzeMaterial(material, texturesUsed);
    });

    // Calculate draw calls (one per material usually)
    const drawCalls = geometry.groups.length || materials.length;

    return {
      name: mesh.name || 'Unnamed Mesh',
      vertexCount,
      triangleCount,
      materialCount: materials.length,
      materials: materialStats,
      drawCalls,
      frustumCulled: mesh.frustumCulled,
      castShadow: mesh.castShadow,
      receiveShadow: mesh.receiveShadow
    };
  }

  private analyzeMaterial(
    material: THREE.Material,
    texturesUsed: Set<THREE.Texture>
  ): MaterialStats {
    const textures: MaterialStats['textures'] = [];
    let textureCount = 0;

    // Check all possible texture slots
    Object.entries(material).forEach(([key, value]) => {
      if (value instanceof THREE.Texture) {
        texturesUsed.add(value);
        textureCount++;
        textures.push({
          type: key,
          size: {
            width: value.image?.width || 0,
            height: value.image?.height || 0
          },
          format: this.getTextureFormat(value),
          generateMipmaps: value.generateMipmaps
        });
      }
    });

    return {
      name: material.name || 'Unnamed Material',
      type: material.type,
      textureCount,
      textures
    };
  }

  private getTextureFormat(texture: THREE.Texture): string {
    if (texture.format === THREE.RGBAFormat) return 'RGBA';
    if (texture.format === THREE.RGBFormat) return 'RGB';
    if (texture.format === THREE.LuminanceFormat) return 'Luminance';
    return 'Unknown';
  }

  private analyzePerformanceIssues(stats: ModelStats): void {
    const issues = stats.performanceIssues;

    // Check for high draw call count
    if (stats.totalDrawCalls > 100) {
      issues.push(`High draw call count (${stats.totalDrawCalls}). Consider merging meshes or materials.`);
    }

    // Check mesh-specific issues
    stats.meshes.forEach(mesh => {
      // Check for large textures
      mesh.materials.forEach(material => {
        material.textures.forEach(texture => {
          if (texture.size.width > 2048 || texture.size.height > 2048) {
            issues.push(`Large texture (${texture.size.width}x${texture.size.height}) in material ${material.name}. Consider downscaling.`);
          }
          if (texture.generateMipmaps) {
            issues.push(`Mipmaps enabled for ${material.name}. Disable if not needed for performance.`);
          }
        });
      });

      // Check for multiple materials
      if (mesh.materialCount > 1) {
        issues.push(`Mesh "${mesh.name}" uses multiple materials (${mesh.materialCount}). Consider combining materials.`);
      }

      // Check for unnecessary shadow casting
      if (mesh.castShadow || mesh.receiveShadow) {
        issues.push(`Mesh "${mesh.name}" has shadows enabled. Disable if not needed.`);
      }
    });
  }

  public suggestOptimizations(stats: ModelStats): string[] {
    const suggestions: string[] = [];

    if (stats.totalDrawCalls > 100) {
      suggestions.push(`
• Reduce Draw Calls:
  - Merge similar meshes using THREE.BufferGeometryUtils.mergeBufferGeometries
  - Combine materials using texture atlasing
  - Current: ${stats.totalDrawCalls} draw calls`);
    }

    let hasLargeTextures = false;
    let hasMipmaps = false;
    stats.meshes.forEach(mesh => {
      mesh.materials.forEach(material => {
        material.textures.forEach(texture => {
          if (texture.size.width > 2048 || texture.size.height > 2048) {
            hasLargeTextures = true;
          }
          if (texture.generateMipmaps) {
            hasMipmaps = true;
          }
        });
      });
    });

    if (hasLargeTextures) {
      suggestions.push(`
• Optimize Textures:
  - Downscale large textures to 1024x1024 or smaller
  - Use texture compression (DXT/ETC)
  - Consider using normal map compression
  - Remove unused texture channels`);
    }

    if (hasMipmaps) {
      suggestions.push(`
• Disable Unnecessary Mipmaps:
  - Set generateMipmaps: false for textures that don't need them
  - Use LINEAR filtering instead of MIPMAP filtering where possible`);
    }

    // Check material complexity
    if (stats.totalMaterials > stats.totalMeshes) {
      suggestions.push(`
• Reduce Material Count:
  - Combine similar materials
  - Use texture atlasing
  - Current: ${stats.totalMaterials} materials for ${stats.totalMeshes} meshes`);
    }

    // Add general optimization suggestions
    suggestions.push(`
• General Optimizations:
  - Disable shadows where not needed
  - Set frustumCulled = true for off-screen meshes
  - Use InstancedMesh for repeated geometries
  - Consider using LOD (Level of Detail)`);

    return suggestions;
  }
}

export { GLTFAnalyzer, type ModelStats, type MeshStats, type MaterialStats };
