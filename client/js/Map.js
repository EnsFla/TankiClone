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
            
            if (obs.type === 'ramp') {
                // Create a ramp with sloped surface
                this.createRamp(group, obs);
            } else if (obs.type === 'platform') {
                // Elevated platform with ramp access
                this.createPlatform(group, obs);
            } else if (obs.type === 'building') {
                // Building with windows
                this.createBuilding(group, obs);
            } else {
                // Default box obstacle
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
            }
            
            group.position.set(obs.x, 0, obs.z);
            this.scene.add(group);
            this.obstacles.push(group);
        });
    }
    
    createRamp(group, obs) {
        // Create a ramp using a custom shape
        const shape = new THREE.Shape();
        shape.moveTo(-obs.depth / 2, 0);
        shape.lineTo(obs.depth / 2, 0);
        shape.lineTo(obs.depth / 2, obs.height);
        shape.lineTo(-obs.depth / 2, 0);
        
        const extrudeSettings = {
            steps: 1,
            depth: obs.width,
            bevelEnabled: false
        };
        
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x887766,
            shininess: 10
        });
        const ramp = new THREE.Mesh(geometry, material);
        ramp.rotation.y = Math.PI / 2;
        ramp.position.x = -obs.width / 2;
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        group.add(ramp);
        
        // Add edge strips for visual appeal
        const stripMat = new THREE.MeshPhongMaterial({ color: 0xffaa00, emissive: 0x443300 });
        const stripGeom = new THREE.BoxGeometry(obs.width + 0.2, 0.1, 0.3);
        
        const strip1 = new THREE.Mesh(stripGeom, stripMat);
        strip1.position.set(0, 0.05, -obs.depth / 2);
        group.add(strip1);
        
        const strip2 = new THREE.Mesh(stripGeom, stripMat);
        strip2.position.set(0, obs.height / 2, 0);
        strip2.rotation.x = -Math.atan2(obs.height, obs.depth);
        group.add(strip2);
    }
    
    createPlatform(group, obs) {
        // Main platform
        const platformGeom = new THREE.BoxGeometry(obs.width, 0.5, obs.depth);
        const platformMat = new THREE.MeshPhongMaterial({ 
            color: 0x666677,
            shininess: 20
        });
        const platform = new THREE.Mesh(platformGeom, platformMat);
        platform.position.y = obs.height;
        platform.castShadow = true;
        platform.receiveShadow = true;
        group.add(platform);
        
        // Support pillars
        const pillarGeom = new THREE.CylinderGeometry(0.5, 0.6, obs.height, 8);
        const pillarMat = new THREE.MeshPhongMaterial({ color: 0x555566 });
        
        const pillarPositions = [
            [-obs.width / 3, -obs.depth / 3],
            [obs.width / 3, -obs.depth / 3],
            [-obs.width / 3, obs.depth / 3],
            [obs.width / 3, obs.depth / 3]
        ];
        
        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(pillarGeom, pillarMat);
            pillar.position.set(pos[0], obs.height / 2, pos[1]);
            pillar.castShadow = true;
            group.add(pillar);
        });
        
        // Ramp to access the platform
        const rampWidth = 4;
        const rampShape = new THREE.Shape();
        rampShape.moveTo(-obs.depth / 2 - 4, 0);
        rampShape.lineTo(-obs.depth / 2, 0);
        rampShape.lineTo(-obs.depth / 2, obs.height);
        rampShape.lineTo(-obs.depth / 2 - 4, 0);
        
        const rampGeom = new THREE.ExtrudeGeometry(rampShape, { steps: 1, depth: rampWidth, bevelEnabled: false });
        const rampMat = new THREE.MeshPhongMaterial({ color: 0x777788 });
        const ramp = new THREE.Mesh(rampGeom, rampMat);
        ramp.rotation.y = Math.PI / 2;
        ramp.position.x = -rampWidth / 2;
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        group.add(ramp);
        
        // Guardrails on platform
        const railMat = new THREE.MeshPhongMaterial({ color: 0xffaa00, emissive: 0x332200 });
        const railGeom = new THREE.BoxGeometry(0.15, 0.8, obs.depth);
        
        const rail1 = new THREE.Mesh(railGeom, railMat);
        rail1.position.set(-obs.width / 2, obs.height + 0.6, 0);
        group.add(rail1);
        
        const rail2 = new THREE.Mesh(railGeom, railMat);
        rail2.position.set(obs.width / 2, obs.height + 0.6, 0);
        group.add(rail2);
    }
    
    createBuilding(group, obs) {
        // Main building body
        const buildingGeom = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
        const buildingMat = new THREE.MeshPhongMaterial({ 
            color: 0x556677,
            shininess: 15
        });
        const building = new THREE.Mesh(buildingGeom, buildingMat);
        building.position.y = obs.height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);
        
        // Windows
        const windowMat = new THREE.MeshPhongMaterial({ 
            color: 0x88aacc,
            emissive: 0x223344,
            shininess: 80
        });
        
        const windowWidth = 1.2;
        const windowHeight = 1.5;
        const windowsPerSide = Math.floor(obs.width / 4);
        
        for (let i = 0; i < windowsPerSide; i++) {
            const x = -obs.width / 2 + 2 + i * 4;
            
            // Front windows
            const windowGeom = new THREE.BoxGeometry(windowWidth, windowHeight, 0.1);
            const win1 = new THREE.Mesh(windowGeom, windowMat);
            win1.position.set(x, obs.height * 0.4, obs.depth / 2 + 0.05);
            group.add(win1);
            
            const win2 = new THREE.Mesh(windowGeom, windowMat);
            win2.position.set(x, obs.height * 0.7, obs.depth / 2 + 0.05);
            group.add(win2);
            
            // Back windows
            const win3 = new THREE.Mesh(windowGeom, windowMat);
            win3.position.set(x, obs.height * 0.4, -obs.depth / 2 - 0.05);
            group.add(win3);
            
            const win4 = new THREE.Mesh(windowGeom, windowMat);
            win4.position.set(x, obs.height * 0.7, -obs.depth / 2 - 0.05);
            group.add(win4);
        }
        
        // Roof detail
        const roofGeom = new THREE.BoxGeometry(obs.width + 0.5, 0.4, obs.depth + 0.5);
        const roofMat = new THREE.MeshPhongMaterial({ color: 0x445566 });
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = obs.height + 0.2;
        roof.castShadow = true;
        group.add(roof);
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
                { x: 0, z: 0, width: 10, height: 5, depth: 10, type: 'box' },
                { x: -22, z: -22, width: 8, height: 4, depth: 8, type: 'box' },
                { x: 22, z: -22, width: 8, height: 4, depth: 8, type: 'box' },
                { x: -22, z: 22, width: 8, height: 4, depth: 8, type: 'box' },
                { x: 22, z: 22, width: 8, height: 4, depth: 8, type: 'box' },
                { x: -35, z: 0, width: 5, height: 3, depth: 12, type: 'box' },
                { x: 35, z: 0, width: 5, height: 3, depth: 12, type: 'box' },
                { x: 0, z: -35, width: 12, height: 3, depth: 8, type: 'ramp' },
                { x: 0, z: 35, width: 12, height: 3, depth: 8, type: 'ramp' }
            ],
            silence: [
                { x: -28, z: -18, width: 12, height: 10, depth: 12, type: 'building' },
                { x: 28, z: -18, width: 12, height: 10, depth: 12, type: 'building' },
                { x: 0, z: 0, width: 14, height: 12, depth: 14, type: 'building' },
                { x: -28, z: 18, width: 8, height: 6, depth: 8, type: 'building' },
                { x: 28, z: 18, width: 8, height: 6, depth: 8, type: 'building' },
                { x: -45, z: 0, width: 10, height: 4, depth: 6, type: 'ramp' },
                { x: 45, z: 0, width: 10, height: 4, depth: 6, type: 'ramp' }
            ],
            kungur: [
                { x: -22, z: 0, width: 14, height: 4, depth: 10, type: 'ramp' },
                { x: 22, z: 0, width: 14, height: 4, depth: 10, type: 'ramp' },
                { x: 0, z: -22, width: 18, height: 6, depth: 18, type: 'platform' },
                { x: 0, z: 22, width: 10, height: 3, depth: 10, type: 'platform' },
                { x: -35, z: -35, width: 6, height: 2, depth: 8, type: 'ramp' },
                { x: 35, z: 35, width: 6, height: 2, depth: 8, type: 'ramp' }
            ],
            island: [
                { x: 0, z: 0, width: 12, height: 6, depth: 12, type: 'platform' },
                { x: -18, z: -18, width: 6, height: 3, depth: 6, type: 'box' },
                { x: 18, z: 18, width: 6, height: 3, depth: 6, type: 'box' },
                { x: -25, z: 15, width: 8, height: 4, depth: 5, type: 'ramp' },
                { x: 25, z: -15, width: 8, height: 4, depth: 5, type: 'ramp' }
            ],
            polygon: [
                { x: 0, z: 0, width: 8, height: 8, depth: 8, type: 'building' },
                { x: -15, z: -15, width: 5, height: 4, depth: 5, type: 'box' },
                { x: 15, z: -15, width: 5, height: 4, depth: 5, type: 'box' },
                { x: -15, z: 15, width: 5, height: 4, depth: 5, type: 'box' },
                { x: 15, z: 15, width: 5, height: 4, depth: 5, type: 'box' },
                { x: -25, z: 0, width: 8, height: 3, depth: 5, type: 'ramp' },
                { x: 25, z: 0, width: 8, height: 3, depth: 5, type: 'ramp' }
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
