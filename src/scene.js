import * as THREE from 'three';

export function createScene() {
    const scene = new THREE.Scene();
    // Dark grey background instead of black to distinguish "working but looking at void" from "broken"
    scene.background = new THREE.Color(0x222222);
    scene.fog = new THREE.FogExp2(0x222222, 0.02);

    // Player Rig
    const player = new THREE.Group();
    player.position.set(0, 1.5, 0); // Eye height - slightly lower to catch more ground/objects
    scene.add(player);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    player.add(camera);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    
    // Add a point light on the player to light up things near them
    const playerLight = new THREE.PointLight(0xffffff, 1, 20);
    player.add(playerLight);

    // Textures
    const textureLoader = new THREE.TextureLoader();
    const groundTex = textureLoader.load('texture_ground.png');
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(20, 20);

    const objTex = textureLoader.load('texture_test_obj.png');

    // Ground
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({ 
        map: groundTex,
        roughness: 0.8 
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Test Objects
    const updatables = [];

    // 1. Spinning Cube
    const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
    const cubeMat = new THREE.MeshStandardMaterial({ map: objTex, color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(0, 1, -10);
    scene.add(cube);
    updatables.push((delta) => {
        cube.rotation.x += delta;
        cube.rotation.y += delta;
    });

    // 2. Tall Pillars (good for 1D vertical cuts)
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    
    for(let i=0; i<5; i++) {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(-10 + i * 5, 5, -15);
        scene.add(pillar);
    }

    // 3. Floating Spheres (Sine wave movement)
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.1, metalness: 0.5 });
    const spheres = [];
    for(let i=0; i<3; i++) {
        const s = new THREE.Mesh(sphereGeo, sphereMat);
        s.position.set(5, 2, -5 - (i*4));
        scene.add(s);
        spheres.push({ mesh: s, offset: i });
    }
    updatables.push((delta, time) => {
        spheres.forEach(data => {
            data.mesh.position.y = 2 + Math.sin(time + data.offset) * 1.5;
        });
    });
    
    // 4. A giant wall with a gradient
    const wallGeo = new THREE.PlaneGeometry(20, 10);
    // Vertex colors for gradient
    const wallMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 5, 10); // Behind player
    
    const count = wallGeo.attributes.position.count;
    const colors = [];
    for(let i=0; i<count; i++) {
        colors.push(Math.random(), Math.random(), Math.random());
    }
    wallGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    scene.add(wall);

    // 5. Center Marker (Always visible at start)
    const markerGeo = new THREE.BoxGeometry(1, 100, 1);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff00ff }); // Magenta
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(0, 0, -5); // Directly in front
    scene.add(marker);


    let totalTime = 0;
    function updateScene(delta) {
        totalTime += delta;
        updatables.forEach(fn => fn(delta, totalTime));
    }

    return { scene, camera, player, updatables: updateScene };
}