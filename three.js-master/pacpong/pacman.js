import * as THREE from '../build/three.module.js';
import { GLTFLoader } from "../examples/jsm/loaders/GLTFLoader.js";

class pongGame {
    // constructor : renderer, scene, 함수들 정의
    constructor() {
        const canvas1 = document.querySelector("#canvas1");
        const canvas2 = document.querySelector("#canvas2");
        this._divCanvas1 = canvas1;
        this._divCanvas2 = canvas2;

        // renderer라는 화면에 찍어내는 객체를 생성한다
        // renderer는 2개 존재하며 같은 scene을 인자로 받아 렌더링해준다
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
        scene.background = new THREE.Color("black");
        this._scene = scene;

        this._setupCamera(); // 카메라 객체 설정
        this._setupLight(); // 광원을 설정
        this._setupModel(); // 3차원 모델을 설정

        // resize 이벤트 핸들러를 추가
        window.addEventListener('resize', this.resize.bind(this));

        // 현재 창 크기에 맞게 카메라, 광원, 렌더러를 설정
        this.resize();

        // render 함수 정의 및 애니메이션 프레임 요청
        requestAnimationFrame(this.render.bind(this));

        this._flag = 1;
    }

    _setupCamera() {
        const width = window.innerWidth / 2; // TODO: 화면에 맞게 수정해야함
        const height = window.innerHeight; // TODO: 화면에 맞게 수정해야함
        const camera1 = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        );
        camera1.position.set(0, 0, 100); // 카메라의 위치 설정 (x: 0, y: 0, z: 42)
        camera1.lookAt(0, 0, 0);
        this._camera1 = camera1;

        const camera2 = new THREE.PerspectiveCamera(
            45,
            (window.innerWidth / 2) / window.innerHeight,
            0.1,
            1000
        );
        camera2.position.set(0, 0, -100);
        camera2.lookAt(0, 0, 0);
        this._camera2 = camera2;
    }

    _setupLight() {
        const PLight = new THREE.PointLight();
        const ALight = new THREE.AmbientLight();
        this._PLight = PLight;
        this._ALight = ALight;
        PLight.position.set(50, 50, 0);
        this._scene.add(PLight, ALight);
        // this._scene.add(ALight);
    }

    _setupModel() {
        const loader = new GLTFLoader();

        // pacman ball
        loader.load("pac/scene.gltf", (gltf) => {
            this._ball = gltf.scene;
            this._scene.add(this._ball);
        });

        // 원근감을 위한 사각테두리라인
        const lineShape = new THREE.Shape();
        lineShape.moveTo(10, 10);
        lineShape.lineTo(10, -10);
        lineShape.lineTo(-10, -10);
        lineShape.lineTo(-10, 10);
        lineShape.closePath();
        const lineGeometry = new THREE.BufferGeometry();
        const linePoints = lineShape.getPoints();
        lineGeometry.setFromPoints(linePoints);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x14ff00 });
        const perspectiveLine = new THREE.Line(lineGeometry, lineMaterial);
        this._perspectiveLine = perspectiveLine;
        this._scene.add(this._perspectiveLine);

        //경기장
        // const stadiumGeometry = new THREE.BoxGeometry(24, 24, 100); //TODO: 좌표 수정해야함
        // const stadiumEdges = new THREE.EdgesGeometry(stadiumGeometry);
        // const stadiumMaterial = new THREE.MeshBasicMaterial({ 
        //     color: 0x00ff00,
        //     polygonOffset: true,
        // });
        // const stadium = new THREE.LineSegments(stadiumEdges, stadiumMaterial);
        // this._scene.add(stadium);
        const stadiumGeometry = new THREE.BoxGeometry(20, 20, 100);
        const stadiumMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
        });
        const stadium = new THREE.Mesh(stadiumGeometry, stadiumMaterial);
        this._scene.add(stadium);
        this._stadium = stadium;

        // 경기장 테두리
        const stadiumEdges = new THREE.EdgesGeometry(stadiumGeometry); //geometry의 테두리를 추출하는 함수
        const edgesMaterial = new THREE.MeshBasicMaterial({ color: 0x1e30f5 });
        const edgeThickness = 0.1; // 선의 두께 설정

        stadium.attributes

        const edges = new THREE.Group(); //그룹을 생성한다
        stadiumEdges.attributes.position.array.forEach((value, index, array) => { //forEach로 각 배열 요소에 대해 제공된 함수를 호출한다 //여기서 객체는 경기장테두리들이고 배열은 경기장테두리의 각 변이다
            //현재 탐색하는 배열에서 value는 배열 요소의 값을 나타내며 각 좌표 값(x, y, z)를 나타낸다
            //array는 현재 순회 중인 배열 자체로 stadiumEdges.attributes.position.array 배열 전체를 나타낸다
            if (index % 6 === 0) { //각 edge는 2개의 점으로 이루어져있으므로 배열에서는 6개의 원소마다 하나의 edge를 가리킴
                const start = new THREE.Vector3(array[index], array[index + 1], array[index + 2]); //3차원의 벡터를 생성한다
                const end = new THREE.Vector3(array[index + 3], array[index + 4], array[index + 5]);

                const cylinderGeometry = new THREE.CylinderGeometry(edgeThickness, edgeThickness, start.distanceTo(end), 8); //8각형으로 원통구성
                const edge = new THREE.Mesh(cylinderGeometry, edgesMaterial);

                const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
                edge.position.copy(midPoint);

                edge.lookAt(end);
                edge.rotateX(Math.PI / 2);

                edges.add(edge); //그룹에 각 edge를 추가한다
            }
        });
        this._scene.add(edges);
        // const stadiumLine = new THREE.LineSegments(stadiumEdges, edgesMaterial);
        // this._scene.add(stadiumLine);

        //패널
        
        
    }

    resize() {
        const width = window.innerWidth / 2; // TODO: 화면에 맞게 수정해야함
        const height = window.innerHeight; // TODO: 화면에 맞게 수정해야함
        // html의 div쪽의 크기를 가져와서 카메라의 속성값을 설정해줌

        this._camera1.aspect = width / height; // 카메라 속성값 설정
        this._camera1.updateProjectionMatrix();
        this._renderer1.setSize(width, height);

        this._camera2.aspect = width / height; // 카메라 속성값 설정
        this._camera2.updateProjectionMatrix();
        this._renderer2.setSize(width, height);
    }

    render(time) { // 렌더링이 시작된 이후 경과된 밀리초를 받는다
        // 렌더러가 scenen을 카메라의 시점을 기준으로 렌더링하는작업을 한다
        this._renderer1.render(this._scene, this._camera1);
        this._renderer2.render(this._scene, this._camera2);
        this.update(time); // 시간에 따라 애니메이션 효과를 발생시킨다
        requestAnimationFrame(this.render.bind(this));
        // 생성자의 코드와 동일: 계속 렌더 메소드가 무한히 반복되어 호출되도록 만든다
    }

    update(time) { // TODO: 앞으로 동작에 대해서 함수를 들어서 정의해야함
        if (this._ball) {
            this._ball.rotation.y += 0.02;
            if (this._ball.position.z > 49 || this._ball.position.z < -49) {
                this._flag *= -1;
            }
            this._ball.position.z += 0.4 * this._flag;
            this._perspectiveLine.position.z += 0.4 * this._flag;
        }
    }
}

