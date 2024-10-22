import * as THREE from "three";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface Dimensions {
  width: number;
  height: number;
}

interface TextureSource {
  data: TexImageSource;
  width: number;
  height: number;
}

// Type for supported texture types in materials
type TextureType = 
  | 'map' 
  | 'normalMap' 
  | 'roughnessMap' 
  | 'metalnessMap'
  | 'aoMap' 
  | 'emissiveMap' 
  | 'displacementMap'
  | 'bumpMap'
  | 'alphaMap'
  | 'lightMap'
  | 'clearcoatMap'
  | 'clearcoatNormalMap'
  | 'clearcoatRoughnessMap'
  | 'sheenColorMap'
  | 'sheenRoughnessMap'
  | 'transmissionMap'
  | 'thicknessMap'
  | 'specularIntensityMap'
  | 'specularColorMap'
  | 'iridescenceMap'
  | 'iridescenceThicknessMap';

// Create an off-screen canvas for image processing
function createOffscreenCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// Scale down an image to new dimensions
function scaleImage(image: TexImageSource, newWidth: number, newHeight: number): Promise<ImageBitmap | HTMLCanvasElement> {
  const canvas = createOffscreenCanvas(newWidth, newHeight);
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

  if (!ctx) {
    throw new Error('Failed to create 2D context');
  }
  
  // Use better quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw the image scaled down
  (ctx as any).drawImage(image, 0, 0, newWidth, newHeight);
  
  // Return as ImageBitmap if supported, otherwise return canvas
  if (typeof createImageBitmap !== 'undefined') {
    return createImageBitmap(canvas);
  }

  // return canvas as HTMLCanvasElement;
  return canvas as any;
}

// Calculate new dimensions maintaining aspect ratio
function calculateNewDimensions(width: number, height: number, maxDimension: number): Dimensions {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  
  const aspectRatio = width / height;
  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio)
    };
  }
  return {
    width: Math.round(maxDimension * aspectRatio),
    height: maxDimension
  };
}

async function processTexture(
  texture: THREE.Texture,
  maxDimension: number
): Promise<void> {
  if (!texture.image || !texture.image.width || !texture.image.height) {
    return;
  }

  const { width, height } = texture.image;
  const newDims = calculateNewDimensions(width, height, maxDimension);

  // Only scale if dimensions need to change and are actually smaller
  if (newDims.width < width || newDims.height < height) {
    try {
      const scaledImage = await scaleImage(
        texture.image,
        newDims.width,
        newDims.height
      );

      texture.image = scaledImage as TexImageSource;
      (texture.source as unknown as TextureSource).data = scaledImage as TexImageSource;
      (texture.source as unknown as TextureSource).width = newDims.width;
      (texture.source as unknown as TextureSource).height = newDims.height;
      texture.needsUpdate = true;

      // Force mipmaps update
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
    } catch (error) {
      console.error('Failed to scale texture:', error);
      throw error;
    }
  }
}



// Main function to downscale textures in a GLTF model
async function downscaleModelTextures(gltf: any, maxDimension: number = 1024): Promise<any> {
  const texturePromises: Promise<void>[] = [];
  const processedTextures = new Set<THREE.Texture>();


  gltf.scene.traverse((node: THREE.Object3D) => {
    if (!(node as THREE.Mesh).isMesh) return;

    if (node instanceof THREE.Mesh) {
      const mesh = node as THREE.Mesh;
      const materials = Array.isArray(node.material) 
        ? node.material 
        : [node.material];

      materials.forEach((material: THREE.Material) => {
        if (! material) return;

        const textureTypes: TextureType[] = [
          'map', 'normalMap', 'roughnessMap', 'metalnessMap',
          'aoMap', 'emissiveMap', 'displacementMap', 'bumpMap',
          'alphaMap', 'lightMap', 'clearcoatMap', 'clearcoatNormalMap',
          'clearcoatRoughnessMap', 'sheenColorMap', 'sheenRoughnessMap',
          'transmissionMap', 'thicknessMap', 'specularIntensityMap',
          'specularColorMap', 'iridescenceMap', 'iridescenceThicknessMap'
        ];


        textureTypes.forEach((type: TextureType) => {
          const texture = (material as any)[type] as THREE.Texture | undefined;
          if (texture && !processedTextures.has(texture)) {
            processedTextures.add(texture);
            texturePromises.push(processTexture(texture, maxDimension));
          }
        });
      });
    }
  });

  // Wait for all texture processing to complete
  await Promise.all(texturePromises);

  return gltf;
}

function logTextureInfo(gltf: GLTF): void {
  gltf.scene.traverse((node: THREE.Object3D) => {
    if (!(node as THREE.Mesh).isMesh) return;

    const mesh = node as THREE.Mesh;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    materials.forEach((material: THREE.Material, index: number) => {
      console.group(`Material ${index} on mesh "${node.name}"`);
      Object.entries(material).forEach(([key, value]) => {
        if (value instanceof THREE.Texture && value.image) {
          console.log(`${key}: ${value.image.width}x${value.image.height}`);
        }
      });
      console.groupEnd();
    });
  });
}

export {
  downscaleModelTextures,
  logTextureInfo,
  type Dimensions,
  type TextureType
};
