class Scenario {
  /*
   * Description: Testing physics
   * Version: 0.1
   */
  constructor(ctx) {
    console.log('constructor', ctx);
    this.$ = ctx.scope;
    this.THREE = ctx.THREE;
    this.elapsed = 0;

    this.timeOfLastBall = 0;
    this.dropEvery = 0.25; // 4 per second

    this.rigidBodies = [];
    this.tmpTrans = new this.$.ammo.btTransform();
  }

  async setup() {
    const $ = this.$;
    const THREE = this.THREE;
    const Ammo = $.ammo;

    await $.loadVrm(
      // 'https://vrm.heyamica.com/file/amica-vrm/82754e287e0b26b5d7a1fd223ed0fd5debcabed81f36549fb2c16b201f3e5ca9',
      '/vrm/AvatarSample_B.vrm',
      (progress) => {
        console.log(`loading model ${progress}`);
      },
    );

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
      }),
    );
    floor.rotation.x = Math.PI / 2;
    $.scene.add(floor);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 0, 0));

    const motionState = new Ammo.btDefaultMotionState(transform);
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(1, 0.1, 1));
    const mass = 0; // Static object

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        shape,
        new Ammo.btVector3(0, 0, 0)
    );
    const body = new Ammo.btRigidBody(rbInfo);

    $.physicsWorld.addRigidBody(body);
  }

  update(delta) {
    const $ = this.$;
    const Ammo = $.ammo;

    this.elapsed += delta;

    if (this.elapsed - this.timeOfLastBall >= this.dropEvery) {
      this.createBall();
    }

    for (let i = 0; i < this.rigidBodies.length; i++) {
      const objThree = this.rigidBodies[i];
      const objAmmo = objThree.userData.physicsBody;
      const ms = objAmmo.getMotionState();

      if (ms) {
        ms.getWorldTransform(this.tmpTrans);
        const p = this.tmpTrans.getOrigin();
        const q = this.tmpTrans.getRotation();

        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }
  }

  createBall() {
    const $ = this.$;
    const THREE = this.THREE;
    const Ammo = this.$.ammo;

    const radius = 0.1;
    const mass = 1;

    // Three.js geometry
    const geometry = new THREE.SphereGeometry(radius);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(geometry, material);
    $.scene.add(ball);

    // Ammo.js physics
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(-1 + Math.random()*2, 2, -1 + Math.random()*2));

    const motionState = new Ammo.btDefaultMotionState(transform);
    const shape = new Ammo.btSphereShape(radius);
    shape.calculateLocalInertia(mass);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        shape,
        shape.calculateLocalInertia(mass)
    );
    const body = new Ammo.btRigidBody(rbInfo);

    $.physicsWorld.addRigidBody(body);

    // Store reference to mesh and body
    ball.userData.physicsBody = body;
    this.rigidBodies.push(ball);

    this.timeOfLastBall = this.elapsed;
  }
}
