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

        //게임에 사용할 변수들
        this._vec = [0, 0, 1]; //공의 방향벡터
        this._flag = 1; //공이 player1의 방향인지 player2의 방향인지 여부
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
        camera1.position.set(0, 0, 100);
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

        //Mesh: pacman ball
        loader.load("pac/scene.gltf", (gltf) => {
            this._ball = gltf.scene;
            this._scene.add(this._ball);
            //ball BoundingBox 설정
            this._ball.traverse((child) => { //TODO: 추가공부필요
                if (child.isMesh) {
                    child.geometry.computeBoundingBox();
                    child.boundingBox = new THREE.Box3().setFromObject(child);
                }
            });
            this._ballBoundingBox = new THREE.Box3().setFromObject(this._ball);
        });

        const edgeThickness = 0.1; // 선의 두께 설정

        //Mesh: 원근감을 위한 사각테두리라인
        const positions = [10, 10, 0, 10, -10, 0, -10, -10, 0, -10, 10, 0, 10, 10, 0];
        const perspectiveLineEdgesMaterial = new THREE.MeshBasicMaterial({ color: 0x14ff00 });
        const perspectiveLineEdges = new THREE.Group();
        
        for (let i = 0; i < positions.length - 3; i += 3) {
            const start = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const end = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
        
            const cylinderGeometry = new THREE.CylinderGeometry(edgeThickness, edgeThickness, start.distanceTo(end), 8); // 8각형으로 원통 구성
            const edge = new THREE.Mesh(cylinderGeometry, perspectiveLineEdgesMaterial);
        
            const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            edge.position.copy(midPoint);
        
            edge.lookAt(end);
            edge.rotateX(Math.PI / 2);
        
            perspectiveLineEdges.add(edge);
        }
        this._perspectiveLineEdges = perspectiveLineEdges;
        this._scene.add(this._perspectiveLineEdges);

        //Mesh: 경기장
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

        //Mesh: 경기장 테두리
        const stadiumEdges = new THREE.EdgesGeometry(stadiumGeometry); //geometry의 테두리를 추출하는 함수
        const edgesMaterial = new THREE.MeshBasicMaterial({ color: 0x1e30f5 });

        const stadiumPositions = stadiumEdges.attributes.position.array;
        const edges = new THREE.Group(); //그룹을 생성한다
        for (let i = 0; i < stadiumPositions.length - 3; i += 6) {
            const start = new THREE.Vector3(stadiumPositions[i], stadiumPositions[i + 1], stadiumPositions[i + 2]);
            const end = new THREE.Vector3(stadiumPositions[i + 3], stadiumPositions[i + 4], stadiumPositions[i + 5]);
        
            const cylinderGeometry = new THREE.CylinderGeometry(edgeThickness, edgeThickness, start.distanceTo(end), 8); // 8각형으로 원통 구성
            const edge = new THREE.Mesh(cylinderGeometry, edgesMaterial);
        
            const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            edge.position.copy(midPoint);
        
            edge.lookAt(end);
            edge.rotateX(Math.PI / 2);
        
            edges.add(edge);
        }
        this._scene.add(edges);

        //stadium BoundingBox
        this._stadium.geometry.computeBoundingBox();
        this._stadium.boundingBox = new THREE.Box3().setFromObject(this._stadium);
        //Mesh: 패널
        
        
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

    collision() {
        // if (!this._ballBoundingBox || !this._stadium.boundingBox) {
        //     return false;
        // }
        return this._stadium.boundingBox.intersectsBox(this._ballBoundingBox);
    }

    getCollisionPoint(obj1, obj2) {
        const direction = new THREE.Vector3();
        direction.subVectors(obj2.position, obj1.position).normalize();

        const raycaster = new THREE.Raycaster(obj1.position, direction);
        const intersects = raycaster.intersectObject(obj2, true);

        if (intersects.length > 0) {
            return intersects[0].point;
        }
        return null;
    }

    reflection() {

    }

    update(time) { // TODO: 앞으로 동작에 대해서 함수를 들어서 정의해야함
        if (this._ball) {
            this._ball.rotation.y += 0.02;
            // if (this.collision()) {
            //     const collisionPoint = this.getCollisionPoint(this._stadium, this._ball);
            //     console.log('Collision detected at:', collisionPoint);
            //     this._flag *= -1;
            // }
            // // if (this._ball.position.z > 49 || this._ball.position.z < -49) {
            //     this._flag *= -1;
            // }
            // this._ball.position.z += 0.4 * this._flag;
            // this._perspectiveLineEdges.position.z += 0.4 * this._flag;
        }
    }
}

window.onload = function() {
    new pongGame();
}
