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
      // 'https://vrm.heyamica.com/file/amica-vrm/e8fc9e2a72e9336dde3635cbdebd0867c4640b72b519dcc5066ba348daac8af5',
      // '/room/low_poly_winter_scene.glb',
      // new THREE.Vector3(0, 0.2, -2),
      // new THREE.Euler(0, 0, 0),
      // new THREE.Vector3(0.016, 0.016, 0.016),
      // new THREE.Vector3(1, 0, -0.5),
      // new THREE.Euler(0, 0, 0),
      // new THREE.Vector3(1, 1, 1),
      // cafe
      // 'https://vrm.heyamica.com/file/amica-vrm/891c084b0831e6c3f1035411ff285aa21b872ce0d29a5986d02907c97d27258a',
      // new THREE.Vector3(-1, 0, 1),
      // new THREE.Euler(0, 0, 0),
      // new THREE.Vector3(1, 1, 1),
      // bathroom
      'https://vrm.heyamica.com/file/amica-vrm/3b718af7c9111e0953a161e10fe8867320b17b4bad04759bcf1d3456c6ea7023',
      new THREE.Vector3(1.4, -4.75, 1.15),
      new THREE.Euler(0, 0, 0),
      new THREE.Vector3(0.275, 0.275, 0.275),
      (progress) => {
        console.log(`loading room ${progress}`);
      }
    );
  }

  update(delta) {
    console.log('update', this.x);
  }
}
