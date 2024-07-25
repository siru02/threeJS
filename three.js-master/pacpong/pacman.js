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
        this._vec = new THREE.Vector3(0.5, 0.9, 5); //공의 방향벡터 //0.5일때 터짐
        this._angularVec = new THREE.Vector3(0.01, 0.01, 0.01); //공의 각속도 회전 벡터
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
            width / height,
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
        
            // Ball의 BoundingBox 설정 및 크기 계산
            let box = new THREE.Box3().setFromObject(this._ball);
            let size = new THREE.Vector3();
            box.getSize(size);
            this._radius = 2;
        
            console.log('Ball size:', size);
        
            this._ball.traverse((child) => {
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

        // BoxGeometry의 6개 면 정의
        this._planes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), this._stadium.geometry.parameters.width / 2),  // Left
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), this._stadium.geometry.parameters.width / 2), // Right
            new THREE.Plane(new THREE.Vector3(0, 1, 0), this._stadium.geometry.parameters.height / 2), // Bottom
            new THREE.Plane(new THREE.Vector3(0, -1, 0), this._stadium.geometry.parameters.height / 2), // Top
            new THREE.Plane(new THREE.Vector3(0, 0, 1), this._stadium.geometry.parameters.depth / 2),  // Front
            new THREE.Plane(new THREE.Vector3(0, 0, -1), this._stadium.geometry.parameters.depth / 2)  // Back
        ];

        //stadium BoundingBox
        this._stadium.geometry.computeBoundingBox();
        this._stadium.boundingBox = new THREE.Box3().setFromObject(this._stadium);

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

        //Mesh: 패널
        const panelGeomtery = new THREE.PlaneGeometry(4, 4);
        const panelMaterial = new THREE.MeshBasicMaterial({ color: 0x1e30f5 });
        const panel1 = new THREE.Mesh(panelGeomtery, panelMaterial);
        panel1.position.set(0, 0, 50);
        const panel2 = new THREE.Mesh(panelGeomtery, panelMaterial);
        panel2.position.set(0, 0, -50);

        
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
        for (const plane of this._planes){
            const collisionPoint = this.getCollisionPointWithPlane(plane);
            if (collisionPoint) {
                console.log("collision plane");
                console.log(plane.normal); //정상출력
                console.log(this._vec); //정상출력
                console.log('Collision detected at:', collisionPoint);
                this._ball.position.copy(collisionPoint);
                this._ball.position.add(plane.normal.clone().multiplyScalar(this._radius));
                return plane;
            }
        }
        return null;
    }

    getCollisionPointWithPlane(plane) {
        const ballCenter = this._ball.position;
        const ballRadius = this._radius;

        const distanceToPlane = plane.distanceToPoint(ballCenter);

        if (Math.abs(distanceToPlane) <= ballRadius) {
            const collisionPoint = ballCenter.clone().sub(plane.normal.clone().multiplyScalar(distanceToPlane));
            return collisionPoint;
        }
        return null;
    }

    updateAngularVelocity(plane, radius) {
        const n = plane.normal.clone();
        const v = this._vec.clone();
        const w = this._angularVec.clone();
    
        // 충돌 전 회전 속도 영향 계산
        const v_r = w.clone().cross(n.clone().multiplyScalar(radius));
        console.log("Surface Velocity (v_r):", v_r);
    
        // 충돌 후 반사 벡터 계산
        const dotProduct = v.dot(n);
        const reflection = n.clone().multiplyScalar(dotProduct * 2);
        const v_prime = v.clone().sub(reflection);
        console.log("Reflection Vector (v'):", v_prime);
    
        // 충돌 전후의 속도 변화 (가정: v' - v)
        const delta_v = v_prime.clone().sub(v);
        console.log("Velocity Change (Δv):", delta_v);
    
        // 충격력 계산 (f = Δv)
        const F = delta_v.clone(); // timeStep 없이 단순한 변화량으로 충격력 추정
        console.log("Impact Force (F):", F);
    
        // 충격 모멘트 계산 (τ = r × F)
        const r = n.clone().multiplyScalar(radius);
        const tau = r.clone().cross(F);
        console.log("Torque (τ):", tau);
    
        // 구의 관성 모멘트 텐서 (단순화된 구의 경우)
        const I = new THREE.Matrix3().set(
            0.4 * radius * radius, 0, 0,
            0, 0.4 * radius * radius, 0,
            0, 0, 0.4 * radius * radius
        );
        // 관성 모멘트 텐서의 역행렬 계산
        const I_inv = new THREE.Matrix3().set(
            1 / (0.4 * radius * radius), 0, 0,
            0, 1 / (0.4 * radius * radius), 0,
            0, 0, 1 / (0.4 * radius * radius)
        );
    
        // 각속도 변화 계산 (Δω = I^(-1) * τ)
        const delta_w = tau.applyMatrix3(I_inv);
        console.log("Angular Velocity Change (Δω):", delta_w);
    
        // 최종 각속도 벡터 계산 (ω' = ω + Δω)
        const w_prime = w.clone().add(delta_w);
        console.log("Final Angular Velocity (ω'):", w_prime);
    
        // 각속도 벡터 업데이트
        this._angularVec.copy(w_prime);
    }

    updateVector(plane) {
        // ball의 방향벡터
        const dotProduct = this._vec.dot(plane.normal);
        console.log("Dot Product:", dotProduct);

        const reflection = plane.normal.clone().multiplyScalar(dotProduct * 2);
        console.log("Reflection:", reflection);

        const angularComponent = this._angularVec.clone().cross(plane.normal.clone().multiplyScalar(this._radius));
        console.log("angularComponent:", angularComponent);

        this._vec.sub(reflection).add(angularComponent);

        // ball의 각속도 벡터
        this.updateAngularVelocity(plane, this._radius);
    }

    update(time) { // TODO: 앞으로 동작에 대해서 함수를 들어서 정의해야함
        if (this._ball) {

            // 공의 이동 업데이트를 작은 시간 간격으로 나누어 수행
            const steps = 10; // 충돌 체크 빈도
            for (let i = 0; i < steps; i++) {
                const movement = new THREE.Vector3().copy(this._vec).multiplyScalar(0.4 / steps);
                this._ball.position.add(movement);
                this._ball.rotation.x += this._angularVec.x;
                this._ball.rotation.y += this._angularVec.y;
                this._ball.rotation.z += this._angularVec.z;

                // 충돌 감지 및 처리
                const collisionPlane = this.collision();
                if (collisionPlane) {
                    console.log("collision plane return");
                    console.log(collisionPlane.normal);
                    this.updateVector(collisionPlane);
                    
                    break; // 충돌이 발생하면 반복문을 중지합니다.
                }
            }
            // if (this._ball.position.z > 49 || this._ball.position.z < -49){
            //     this._vec.z *= -1;
            // }
            this._perspectiveLineEdges.position.z = this._ball.position.z;
        }
    }
}


window.onload = function() {
    new pongGame();
}
