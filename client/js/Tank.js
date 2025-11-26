// Tank class - 3D tank rendering with Three.js
class Tank {
    constructor(scene, data) {
        this.scene = scene;
        this.id = data.id;
        this.name = data.name;
        this.team = data.team;
        this.hull = data.hull || 'viking';
        this.turret = data.turret || 'smoky';
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.z = data.z || 0;
        this.rotation = data.rotation || 0;
        this.turretRotation = data.turretRotation || 0;
        this.hp = data.hp || 200;
        this.maxHp = data.maxHp || 200;
        this.alive = data.alive !== false;
        this.mesh = null;
        this.turretMesh = null;
        this.createMesh();
    }

    createMesh() {
        const hullConfig = CONFIG.HULLS[this.hull];
        const teamColor = this.team !== 'none' ? CONFIG.TEAM_COLORS[this.team] : hullConfig.color;
        this.mesh = new THREE.Group();
        const hullGeom = new THREE.BoxGeometry(hullConfig.width, hullConfig.height, hullConfig.length);
        const hullMat = new THREE.MeshLambertMaterial({ color: teamColor });
        const hullBody = new THREE.Mesh(hullGeom, hullMat);
        hullBody.position.y = hullConfig.height / 2;
        hullBody.castShadow = true;
        this.mesh.add(hullBody);
        const trackGeom = new THREE.BoxGeometry(0.4, hullConfig.height * 0.6, hullConfig.length * 0.95);
        const trackMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const trackLeft = new THREE.Mesh(trackGeom, trackMat);
        trackLeft.position.set(-hullConfig.width / 2 - 0.15, hullConfig.height * 0.3, 0);
        this.mesh.add(trackLeft);
        const trackRight = new THREE.Mesh(trackGeom, trackMat);
        trackRight.position.set(hullConfig.width / 2 + 0.15, hullConfig.height * 0.3, 0);
        this.mesh.add(trackRight);
        this.turretMesh = new THREE.Group();
        const turretBaseGeom = new THREE.CylinderGeometry(hullConfig.width * 0.35, hullConfig.width * 0.4, 0.4, 16);
        const turretBase = new THREE.Mesh(turretBaseGeom, new THREE.MeshLambertMaterial({ color: teamColor }));
        turretBase.position.y = 0.2;
        this.turretMesh.add(turretBase);
        const barrelGeom = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 12);
        const barrel = new THREE.Mesh(barrelGeom, new THREE.MeshLambertMaterial({ color: 0x555555 }));
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.4, 1.25);
        this.turretMesh.add(barrel);
        this.turretMesh.position.y = hullConfig.height;
        this.mesh.add(this.turretMesh);
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        this.scene.add(this.mesh);
    }

    update(data, deltaTime) {
        const lerpFactor = Math.min(1, deltaTime * 10);
        this.x += (data.x - this.x) * lerpFactor;
        this.z += (data.z - this.z) * lerpFactor;
        let rotDiff = data.rotation - this.rotation;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        this.rotation += rotDiff * lerpFactor;
        this.turretRotation = data.turretRotation;
        this.hp = data.hp;
        this.alive = data.alive;
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        this.turretMesh.rotation.y = this.turretRotation - this.rotation;
        this.mesh.visible = this.alive;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}
window.Tank = Tank;