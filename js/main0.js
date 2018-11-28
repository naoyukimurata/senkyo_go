var vrDisplay;
var vrControls;
var arView;

var canvas;
var camera;
var scene;
var renderer;
var model;

var shadowMesh;
var planeGeometry;
var light;
var directionalLight;

var OBJ_PATH = '../assets/abe/abe_body_test.obj';
var MTL_PATH = '../assets/abe/abe_body_test.mtl';
var SCALE = 0.1;

//ARが使えるかどうかの判定
THREE.ARUtils.getARDisplay().then(function (display) {
  if (display) {
    vrDisplay = display;
    init();
  } else {
    THREE.ARUtils.displayUnsupportedMessage();
  }
});

function init() {
  //gps();

  //デバッグパネルを画面上に表示
  var arDebug = new THREE.ARDebug(vrDisplay);
  document.body.appendChild(arDebug.getElement());

  //背景を透明にする
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  canvas = renderer.domElement;
  document.body.appendChild(canvas);
  scene = new THREE.Scene();

  //カメラからの映像を背景(というよりは背景のもう一個奥のディスプレイのレイヤー)にセット
  arView = new THREE.ARView(vrDisplay, renderer);

  // 大体three.jsのカメラと一緒だが、現実のカメラとの奥行きの同期ができるようになるっぽい？
  camera = new THREE.ARPerspectiveCamera(
    vrDisplay,
    60,
    window.innerWidth / window.innerHeight,
    vrDisplay.depthNear,
    vrDisplay.depthFar
  );

  //現実のカメラの動きとVR(scene)のカメラを同期させる
  vrControls = new THREE.VRControls(camera);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  directionalLight = new THREE.DirectionalLight();
  // 将来的にはAR専用のライトを使うようになるらしい
  directionalLight.intensity = 0.3;
  directionalLight.position.set(10, 15, 10);
  // ここの光で影を作ってる
  directionalLight.castShadow = true;
  light = new THREE.AmbientLight();
  scene.add(light);
  scene.add(directionalLight);

  // 影を映すためのオブジェクト
  planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  // 現実の床に合わせて回転させてる
  planeGeometry.rotateX(-Math.PI / 2);

  // 影を含むメッシュを作成してる
  //メッシュじゃないほうがいい場合はreceiveShadowをfalseにすれば影をレンダリングするだけになる
  shadowMesh = new THREE.Mesh(planeGeometry, new THREE.ShadowMaterial({
    color: 0x111111,
    opacity: 0.15,
  }));
  shadowMesh.receiveShadow = true;
  scene.add(shadowMesh);

  THREE.ARUtils.loadModel({
    objPath: OBJ_PATH,
    mtlPath: MTL_PATH,
    OBJLoader: undefined, // uses window.THREE.OBJLoader by default
    MTLLoader: undefined, // uses window.THREE.MTLLoader by default
  }).then(function(group) {
    model = group;
    // objectの持ってる全てのメッシュに影を追加する
    model.children.forEach(function(mesh) { mesh.castShadow = true; });

    model.scale.set(SCALE, SCALE, SCALE);
    model.position.set(10000, 10000, 10000);
    scene.add(model);
  });

  window.addEventListener('resize', onWindowResize, false);
  canvas.addEventListener('click', spawn, false);

  update();
}

