import * as THREE from '../build/three.module.js';

class App {
	constructor() {
		const divContainer = document.querySelector("#webgl-container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({antialias: true});

		
		renderer.setPixelRatio(window.devicePixelRatio);
		divContainer.appendChild(renderer.domElement);
	
		this._renderer = renderer;
		console.dir(this._renderer);
		console.dir(renderer.domElement);

		console.dir(renderer);

		const scene = new THREE.Scene();
		this._scene = scene;

		this._setupCamera(); 
		this._setupLight(); 
		this._setupModel();

		window.onresize = this.resize.bind(this);
		this.resize(); 

		requestAnimationFrame(this.render.bind(this)); //여기서 콜백함수로 this.render가 넘어가므로 콜백함수가 호출되면서 렌더링이 실행된다

	}
	//여기까지 생성자

	_setupCamera() {
		const width = this._divContainer.clientWidth;//3차원 가로
		const heigth = this._divContainer.clientWidth;//3차원 세로
		const camera = new THREE.PerspectiveCamera(
			75,
			width / heigth,
			0.1,
			100
		); 
		camera.position.z = 24;
		this._camera = camera; 
	}

	_setupLight(){
		const color = 0xffffff; 
		const intensity = 1; 
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		this._scene.add(light);
	}

	_setupModel() {
		const solarSystem = new THREE.Object3D();
		this._scene.add(solarSystem);

		const radius = 1;
		const widthSegments = 12;
		const heightSegments = 12;
		const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

		const sunMaterial = new THREE.MeshPhongMaterial({
			emissive: 0xffff00, flatShading: true
		});

		const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
		sunMesh.scale.set(3, 3, 3);
		solarSystem.add(sunMesh);
		//solar system을 scene에 추가
		//sun 만들기

		const earthOrbit = new THREE.Object3D();
		solarSystem.add(earthOrbit);

		const earthMaterial = new THREE.MeshPhongMaterial({
			color: 0x2233ff, emissive: 0x112244, flatShading: true
		});

		const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
		earthOrbit.position.x = 10;
		earthOrbit.add(earthMesh);
		//earth제작

		const moonOrbit = new THREE.Object3D();
		moonOrbit.position.x = 2;
		earthOrbit.add(moonOrbit);

		const moonMaterial = new THREE.MeshPhongMaterial({
			color: 0x888888, emissive: 0x222222, flatShading: true
		});

		const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
		moonMesh.scale.set(0.5, 0.5, 0.5);
		moonOrbit.add(moonMesh);

		this._solarSystem = solarSystem;
		this._earthOrbit = earthOrbit;
		this._moonOrbit = moonOrbit;
	}

	resize(){
		const width = this._divContainer.clientWidth;
		const heigth = this._divContainer.clientHeight;

		this._camera.aspect = width / heigth;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, heigth);
	}

	render(time) {
		this._renderer.render(this._scene, this._camera);
		this.update(time);
		requestAnimationFrame(this.render.bind(this));
	}

	update(time) {
		time *= 0.001;

		this._solarSystem.rotation.y = time / 2;
		this._earthOrbit.rotation.y = time * 2;
		this._moonOrbit.rotation.y = time * 6;
	}
}

//클래스만 정의했음


window.onload = function () {
//window.onload는 웹 페이지가 모두 로드된 후 실행될 함수를 지정하는 이벤트 핸들러이다
	new App(); //App객체를 생성한다
}