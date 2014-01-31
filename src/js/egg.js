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

    var Egg = function Egg() {

        var easing = 'easeInOutQuart';
        var autoPanTimer;
        var baseTime = +new Date;
        var numParticles = 60000;
        var exploded = false;

        this.init = function () {

            var that = this;

            // レンダラーの定義
            this.renderer = new THREE.WebGLRenderer({antialias: true});
            this.renderer.setSize(_window.innerWidth, _window.innerHeight);
            this.renderer.setClearColorHex(0x000000, 1);

            // 影を有効にする
            this.renderer.shadowMapEnabled = true;

            $(_window).on('resize', function () {
                that.renderer.setSize(_window.innerWidth, _window.innerHeight);
            });

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

            // ウィンドウリサイズ時のフィット
//            $(_window).on('mousemove', function () {
//                clearInterval(autoPanTimer);
//                autoPanTimer = setInterval($.proxy(that.autoPan, that), 5000);
//            });


            // シーンの初期化
            this.scene = new THREE.Scene();
            this.scene.add(this.camera);



            // スポットライト
            var spotLight = new THREE.SpotLight(0xFFFFFF);
            spotLight.position.set(150, 150, 300);
            spotLight.target.position.set(0, 0, 0);
            spotLight.castShadow = true;
            this.scene.add(spotLight);


            // スポットライト
            var spotLight2 = new THREE.SpotLight(0xFFFFFF);
            spotLight2.position.set(100, -150, 300);
            spotLight2.target.position.set(0, 0, 0);
            spotLight2.castShadow = true;
            //this.scene.add(spotLight2);

            // スポットライト
            var spotLight3 = new THREE.SpotLight(0xFFFFFF);
            spotLight3.position.set(150, 500, 300);
            spotLight3.target.position.set(0, 0, 0);
            spotLight3.castShadow = true;
            //this.scene.add(spotLight3);

            // スポットライト
            var spotLight4 = new THREE.SpotLight(0xFFFFFF);
            spotLight4.position.set(100, -500, 300);
            spotLight4.target.position.set(0, 0, 0);
            spotLight4.castShadow = true;
            //this.scene.add(spotLight4);

            // アンビエントライト 全体を照らす照明
            var light = new THREE.AmbientLight(0x101010); // soft white light
            this.scene.add(light);



            // 地面のマテリアル
            var groundMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                specular: 0xFFFFFF,
                shininess: 1000,
                shading: THREE.SmoothShading,
                side: THREE.DoubleSide
            });

            // 地面の形状、平面
            var groundGeometry = new THREE.PlaneGeometry(10000, 100000, 200, 200);

            // 地面の生成
            this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
            this.ground.position.z = -40;
            this.ground.receiveShadow = true;
            this.ground.visible = false;
            this.scene.add(this.ground);




            // 卵型の座標
            this.eggPoints = [];
            // 卵の高さ
            var eggHeight = 40;
            // 角度のパラメータと格納ベクトル
            var theta, vector;

            // 卵型の座標を格納する
            for (var i = 0; i <= 180; i++) {
                theta = Math.PI * i / 180;
                vector = new THREE.Vector3(
                    0,
                    eggHeight * ((0.72 + 0.08 * Math.cos(theta)) * Math.sin(theta)),
                    -eggHeight * Math.cos(theta)
                );
                this.eggPoints.push(vector);
            }

            // 卵
            this.eggGeometry = new THREE.LatheGeometry(this.eggPoints, 100);
            this.eggGeometry.dynamic = true;

            this.eggMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFB071,
                shininess: 50,
                //map: THREE.ImageUtils.loadTexture('img/egg.jpg'), // テクスチャーなしで定義
                shading: THREE.SmoothShading,
                wireframe: true
            });

            // 卵オブジェクトの生成
            this.egg = new THREE.Mesh(this.eggGeometry, this.eggMaterial);
            this.egg.matrixWorldNeedsUpdate = true;
            this.egg.updateMatrixWorld();
            this.egg.position.set(0.1, 0.1, 0.1);
            this.egg.castShadow = true;
            //this.scene.add(this.egg);


            // 卵型の点集合
            this.dotsPoints = new THREE.Object3D();
            var dpMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff, transparent: false
            });

            this.scene.add(this.dotsPoints);




            // バーティクル

            // パーティクルのジオメトリ
            this.particleGeometry = new THREE.Geometry();

             // パーティクルのマテリアルを作成(シンプルな点)