function update() {
  // いま表示されてるのものをクリア
  renderer.clearColor();

  //現実のカメラと同期してオブジェクトを正しい場所に相対的に移動
  arView.render();

  //床用のオブジェクトを更新(おそらくこれがしたいがためにARのカメラを使用している)
  camera.updateProjectionMatrix();

  // 現実のカメラに合わせてカメラの位置をアップデート
  vrControls.update();

  //VR空間を描画
  renderer.clearDepth();
  renderer.render(scene, camera);

  // アニメーションフレームはVR空間が描画されたあと
  vrDisplay.requestAnimationFrame(update);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//オブジェクトを描画するための関数
function spawn(e) {
  // マウスクリック位置を正規化
  var mouse = new THREE.Vector2();
  mouse.x =  ( e.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = -( e.clientY / window.innerHeight ) * 2 + 1;

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( scene.children );

  if(intersects.length == 0) {
    var x = e.clientX / window.innerWidth;
    var y = e.clientY / window.innerHeight;

    //擬似的な光線を発射し、(おそらく床用のオブジェクトとの)衝突判定を行っている
    var hits = vrDisplay.hitTest(x, y);

    /*if (!model) {
      console.warn('Model not yet loaded');
      return;
    }*/

    // 衝突したらオブジェクトを描画
    /*if(hits && hits.length) {
      var hit = hits[0];

      THREE.ARUtils.loadModel({
        objPath: OBJ_PATH,
        mtlPath: MTL_PATH,
        OBJLoader: undefined, // uses window.THREE.OBJLoader by default
        MTLLoader: undefined, // uses window.THREE.MTLLoader by default
      }).then(function(group) {
        model = group;
        // objectの持ってる全てのメッシュに影を追加する
        model.children.forEach(function(mesh) { mesh.castShadow = true; });

        model.scale.set(SCALE, SCALE, SCALE);
        model.position.set(10000, 10000, 10000);
        scene.add(model);
      });*/

      //これで現実世界の床の上になるような正しい位置(かつ影がうまいこと表示できる位置)を取得
      //どうやら影をうまいこと描画するプロセスが複雑らしいが詳しいことは割愛(わかる方いたら教えてください)
      var matrix = new THREE.Matrix4();
      var position = new THREE.Vector3();
      matrix.fromArray(hit.modelMatrix);
      position.setFromMatrixPosition(matrix);

      // 影をセット、今後その影も現実に合わせて回転するようになるっぽい？
      shadowMesh.position.y = position.y;

      // モデルをその場所にセット
      THREE.ARUtils.placeObjectAtHit(model,hit,1,true);

      // 現実のカメラに合わせてオブジェクトを回転
      var angle = Math.atan2(
        camera.position.x - model.position.x,
        camera.position.z - model.position.z
      );
      model.rotation.set(0, angle, 0);
    }
  } else {
    //alert(intersects[0].object.name);
  }
}

function gps() {
  // 対応している場合
  if(navigator.geolocation) {
  	// 現在地を取得
  	navigator.geolocation.getCurrentPosition(
  		// [第1引数] 取得に成功した場合の関数
  		function(position) {
  			// 取得したデータの整理
  			var data = position.coords ;

  			// データの整理
  			var lat = data.latitude ;
  			var lng = data.longitude ;
  			var alt = data.altitude ;
  			var accLatlng = data.accuracy ;
  			var accAlt = data.altitudeAccuracy ;
  			var heading = data.heading ;			//0=北,90=東,180=南,270=西
  			var speed = data.speed ;

  			// アラート表示
        alert( "あなたの現在位置は、\n[" + lat + "," + lng + "]\nです。" ) ;

  			// 位置情報
  			var latlng = new google.maps.LatLng( lat , lng ) ;

  			// マーカーの新規出力
  			new google.maps.Marker( {
  				map: map ,
  				position: latlng ,
  			} ) ;
  		},

  		// [第2引数] 取得に失敗した場合の関数
  		function(error) {
  			// エラーコード(error.code)の番号
  			// 0:UNKNOWN_ERROR				原因不明のエラー
  			// 1:PERMISSION_DENIED			利用者が位置情報の取得を許可しなかった
  			// 2:POSITION_UNAVAILABLE		電波状況などで位置情報が取得できなかった
  			// 3:TIMEOUT					位置情報の取得に時間がかかり過ぎた…

  			// エラー番号に対応したメッセージ
  			var errorInfo = [
  				"原因不明のエラーが発生しました…。" ,
  				"位置情報の取得が許可されませんでした…。" ,
  				"電波状況などで位置情報が取得できませんでした…。" ,
  				"位置情報の取得に時間がかかり過ぎてタイムアウトしました…。"
  			] ;

  			// エラー番号
  			var errorNo = error.code ;

  			// エラーメッセージ
  			var errorMessage = "[エラー番号: " + errorNo + "]\n" + errorInfo[ errorNo ] ;
  			// アラート表示
  			alert( errorMessage ) ;
  		} ,

  		// [第3引数] オプション
  		{
  			"enableHighAccuracy": false,
  			"timeout": 8000,
  			"maximumAge": 2000,
  		}
  	) ;
  }

  // 対応していない場合
  else {
  	// エラーメッセージ
  	var errorMessage = "お使いの端末は、GeoLacation APIに対応していません。" ;
  	// アラート表示
  	alert( errorMessage ) ;
  }
}
