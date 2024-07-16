import * as THREE from '../build/three.module.js';
import { VertexNormalsHelper} from "../examples/jsm/helpers/VertexNormalsHelper.js"
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js'

class App {
	constructor() {
		const divContainer = document.querySelector("#webgl-container");
		this._divContainer = divContainer; //다른 메소드에서 참조하게 하기 위해서 this의 변수로 설정

		const renderer = new THREE.WebGLRenderer({antialias: true});
		
		renderer.setPixelRatio(window.devicePixelRatio); //pixel비율설정
		divContainer.appendChild(renderer.domElement); //div속성 내에 렌더링속성을 추가해서 canvas를 추가한다
		this._renderer = renderer;
		console.dir(this._renderer); //WebGLRenderer라는 dom객체
		console.dir(renderer.domElement); //canvas를 가리킴 
		console.dir(renderer);

		const scene = new THREE.Scene();//scene객체를 생성한다
		//scene객체는 THREE안의 생성자를 가져와서 호출
		this._scene = scene;

		this._setupCamera(); //카메라 객체 설정
		this._setupLight(); //광원을 설정
		this._setupModel(); //3차원 모델을 설정
		this._setupControls();

		window.onresize = this.resize.bind(this);

		this.resize(); //현재창크기에 맞게 카메라, 광원, 렌더러를 설정

		requestAnimationFrame(this.render.bind(this)); //여기서 콜백함수로 this.render가 넘어가므로 콜백함수가 호출되면서 렌더링이 실행된다
	}
	//여기까지 생성자

	_setupControls() {
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;//3차원 가로
		const heigth = this._divContainer.clientWidth;//3차원 세로
		const camera = new THREE.PerspectiveCamera(
			75,
			width / heigth,
			0.1,
			100
		); //카메라 객체를 생성
		camera.position.z = 2;
		this._camera = camera; //APP클래스 내의 변수로 지정해줌
	}

	_setupLight(){
		const color = 0xffffff; //광원의 색상
		const intensity = 1; //광원의 세기
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4); //광원의 방향
		this._scene.add(light);
	}

	_setupModel() {
		const rawPositions = [
			-1, -1, 0,
			 1, -1, 0,
			-1,  1, 0,
			 1,  1, 0
		];

		const rawNormals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		]
	
		const rawColors = [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1,
			1, 1, 0
		];

		const rawUVs = [
			0, 0,
			1, 0,
			0, 1,
			1, 1
		];


		const positions = new Float32Array(rawPositions);
		const normals = new Float32Array(rawNormals);
		const colors = new Float32Array(rawColors);
		const uvs = new Float32Array(rawUVs);

		const geometry = new THREE.BufferGeometry();

		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
		geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
		geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

		geometry.setIndex([
			0, 1, 2,
			2, 1, 3
		]);

		//geometry.computeVertexNormals();

		const textureLoader = new THREE.TextureLoader();
		const map = textureLoader.load("../examples/textures/uv_grid_opengl.jpg")


		const material = new THREE.MeshPhongMaterial({ color: 0xffffff ,
			 vertexColors: true,
			 map: map
			});

		const box = new THREE.Mesh(geometry, material);
		this._scene.add(box);

		const helper = new VertexNormalsHelper(box, 0.1, 0xffff00); //노란색의 법선벡터를 생성
		this._scene.add(helper);
	}

	resize(){
		const width = this._divContainer.clientWidth;
		const heigth = this._divContainer.clientHeight;
		//html의 div쪽의 크기를 가져와서 카메라의 속성값을 설정해줌

		this._camera.aspect = width / heigth; //카메라 속성값 설저ㅇ
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, heigth);
	}

	render(time) { //렌더링이 시작된 이후 경과된 밀리초를 받는다
		//렌더러가 scenen을 카메라의 시점을 기준으로 렌더링하는작업을 한다
		this._renderer.render(this._scene, this._camera);
		this.update(time); //시간에 따라 애니메이션 효과를 발생시킨다
		requestAnimationFrame(this.render.bind(this));
		//생성자의 코드와 동일: 계속 렌더 메소드가 무한히 반복되어 호출되도록 만든다
	}

	update(time) {
		time *= 0.001; //ms를 s로 바꿔준다


	}
}

//클래스만 정의했음


window.onload = function () {
//window.onload는 웹 페이지가 모두 로드된 후 실행될 함수를 지정하는 이벤트 핸들러이다
	new App(); //App객체를 생성한다
}