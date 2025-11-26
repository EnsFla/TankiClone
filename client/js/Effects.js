// Effects class - Particle and visual effects
class Effects {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.explosions = [];
        this.streams = [];
        this.dustParticles = [];
        this.trailParticles = [];
    }

    createExplosion(x, y, z, color, size) {
        // Fire particles
        const fireCount = 30;
        const fireParticles = [];
        for (let i = 0; i < fireCount; i++) {
            const geomSize = (0.15 + Math.random() * 0.2) * size;
            const geom = new THREE.SphereGeometry(geomSize, 8, 8);
            const fireColor = new THREE.Color(color);
            // Vary the color slightly
            fireColor.offsetHSL(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.2 - 0.1);
            const mat = new THREE.MeshBasicMaterial({ 
                color: fireColor, 
                transparent: true, 
                opacity: 1 
            });
            const particle = new THREE.Mesh(geom, mat);
            particle.position.set(x, y, z);
            const speed = 8 + Math.random() * 8;
            const angle = Math.random() * Math.PI * 2;
            const upward = 3 + Math.random() * 6;
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                upward,
                Math.sin(angle) * speed
            );
            particle.life = 0.6 + Math.random() * 0.4;
            particle.maxLife = particle.life;
            this.scene.add(particle);
            fireParticles.push(particle);
        }
        
        // Smoke particles (darker, slower)
        for (let i = 0; i < 15; i++) {
            const geom = new THREE.SphereGeometry(0.3 * size + Math.random() * 0.3, 8, 8);
            const smokeColor = 0x333333 + Math.floor(Math.random() * 0x222222);
            const mat = new THREE.MeshBasicMaterial({ 
                color: smokeColor, 
                transparent: true, 
                opacity: 0.7 
            });
            const smoke = new THREE.Mesh(geom, mat);
            smoke.position.set(x + (Math.random() - 0.5) * 2, y, z + (Math.random() - 0.5) * 2);
            smoke.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                2 + Math.random() * 3,
                (Math.random() - 0.5) * 3
            );
            smoke.life = 1.0 + Math.random() * 0.5;
            smoke.maxLife = smoke.life;
            smoke.isSmoke = true;
            this.scene.add(smoke);
            fireParticles.push(smoke);
        }
        
        // Ground debris
        for (let i = 0; i < 10; i++) {
            const debrisSize = 0.1 + Math.random() * 0.15;
            const geom = new THREE.BoxGeometry(debrisSize, debrisSize, debrisSize);
            const mat = new THREE.MeshPhongMaterial({ color: 0x555544 });
            const debris = new THREE.Mesh(geom, mat);
            debris.position.set(x, y, z);
            debris.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 12,
                5 + Math.random() * 8,
                (Math.random() - 0.5) * 12
            );
            debris.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            debris.angularVelocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            debris.life = 1.5;
            debris.castShadow = true;
            this.scene.add(debris);
            fireParticles.push(debris);
        }
        
        this.explosions.push({ particles: fireParticles, time: 0 });
        
        // Flash effect
        this.createFlash(x, y + 0.5, z, color, size * 3);
    }
    
    createFlash(x, y, z, color, size) {
        const flashGeom = new THREE.SphereGeometry(size, 16, 16);
        const flashMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffaa, 
            transparent: true, 
            opacity: 0.8 
        });
        const flash = new THREE.Mesh(flashGeom, flashMat);
        flash.position.set(x, y, z);
        flash.life = 0.15;
        flash.isFlash = true;
        this.scene.add(flash);
        this.particles.push(flash);
    }

    createMuzzleFlash(x, y, z, rotation, color) {
        // Main flash
        const flashGeom = new THREE.SphereGeometry(0.6, 12, 12);
        const flashMat = new THREE.MeshBasicMaterial({ 
            color: 0xffff88, 
            transparent: true, 
            opacity: 0.9 
        });
        const flash = new THREE.Mesh(flashGeom, flashMat);
        flash.position.set(x, y, z);
        flash.life = 0.08;
        this.scene.add(flash);
        this.particles.push(flash);
        
        // Muzzle smoke
        for (let i = 0; i < 5; i++) {
            const smokeGeom = new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 8, 8);
            const smokeMat = new THREE.MeshBasicMaterial({ 
                color: 0x888888, 
                transparent: true, 
                opacity: 0.5 
            });
            const smoke = new THREE.Mesh(smokeGeom, smokeMat);
            smoke.position.set(
                x + Math.sin(rotation) * (0.3 + i * 0.2),
                y + 0.2 + Math.random() * 0.3,
                z + Math.cos(rotation) * (0.3 + i * 0.2)
            );
            smoke.velocity = new THREE.Vector3(
                Math.sin(rotation) * 2 + (Math.random() - 0.5),
                1 + Math.random(),
                Math.cos(rotation) * 2 + (Math.random() - 0.5)
            );
            smoke.life = 0.5 + Math.random() * 0.3;
            smoke.maxLife = smoke.life;
            this.scene.add(smoke);
            this.particles.push(smoke);
        }
        
        // Sparks
        for (let i = 0; i < 8; i++) {
            const sparkGeom = new THREE.SphereGeometry(0.05, 4, 4);
            const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
            const spark = new THREE.Mesh(sparkGeom, sparkMat);
            spark.position.set(x, y, z);
            const spreadAngle = rotation + (Math.random() - 0.5) * 0.8;
            spark.velocity = new THREE.Vector3(
                Math.sin(spreadAngle) * (8 + Math.random() * 5),
                Math.random() * 3,
                Math.cos(spreadAngle) * (8 + Math.random() * 5)
            );
            spark.life = 0.2 + Math.random() * 0.2;
            this.scene.add(spark);
            this.particles.push(spark);
        }
    }
    
    createDustCloud(x, z, intensity) {
        for (let i = 0; i < Math.ceil(intensity * 3); i++) {
            const dustGeom = new THREE.SphereGeometry(0.2 + Math.random() * 0.2, 6, 6);
            const dustMat = new THREE.MeshBasicMaterial({ 
                color: 0x8b7355, 
                transparent: true, 
                opacity: 0.4 
            });
            const dust = new THREE.Mesh(dustGeom, dustMat);
            dust.position.set(
                x + (Math.random() - 0.5) * 2,
                0.2,
                z + (Math.random() - 0.5) * 2
            );
            dust.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0.5 + Math.random(),
                (Math.random() - 0.5) * 2
            );
            dust.life = 0.8 + Math.random() * 0.4;
            dust.maxLife = dust.life;
            this.scene.add(dust);
            this.dustParticles.push(dust);
        }
    }

    createStream(startX, startY, startZ, endX, endY, endZ, color) {
        const points = [
            new THREE.Vector3(startX, startY, startZ), 
            new THREE.Vector3(endX, endY, endZ)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.9,
            linewidth: 2
        });
        const line = new THREE.Line(geometry, material);
        line.life = 0.08;
        this.scene.add(line);
        this.streams.push(line);
        
        // Add glow particles along stream
        const dx = endX - startX, dy = endY - startY, dz = endZ - startZ;
        const length = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const steps = Math.max(3, Math.floor(length / 3));
        
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const particleGeom = new THREE.SphereGeometry(0.1, 4, 4);
            const particleMat = new THREE.MeshBasicMaterial({ 
                color: color, 
                transparent: true, 
                opacity: 0.6 
            });
            const particle = new THREE.Mesh(particleGeom, particleMat);
            particle.position.set(
                startX + dx * t + (Math.random() - 0.5) * 0.3,
                startY + dy * t + (Math.random() - 0.5) * 0.3,
                startZ + dz * t + (Math.random() - 0.5) * 0.3
            );
            particle.life = 0.1;
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }
    
    createHitSpark(x, y, z, color) {
        for (let i = 0; i < 10; i++) {
            const sparkGeom = new THREE.SphereGeometry(0.08, 4, 4);
            const sparkMat = new THREE.MeshBasicMaterial({ color: color || 0xffaa00 });
            const spark = new THREE.Mesh(sparkGeom, sparkMat);
            spark.position.set(x, y, z);
            spark.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 5,
                (Math.random() - 0.5) * 8
            );
            spark.life = 0.3 + Math.random() * 0.2;
            this.scene.add(spark);
            this.particles.push(spark);
        }
    }

    update(deltaTime) {
        // Update regular particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime;
            
            if (p.velocity) {
                p.position.addScaledVector(p.velocity, deltaTime);
                p.velocity.y -= 12 * deltaTime;
            }
            
            if (p.isFlash) {
                p.scale.multiplyScalar(1.3);
            }
            
            if (p.material) {
                if (p.maxLife) {
                    p.material.opacity = (p.life / p.maxLife) * 0.8;
                } else {
                    p.material.opacity = Math.max(0, p.life * 2);
                }
            }
            
            if (p.life <= 0) { 
                this.scene.remove(p); 
                this.particles.splice(i, 1); 
            }
        }
        
        // Update explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            let allDead = true;
            
            exp.particles.forEach(p => {
                p.life -= deltaTime;
                
                if (p.velocity) {
                    p.position.addScaledVector(p.velocity, deltaTime);
                    
                    if (p.isSmoke) {
                        p.velocity.y -= 2 * deltaTime;
                        p.velocity.multiplyScalar(0.98);
                        p.scale.multiplyScalar(1 + deltaTime * 0.5);
                    } else if (p.angularVelocity) {
                        // Debris
                        p.velocity.y -= 15 * deltaTime;
                        p.rotation.x += p.angularVelocity.x * deltaTime;
                        p.rotation.y += p.angularVelocity.y * deltaTime;
                        p.rotation.z += p.angularVelocity.z * deltaTime;
                        if (p.position.y < 0.1) {
                            p.position.y = 0.1;
                            p.velocity.y *= -0.3;
                            p.velocity.x *= 0.7;
                            p.velocity.z *= 0.7;
                        }
                    } else {
                        p.velocity.y -= 8 * deltaTime;
                    }
                }
                
                if (p.material && p.maxLife) {
                    p.material.opacity = Math.max(0, p.life / p.maxLife);
                }
                
                if (p.life > 0) allDead = false;
            });
            
            if (allDead) { 
                exp.particles.forEach(p => this.scene.remove(p)); 
                this.explosions.splice(i, 1); 
            }
        }
        
        // Update streams
        for (let i = this.streams.length - 1; i >= 0; i--) {
            const s = this.streams[i];
            s.life -= deltaTime;
            if (s.material) {
                s.material.opacity = s.life * 10;
            }
            if (s.life <= 0) { 
                this.scene.remove(s); 
                this.streams.splice(i, 1); 
            }
        }
        
        // Update dust particles
        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const d = this.dustParticles[i];
            d.life -= deltaTime;
            if (d.velocity) {
                d.position.addScaledVector(d.velocity, deltaTime);
                d.velocity.y -= deltaTime;
                d.velocity.multiplyScalar(0.98);
            }
            d.scale.multiplyScalar(1 + deltaTime * 0.3);
            if (d.material && d.maxLife) {
                d.material.opacity = (d.life / d.maxLife) * 0.4;
            }
            if (d.life <= 0) {
                this.scene.remove(d);
                this.dustParticles.splice(i, 1);
            }
        }
    }
}
window.Effects = Effects;