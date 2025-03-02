const canvas = document.getElementById("vectorCanvas");
const ctx = canvas.getContext("2d");
let c = 120000;//2.998e8; // "Speed of light"
let draw = true;
let startX = canvas.width / 2;
let startY = canvas.height / 2;
let magnitude = 10;
let angle = 3.14 / 4;
let dragging = false;
let electron_speed = 10;
let sp = magnitude * 1000;


/**
 * HTML5 Canvas API Quick Reference
 * ---------------------------------
 * 
 * // 1. Get the Canvas Context
 * const canvas = document.getElementById('myCanvas');
 * const ctx = canvas.getContext('2d'); // '2d' for 2D rendering, 'webgl' for WebGL
 * 
 * // 2. Drawing Shapes
 * ctx.fillRect(x, y, width, height);    // Filled rectangle
 * ctx.strokeRect(x, y, width, height);  // Stroked rectangle
 * ctx.clearRect(x, y, width, height);   // Clear a rectangular area
 * 
 * // 3. Paths and Lines
 * ctx.beginPath();
 * ctx.moveTo(x, y);         // Move to a point
 * ctx.lineTo(x, y);         // Draw a line
 * ctx.closePath();          // Close path (optional)
 * ctx.stroke();             // Apply stroke (outline)
 * ctx.fill();               // Apply fill (if closed path)
 * 
 * // 4. Circles & Arcs
 * ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
 * ctx.fill();
 * ctx.stroke();
 * 
 * // 5. Colors and Styles
 * ctx.fillStyle = 'red';    // Fill color
 * ctx.strokeStyle = 'blue'; // Stroke color
 * ctx.lineWidth = 5;        // Line thickness
 * ctx.globalAlpha = 0.5;    // Transparency (0.0 to 1.0)
 * 
 * // 6. Gradients
 * const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
 * gradient.addColorStop(0, 'red');
 * gradient.addColorStop(1, 'blue');
 * ctx.fillStyle = gradient;
 * ctx.fillRect(x, y, width, height);
 * 
 * // 7. Text
 * ctx.font = '30px Arial';
 * ctx.fillText('Hello', x, y);
 * ctx.strokeText('World', x, y);
 * 
 * // 8. Images
 * const img = new Image();
 * img.src = 'image.jpg';
 * img.onload = () => ctx.drawImage(img, x, y, width, height);
 * 
 * // 9. Transformations
 * ctx.translate(x, y);  // Move origin
 * ctx.rotate(angle);    // Rotate (radians)
 * ctx.scale(sx, sy);    // Scale
 * 
 * // 10. Animation
 * function animate() {
 *   ctx.clearRect(0, 0, canvas.width, canvas.height);
 *   // Draw something
 *   requestAnimationFrame(animate);
 * }
 * animate();
 */

function relativisticRelativeVelocity(velA, velB) {
    let vA = math.norm(velA);
    let vB = math.norm(velB);

    if (vA >= c || vB >= c) {
        throw new Error("Velocities must be less than the speed of light");
    }

    let dotProduct = math.dot(velA, velB);

    let numerator = math.subtract(velA, velB);
    let denominator = 1 - (dotProduct / (c * c));

    if (denominator === 0) {
        throw new Error("Denominator in velocity transformation is zero.");
    }

    return math.divide(numerator, denominator);
}


function calculateTransformationOfRemotePointForObserver(obs_vel, remotes_vel, obs_pos, remotes_pos) {
    let distance = math.subtract(obs_pos, remotes_pos);
    obs_vel = [obs_vel[0], -obs_vel[1]]
    let len0 = math.norm(distance);
    if (len0 == 0) {
        return remotes_pos;
    }
    let unit_distance_vector = math.divide(distance, len0);
    let relative_speeds = math.subtract(obs_vel, remotes_vel)
    let closing_speed = math.dot(relative_speeds, unit_distance_vector);
    function get_contracted(relative_speed, l0) {
        if (l0 == 0) {
            return 0;
        }
        return l0 * math.sqrt(1 - (relative_speed * relative_speed) / (c * c))
    }

    let len1 = get_contracted(closing_speed, len0);


    let relativistic_distance = math.multiply(unit_distance_vector, len1);

    return math.subtract(obs_pos, relativistic_distance);

}

