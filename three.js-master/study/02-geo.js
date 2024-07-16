import * as THREE from '../build/three.module.js';
import { OrbitControls } from "../examples/jsm/controls/OrbitControls.js"

class App {
	constructor() {
		const divContainer = document.querySelector("#webgl-container");
		this._divContainer = divContainer; //다른 메소드에서 참조하게 하기 위해서 this의 변수로 설정

		const renderer = new THREE.WebGLRenderer({antialias: true});
//renderer라는 변수는 화면에 찍어줄 모양의 정보를 담고있는 객체
//antialias를 활성화시켜주면 3차원장면이 렌더링될 때 오브젝트들의 경계선이 계단없이 부드럽게 표현됨
		
		renderer.setPixelRatio(window.devicePixelRatio); //pixel비율설정
		divContainer.appendChild(renderer.domElement); //div속성 내에 렌더링속성을 추가해서 canvas를 추가한다
		//domElement란 DOM구조내의 개별 요소를 가리키는 용어
		//renderer의 domElement는 canvas이다
		this._renderer = renderer;
		console.dir(this._renderer); //WebGLRenderer라는 dom객체
		console.dir(renderer.domElement); //canvas를 가리킴 
		//WebGL객체가 생성되면 내부적으로 canvas를 생성함
		console.dir(renderer); //this._renderer와 같다

		const scene = new THREE.Scene();//scene객체를 생성한다
		//scene객체는 THREE안의 생성자를 가져와서 호출
		this._scene = scene;

		this._setupCamera(); //카메라 객체 설정
		this._setupLight(); //광원을 설정
		this._setupModel(); //3차원 모델을 설정
		this._setupControls();

		window.onresize = this.resize.bind(this);
		//화면의 크기가 resize되는 이벤트에서 객체의 resize되는 함수를 바인드
		//bind로 넘겨주는 이유는 resize함수 안에서 this가 가리키는 객체가 event객체가 아닌 App클래스를 가리키도록 하기 위해서
		this.resize(); //현재창크기에 맞게 카메라, 광원, 렌더러를 설정

		requestAnimationFrame(this.render.bind(this)); //여기서 콜백함수로 this.render가 넘어가므로 콜백함수가 호출되면서 렌더링이 실행된다
		//render메소드는 3차원 그래픽을 만들어주는 메소드
		//bind로 넘겨주는 이유는 render method의 코드 안에서 사용되는 this가 app클래스의 객체를 가르키게 하기 위해서
		//request~~함수에 넘기면 프레임최적화가 된다
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

	_setupModel() { //모델을 정의하는 메소드이며 이번에 만들것은 정육면체
		const geometry = new THREE.PlaneGeometry(); //가로 세로 깊이에 대한 값을 받음
		const material = new THREE.MeshPhongMaterial({color: 0x44a88});//재질의 색을 설정
		const cube = new THREE.Mesh(geometry, material);//실제 객체 생성

		const lineMaterial = new THREE.LineBasicMaterial({color: 0xffff00});
		const line = new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry), lineMaterial
			);
		
		const group = new THREE.Group();
		group.add(cube);
		group.add(line);


		this._scene.add(group); //화면의 구성요소로 추가된다
		this._cube = group;
	}

	// _setupModel() {
	// 	const shape = new THREE.Shape();
	// 	shape.moveTo(1, 1);
	// 	shape.lineTo(1, -1);
	// 	shape.lineTo(-1, -1);
	// 	shape.lineTo(-1, 1);
	// 	shape.closePath();

	// 	const geometry = new THREE.BufferGeometry();
	// 	const points = shape.getPoints();
	// 	geometry.setFromPoints(points);

	// 	const material = new THREE.LineBasicMaterial({color: 0xffff00});
	// 	const line = new THREE.Line(geometry, material);

	// 	this._scene.add(line);
	// }

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

		//x, y의 회전값에 시간값을 넣으면 x,y축으로 큐브가 회전하게된다
		// this._cube.rotation.x = time;
		// this._cube.rotation.y = time;
	}
}

//클래스만 정의했음


window.onload = function () {
//window.onload는 웹 페이지가 모두 로드된 후 실행될 함수를 지정하는 이벤트 핸들러이다
	new App(); //App객체를 생성한다
}