window.onload = function() {
    new pongGame();
}


// window.addEventListener('resize', () => {
//     const width = window.innerWidth / 2;
//     const height = window.innerHeight;

//     this._camera1.aspect = width / height;
//     this._camera1.updateProjectionMatrix();
//     this._renderer1.setSize(width, height);

//     this._camera2.aspect = width / height;
//     this._camera2.updateProjectionMatrix();
//     this._renderer2.setSize(width, height);
// });

// const canvas1 = document.querySelector("#canvas1");
// const canvas2 = document.querySelector("#canvas2");

// let renderer1 = new THREE.WebGLRenderer({
//     canvas: canvas1,
//     antialias: true,
// });
// renderer1.outputEncoding = THREE.sRGBEncoding;
// renderer1.setSize(window.innerWidth / 2, window.innerHeight);

// let renderer2 = new THREE.WebGLRenderer({
//     canvas: canvas2,
//     antialias: true,
// });
// renderer2.outputEncoding = THREE.sRGBEncoding;
// renderer2.setSize(window.innerWidth / 2, window.innerHeight);

// let scene = new THREE.Scene();
// scene.background = new THREE.Color("skyblue");

// const camera1 = new THREE.PerspectiveCamera(
//     45, 
//     (window.innerWidth / 2) / window.innerHeight, 
//     0.1, 
//     1000
// );
// camera1.position.set(0, 0, 42);// 카메라의 위치 설정 (x: 0, y: 0, z: 42)
// camera1.lookAt(0, 0, 0);

// const camera2 = new THREE.PerspectiveCamera(
//     45, 
//     (window.innerWidth / 2) / window.innerHeight, 
//     0.1, 
//     1000
// );
// camera2.position.set(0, 0, -42);
// console.dir(camera2);
// camera2.lookAt(0, 0, 0);

// let loader = new GLTFLoader();

// let PLight = new THREE.PointLight();
// let ALight = new THREE.AmbientLight();
// PLight.position.set(50, 50, 50); //TODO: 점광원 조명좌표 수정해야함
// scene.add(PLight, ALight);

// let model;
// let model2;

// loader.load("pac/scene.gltf", function (gltf) {
//     model = gltf.scene;
//     scene.add(model);
// });

// loader.load("pac/scene.gltf", function (gltf) {
//     model2 = gltf.scene;
//     scene.add(model2);
//     model2.position.x = 1;
//     model2.position.y = 4;
//     model2.position.z = 4; //카메라의 좌표가 (0, 0, 42)이므로 y가 화면에서 높낮이, x가 좌우, z가 원근감을 나타냄
// });

// const shape = new THREE.Shape();
// shape.moveTo(6, 6);
// shape.lineTo(6, -6);
// shape.lineTo(-6, -6);
// shape.lineTo(-6, 6);
// shape.closePath();
// const geometry = new THREE.BufferGeometry();
// const points = shape.getPoints();
// geometry.setFromPoints(points);
// const material = new THREE.LineBasicMaterial({color: 0xffff00});
// const line = new THREE.Line(geometry, material);
// scene.add(line);

// let flag = 1;
// // 애니메이션 루프
// function animate() {
//     requestAnimationFrame(animate);

//     if (model) {
//         // 모델 회전
//         model.rotation.y += 0.02;
//         if (model.position.z >= 20 || model.position.z <= -20){
//             flag *= -1;
//         }
//         model.position.z += 0.2 * flag;
//         line.position.z += 0.2 * flag;
//         model2.rotation.y += 0.01;
// 		// model.rotation.x += 0.01;
//         // console.log("Model Position:", model.position);
//     }

//     renderer1.render(scene, camera1);
//     renderer2.render(scene, camera2);
// }

// animate();