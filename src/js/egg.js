/* global jQuery:false*, requestAnimationFrame:false, THREE:false */
/**
 * @fileOverview egg
 *
 * @author y-minami
 * @version 1.1
 * @require jQuery
 */
(function (_window, _document, $, THREE) {
	"use strict";

	THREE.Object3D._matrixAux = new THREE.Matrix4();
	THREE.Object3D.prototype.rotateAroundWorldAxis = function(axis, radians) {
		THREE.Object3D._matrixAux.makeRotationAxis(axis, radians);
		this.matrix.multiplyMatrices(THREE.Object3D._matrixAux,this.matrix); // r56
		THREE.Object3D._matrixAux.extractRotation(this.matrix);
		this.rotation.setEulerFromRotationMatrix(THREE.Object3D._matrixAux, this.eulerOrder );
		this.position.getPositionFromMatrix( this.matrix );
	};
	THREE.Object3D.prototype.rotateAroundWorldAxisX = function(radians) {
		this._vector.set(1,0,0);
		this.rotateAroundWorldAxis(this._vector,radians);
	};
	THREE.Object3D.prototype.rotateAroundWorldAxisY = function(radians) {
		this._vector.set(0,1,0);
		this.rotateAroundWorldAxis(this._vector,radians);
	};
	THREE.Object3D.prototype. rotateAroundWorldAxisZ = function(degrees){
		this._vector.set(0,0,1);
		this.rotateAroundWorldAxis(this._vector,degrees);
	};

	var Egg = function Egg() {

		this.renderer = null;
		this.camera  = null;

		this.init = function () {

			var that = this;

			// レンダラーの定義
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize(_window.innerWidth, _window.innerHeight);

			// 影を有効にする
			this.renderer.shadowMapEnabled = true;

			// **#canvas-frame** にWegGLを描く
			_document.getElementById('canvas-frame').appendChild(this.renderer.domElement);

			// カメラの定義

			// 視野角
			var VIEW_ANGLE = 60;

			// アスペクト比
			var ASPECT = window.innerWidth / window.innerHeight;

			// 映る一番近い距離
			var NEAR = 0.1;

			// 映る一番遠い距離
			var FAR = 10000;

			// パースペクティブカメラ 標準的なカメラ
			this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

			// カメラの位置ベクトルの設定
			this.camera.position = new THREE.Vector3(170, 0, 10);
			// カメラの上ベクトルの設定
			this.camera.up = new THREE.Vector3(1, 0, 1);


			// シーンの初期化
			this.scene = new THREE.Scene();
			this.scene.add(this.camera);

			// 地面のマテリアル
			var groundMaterial = new THREE.MeshPhongMaterial({
				//ambient: 0x888888,
				color: 0xFFFFFF,
				specular: 0xFFFFFF,
				shininess: 1000,
				shading: THREE.SmoothShading
//					color: 0xFFB071,
//					side: THREE.DoubleSide,
//					wireframe: false

			});

			// 地面の形状、平面
			var groundGeometry = new THREE.PlaneGeometry(10000, 100000, 200, 200);

			// 地面の生成
			this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
			this.ground.position.z = -40;

			// 影が映るように設定
			this.ground.receiveShadow = true;
			this.scene.add(this.ground);

			// 卵型の座標
			var eggPoints = [];

			// 卵の高さ
			var eggHeight = 40;

			// 角度のパラメータと格納ベクトル
			var theta, vector;

			// 卵型ライン用のジオメトリ
			var lineGeometry = new THREE.Geometry();

			// 卵型の座標を格納する
			for (var i=0; i <= 180; i++) {
				theta = Math.PI * i / 180;
				vector = new THREE.Vector3(
					0,
					eggHeight * ((0.72 + 0.08 * Math.cos(theta)) * Math.sin(theta)),
					-eggHeight * Math.cos(theta)
				);
				eggPoints.push(vector);
				lineGeometry.vertices.push(vector);
			}

			// ラインのスタイルの設定
			var lineMaterial = new THREE.LineBasicMaterial({
				color: 0xFFB071,
				linewidth: 3
			});

			// 卵型ラインの生成
			this.eggLine = new THREE.Line(lineGeometry, lineMaterial, THREE.LineStrip);
			//this.scene.add(this.eggLine);
			this.eggGeometry = new THREE.LatheGeometry(eggPoints, 100);
			this.eggMaterial = new THREE.MeshPhongMaterial({
					//ambient: 0x888888,
					color: 0xFFB071,
					//specular: 0xFFB071,
					shininess: 1,
					map: THREE.ImageUtils.loadTexture('img/egg.jpg'),
					shading: THREE.SmoothShading,
					//wireframe: true
				});

			// 卵オブジェクトの生成
			this.egg = new THREE.Mesh(this.eggGeometry, this.eggMaterial);
			this.egg.castShadow = true;
			this.scene.add(this.egg);

//			this.text = new THREE.TextGeometry('EGG', {
//				size: 14,
//				height: 20,
//				font: 'Helvetiker',
//				bevelEnabled: true
//			});
//			this.scene.add(this.text);

			// 卵型の点集合
			this.dotsPoints = new THREE.Object3D();
			var dpMaterial = new THREE.MeshBasicMaterial({
				color: 0xffffff, transparent: false
			});
			this.scene.add(this.dotsPoints)

			var ind = 0

			// 点の集合で卵型曲線を描く
			this.drawEggPoint = function () {
				if (ind % 5 === 0) {
					var pointGeometry = new THREE.SphereGeometry(0.5);
					var pointMesh = new THREE.Mesh(pointGeometry, dpMaterial);
					pointMesh.position = eggPoints[ind];
					that.dotsPoints.add(pointMesh);
					that.renderer.render(that.scene, that.camera);
				}
				ind++;
				if(ind <= 180){
					requestAnimationFrame(that.drawEggPoint);
				}
			}

			var ind2 = 0; var speed = 0;
			this.spinCurve = function () {
					that.dotsPoints.rotateZ(speed);
					that.renderer.render(that.scene, that.camera);
				ind2++
				if(speed < 1) speed += 0.001;
				//if(ind2 <= 360){
					requestAnimationFrame(that.spinCurve);
				//}
			}

			// ポイントライト　点光源の照明
			var pointLight = new THREE.PointLight(0xFFFFFF);
			pointLight.position.set(700, 700, 700);
			pointLight.shadowCameraVisible = true;
			pointLight.castShadow = true;
			this.scene.add(pointLight);

			// スポットライト
			var spotLight = new THREE.SpotLight(0xFFFFFF);
			spotLight.position.set( 700, 700, 700 );
			spotLight.target.position.set( 0, 0, 0 );
			spotLight.shadowCameraVisible = true;
			spotLight.castShadow = true;
			//this.scene.add(spotLight);

			// アンビエントライト 全体を照らす照明
			var light = new THREE.AmbientLight( 0x202020 ); // soft white light
			this.scene.add( light );

			// ディレクショナルライト 指向性光源
			var dlight = new THREE.DirectionalLight(0x404040);
			dlight.position.set(1,-1, 1).normalize();
			dlight.shadowCameraVisible = true;
			dlight.castShadow = true;
			//this.scene.add( dlight );


			var dlight2 = new THREE.DirectionalLight(0x404040);
			dlight2.position.set(1,1, 1).normalize();
			dlight2.shadowCameraVisible = true;
			dlight2.castShadow = true;
			//this.scene.add( dlight2 );


			var controls = new THREE.TrackballControls( this.camera );
			controls.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];
			controls.noRotate = false; //trueで回転操作を不可にする
			controls.noZoom = false; //trueでズーム操作を不可にする
			controls.noPan = false; //trueでパンの操作を不可にする

			this.renderer.render(this.scene, this.camera);

			var c = 0;

			function drawEggPoint() {


				that.renderer.render(that.scene, that.camera);
				requestAnimationFrame(drawEggPoint);
			}

			function render() {

				//eggMesh.position.x = 120 * Math.sin (++c / 30) + 75;
				//eggMesh.position.y = 120 * Math.sin (++c / 30) + 75;
				that.egg.position.z = 0;

				controls.update();
				that.renderer.render(that.scene, that.camera);
				requestAnimationFrame(render);
			}

			render();
		}


	};


	Egg.prototype = {



	};

	if (typeof _window.jp === 'undefined') {
		_window.jp = {};
	}

	if (typeof _window.jp.mi73 === 'undefined') {
		_window.jp.mi73 = {};
	}

	_window.jp.mi73.Egg = new Egg();

})(window, document, jQuery, THREE);

window.jp.mi73.Egg.init();
var e = window.jp.mi73.Egg;