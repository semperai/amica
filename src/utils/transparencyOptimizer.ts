import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface TransparencyStats {
  meshName: string;
  materialName: string;
  transparencyType: 'transparent' | 'alphaTest' | 'none';
  alphaValue: number;
  textureAlpha: boolean;
  blendMode: string;
  renderOrder: number;
}

class TransparencyOptimizer {
  private stats: TransparencyStats[] = [];

  public analyzeTransparency(gltf: GLTF): TransparencyStats[] {
    this.stats = [];

    gltf.scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        materials.forEach((material) => {
          this.analyzeMaterialTransparency(mesh.name, material);
        });
      }
    });

    return this.stats;
  }

  private analyzeMaterialTransparency(meshName: string, material: THREE.Material): void {
    let transparencyType: 'transparent' | 'alphaTest' | 'none' = 'none';
    let alphaValue = 1;
    let textureAlpha = false;
    let blendMode = 'normal';

    if (material instanceof THREE.MeshBasicMaterial || 
        material instanceof THREE.MeshStandardMaterial || 
        material instanceof THREE.MeshPhysicalMaterial) {
      
      // Check for transparency settings
      if (material.transparent) {
        transparencyType = 'transparent';
        alphaValue = material.opacity;
      } else if (material.alphaTest > 0) {
        transparencyType = 'alphaTest';
        alphaValue = material.alphaTest;
      }

      // Check for alpha textures
      if (material.map?.format === THREE.RGBAFormat) {
        textureAlpha = true;
      }
      if (material.alphaMap) {
        textureAlpha = true;
      }

      // Get blend mode
      blendMode = material.blending === THREE.NormalBlending ? 'normal' :
                  material.blending === THREE.AdditiveBlending ? 'additive' :
                  material.blending === THREE.MultiplyBlending ? 'multiply' : 'custom';
    }

    this.stats.push({
      meshName,
      materialName: material.name || 'Unnamed Material',
      transparencyType,
      alphaValue,
      textureAlpha,
      blendMode,
      renderOrder: (material as any).renderOrder || 0
    });
  }

  public optimizeTransparency(gltf: GLTF, options: {
    disableTransparency?: boolean;
    minAlphaThreshold?: number;
    convertToAlphaTest?: boolean;
    alphaTestThreshold?: number;
  } = {}): void {
    const {
      disableTransparency = false,
      minAlphaThreshold = 0.9,
      convertToAlphaTest = true,
      alphaTestThreshold = 0.5
    } = options;

    gltf.scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        materials.forEach((material) => {
          if (material instanceof THREE.MeshBasicMaterial || 
              material instanceof THREE.MeshStandardMaterial || 
              material instanceof THREE.MeshPhysicalMaterial) {

            // Handle fully opaque materials with transparency enabled
            if (material.transparent && material.opacity >= minAlphaThreshold) {
              material.transparent = false;
              material.needsUpdate = true;
            }

            // Convert transparent materials to alphaTest if possible
            if (convertToAlphaTest && material.transparent && !material.alphaTest) {
              material.transparent = false;
              material.alphaTest = alphaTestThreshold;
              material.needsUpdate = true;
            }

            // Force disable transparency if requested
            if (disableTransparency) {
              material.transparent = false;
              material.opacity = 1;
              material.alphaTest = 0;
              material.needsUpdate = true;
            }
          }
        });
      }
    });
  }

  public logTransparencyIssues(): string[] {
    const issues: string[] = [];

    // Check for performance issues with transparency
    this.stats.forEach(stat => {
      if (stat.transparencyType === 'transparent') {
        issues.push(`Mesh "${stat.meshName}" uses full transparency which may impact performance.`);
        
        if (stat.alphaValue >= 0.9) {
          issues.push(`  - Material "${stat.materialName}" is nearly opaque (${stat.alphaValue}). Consider disabling transparency.`);
        }

        if (stat.blendMode !== 'normal') {
          issues.push(`  - Uses custom blend mode "${stat.blendMode}" which may be expensive.`);
        }
      }

      if (stat.textureAlpha) {
        issues.push(`  - Uses alpha texture which may require special handling for proper sorting.`);
      }
    });

    // Check for sorting issues
    const transparentMaterials = this.stats.filter(s => s.transparencyType === 'transparent');
    if (transparentMaterials.length > 1) {
      issues.push(`Multiple transparent materials found (${transparentMaterials.length}). May cause sorting issues.`);
    }

    return issues;
  }
}

// Helper function to quickly check and optimize transparency
export async function checkAndOptimizeTransparency(gltf: GLTF, autoFix: boolean = false): Promise<void> {
  const optimizer = new TransparencyOptimizer();
  
  // Analyze current transparency usage
  const stats = optimizer.analyzeTransparency(gltf);
  
  // Log transparency information
  console.group('Transparency Analysis');
  console.log('Transparent materials found:', stats.filter(s => s.transparencyType === 'transparent').length);
  console.log('AlphaTest materials found:', stats.filter(s => s.transparencyType === 'alphaTest').length);
  
  // Log any issues
  const issues = optimizer.logTransparencyIssues();
  if (issues.length > 0) {
    console.log('\nPotential Issues:');
    issues.forEach(issue => console.log(issue));
  }
  
  // Auto-fix if requested
  if (autoFix) {
    optimizer.optimizeTransparency(gltf, {
      disableTransparency: false,
      minAlphaThreshold: 0.9,
      convertToAlphaTest: true,
      alphaTestThreshold: 0.5
    });
    console.log('\nOptimizations applied automatically.');
  }
  
  console.groupEnd();
}

export { TransparencyOptimizer, type TransparencyStats };
