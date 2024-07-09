import * as THREE from "../build/THREE.module.js";

class App {
	constructor() {
		const divContainer = document.querySelector("#webgl-container");
		this._divContainer = divContainer; //다른 메소드에서 참조하게 하기 위해서 this의 변수로 설정

		const renderer = new THREE.WebGLRenderer({antialias: true});
//renderer라는 변수는 화면에 찍어줄 모양의 정보를 담고있는 객체
//antialias를 활성화시켜주면 3차원장면이 렌더링될 때 오브젝트들의 경계선이 계단없이 부드럽게 표현됨
		
		renderer.setPixelRatio(window.devicePixelRatio); //pixel비율설정
		divContainer.appendChild(renderer.domElement);
		//domElement란 DOM구조내의 개별 요소를 가리키는 용어
		this._renderer = renderer;
		console.dir(this._renderer); //WebGLRenderer라는 dom객체
		console.dir(renderer.domElement); //canvas를 가리킴 
		//WebGL객체가 생성되면 내부적으로 canvas를 생성함
		console.dir(renderer); //this._renderer와 같다

		const scene = new THREE.Scene();
		this._scene = scene;

		this._setupCamera(); //카메라 객체 설정
		this._setupLight(); //광원을 설정
		this._setupModel(); //3차원 모델을 설정

		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}
}

window.onload = function () {
//window.onload는 웹 페이지가 모두 로드된 후 실행될 함수를 지정하는 이벤트 핸들러이다
	new App();
}