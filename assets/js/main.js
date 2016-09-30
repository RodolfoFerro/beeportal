var scene, camera, renderer, light;
var earthRotY = 0, moonRotY = 0;
var radY = 0, radZ = -0.3;
var moonDist = 84;
var earthRadius = 30;
var earthMesh, tmpMesh;
var moonMesh;
var mouse = {};

function init(width, height) {
    scene = new THREE.Scene();
    // Setup cameta with 45 deg field of view and same aspect ratio
    var aspect = width / height;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    // Set the camera to 400 units along `z` axis
    camera.position.set(0, 0, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
}

function initLight() {
    light = new THREE.SpotLight(0xffffff);
    // Position the light slightly to a side to make
    // shadows look better.
    light.position.set(400, 100, 1000);
    light.castShadow = true;
    scene.add(light);
}

function initEarth() {
    // Load Earth texture and create material from it
    var earthTexture = THREE.ImageUtils.loadTexture(earthBase64);
    earthTexture.minFilter = THREE.NearestFilter;
    var earthMaterial = new THREE.MeshLambertMaterial({
        map: earthTexture,
    });
    // Create a sphere 25 units in radius and 16 segments
    // both horizontally and vertically.
    var earthGeometry = new THREE.SphereGeometry(earthRadius, 16, 16);
    earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.receiveShadow = true;
    earthMesh.castShadow = true;
    // Add Earth to the scene
    scene.add(earthMesh);
}

function initMoon() {
    var moonTexture = THREE.ImageUtils.loadTexture(moonBase64);
    moonTexture.minFilter = THREE.NearestFilter;
    var moonMaterial = new THREE.MeshLambertMaterial({
        map: moonTexture,
    });
    var moonGeometry =  new THREE.SphereGeometry(earthRadius * 0.273, 10, 10);
    moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonMesh.receiveShadow = true;
    moonMesh.castShadow = true;
    scene.add(moonMesh);
}

function initPlane() {
    // The plane needs to be large to be sure it'll always intersect
    var tmpGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    tmpGeometry.position = new THREE.Vector3(0, 0, 0);
    tmpMesh = new THREE.Mesh(tmpGeometry);
}

// Update position of objects in the scene
function update() {
    earthRotY += 0.007;

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.0);
    // Unproject camera distortion (fov, aspect ratio)
    vector.unproject(camera);
    var norm = vector.sub(camera.position).normalize();
    // Cast a line from our camera to the tmpMesh and see where these
    // two intersect. That's our 2D position in 3D coordinates.
    var ray = new THREE.Raycaster(camera.position, norm);
    var intersects = ray.intersectObject(tmpMesh);

    var point = intersects[0].point;
    earthMesh.position.x = point.x;
    earthMesh.position.y = point.y;
    earthMesh.rotation.y = earthRotY;

    moonRotY += 0.005;
    radY += 0.03;
    radZ += 0.0005;

    // Update Moon position
    x = moonDist * Math.cos(radZ) * Math.sin(radY);
    y = moonDist * Math.sin(radZ) * Math.sin(radY);
    z = moonDist * Math.cos(radY);

    moonMesh.position.set(x + earthMesh.position.x, y + earthMesh.position.y, z);
    moonMesh.rotation.y = moonRotY;
}

// Redraw entire scene
function render() {
    update();

    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
    // Schedule another frame
    requestAnimationFrame(render);
}

function onDocumentMouseMove(event) {
    // Current mouse position with [0,0] in the center of the document
    // and ranging from -1.0 to +1.0 with `y` axis inverted.
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

document.addEventListener('DOMContentLoaded', function(event) {
    // Initialize everything and start rendering
    init(window.innerWidth, window.innerHeight);
    initEarth();
    initMoon();
    initLight();
    initPlane();

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    requestAnimationFrame(render);
});
