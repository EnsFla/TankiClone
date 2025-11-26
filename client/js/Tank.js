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
        this.nameSprite = null;
        this.healthBar = null;
        // For smooth interpolation
        this.targetX = this.x;
        this.targetZ = this.z;
        this.targetRotation = this.rotation;
        this.createMesh();
    }

    createMesh() {
        const hullConfig = CONFIG.HULLS[this.hull];
        const turretConfig = CONFIG.TURRETS[this.turret];
        const teamColor = this.team !== 'none' ? CONFIG.TEAM_COLORS[this.team] : hullConfig.color;
        
        this.mesh = new THREE.Group();
        
        // Hull body with better materials
        const hullGeom = new THREE.BoxGeometry(hullConfig.width, hullConfig.height, hullConfig.length);
        const hullMat = new THREE.MeshPhongMaterial({ 
            color: teamColor,
            shininess: 60,
            specular: 0x333333
        });
        const hullBody = new THREE.Mesh(hullGeom, hullMat);
        hullBody.position.y = hullConfig.height / 2 + 0.1;
        hullBody.castShadow = true;
        hullBody.receiveShadow = true;
        this.mesh.add(hullBody);
        
        // Hull top detail
        const hullTopGeom = new THREE.BoxGeometry(hullConfig.width * 0.8, 0.15, hullConfig.length * 0.6);
        const hullTop = new THREE.Mesh(hullTopGeom, new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(teamColor).multiplyScalar(0.7),
            shininess: 40
        }));
        hullTop.position.y = hullConfig.height + 0.15;
        hullTop.castShadow = true;
        this.mesh.add(hullTop);
        
        // Tracks with better detail
        const trackGeom = new THREE.BoxGeometry(0.5, hullConfig.height * 0.7, hullConfig.length * 1.0);
        const trackMat = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            shininess: 10
        });
        const trackLeft = new THREE.Mesh(trackGeom, trackMat);
        trackLeft.position.set(-hullConfig.width / 2 - 0.2, hullConfig.height * 0.35, 0);
        trackLeft.castShadow = true;
        trackLeft.receiveShadow = true;
        this.mesh.add(trackLeft);
        
        const trackRight = new THREE.Mesh(trackGeom, trackMat);
        trackRight.position.set(hullConfig.width / 2 + 0.2, hullConfig.height * 0.35, 0);
        trackRight.castShadow = true;
        trackRight.receiveShadow = true;
        this.mesh.add(trackRight);
        
        // Track wheels (simplified)
        const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
        for (let i = -2; i <= 2; i++) {
            const wheelGeom = new THREE.CylinderGeometry(hullConfig.height * 0.35, hullConfig.height * 0.35, 0.2, 12);
            const wheelL = new THREE.Mesh(wheelGeom, wheelMat);
            wheelL.rotation.z = Math.PI / 2;
            wheelL.position.set(-hullConfig.width / 2 - 0.35, hullConfig.height * 0.35, i * (hullConfig.length / 5));
            this.mesh.add(wheelL);
            
            const wheelR = new THREE.Mesh(wheelGeom, wheelMat);
            wheelR.rotation.z = Math.PI / 2;
            wheelR.position.set(hullConfig.width / 2 + 0.35, hullConfig.height * 0.35, i * (hullConfig.length / 5));
            this.mesh.add(wheelR);
        }
        
        // Turret
        this.turretMesh = new THREE.Group();
        
        // Turret base
        const turretBaseGeom = new THREE.CylinderGeometry(
            hullConfig.width * 0.35, 
            hullConfig.width * 0.4, 
            0.5, 
            20
        );
        const turretMat = new THREE.MeshPhongMaterial({ 
            color: teamColor,
            shininess: 80,
            specular: 0x444444
        });
        const turretBase = new THREE.Mesh(turretBaseGeom, turretMat);
        turretBase.position.y = 0.25;
        turretBase.castShadow = true;
        this.turretMesh.add(turretBase);
        
        // Turret top
        const turretTopGeom = new THREE.SphereGeometry(hullConfig.width * 0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const turretTop = new THREE.Mesh(turretTopGeom, turretMat);
        turretTop.position.y = 0.5;
        turretTop.castShadow = true;
        this.turretMesh.add(turretTop);
        
        // Barrel with muzzle brake
        const barrelGeom = new THREE.CylinderGeometry(0.12, 0.15, 2.8, 12);
        const barrelMat = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            shininess: 100,
            specular: 0x666666
        });
        const barrel = new THREE.Mesh(barrelGeom, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.5, 1.4);
        barrel.castShadow = true;
        this.turretMesh.add(barrel);
        
        // Muzzle brake
        const muzzleGeom = new THREE.CylinderGeometry(0.18, 0.14, 0.3, 12);
        const muzzle = new THREE.Mesh(muzzleGeom, barrelMat);
        muzzle.rotation.x = Math.PI / 2;
        muzzle.position.set(0, 0.5, 2.7);
        this.turretMesh.add(muzzle);
        
        this.turretMesh.position.y = hullConfig.height + 0.1;
        this.mesh.add(this.turretMesh);
        
        // Create name label
        this.createNameLabel();
        
        // Create health bar
        this.createHealthBar();
        
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        this.scene.add(this.mesh);
    }
    
    createNameLabel() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 16, 256, 32);
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.team === 'red' ? '#ff6666' : this.team === 'blue' ? '#6666ff' : '#66ff66';
        ctx.fillText(this.name || 'Tank', 128, 42);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        this.nameSprite = new THREE.Sprite(spriteMat);
        this.nameSprite.scale.set(4, 1, 1);
        this.nameSprite.position.y = 4;
        this.mesh.add(this.nameSprite);
    }
    
    createHealthBar() {
        const hullConfig = CONFIG.HULLS[this.hull];
        this.healthBar = new THREE.Group();
        
        // Background
        const bgGeom = new THREE.PlaneGeometry(2.5, 0.3);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
        const bg = new THREE.Mesh(bgGeom, bgMat);
        this.healthBar.add(bg);
        
        // Health fill
        const fillGeom = new THREE.PlaneGeometry(2.4, 0.2);
        const fillMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        this.healthFill = new THREE.Mesh(fillGeom, fillMat);
        this.healthFill.position.z = 0.01;
        this.healthBar.add(this.healthFill);
        
        this.healthBar.position.y = 3.2;
        this.healthBar.rotation.y = Math.PI;
        this.mesh.add(this.healthBar);
    }

    update(data, deltaTime) {
        // Smoother interpolation
        const lerpFactor = Math.min(1, deltaTime * 15);
        
        this.targetX = data.x;
        this.targetZ = data.z;
        this.x += (this.targetX - this.x) * lerpFactor;
        this.z += (this.targetZ - this.z) * lerpFactor;
        
        // Smooth rotation with wrapping
        let rotDiff = data.rotation - this.rotation;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        this.rotation += rotDiff * lerpFactor;
        
        // Smooth turret rotation
        let turretDiff = data.turretRotation - this.turretRotation;
        while (turretDiff > Math.PI) turretDiff -= Math.PI * 2;
        while (turretDiff < -Math.PI) turretDiff += Math.PI * 2;
        this.turretRotation += turretDiff * lerpFactor * 1.5;
        
        this.hp = data.hp;
        this.alive = data.alive;
        
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        this.turretMesh.rotation.y = this.turretRotation - this.rotation;
        this.mesh.visible = this.alive;
        
        // Update health bar
        if (this.healthFill && this.maxHp > 0) {
            const healthPercent = this.hp / this.maxHp;
            this.healthFill.scale.x = healthPercent;
            this.healthFill.position.x = (1 - healthPercent) * 1.2;
            
            // Change color based on health
            if (healthPercent > 0.6) {
                this.healthFill.material.color.setHex(0x00ff00);
            } else if (healthPercent > 0.3) {
                this.healthFill.material.color.setHex(0xffff00);
            } else {
                this.healthFill.material.color.setHex(0xff0000);
            }
        }
        
        // Make health bar face camera (billboard)
        if (this.healthBar) {
            this.healthBar.rotation.y = -this.rotation;
        }
        if (this.nameSprite) {
            this.nameSprite.material.opacity = this.alive ? 1 : 0;
        }
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}
window.Tank = Tank;