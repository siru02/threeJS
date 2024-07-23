import * as THREE from '../build/three.module.js';
import { GLTFLoader } from "../examples/jsm/loaders/GLTFLoader.js";

class pongGame {
    //constructor : renderer, scene, 함수들정의
    constructor() {
        const canvas1 = document.querySelector("#canvas1");
        const canvas2 = document.querySelector("#canvas2");
        this._divCanvas1 = canvas1;
        this._divCanvas2 = canvas2;

        //renderer라는 화면에 찍어내는 객체를 생성한다
        //renderer는 2개 존재하며 같은 scene을 인자로 받아 렌더링해준다
        let renderer1 = new THREE.WebGLRenderer({
            canvas: canvas1,
            antialias: true,
        });
        renderer1.outputEncoding = THREE.sRGBEncoding;
        renderer1.setSize(window.innerWidth / 2, window.innerHeight);
        this._renderer1 = renderer1;

        let renderer2 = new THREE.WebGLRenderer({
            canvas: canvas2,
            antialias: true,
        });
        renderer2.outputEncoding = THREE.sRGBEncoding;
        renderer2.setSize(window.innerWidth / 2, window.innerHeight);
        this._renderer2 = renderer2;

        let scene = new THREE.Scene();
        scene.background = new THREE.Color("skyblue");
        this._scene = scene;

        this._setupCamera(); //카메라 객체 설정
		this._setupLight(); //광원을 설정
		this._setupModel(); //3차원 모델을 설정
    }

    _setupCamera() {
        const width = window.innerWidth / 2; //TODO: 화면에 맞게 수정해야함
        const height = window.innerHeight; //TODO: 화면에 맞게 수정해야함
        const camera1 = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        );
        camera1.position.set(0, 0, 42);// 카메라의 위치 설정 (x: 0, y: 0, z: 42)
        camera1.lookAt(0, 0, 0);
        this._camera1 = camera1;

        const camera2 = new THREE.PerspectiveCamera(
            45, 
            (window.innerWidth / 2) / window.innerHeight, 
            0.1, 
            1000
        );
        camera2.position.set(0, 0, -42);
        console.dir(camera2);
        camera2.lookAt(0, 0, 0);
        this._camera2 = camera2;
    }

    _setupLight(){
        const PLight = new THREE.PointLight();
        const ALight = new THREE.AmbientLight();
        this._PLight = PLight;
        this._ALight = ALight;
        PLight.position.set(50, 50, 0);
        this._scene.add(PLight, ALight);
    }

    _setupModel(){
        const loader = new GLTFLoader();

        //pacman ball
        let ball;
        loader.load("pac/scene.gltf", function (gltf) {
            ball = gltf.scene;
            this._scene.add(ball);
        })
        this._ball = ball;

        //원근감을 위한 사각테두리라인
        const shape = new THREE.Shape();
        shape.moveTo(6, 6);
        shape.lineTo(6, -6);
        shape.lineTo(-6, -6);
        shape.lineTo(-6, 6);
        shape.closePath();
        const geometry = new THREE.BufferGeometry();
        const points = shape.getPoints();
        geometry.setFromPoints(points);
        const material = new THREE.LineBasicMaterial({color: 0xffff00});
        const perspectiveLine = new THREE.Line(geometry, material);
        this._perspectiveLine = perspectiveLine;
        this._scene.add(line);
    }
}
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
PLight.position.set(50, 50, 50); //TODO: 점광원 조명좌표 수정해야함
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

const shape = new THREE.Shape();
shape.moveTo(6, 6);
shape.lineTo(6, -6);
shape.lineTo(-6, -6);
shape.lineTo(-6, 6);
shape.closePath();
const geometry = new THREE.BufferGeometry();
const points = shape.getPoints();
geometry.setFromPoints(points);
const material = new THREE.LineBasicMaterial({color: 0xffff00});
const line = new THREE.Line(geometry, material);
scene.add(line);

let flag = 1;
// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);

    if (model) {
        // 모델 회전
        model.rotation.y += 0.02;
        if (model.position.z >= 20 || model.position.z <= -20){
            flag *= -1;
        }
        model.position.z += 0.2 * flag;
        line.position.z += 0.2 * flag;
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