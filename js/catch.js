var camera, scene, render, mesh;
var sky, sunSphere, controls;
var rot;
var anime = false;

var user;
var giin;
var questions;
var qNum = 0;

window.onload = function(){
  getJson();
  init();
  update();

  // 回答クリック判定
  $('.choices').on('click', function(){
      var id =  $(this).attr("id");
      ans(id);
  });
}

function getJson() {
  user = {"id":"10001","name":"Yusuke Nakayama","sex":"M","email":"ymid5287@gamil.com"};
  $('#user-name').text(user.name);

  giin = {"id":"20001","name":"\u5b89\u500d\u664b\u4e09","sex":"M","age":"58","political_party":"\u6c11\u4e3b\u515a","thumbnail":"https:\/\/upload.wikimedia.org\/wikipedia\/commons\/thumb\/6\/6d\/Shinz%C5%8D_Abe_Official.jpg\/240px-Shinz%C5%8D_Abe_Official.jpg","3d_object":""}
  $('#firstText').text('あ！野生の'+giin.name+'が現れた');
  $('#moa-name').text(giin.name);

  // 同一サーバから出ないとAPIを叩けないので仮JSON
  questions = [{"id":"1","question":"\u3053\u308c\u306f\u30c6\u30b9\u30c8\u554f\u984c\u3067\u3059\u3002","choice1":"\u9078\u629e\u80a2A","choice2":"\u9078\u629e\u80a2B","choice3":"\u9078\u629e\u80a2C","choice4":"\u9078\u629e\u80a2D","answer":"choice4","point":"10"},
  {"id":"2","question":"test","choice1":"test","choice2":"test","choice3":"test","choice4":"test","answer":"choice4","point":"10"},
  {"id":"3","question":"test","choice1":"test","choice2":"test","choice3":"test","choice4":"test","answer":"choice4","point":"10"},
]
  setQuestion();
}

function setQuestion(){
  $('#question').text(questions[qNum].question);
  $('#choice1').text(questions[qNum].choice1);
  $('#choice2').text(questions[qNum].choice2);
  $('#choice3').text(questions[qNum].choice3);
  $('#choice4').text(questions[qNum].choice4);

  $('#answer-box').css({'pointer-events': 'auto'});
}

function init() {

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
  camera.position.set(0, 8, 60);
  camera.lookAt(new THREE.Vector3(0, 12, 4));

  var onProgress = function(xhr) {
    if(xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
  };
  var onError = function ( xhr ) {
  };

  var mtlLoader = new THREE.MTLLoader();
  //mtlの読み込み。ここのPATHがルートからのPATHになる
  mtlLoader.load( "../assets/abe/abe_face.mtl", function( materials ) {
    materials.preload();
    //objのインスタンスにmtlをセット
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials( materials );
    //objの読み込み。ここのPATHがルートからのPATHになる
    objLoader.load( "../assets/abe/abe_face.obj", function(obj) {
      mesh = obj;
      mesh.position.set(-3.5, 0, 20);　//位置
      mesh.rotation.set(0, 0, 0); //傾き
      mesh.scale.set(5, 5, 5); //大きさ(比率)
      scene.add(mesh);　//追加
    }, onProgress, onError);
  });

  initGround();
  initSky(light);

  camera.position.set(0, 8, 60);
  camera.lookAt(new THREE.Vector3(0, 12, 4));
  setTimeout(function(){
    $('#firstText').hide();
    cameraAnimation();
  },4000);
}

function initGround() {
  var geometry = new THREE.PlaneGeometry( 150, 150, 64, 64 );
  var map1 = THREE.ImageUtils.loadTexture("../resources/img/grass.jpg");
  ground = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial( { map: map1 } )
  );

  ground.rotation.x = Math.PI / -2;
  scene.add( ground );
}

function initSky(light) {
  var sky = new THREE.Sky();
	sky.scale.setScalar( 10000 );

  var uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 0.7;
  uniforms.rayleigh.value = 0.2;
  uniforms.luminance.value = 1;
  uniforms.mieCoefficient.value = 0.005;
  uniforms.mieDirectionalG.value = 0.8;

  sky.material.uniforms.sunPosition.value.copy(light.position);
	scene.add( sky );
}

function cameraAnimation() {
  if(camera.position.y <= 13) camera.position.y += 0.15;
  if(camera.position.z <= 100) camera.position.z += 1;
  //camera.position.set(0, 10, 100); 正しい位置

  // カメラの方向
  camera.lookAt(new THREE.Vector3(0, 12, 4));
  // レンダリング
  render.render(scene, camera);
  requestAnimationFrame(cameraAnimation);

  if(anime == false) {
    if(camera.position.y >= 13 && camera.position.z >= 100) {
      anime = true;
      $('.hp-box').show('slide');
      setTimeout(function(){
        $('#question-box')
        .css({'visibility':'visible'})
        .animate({'marginTop': '0'}, 500);
      },2000);
      setTimeout(function(){
        $('#answer-box').show('drop');
      },4000);
    }
  }
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

/* 回答 */
var lifeBar;
var timer;
function ans(id) {
  // 正解
  if(id == questions[qNum].answer) {
    $('#'+id).css({
      'background-color':'#14f4b4',
      'pointer-events': 'none',
    });
    $('#answer-box').css({'pointer-events': 'none'});
    startLifeBar('giinLife', id);
    // ライフバーが下がりきるまで待つ
    setTimeout(function(){
      $('#choice1').css({'background-color':'rgba(198,198,198,0.8)','pointer-events': 'auto',})
      $('#choice2').css({'background-color':'rgba(198,198,198,0.8)','pointer-events': 'auto',})
      $('#choice3').css({'background-color':'rgba(198,198,198,0.8)','pointer-events': 'auto',})
      $('#choice4').css({'background-color':'rgba(198,198,198,0.8)','pointer-events': 'auto',})
      qNum++;
      setQuestion();
    },2500);
  }
  // ミス
  else {
    $('#'+id).css({
      'background-color':'#f31453',
      'pointer-events': 'none',
    });
    $('#answer-box').css({'pointer-events': 'none'});
    startLifeBar('myLife');
    // ライフバーが下がりきるまで待つ
    setTimeout(function(){
      $('#answer-box').css({'pointer-events': 'auto'});
    },2500);
  }
}
function startLifeBar(bar) {
  var count = 0;
  lifeBar = document.getElementById(bar);
  timer = setInterval(function() {
    count++;
    lifeBar.value--;
    if(count == 30) {
      clearInterval(timer);
      if(lifeBar.value <= 0) {
        $('#question-box').hide();
        $('#answer-box').hide();
        // 負け
        if(bar == 'myLife') {
          $('#lwText').show('drop');
          $('#lwText').text('敗戦…。野生の'+giin.name+'に逃げられた');
          setTimeout(function(){
            window.location.href = './';
          },4000);
        }
        // 勝ち
        else {
          $('#lwText').text('やったー！'+giin.name+'をゲットした！');
          $('#lwText').show('drop');
          setTimeout(function(){
            window.location.href = './';
          },4000);
        }
      }
    }
  },50);
}
