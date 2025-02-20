import { VRM } from "@pixiv/three-vrm";

const pi = Math.PI;
const sin = Math.sin;
const cos = Math.cos;

export class ProceduralAnimation {
  private vrm: VRM;
  private elapsedTime: number = 0;

  constructor(vrm: VRM) {
    this.vrm = vrm;
  }

  public update(delta: number) {
    this.elapsedTime += delta;

    if (!this.vrm?.humanoid) return;

    const humanoid = this.vrm.humanoid;

    humanoid.getNormalizedBoneNode("spine")!.rotation.x =
      -0.2 - 0.04 * pi * sin(this.elapsedTime);

    humanoid.getNormalizedBoneNode("neck")!.rotation.x =
      -0.02 * pi * sin(this.elapsedTime);

    humanoid.getNormalizedBoneNode("leftUpperArm")!.rotation.z = 1.3;
    humanoid.getNormalizedBoneNode("rightUpperArm")!.rotation.z = -1.3;

    humanoid.getNormalizedBoneNode("leftUpperLeg")!.rotation.z =
      -0.4 - 0.01 * pi * sin(this.elapsedTime);
    humanoid.getNormalizedBoneNode("rightUpperLeg")!.rotation.z =
      0.4 + 0.01 * pi * sin(this.elapsedTime);

    humanoid.getNormalizedBoneNode("leftLowerLeg")!.rotation.x =
      -1.9 + 0.01 * pi * sin(this.elapsedTime);
    humanoid.getNormalizedBoneNode("rightLowerLeg")!.rotation.x =
      -1.1 + 0.01 * pi * sin(this.elapsedTime);
    // humanoid!.getNormalizedBoneNode('neck')!.rotation.y = 0.101 * pi * sin(pi * this.elapsedTime);
    // humanoid!.getNormalizedBoneNode( 'leftUpperArm' )!.rotation.z = s;
    // humanoid!.getNormalizedBoneNode( 'rightUpperArm' )!.rotation.x = s;
  }
}
