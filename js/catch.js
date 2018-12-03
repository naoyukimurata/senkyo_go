var camera, scene, render, mesh;
var rot;

window.onload = function(){
    init();
    update();
}

function init(){
  var target = document.getElementById("container");
  var width = window.innerWidth;
  var height = window.innerHeight;

  //描画更新するためのもの
  render = new THREE.WebGLRenderer();
  //Retinaディスプレイに対応するためのもの
  render.setPixelRatio(window.devicePixelRatio);
  //3Dの空間のサイズを指定
  render.setSize(width,height);
  //16進数で色指定、なれないかもだけどなんか明示的に0xって書いてることが多い
  render.setClearColor(0xdddddd);
  //影をつける
  render.shadowMapEnabled = true;
  //htmlに描画
  target.appendChild(render.domElement);

  //空間を定義
  scene = new THREE.Scene();

  //環境光を作成して空間に追加
  var ambient = new THREE.AmbientLight(0xeeeeee);
  scene.add(ambient);

  //もう一つの光(今回はポイントライト)を作成して座標を設定して追加
  var light = new THREE.PointLight(0xffffff, 1, 50);
  light.position.set( 0, 15, -40);
  scene.add(light);

  //カメラの作成(第二引数はアスペクト比)、位置の設定
  camera = new THREE.PerspectiveCamera(40, width/height, 1, 1000);
  camera.position.set(0, 10, 110);
  //camera.position.set(0, 25, 110); 正しい位置

  var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
  };

  var onError = function ( xhr ) {
  };

  var mtlLoader = new THREE.MTLLoader();
  //mtlの読み込み。ここのPATHがルートからのPATHになるので注意
  mtlLoader.load( "../assets/abe/abe_face.mtl", function( materials ) {
    materials.preload();
    //objのインスタンスにmtlをセット
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials( materials );
    //objの読み込み。ここのPATHがルートからのPATHになるので注意
    objLoader.load( "../assets/abe/abe_face.obj", function(obj) {
      mesh = obj;
      //位置
      mesh.position.set(-3.5, 0, 40);
      //傾き
      mesh.rotation.set(0, 0, 0);
      //大きさ(比率)
      mesh.scale.set(5, 5, 5);
      //追加
      scene.add(mesh);
    }, onProgress, onError );
  });

  groundSettings();
  cameraAnimation();
}

function groundSettings() {
  var geometry = new THREE.PlaneGeometry( 150, 150, 64, 64 );
  var map1 = THREE.ImageUtils.loadTexture("../resources/img/grass.jpg");
  ground = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial( { map: map1 } )
  );

  ground.rotation.x = Math.PI / -2;
  scene.add( ground );
}

function cameraAnimation() {
  rot += 0.1; // 毎フレーム角度を0.5度ずつ足していく
  // ラジアンに変換する
  const radian = rot * Math.PI / 180;
  // 角度に応じてカメラの位置を設定
  //camera.position.x += 0.1;
  //camera.position.z += 0.1;
  //camera.position.set(1, 15, 100);
  //camera.position.set(camera.position.x+=rot, 15, 1000 * Math.cos(radian));
  //camera.position.z = 1000 * Math.cos(radian);

  // 原点方向を見つめる
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  // レンダリング
  render.render(scene, camera);
  requestAnimationFrame(cameraAnimation);
}

function onWindowResize() {
    //アスペクト比の変更
    camera.aspect = width / height;
    //カメラの内部状況の更新(新しいアスペクト比を読み込む)
    camera.updateProjectionMatrix();
    //3D空間のサイズ変更
    renderer.setSize(width, height);
}

function update(){
    //アニメーションつけるためのものupdate関数自体を引数に渡す
    requestAnimationFrame( update );

    //今の画面を消す
    render.clear();
    //新しい画面を表示する
    render.render(scene,camera);
}
