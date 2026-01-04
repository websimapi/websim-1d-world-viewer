import * as THREE from 'three';
import { createScene, updateScene } from './scene.js';
import { setupInput, getMovement } from './input.js';

// Configuration
const config = {
    is1D: true, // Start in 1D mode
    renderHeight: 1 // The height of the render buffer in 1D mode
};

// Setup Renderer
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(window.devicePixelRatio); // Not strictly needed for 1D but good for Debug
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Setup Scene & Camera
const { scene, camera, player, updatables } = createScene();

// Handle Resize
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (config.is1D) {
        // 1D Mode: Render Width x 1
        // We set the internal size to Width x 1
        // Using Math.floor to ensure integer dimensions
        renderer.setSize(Math.floor(width), config.renderHeight, false); 
        
        // We calculate a vertical FOV that results in a ~90 degree Horizontal FOV
        // tan(hFOV/2) = aspect * tan(vFOV/2)
        // Let's desire hFOV = 90 deg -> tan(45) = 1
        // 1 = (W/1) * tan(vFOV/2)
        // tan(vFOV/2) = 1/W
        // vFOV = 2 * atan(1/W)
        const desiredHFOV = 90;
        const aspect = width / config.renderHeight;
        const vFOV_rad = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(desiredHFOV) / 2) / aspect);
        const vFOV_deg = THREE.MathUtils.radToDeg(vFOV_rad);

        camera.fov = vFOV_deg;
        camera.aspect = aspect;
        
        // Stretch the canvas to fill screen visually
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
    } else {
        // Debug 3D Mode: Normal rendering
        renderer.setSize(width, height);
        camera.fov = 60;
        camera.aspect = width / height;
        
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
    }
    camera.updateProjectionMatrix();
}

// Initial resize
handleResize();
window.addEventListener('resize', handleResize);

// Setup Input
setupInput(document.getElementById('zone-joystick'));

// UI
const btn = document.getElementById('toggle-debug');
btn.addEventListener('click', () => {
    config.is1D = !config.is1D;
    handleResize();
    btn.textContent = config.is1D ? "Switch to 3D Debug" : "Switch to 1D View";
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const movement = getMovement();

    // Move Player
    // Forward/Back
    // Add simple bounds check or clamp if needed, but world is open.
    // Adjust speed.
    const speed = 10;
    player.translateZ(-movement.forward * speed * delta);
    player.translateX(movement.right * speed * delta);
    
    // Rotate Player (Yaw)
    player.rotation.y -= movement.rotateX * 2.0 * delta;
    
    // Pitch (Look up/down) - helpful for 1D scanning
    // We clamp it to avoid flipping
    /* 
       Note: Moving the camera pitch in 1D mode effectively scans vertically 
       through the world, which is a cool effect.
    */
    camera.rotation.x -= movement.rotateY * 2.0 * delta;
    camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));


    // Update Scene objects
    updateScene(delta);

    // Sync camera to player object (if separated, but here camera is child of player or player is camera wrapper)
    // Actually, in scene.js we likely returned a camera that is part of a player group or independent.
    // Let's assume player IS the group containing the camera.

    renderer.render(scene, camera);
}

animate();