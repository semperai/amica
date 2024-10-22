class Scenario {
  constructor($) {
    console.log('constructor', $);
    this.$ = $;
  }

  async setup() {
    const $ = this.$;
    console.log('setup complete', $.scope._scene);
    this.x = new $.THREE.Vector3(1, 2, 3);

    await $.scope.loadVrm(
      // 'https://vrm.heyamica.com/file/amica-vrm/82754e287e0b26b5d7a1fd223ed0fd5debcabed81f36549fb2c16b201f3e5ca9',
      '/vrm/AvatarSample_B.vrm',
      (progress) => {
        console.log(`loading model ${progress}`);
      },
    );

    await $.scope.loadRoom(
      // 'https://vrm.heyamica.com/file/amica-vrm/8d8254f0170994eb26f31b62feecdad79d19bbb1bfbbd7e477acda418921099d',
      '/room/low_poly_winter_scene.glb',
      new $.THREE.Vector3(1, 0, -0.5),
      new $.THREE.Euler(0, 0, 0),
      new $.THREE.Vector3(1, 1, 1),
      (progress) => {
        console.log(`loading room ${progress}`);
      }
    );
  }

  update(delta) {
    const $ = this.$;
    console.log('update', this.x);
  }
}