let onetime_scaler = undefined


function drawGrid(observer_pos, observer_vel) {

    let density = canvas.width / 30; // Grid spacing
    let w = canvas.width
    for (let y = -canvas.width; y < canvas.height * 2; y += density) {
        for (let x = -canvas.width; x < canvas.width * 2; x += density) {
            let point_vel = [0, 0]
            let point_pos = [x, y];
            let new_pos = calculateTransformationOfRemotePointForObserver(observer_vel, point_vel, observer_pos, point_pos)

            let xx = new_pos[0], yy = new_pos[1];
            size = 1;
            ctx.fillRect(xx - size / 2, yy - size / 2, size, size);
        }
    }
}
function drawCircle(observer_pos, observer_vel) {
    let N = 40;
    for (let i = 0; i < N; i++) {
        let d = 100;
        let t = 2 * math.PI * (i / N)
        let x = d * math.cos(t) + observer_pos[0]
        let y = d * math.sin(t) + observer_pos[1]
        let point_vel = [0, 0]
        let point_pos = [x, y];
        let new_pos = calculateTransformationOfRemotePointForObserver(observer_vel, point_vel, observer_pos, point_pos)

        let xx = new_pos[0], yy = new_pos[1];
        size = 2;
        ctx.fillStyle = "red";

        ctx.fillRect(xx - size / 2, yy - size / 2, size, size);
        ctx.fillStyle = "green";

        ctx.fillRect(x - size / 2, y - size / 2, size, size);

    }
}
function registerSingleWire(observer_pos, observer_vel) {

    let charges = []
    let K = 1
    density = 100
    let W = canvas.width * 0.3;
    let origin_x = canvas.width / 2;
    let C = origin_x
    let origin_y = canvas.height / 2;
    let start=true;

    ctx.beginPath();
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1;
    for (let x = C - W * K; x <= C + W * K; x += density) {

        function register_electron_proton_pair(y, point_vel) {


            let point_pos = [x, y];

            let new_pos = calculateTransformationOfRemotePointForObserver(observer_vel, point_vel, observer_pos, point_pos)

            let xx = new_pos[0], yy = new_pos[1];
            ctx.fillStyle = "#0000ff";
            size = 7
            charges.push({ pos: new_pos, charge: -1 });

            ctx.fillRect(xx - size / 2, yy - size / 2, size, size);
            ctx.fillStyle = "red";
     
            new_pos = calculateTransformationOfRemotePointForObserver(observer_vel, [0, 0], observer_pos, point_pos)
            xx = new_pos[0], yy = new_pos[1];
            charges.push({ pos: new_pos, charge: 1 });

            if (start) {
                start=false;
                ctx.moveTo(xx, yy)
            } else { ctx.lineTo(xx, yy) }
            ctx.stroke();
            ctx.fillRect(xx - size / 2, yy - size / 2, size, size);

        }



            let offset = 100;
            let point_vel = electron_speed;
            register_electron_proton_pair(origin_y + offset, [point_vel, 0])




    }
    ctx.stroke();
    return charges;
}

