// Effects class - Particle and visual effects
class Effects {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.explosions = [];
        this.streams = [];
    }

    createExplosion(x, y, z, color, size) {
        const particleCount = 20;
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            const geom = new THREE.SphereGeometry(0.2 * size, 6, 6);
            const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 });
            const particle = new THREE.Mesh(geom, mat);
            particle.position.set(x, y, z);
            particle.velocity = new THREE.Vector3((Math.random() - 0.5) * 10, Math.random() * 8, (Math.random() - 0.5) * 10);
            particle.life = 1.0;
            this.scene.add(particle);
            particles.push(particle);
        }
        this.explosions.push({ particles, time: 0 });
    }

    createMuzzleFlash(x, y, z, rotation, color) {
        const flashGeom = new THREE.SphereGeometry(0.5, 8, 8);
        const flashMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
        const flash = new THREE.Mesh(flashGeom, flashMat);
        flash.position.set(x, y, z);
        flash.life = 0.1;
        this.scene.add(flash);
        this.particles.push(flash);
    }

    createStream(startX, startY, startZ, endX, endY, endZ, color) {
        const points = [new THREE.Vector3(startX, startY, startZ), new THREE.Vector3(endX, endY, endZ)];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
        const line = new THREE.Line(geometry, material);
        line.life = 0.05;
        this.scene.add(line);
        this.streams.push(line);
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime;
            if (p.velocity) {
                p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
                p.velocity.y -= 15 * deltaTime;
            }
            if (p.material) p.material.opacity = p.life;
            if (p.life <= 0) { this.scene.remove(p); this.particles.splice(i, 1); }
        }
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            let allDead = true;
            exp.particles.forEach(p => {
                p.life -= deltaTime * 1.5;
                p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
                p.velocity.y -= 10 * deltaTime;
                p.material.opacity = Math.max(0, p.life);
                if (p.life > 0) allDead = false;
            });
            if (allDead) { exp.particles.forEach(p => this.scene.remove(p)); this.explosions.splice(i, 1); }
        }
        for (let i = this.streams.length - 1; i >= 0; i--) {
            const s = this.streams[i];
            s.life -= deltaTime;
            if (s.life <= 0) { this.scene.remove(s); this.streams.splice(i, 1); }
        }
    }
}
window.Effects = Effects;