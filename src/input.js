import nipplejs from 'nipplejs';

const movement = {
    forward: 0,
    right: 0,
    rotateX: 0, // Yaw
    rotateY: 0  // Pitch
};

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false
};

export function setupInput(zoneElement) {
    // Keyboard
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = true;
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = false;
    });

    // Joystick (Nipple.js)
    if (zoneElement) {
        const manager = nipplejs.create({
            zone: zoneElement,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 100
        });

        manager.on('move', (evt, data) => {
            if (data && data.vector) {
                // Joystick moves player forward/back/strafe
                movement.forward = data.vector.y;
                movement.right = data.vector.x;
            }
        });

        manager.on('end', () => {
            movement.forward = 0;
            movement.right = 0;
        });
    }
}

export function getMovement() {
    // Reset from previous frame if needed, or accumulate
    // Here we recalculate from state
    
    let fwd = 0;
    let rgt = 0;
    let rotX = 0;
    let rotY = 0;

    // Keyboard contribution
    if (keys.w || keys.arrowup) fwd += 1;
    if (keys.s || keys.arrowdown) fwd -= 1;
    if (keys.a || keys.arrowleft) rgt -= 1;
    if (keys.d || keys.arrowright) rgt += 1;
    
    // Joystick overwrites/adds if active (handled in listener updating the movement obj)
    // We'll just sum them for simplicity or take max
    // Since joystick updates `movement.forward` directly, we blend them.
    
    // Actually, let's keep keyboard affecting the exported object
    const finalForward = fwd + movement.forward;
    const finalRight = rgt + movement.right;
    
    // Rotation keys (Q/E or mouse drag could be added, but for now just move)
    // Let's map Arrow Keys to rotation if we want? 
    // The instructions said WASD for movement. 
    // Let's add simple mouse look or just assume standard WASD strafing.
    // The previous main.js uses movement.rotateX/Y.
    // Let's use Q/E for rotate.
    
    if (keys.q) rotX += 1;
    if (keys.e) rotX -= 1;
    
    // Mouse look
    // We need to capture mouse movement for rotation.
    // Implementing a simple global mouse listener here.
}

// Add mouse listener outside
let mouseDeltaX = 0;
let mouseDeltaY = 0;

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        mouseDeltaX += e.movementX;
        mouseDeltaY += e.movementY;
    }
});

document.addEventListener('click', () => {
    document.body.requestPointerLock();
});

// Overwrite getMovement to include mouse
const exportedMovement = {
    forward: 0,
    right: 0,
    rotateX: 0,
    rotateY: 0
};

export { exportedMovement as movement }; // Legacy export if needed

// Real export
const tempVec = { x: 0, y: 0 }; // Joystick vector

export function getMovement_v2() {
    // Combine keyboard and joystick state
    let f = 0; 
    let r = 0;
    
    if (keys.w) f += 1;
    if (keys.s) f -= 1;
    if (keys.a) r -= 1;
    if (keys.d) r += 1;
    
    // Apply Joystick
    f += movement.forward; // from nipple listener
    r += movement.right;

    // Rotation from mouse
    const rotX = mouseDeltaX * 0.1; // Sensitivity
    const rotY = mouseDeltaY * 0.1;
    
    // Reset deltas
    mouseDeltaX = 0;
    mouseDeltaY = 0;

    return {
        forward: f,
        right: r,
        rotateX: rotX,
        rotateY: rotY
    };
}

// Re-binding the original export expectation
const internalMovement = {
    forward: 0,
    right: 0,
    rotateX: 0,
    rotateY: 0
};

// Re-implement the one from analysis
export { getMovement_v2 as getMovement };