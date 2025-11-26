// Projectile class - 3D projectile rendering
class Projectile {
    constructor(scene, data) {
        this.scene = scene;
        this.id = data.id;
        this.x = data.x;
        this.y = data.y || 1.5;
        this.z = data.z;
        this.vx = data.vx;
        this.vz = data.vz;
        this.rotation = data.rotation;
        this.turret = data.turret;
        this.type = data.type;
        this.mesh = null;
        this.createMesh();
    }

    createMesh() {
        const turretConfig = CONFIG.TURRETS[this.turret];
        const color = turretConfig ? turretConfig.color : 0xffaa00;
        if (this.type === 'instant') {
            const beamGeom = new THREE.CylinderGeometry(0.1, 0.1, 100, 8);
            const beamMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
            this.mesh = new THREE.Mesh(beamGeom, beamMat);
            this.mesh.rotation.x = Math.PI / 2;
            this.mesh.position.set(this.x, this.y, this.z + 50);
        } else {
            const projGeom = new THREE.SphereGeometry(0.2, 8, 8);
            const projMat = new THREE.MeshBasicMaterial({ color: color });
            this.mesh = new THREE.Mesh(projGeom, projMat);
            this.mesh.position.set(this.x, this.y, this.z);
        }
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (this.type === 'instant') {
            if (this.mesh.material.opacity > 0) this.mesh.material.opacity -= deltaTime * 3;
            return this.mesh.material.opacity > 0;
        }
        this.x += this.vx * deltaTime;
        this.z += this.vz * deltaTime;
        this.mesh.position.set(this.x, this.y, this.z);
        return true;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}
window.Projectile = Projectile;