function showForceFromCharges(observer_pos, observer_vel, charges) {

    let forces = [0, 0]
    charges.forEach(c => {
        let distance = math.subtract(observer_pos, c.pos);

        let observer_charge = -1;
        let k = 1e1;
        let r_squared = math.pow(math.norm(distance), 2);
        let a = c.charge * observer_charge / r_squared;
        let f = math.multiply(a, distance)
        forces = math.add(forces, f);
    })


    if (onetime_scaler == undefined) {
        let desired_lenght = 200;
        let f = math.norm(forces)
        onetime_scaler = desired_lenght / f
        console.log("Set the one shot scaler to", onetime_scaler)
    }

    drawVector(observer_pos, math.multiply(forces, onetime_scaler), "#ff00ff", "Force")


    let human_obs_vel = math.divide(observer_vel, (1 / 100) * math.norm(observer_vel))

    drawVector(observer_pos, human_obs_vel, "red", "Velocity")
}
function drawEnvironment() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let size = 2;
    ctx.fillStyle = "#888888";

    let observer_pos = [startX, startY];
    let observer_vel = [sp * math.cos(angle), sp * math.sin(angle)];

    size = 10
    ctx.fillRect(observer_pos[0] - size / 2, observer_pos[1] - size / 2, size, size);
    size = 4

    drawGrid(observer_pos, observer_vel);
    //  drawCircle(observer_pos, observer_vel);

    let charges = registerSingleWire(observer_pos, observer_vel);
    showForceFromCharges(observer_pos, observer_vel, charges)


    ctx.fillStyle = '#888888';
    ctx.font = '50px Arial';

    ctx.fillText("Draft! Simulation may have errors.", canvas.width * 0.1, canvas.height * 0.1)
    if (0) {
        ctx.fillStyle = 'white';
        ctx.font = '90px Arial';

        ctx.fillText("Welcome", canvas.width * 0.5, canvas.height * 0.3)
        ctx.font = '30px Arial';
        let s = "This simulation uses special relativity and lenght contraction to illustrate how magnetism is an emergent phenomenom"
        ctx.fillText(s, canvas.width * 0.1, canvas.height * 0.4)
    }
}
function drawVector(startpos, vector, color = "white", text = undefined) {

    let startX = startpos[0]
    let startY = startpos[1]
    let endX = startpos[0] + vector[0]
    let endY = startpos[1] + vector[1]

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    drawArrowhead(ctx, startX, startY, endX, endY);
    if (text) {
        ctx.fillStyle = 'white';
        ctx.font = '90px Arial';

        ctx.fillText(20, 20, text)


    }
}

function drawArrowhead(ctx, fromX, fromY, toX, toY) {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    return {
        x: (clientX - rect.left - window.scrollX) * scaleX,
        y: (clientY - rect.top - window.scrollY) * scaleY
    };
}
function startDrag(event) {
    console.log("Dragging")
    event.preventDefault();
    const pointerPos = getPointerPosition(event);
    let endX = startX + magnitude * Math.cos(angle);
    let endY = startY + magnitude * Math.sin(angle);

    const distance = Math.hypot(pointerPos.x - endX, pointerPos.y - endY);

    dragging = true;

}

function moveDrag(event) {


    const pointerPos = getPointerPosition(event);
    const dx = pointerPos.x - startX;
    const dy = pointerPos.y - startY;



    if (dragging) {
        magnitude = Math.hypot(dx, dy);
        event.preventDefault();
        onetime_scaler = undefined;
        startX = pointerPos.x
        startY = pointerPos.y

    } else {

        angle = Math.atan2(dy, dx);
    }
    draw = true;
}



function endDrag() {
    console.log("End drag")
    dragging = false;
}

canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", moveDrag);
canvas.addEventListener("mouseup", endDrag);
canvas.addEventListener("mouseleave", endDrag);

canvas.addEventListener("touchstart", startDrag, { passive: false });
canvas.addEventListener("touchmove", moveDrag, { passive: false });
canvas.addEventListener("touchend", endDrag);


setInterval(() => {
    if (draw) {
        draw = false;
        drawEnvironment();
    }
}, 1000 / 20)

function setElectronSpeedSlider(val) {
    console.log("electron speed slider", val)

    electron_speed = c * val * 0.8;
    onetime_scaler = undefined;
    draw = true;
}

function setParticleSpeedSlider(val) {
    sp = c * val * 0.7;
    onetime_scaler = undefined;
    draw = true;
}
function resizeCanvas() {

    canvas.width = document.getElementById("canvas_container").clientWidth;
    canvas.height = document.getElementById("canvas_container").clientHeight;

    // Redraw content (example)
    draw = true;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();