//            this.particleMaterial = new THREE.ParticleBasicMaterial({
//                size: .5,
//                color: 0xFFB071,
//                blending: THREE.AdditiveBlending,
//                transparent: true,
//                depthTest: false
//            });

             // パーティクルのマテリアルを作成(GLSLによるシェーダー)
            this.particleMaterial = new THREE.ShaderMaterial({
                vertexShader: document.getElementById('vshader').textContent,
                fragmentShader: document.getElementById('fshader').textContent,
                uniforms: {
                    time: { type: 'f', value: 0 },
                    size: { type: 'f', value: 0.13 },
                    color: { type: 'c', value: new THREE.Color(0xFFB071) },
                    texture: { type: 't', value: THREE.ImageUtils.loadTexture('img/particle.png') }
                },
                attributes: {
                    lifetime: { type: 'f', value: [] },
                    shift: { type: 'f', value: [] }
                },
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthTest: false
            });

            // パーティクルの座標と速度の初期化
            for (var i = 0; i < numParticles; i++) {

                var theta = Math.random() * 2 * Math.PI;
                var r = eggHeight * ((0.72 + 0.08 * Math.cos(theta)) * Math.sin(theta));
                var angle = Math.random() * Math.PI;
                var particle = new THREE.Vector3(Math.sin(angle) * r, Math.cos(angle) * r, -eggHeight * Math.cos(theta));
                particle.velocity = {
                    x: Math.sin(angle) * r / eggHeight * 5,
                    y: Math.cos(angle) * r / eggHeight * 5,
                    z: -Math.cos(theta) * 5
                };
                this.particleMaterial.attributes.lifetime.value.push(3 + Math.random());
                this.particleMaterial.attributes.shift.value.push(Math.random());
                this.particleGeometry.vertices.push(particle);
            }

            // パーティクルの作成
            this.particleGeometry.verticesNeedUpdate = true;
            this.particle = new THREE.ParticleSystem(this.particleGeometry, this.particleMaterial);
            this.particle.position = new THREE.Vector3(0, 0, 0);
            this.particle.sortParticles = false;
            this.particle.visible = false; // 初期状態は隠れている
            this.scene.add(this.particle);




            // マウスコントロールの追加
            var controls = new THREE.TrackballControls(this.camera);
            controls.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];
            controls.noRotate = false;
            controls.noZoom = false;
            controls.noPan = false;
            this.controls = controls;


            // レンダリングを行う
            function render() {
                requestAnimationFrame(render);

                // for GLSL
                that.particleMaterial.uniforms.time.value = (+new Date - baseTime) / 1000;

                controls.update();
                that.renderer.render(that.scene, that.camera);
            }

            render();


            // 点の集合で卵型曲線を描く
            this.drawEggPoint = function () {
                var ind = 0;
                var animate = function () {
                    if (ind % 5 === 0) {
                        var pointGeometry = new THREE.SphereGeometry(0.5);
                        var pointMesh = new THREE.Mesh(pointGeometry, dpMaterial);
                        pointMesh.position = that.eggPoints[ind];
                        that.dotsPoints.add(pointMesh);
                        that.renderer.render(that.scene, that.camera);
                    }
                    ind++;
                    if (ind <= 180) {
                        requestAnimationFrame(animate);
                    }
                }
                animate();
            };

            // 点の集合による卵型曲線を回転させる
            this.spinCurve = function () {

                var ind2 = 0;
                var speed = 0;
                var animate = function () {
                    if (that.dotsPoints) {
                        that.dotsPoints.rotateZ(speed);
                        that.renderer.render(that.scene, that.camera);
                        ind2++;
                        speed += 0.001;
                        requestAnimationFrame(animate);
                    }
                }
                animate();
            };

            // ランダムな位置にカメラをアニメーションさせる(爆発後は遠くまで行う)
            this.autoPan = function () {
                var distance = exploded ? Math.random() * 1200 : Math.random() * 200 + 200;
                var angle = Math.random() * Math.PI * 2;
                var height = exploded ? Math.random() * 500 - 60 : Math.random() * 200 - 40;
                this.panTo({
                    x: distance * Math.sin(angle),
                    y: distance * Math.cos(angle),
                    z: height
                });
            };

            // 特定のポジションにカメラをアニメーションさせる
            this.panTo = function (position) {

                var that = this;
                var count = 0;
                var step = 200;
                var easing = 'easeOutQuart';
                var val;
                var from = {
                    x: this.camera.position.x,
                    y: this.camera.position.y,
                    z: this.camera.position.z
                };

                var animate = function () {
                    count++;
                    val = $.easing[easing](0, count, 0, 1, step);
                    that.camera.position = new THREE.Vector3(from.x * (1 - val) + position.x * val, from.y * (1 - val) + position.y * val, from.z * (1 - val) + position.z * val);
                    that.camera.up = new THREE.Vector3(0, 0, 10000);
                    if (count < step) {
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            };

            // 点の回転体の数を増やす
            this.addEggPoints = function () {
                var r;
                var t;
                var theta;
                var pointGeometry = new THREE.SphereGeometry(0.5);
                var pointMesh = new THREE.Mesh(pointGeometry, dpMaterial);
                // 卵型の座標を格納する
                for (var j = 1; j < 6; j++) {
                    for (var i = 0; i <= 180; i++) {
                        if (i % 5 === 0) {
                            t = j / 6 * 2 * Math.PI;
                            theta = Math.PI * i / 180;
                            r = eggHeight * ((0.72 + 0.08 * Math.cos(theta)) * Math.sin(theta));

                            pointMesh = new THREE.Mesh(pointGeometry, dpMaterial);
                            vector = new THREE.Vector3(r * Math.sin(t), r * Math.cos(t), -eggHeight * Math.cos(theta));
                            pointMesh.position = vector;
                            that.dotsPoints.add(pointMesh);
                            that.renderer.render(that.scene, that.camera);
                        }
                    }
                }
            };



            // 点の回転体を隠す
            this.fallOutPoints = function () {
                var z = 0;
                var t = 0
                var step = 100;
                var animate = function () {
                    var val = $.easing[easing](0, t, 0, 4000, step);
                    if (t !== step) {
                        requestAnimationFrame(animate);
                        that.dotsPoints.position.z = -val;
                        t++;
                    } else {
                        finalize();
                    }

                };
                var finalize = function () {
                    that.scene.remove(that.dotsPoints);
                    delete that.dotsPoints;
                }
                if (that.dotsPoints) {
                    animate();
                }
            };

            // ワイヤーの粒度を細かくしていく
            this.animateEggWire = function () {
                var index = 2;
                var dest = 100;
                var animate = function () {
                    that.showEggWire(index);
                    index *= 2;
                    if (index <= dest) setTimeout($.proxy(animate, this), 300);
                };
                animate();
            };

            // ワイヤーを粒度指定で出現させる
            this.showEggWire = function (num) {
                that.scene.remove(that.egg);
                delete that.egg;

                that.eggGeometry = new THREE.LatheGeometry(that.eggPoints, num);

                that.egg = new THREE.Mesh(that.eggGeometry, that.eggMaterial);

                that.egg.matrixWorldNeedsUpdate = true;
                that.egg.updateMatrixWorld();
                that.egg.position.set(0, 0, 0);
                that.egg.castShadow = true;
                that.scene.add(that.egg);
            };

            this.offWireframe = function () {
                that.egg.material.wireframe = false;
            };

            this.applyMap = function () {
                that.scene.remove(that.egg);
                delete that.egg;
                delete that.eggGeometry;
                delete that.eggMaterial;
                that.eggGeometry = new THREE.LatheGeometry(that.eggPoints, 100);

                that.eggMaterial = new THREE.MeshPhongMaterial({
                    color: 0xFFB071,
                    shininess: 50,
                    map: THREE.ImageUtils.loadTexture('img/egg.jpg'),
                    shading: THREE.SmoothShading
                });
                that.egg = new THREE.Mesh(that.eggGeometry, that.eggMaterial);

                that.egg.castShadow = true;
                that.scene.add(that.egg);
            };

            // 出現済みの卵を爆発させる
            this.explode = function () {
                var animate = function () {
                    var count = that.particleGeometry.vertices.length;
                    while (count--) {
                        var particle = that.particleGeometry.vertices[count];
                        particle.x += particle.velocity.x;
                        particle.y += particle.velocity.y;
                        particle.velocity.z -= 0.1;
                        particle.z += particle.velocity.z;
                        if (particle.z <= -39) {
                            particle.velocity.x *= 0.9;
                            particle.velocity.y *= 0.9;
                            particle.velocity.z = -particle.velocity.z * 0.7;
                            particle.z = -39;
                        }
                        that.ground.position.z -= 10;
                    }
                    that.particleGeometry.verticesNeedUpdate = true;

                    requestAnimationFrame(animate);
                }
                that.particle.visible = true;
                that.egg.visible = false;
                exploded = true;
                animate();
            };

            // 隠してある地面をアニメーションさせながら出現させる
            this.appearGround = function () {

                var count = 0;
                var step = 250;
                var easing = 'easeOutQuart';

                var animate = function () {

                    var val = $.easing[easing](0, count, 0, 1, step);
                    that.ground.position.z = -4000 + 3960 * val;
                    count++;
                    if (count !== step) {
                        requestAnimationFrame(animate);
                    } else {
                        that.ground.position.z = -40;
                    }
                };
                that.ground.position.z = -4000;
                that.ground.visible = true;
                animate();
            };

            // 出現済みの卵を揺らす
            this.move = function () {
                var count = 0;
                var animate = function () {
                    var val = 15 * count / 300;
                    that.egg.rotation.x = 0.1 * Math.sin(Math.PI * val);
                    that.egg.position.y = -5 * Math.sin(Math.PI * val)
                    count++;
                    if (count <= 300) {
                        requestAnimationFrame(animate);
                    }
                }
                animate();
            };

            // 出現済みの卵をジャンプさせる
            this.jump = function () {
                var speed = 20;
                var base = 0;
                var animate = function () {
                    base = base + speed;
                    if (base <= 0) {
                        speed = -speed * .7;
                        base = 0;
                    }
                    that.egg.position.z = base;
                    speed -= 0.5;
                    that.renderer.render(that.scene, that.camera);
                    requestAnimationFrame(animate);
                }
                animate();

            };

            this.startAutoPan = function () {        
                // ウィンドウリサイズ時のフィット
               $(_window).on('mousemove', function () {
                   clearInterval(autoPanTimer);
                   autoPanTimer = setInterval($.proxy(that.autoPan, that), 5000);
               });
            }

            // ダンスの小節
            this.bar = 0;

            // ダンスフラグ
            this.dancing = true;

            // ダンスをする
            this.startDancing= function () {
                that.dancing = true;
                that.dance();
            };
            
            // ダンスを止める
            this.stopDancing = function () {
                that.dancing = false;
            }

            // ダンス用の関数
            this.dance = function () {
                var step = 0;
                var bpm = 160;
                var fbb = 3600 / bpm;//framesByBeat
                var count = 0;

                var tmp1 = 0, tmp2 = 0, tmp3;

                var allow = 100
                var ig_f = that.egg.position.x > allow;
                var ig_b = that.egg.position.x < -allow;
                var ig_l = that.egg.position.y > allow;
                var ig_r = that.egg.position.y < -allow;


                var jump = function () {

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + 225) / 8;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(jump);
                    }
                };
                var jumpFront = function () {

                    if(step===0 && ig_f) {

                        console.log('ig_f');
                        return requestAnimationFrame(jumpBack);
                    }

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + 225) / 8;
                    that.egg.position.x += 1;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(jumpFront);
                    }
                };
                var jumpBack = function () {
                    
                    if(step===0 && ig_b) {
                        console.log('ig_b');
                        return requestAnimationFrame(jumpFront);
                    }

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + 225) / 8;
                    that.egg.position.x += 1;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(jumpBack);
                    }
                };
                var jumpLeft = function () {
                    
                    if(step===0 && ig_l) {
                        console.log('ig_l');
                        return requestAnimationFrame(jumpRight);
                    }

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + 225) / 8;
                    that.egg.position.y += 1;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(jumpLeft);
                    }
                };
                var jumpRight = function () {
                    
                    if(step===0 && ig_r) {

                        console.log('ig_r');
                        return requestAnimationFrame(jumpLeft);
                    }

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + 225) / 8;
                    that.egg.position.y -= 1;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(jumpRight);
                    }
                };
                var walkFront = function () {

                    
                    if(step===0 && that.egg.position.x < -allow) {
                        console.log('ignore');
                        
                        return requestAnimationFrame(walkBack);
                    }

                    var val = Math.sin(2 * Math.PI * step / fbb); // 0 1 0 -1 0

                    that.egg.position.z =  Math.abs(val) * 6;
                    that.egg.rotation.x = -val / 5;
                    that.egg.position.x -= 1;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(walkFront);
                    }
                }
                var walkBack = function () {
                    
                    if(step===0 && that.egg.position.x > allow) {
                        console.log('ignore');
                        return requestAnimationFrame(walkFront);
                    }

                    var val = Math.sin(2 * Math.PI * step / fbb); // 0 1 0 -1 0

                    that.egg.position.z =  Math.abs(val) * 6;
                    that.egg.rotation.x = val / 5;
                    that.egg.position.x += 1;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(walkBack);
                    }
                }
                var walkLeft = function () {
                    
                    if(step===0 && that.egg.position.y > allow) {
                        console.log('ignore');
                        return requestAnimationFrame(walkRight);
                    }

                    var val = Math.sin(2 * Math.PI * step / fbb); // 0 1 0 -1 0

                    that.egg.position.z =  Math.abs(val) * 6;
                    that.egg.rotation.y = val / 5;
                    that.egg.position.y += 1;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(walkLeft);
                    }
                }
                var walkRight = function () {
                    
                    if(step===0 && that.egg.position.y < -allow) {
                        console.log('ignore');
                        return requestAnimationFrame(walkLeft);
                    }

                    var val = Math.sin(2 * Math.PI * step / fbb); // 0 1 0 -1 0

                    that.egg.position.z =  Math.abs(val) * 6;
                    that.egg.rotation.y= val / 5;
                    that.egg.position.y -= 1;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(walkRight);
                    }
                }


                var slideLeft = function () {
                    
                    if(step===0 && that.egg.position.y > allow) {
                        console.log('ignore');
                        return requestAnimationFrame(slideRight);
                    }

                    var val = $.easing['easeOutQuart'](0, step, 0, 50, fbb);
                    that.egg.position.z = 0;
                    that.egg.position.y += val - tmp1;
                    that.egg.rotation.x = val - tmp1;
                    tmp1 = val;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(slideLeft);
                    }
                };
                var slideRight = function () {
                    
                    if(step===0 && that.egg.position.y < -allow) {
                        console.log('ignore');
                        return requestAnimationFrame(slideLeft);
                    }

                    var val = $.easing['easeOutQuart'](0, step, 0, 50, fbb);
                    that.egg.position.z = 0;
                    that.egg.position.y -= val - tmp1;
                    that.egg.rotation.x = - val + tmp1;
                    tmp1 = val;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(slideRight);
                    }
                };


                var slideFront = function () {
                    
                    if(step===0 && that.egg.position.x < -allow) {
                        return requestAnimationFrame(slideBack);
                    }

                    var val = $.easing['easeOutQuart'](0, step, 0, 50, fbb);
                    that.egg.position.z = 0;
                    that.egg.position.x -= val - tmp1;

                    that.egg.rotation.y = val - tmp1;
                    tmp1 = val;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(slideFront);
                    }
                };
                var slideBack = function () {
                    
                    if(step===0 && that.egg.position.x > allow) {
                        console.log('ignore');
                        return requestAnimationFrame(slideFront);
                    }

                    var val = $.easing['easeOutQuart'](0, step, 0, 50, fbb);
                    that.egg.position.z = 0;
                    that.egg.position.x += val - tmp1;
                    that.egg.rotation.y = -val + tmp1;
                    tmp1 = val;
                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(slideBack);
                    }
                };

                var rotJumpLeft = function () {

                    var rate = step / fbb;

                    that.egg.rotation.x = Math.PI * 2 * rate;

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + fbb*fbb/4) / 8;

                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(rotJumpLeft);
                    }
                };
                var rotJumpLeft2 = function () {

                    var rate = step / fbb;

                    that.egg.rotation.x = Math.PI * 4 * rate;

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + fbb*fbb/4) / 8;

                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(rotJumpLeft2);
                    }
                };

                var rotJumpRight = function () {

                    var rate = step / fbb;

                    that.egg.rotation.x = - Math.PI * 2 * rate;

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + fbb*fbb/4) / 8;

                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(rotJumpRight);
                    }
                };
                var rotJumpRight2 = function () {

                    var rate = step / fbb;

                    that.egg.rotation.x = - Math.PI * 4 * rate;

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + fbb*fbb/4) / 8;

                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(rotJumpRight2);
                    }
                };
                var rotJumpFront = function () {

                    var rate = step / fbb;

                    that.egg.rotation.y = - Math.PI * 2 * rate;

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + fbb*fbb/4) / 8;

                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(rotJumpFront);
                    }
                };
                var rotJumpFront2 = function () {

                    var rate = step / fbb;

                    that.egg.rotation.y = - Math.PI * 4 * rate;

                    that.egg.position.z =  (-(step - (fbb/2)) * (step - (fbb/2)) + fbb*fbb/4) / 8;

                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        requestAnimationFrame(that.dance);
                    } else {
                        requestAnimationFrame(rotJumpFront2);
                    }
                };

                var returnCenter = function () {

                    var rate = step / fbb;
                    var val = Math.sin(2 * Math.PI * step / fbb); // 0 1 0 -1 0

                    that.egg.rotation.x = val / 5;
                    that.egg.rotation.y = val / 5;
                    that.egg.rotation.z = val / 5;

                    that.egg.position.x *= (1 - rate);
                    that.egg.position.y *= (1 - rate);
                    that.egg.position.z *= (1 - rate); 

                    step++;
                    that.renderer.render(that.scene, that.camera);
                    if(step >= fbb){
                        that.egg.position.x = 0;
                        that.egg.position.y = 0;
                        that.egg.position.z = 0;

                    } else {
                        requestAnimationFrame(returnCenter);
                    }
                };

                var motions = [walkFront, walkBack,  walkLeft, walkRight,   slideLeft, slideRight, slideFront, slideBack,   rotJumpLeft, rotJumpRight,   rotJumpLeft2, rotJumpRight2,   rotJumpFront, rotJumpFront2];
                var random = Math.floor(Math.random() * 12);
                
                // 動き定義用の配列
                var huri = [0,0,1,1,2,3,3,2,
                            4,4,8,8,8,8,5,5,
                            5,5,9,9,9,9,4,4,
                            6,7,4,5,7,6,5,4,
                            6,9,6,9,7,10,7,10,
                            0,11,0,12,1,12,1,11,
                            0,5,1,1,4,4,0,0,5,1,
                            12];
                var huriLength = huri.length;

                if(that.dancing){
                    motions[huri[that.bar%huriLength]]();    
                } else {
                    returnCenter();
                }
                that.bar ++;
            }

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

    _window.jp.mi73.egg = new Egg();

})(window, document, jQuery, THREE);