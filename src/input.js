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
    // Request pointer lock on click to enable mouse looking
    if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
    }
});

export function getMovement() {
    // Combine keyboard and joystick state
    let f = 0; 
    let r = 0;
    
    if (keys.w) f += 1;
    if (keys.s) f -= 1;
    if (keys.a) r -= 1;
    if (keys.d) r += 1;
    
    // Add Joystick input
    f += movement.forward;
    r += movement.right;

    // Rotation from mouse movement
    const rotX = mouseDeltaX * 0.05; // Adjusted sensitivity
    const rotY = mouseDeltaY * 0.05;
    
    // Reset deltas after consumption
    mouseDeltaX = 0;
    mouseDeltaY = 0;

    return {
        forward: f,
        right: r,
        rotateX: rotX,
        rotateY: rotY
    };
}