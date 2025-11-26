// Map class - 3D map rendering with Three.js
class GameMap {
    constructor(scene, mapName) {
        this.scene = scene;
        this.mapName = mapName || 'sandbox';
        this.config = CONFIG.MAPS[this.mapName] || CONFIG.MAPS.sandbox;
        this.obstacles = [];
        this.healthPacks = [];
        this.flags = {};
        this.createMap();
    }

    createMap() {
        const groundGeom = new THREE.PlaneGeometry(this.config.width, this.config.height);
        const groundMat = new THREE.MeshLambertMaterial({ color: this.config.groundColor });
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        const gridHelper = new THREE.GridHelper(this.config.width, 20, 0x444444, 0x333333);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
        this.createWalls();
        this.createObstacles();
    }

    createWalls() {
        const wallHeight = 5;
        const wallMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const halfW = this.config.width / 2;
        const halfH = this.config.height / 2;
        const northGeom = new THREE.BoxGeometry(this.config.width, wallHeight, 2);
        const north = new THREE.Mesh(northGeom, wallMat);
        north.position.set(0, wallHeight / 2, -halfH - 1);
        this.scene.add(north);
        const south = new THREE.Mesh(northGeom, wallMat);
        south.position.set(0, wallHeight / 2, halfH + 1);
        this.scene.add(south);
        const eastGeom = new THREE.BoxGeometry(2, wallHeight, this.config.height);
        const east = new THREE.Mesh(eastGeom, wallMat);
        east.position.set(halfW + 1, wallHeight / 2, 0);
        this.scene.add(east);
        const west = new THREE.Mesh(eastGeom, wallMat);
        west.position.set(-halfW - 1, wallHeight / 2, 0);
        this.scene.add(west);
    }

    createObstacles() {
        const obstacleMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const obstacles = this.getMapObstacles();
        obstacles.forEach(obs => {
            const geom = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
            const mesh = new THREE.Mesh(geom, obstacleMat);
            mesh.position.set(obs.x, obs.height / 2, obs.z);
            mesh.castShadow = true;
            this.scene.add(mesh);
            this.obstacles.push(mesh);
        });
    }

    getMapObstacles() {
        const obstacles = {
            sandbox: [
                { x: 0, z: 0, width: 8, height: 4, depth: 8 },
                { x: -20, z: -20, width: 6, height: 3, depth: 6 },
                { x: 20, z: -20, width: 6, height: 3, depth: 6 },
                { x: -20, z: 20, width: 6, height: 3, depth: 6 },
                { x: 20, z: 20, width: 6, height: 3, depth: 6 }
            ],
            silence: [
                { x: -25, z: -15, width: 10, height: 8, depth: 10 },
                { x: 25, z: -15, width: 10, height: 8, depth: 10 },
                { x: 0, z: 0, width: 12, height: 10, depth: 12 }
            ],
            kungur: [
                { x: -20, z: 0, width: 12, height: 3, depth: 8 },
                { x: 20, z: 0, width: 12, height: 3, depth: 8 },
                { x: 0, z: -20, width: 15, height: 5, depth: 15 }
            ]
        };
        return obstacles[this.mapName] || obstacles.sandbox;
    }

    createHealthPack(x, z, id) {
        const group = new THREE.Group();
        const box = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
        group.add(box);
        group.position.set(x, 0.5, z);
        group.userData.id = id;
        this.scene.add(group);
        this.healthPacks.push(group);
        return group;
    }

    createFlag(x, z, team) {
        const group = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 8), new THREE.MeshLambertMaterial({ color: 0x888888 }));
        pole.position.y = 2;
        group.add(pole);
        const flagColor = team === 'red' ? 0xff0000 : 0x0000ff;
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.5), new THREE.MeshLambertMaterial({ color: flagColor, side: THREE.DoubleSide }));
        flag.position.set(1, 3.2, 0);
        group.add(flag);
        group.position.set(x, 0, z);
        this.scene.add(group);
        this.flags[team] = group;
        return group;
    }

    updateHealthPacks(data) {
        data.forEach(hp => {
            let pack = this.healthPacks.find(p => p.userData.id === hp.id);
            if (!pack && hp.active) pack = this.createHealthPack(hp.x, hp.z, hp.id);
            if (pack) { pack.visible = hp.active; pack.rotation.y += 0.02; }
        });
    }

    updateFlags(data) {
        ['red', 'blue'].forEach(team => {
            if (data[team]) {
                if (!this.flags[team]) this.createFlag(data[team].x, data[team].z, team);
                this.flags[team].position.set(data[team].x, 0, data[team].z);
                this.flags[team].visible = !data[team].carrier;
            }
        });
    }
}
window.GameMap = GameMap;
