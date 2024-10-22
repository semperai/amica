class Scenario {
  /*
   * Description: Test scenario for the Amica VRM viewer.
   * Version: 0.1
   */
  constructor(ctx) {
    console.log('constructor', ctx);
    this.$ = ctx.scope;
    this.THREE = ctx.THREE;
  }

  async setup() {
    const $ = this.$;
    const THREE = this.THREE;

    this.x = new THREE.Vector3(1, 2, 3);

    await $.loadVrm(
      // 'https://vrm.heyamica.com/file/amica-vrm/82754e287e0b26b5d7a1fd223ed0fd5debcabed81f36549fb2c16b201f3e5ca9',
      '/vrm/AvatarSample_B.vrm',
      (progress) => {
        console.log(`loading model ${progress}`);
      },
    );

    await $.loadRoom(
      // 'https://vrm.heyamica.com/file/amica-vrm/8d8254f0170994eb26f31b62feecdad79d19bbb1bfbbd7e477acda418921099d',
      '/room/low_poly_winter_scene.glb',
      new THREE.Vector3(1, 0, -0.5),
      new THREE.Euler(0, 0, 0),
      new THREE.Vector3(1, 1, 1),
      (progress) => {
        console.log(`loading room ${progress}`);
      }
    );
  }

  update(delta) {
    console.log('update', this.x);
  }
}
