// Map class - 3D map rendering with Three.js
class GameMap {
    constructor(scene, mapName) {
        this.scene = scene;
        this.mapName = mapName || 'sandbox';
        this.config = CONFIG.MAPS[this.mapName] || CONFIG.MAPS.sandbox;
        this.obstacles = [];
        this.healthPacks = [];
        this.flags = {};
        this.decorations = [];
        this.createMap();
    }

    createMap() {
        // Main ground with texture-like appearance
        const groundGeom = new THREE.PlaneGeometry(this.config.width + 20, this.config.height + 20, 50, 50);
        const groundMat = new THREE.MeshPhongMaterial({ 
            color: this.config.groundColor,
            shininess: 5,
            flatShading: false
        });
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Subtle ground detail grid
        const gridHelper = new THREE.GridHelper(this.config.width, 40, 0x2a3a2a, 0x1a2a1a);
        gridHelper.position.y = 0.02;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
        
        // Add ground border/runway lines
        this.createGroundDetails();
        
        this.createWalls();
        this.createObstacles();
        this.createDecorations();
    }
    
    createGroundDetails() {
        // Create some ground markings/lines
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x4a5a4a });
        const lineGeom = new THREE.PlaneGeometry(this.config.width * 0.8, 0.3);
        
        // Horizontal lines
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue;
            const line = new THREE.Mesh(lineGeom, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.03, i * 15);
            this.scene.add(line);
        }
    }

    createWalls() {
        const wallHeight = 6;
        const wallMat = new THREE.MeshPhongMaterial({ 
            color: 0x667766,
            shininess: 20
        });
        const wallTopMat = new THREE.MeshPhongMaterial({ 
            color: 0x556655,
            shininess: 30
        });
        
        const halfW = this.config.width / 2;
        const halfH = this.config.height / 2;
        
        // Create walls with top detail
        const walls = [
            { pos: [0, wallHeight / 2, -halfH - 1.5], size: [this.config.width + 6, wallHeight, 3] },
            { pos: [0, wallHeight / 2, halfH + 1.5], size: [this.config.width + 6, wallHeight, 3] },
            { pos: [halfW + 1.5, wallHeight / 2, 0], size: [3, wallHeight, this.config.height] },
            { pos: [-halfW - 1.5, wallHeight / 2, 0], size: [3, wallHeight, this.config.height] }
        ];
        
        walls.forEach(w => {
            const geom = new THREE.BoxGeometry(w.size[0], w.size[1], w.size[2]);
            const wall = new THREE.Mesh(geom, wallMat);
            wall.position.set(w.pos[0], w.pos[1], w.pos[2]);
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);
            
            // Wall top
            const topGeom = new THREE.BoxGeometry(w.size[0] + 0.5, 0.4, w.size[2] + 0.5);
            const top = new THREE.Mesh(topGeom, wallTopMat);
            top.position.set(w.pos[0], wallHeight + 0.2, w.pos[2]);
            top.castShadow = true;
            this.scene.add(top);
        });
        
        // Corner pillars
        const pillarPositions = [
            [-halfW - 1.5, -halfH - 1.5],
            [halfW + 1.5, -halfH - 1.5],
            [-halfW - 1.5, halfH + 1.5],
            [halfW + 1.5, halfH + 1.5]
        ];
        
        pillarPositions.forEach(pos => {
            const pillarGeom = new THREE.CylinderGeometry(1.2, 1.5, wallHeight + 1, 8);
            const pillar = new THREE.Mesh(pillarGeom, wallTopMat);
            pillar.position.set(pos[0], (wallHeight + 1) / 2, pos[1]);
            pillar.castShadow = true;
            this.scene.add(pillar);
        });
    }

    createObstacles() {
        const obstacles = this.getMapObstacles();
        
        obstacles.forEach(obs => {
            const group = new THREE.Group();
            
            // Main obstacle body
            const geom = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
            const mat = new THREE.MeshPhongMaterial({ 
                color: 0x778877,
                shininess: 15
            });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.y = obs.height / 2;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            
            // Top detail
            const topGeom = new THREE.BoxGeometry(obs.width + 0.3, 0.3, obs.depth + 0.3);
            const topMat = new THREE.MeshPhongMaterial({ color: 0x6a7a6a, shininess: 20 });
            const top = new THREE.Mesh(topGeom, topMat);
            top.position.y = obs.height + 0.15;
            top.castShadow = true;
            group.add(top);
            
            // Base detail
            const baseGeom = new THREE.BoxGeometry(obs.width + 0.5, 0.2, obs.depth + 0.5);
            const baseMat = new THREE.MeshPhongMaterial({ color: 0x5a6a5a });
            const base = new THREE.Mesh(baseGeom, baseMat);
            base.position.y = 0.1;
            group.add(base);
            
            group.position.set(obs.x, 0, obs.z);
            this.scene.add(group);
            this.obstacles.push(group);
        });
    }
    
    createDecorations() {
        // Add some environmental details based on map
        const mapData = this.getMapObstacles();
        
        // Small crates/boxes as decoration
        const cratePositions = this.getCratePositions();
        const crateMat = new THREE.MeshPhongMaterial({ color: 0x8b7355, shininess: 10 });
        
        cratePositions.forEach(pos => {
            const size = 0.5 + Math.random() * 0.5;
            const crateGeom = new THREE.BoxGeometry(size, size, size);
            const crate = new THREE.Mesh(crateGeom, crateMat);
            crate.position.set(pos.x, size / 2, pos.z);
            crate.rotation.y = Math.random() * Math.PI;
            crate.castShadow = true;
            crate.receiveShadow = true;
            this.scene.add(crate);
            this.decorations.push(crate);
        });
    }
    
    getCratePositions() {
        // Random positions for decorative crates, avoiding center and spawn areas
        const positions = [];
        const halfW = this.config.width / 2 - 10;
        const halfH = this.config.height / 2 - 10;
        
        for (let i = 0; i < 12; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * halfW * 1.8;
                z = (Math.random() - 0.5) * halfH * 1.8;
            } while (Math.abs(x) < 15 && Math.abs(z) < 15);  // Avoid center
            
            positions.push({ x, z });
        }
        return positions;
    }

    getMapObstacles() {
        const obstacles = {
            sandbox: [
                { x: 0, z: 0, width: 10, height: 5, depth: 10 },
                { x: -22, z: -22, width: 8, height: 4, depth: 8 },
                { x: 22, z: -22, width: 8, height: 4, depth: 8 },
                { x: -22, z: 22, width: 8, height: 4, depth: 8 },
                { x: 22, z: 22, width: 8, height: 4, depth: 8 },
                { x: -35, z: 0, width: 5, height: 3, depth: 12 },
                { x: 35, z: 0, width: 5, height: 3, depth: 12 }
            ],
            silence: [
                { x: -28, z: -18, width: 12, height: 10, depth: 12 },
                { x: 28, z: -18, width: 12, height: 10, depth: 12 },
                { x: 0, z: 0, width: 14, height: 12, depth: 14 },
                { x: -28, z: 18, width: 8, height: 6, depth: 8 },
                { x: 28, z: 18, width: 8, height: 6, depth: 8 }
            ],
            kungur: [
                { x: -22, z: 0, width: 14, height: 4, depth: 10 },
                { x: 22, z: 0, width: 14, height: 4, depth: 10 },
                { x: 0, z: -22, width: 18, height: 6, depth: 18 },
                { x: 0, z: 22, width: 10, height: 3, depth: 10 }
            ]
        };
        return obstacles[this.mapName] || obstacles.sandbox;
    }

    createHealthPack(x, z, id) {
        const group = new THREE.Group();
        
        // Glowing health pack
        const boxGeom = new THREE.BoxGeometry(1.8, 1, 1.8);
        const boxMat = new THREE.MeshPhongMaterial({ 
            color: 0x00ff44,
            emissive: 0x00aa22,
            emissiveIntensity: 0.5,
            shininess: 100
        });
        const box = new THREE.Mesh(boxGeom, boxMat);
        box.position.y = 0.5;
        box.castShadow = true;
        group.add(box);
        
        // Cross symbol
        const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.4), crossMat);
        crossH.position.y = 1.02;
        group.add(crossH);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 1.2), crossMat);
        crossV.position.y = 1.02;
        group.add(crossV);
        
        // Glow effect
        const glowGeom = new THREE.SphereGeometry(1.5, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ff44, 
            transparent: true, 
            opacity: 0.15 
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        glow.position.y = 0.5;
        group.add(glow);
        
        group.position.set(x, 0, z);
        group.userData.id = id;
        this.scene.add(group);
        this.healthPacks.push(group);
        return group;
    }

    createFlag(x, z, team) {
        const group = new THREE.Group();
        
        // Flag pole
        const poleGeom = new THREE.CylinderGeometry(0.08, 0.12, 5, 12);
        const poleMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 80 });
        const pole = new THREE.Mesh(poleGeom, poleMat);
        pole.position.y = 2.5;
        pole.castShadow = true;
        group.add(pole);
        
        // Flag base
        const baseGeom = new THREE.CylinderGeometry(0.6, 0.8, 0.3, 12);
        const base = new THREE.Mesh(baseGeom, new THREE.MeshPhongMaterial({ color: 0x666666 }));
        base.position.y = 0.15;
        group.add(base);
        
        // Flag cloth
        const flagColor = team === 'red' ? 0xff3333 : 0x3333ff;
        const flagGeom = new THREE.PlaneGeometry(2.5, 1.8);
        const flagMat = new THREE.MeshPhongMaterial({ 
            color: flagColor, 
            side: THREE.DoubleSide,
            emissive: flagColor,
            emissiveIntensity: 0.2
        });
        const flag = new THREE.Mesh(flagGeom, flagMat);
        flag.position.set(1.25, 4, 0);
        flag.castShadow = true;
        group.add(flag);
        
        // Team emblem on flag
        const emblemGeom = new THREE.CircleGeometry(0.4, 16);
        const emblemMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const emblem = new THREE.Mesh(emblemGeom, emblemMat);
        emblem.position.set(1.25, 4, 0.01);
        group.add(emblem);
        
        group.position.set(x, 0, z);
        this.scene.add(group);
        this.flags[team] = group;
        return group;
    }

    updateHealthPacks(data, time) {
        const now = time || Date.now();
        data.forEach(hp => {
            let pack = this.healthPacks.find(p => p.userData.id === hp.id);
            if (!pack && hp.active) pack = this.createHealthPack(hp.x, hp.z, hp.id);
            if (pack) { 
                pack.visible = hp.active; 
                pack.rotation.y += 0.03;
                // Bobbing animation
                pack.position.y = 0.3 + Math.sin(now * 0.003 + hp.id) * 0.15;
            }
        });
    }

    updateFlags(data, time) {
        const now = time || Date.now();
        ['red', 'blue'].forEach(team => {
            if (data[team]) {
                if (!this.flags[team]) this.createFlag(data[team].x, data[team].z, team);
                this.flags[team].position.set(data[team].x, 0, data[team].z);
                this.flags[team].visible = !data[team].carrier;
                // Animate flag
                if (this.flags[team].children[2]) {
                    this.flags[team].children[2].rotation.y = Math.sin(now * 0.002) * 0.2;
                }
            }
        });
    }
}
window.GameMap = GameMap;
