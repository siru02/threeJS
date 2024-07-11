import * as THREE from "three"
import { GLTFLoader } from "GLTFLoader";

const canvas1 = document.querySelector("#canvas1");
const canvas2 = document.querySelector("#canvas2");

let renderer1 = new THREE.WebGLRenderer({
    canvas: canvas1,
    antialias: true,
});
renderer1.outputEncoding = THREE.sRGBEncoding;
renderer1.setSize(window.innerWidth / 2, window.innerHeight);

let renderer2 = new THREE.WebGLRenderer({
    canvas: canvas2,
    antialias: true,
});
renderer2.outputEncoding = THREE.sRGBEncoding;
renderer2.setSize(window.innerWidth / 2, window.innerHeight);

let scene = new THREE.Scene();
scene.background = new THREE.Color("skyblue");

const camera1 = new THREE.PerspectiveCamera(
    45, 
    (window.innerWidth / 2) / window.innerHeight, 
    0.1, 
    1000
);
camera1.position.set(0, 0, 42);// 카메라의 위치 설정 (x: 0, y: 0, z: 42)
camera1.lookAt(0, 0, 0);

const camera2 = new THREE.PerspectiveCamera(
    45, 
    (window.innerWidth / 2) / window.innerHeight, 
    0.1, 
    1000
);
camera2.position.set(0, 0, -42);
console.dir(camera2);
camera2.lookAt(0, 0, 0);

let loader = new GLTFLoader();

let PLight = new THREE.PointLight();
let ALight = new THREE.AmbientLight();
PLight.position.set(50, 50, 50);
scene.add(PLight, ALight);

let model;
let model2;

loader.load("pac/scene.gltf", function (gltf) {
    model = gltf.scene;
    scene.add(model);
});

loader.load("pac/scene.gltf", function (gltf) {
    model2 = gltf.scene;
    scene.add(model2);
    model2.position.x = 1;
    model2.position.y = 4;
    model2.position.z = 4; //카메라의 좌표가 (0, 0, 42)이므로 y가 화면에서 높낮이, x가 좌우, z가 원근감을 나타냄
});

let flag = 1;
// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);

    if (model) {
        // 모델 회전
        model.rotation.y += 0.02;
        if (model.position.z >= 24 || model.position.z <= -24){
            flag *= -1;
        }
        model.position.z += 0.2 * flag;
        model2.rotation.y += 0.01;
		// model.rotation.x += 0.01;
        // console.log("Model Position:", model.position);
    }

    renderer1.render(scene, camera1);
    renderer2.render(scene, camera2);
}

// 창 크기 변경시 리사이즈
window.addEventListener('resize', () => {
    const width = window.innerWidth / 2;
    const height = window.innerHeight;

    camera1.aspect = width / height;
    camera1.updateProjectionMatrix();
    renderer1.setSize(width, height);

    camera2.aspect = width / height;
    camera2.updateProjectionMatrix();
    renderer2.setSize(width, height);
});


animate();