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

  camera.position.set(0, 8, 60);
  camera.lookAt(new THREE.Vector3(0, 12, 4));

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
      mesh.position.set(-3.5, 0, 20);
      //傾き
      mesh.rotation.set(0, 0, 0);
      //大きさ(比率)
      mesh.scale.set(5, 5, 5);
      //追加
      scene.add(mesh);
    }, onProgress, onError );
  });

  groundSettings();
  setTimeout(function(){
    $('#firstText').hide();
    cameraAnimation();
  },4000);
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
  //rot += 0.1; // 毎フレーム角度を0.5度ずつ足していく
  // ラジアンに変換する
  //const radian = rot * Math.PI / 180;
  // 角度に応じてカメラの位置を設定

  if(camera.position.y <= 10) camera.position.y += 0.2;
  if(camera.position.z <= 100) camera.position.z += 0.5;
  //camera.position.set(1, 15, 100);
  //camera.position.set(camera.position.x+=rot, 15, 1000 * Math.cos(radian));
  //camera.position.z = 1000 * Math.cos(radian);

  //camera.position.set(0, 10, 100); 正しい位置

  // 原点方向を見つめる
  //camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.lookAt(new THREE.Vector3(0, 12, 4));
  // レンダリング
  render.render(scene, camera);
  requestAnimationFrame(cameraAnimation);
}

//キャンバスのテクスチャ作り
//文字を表示させたの返す
function setTexture() {
  /*var textBoardObject = new TextBoardObject({
    fontSize : 4, // [%]
    textColor : {r:1, g:1, b:1, a:1},//文字色
    backgroundColor : { r:1, g:1, b:1, a:0.1 },//背景色（RGBA値を0から１で指定）
    boardWidth : 30,  //マッピング対象平面オブジェクトの横幅
    boardHeight : 30, //マッピング対象平面オブジェクトの縦幅
    fontName :"Times New Roman"
  });
  scene.add( textBoardObject.cleatePlaneObject() );
  textBoardObject.clear();
  textBoardObject.addTextLine( "あ！野生の安倍総理が現れた", 10, 1 );
  textBoardObject.update();*/

  var target = document.getElementById("container");
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






/* TextBoardObjectクラス */

//平面オブジェクト＋テクスチャマッピングによる
var TextBoardCanvas = function( parameter ){
    parameter = parameter || {};

    //背景色（RGBA値を0から１で指定）
    this.backgroundColor = parameter.backgroundColor || {r:1, g:1, b:1, a:1};
    //文字色（RGBA値を0から１で指定）
    this.textColor = parameter.textColor || {r:0, g:0, b:0, a:1};

    //マッピング対象オブジェクトのサイズ（縦横比は２のべき乗を推奨）
    this.boardWidth = parameter.boardWidth || 100;
    this.boardHeight = parameter.boardHeight || 100;

    //フォントサイズと行間（canvas要素の横幅に対する[%]で指定）
    this.fontSize = parameter.fontSize || 10;      //フォントサイズ
    this.lineHeight = parameter.lineHeight || 1.1; //行間

    //フォント名（CSSで指定可能な形式）
    this.fontName = parameter.fontName || "serif"; //フォント名
    //解像度
    this.resolution = parameter.resolution || 4;

    this._lineHeight = 0;
    this.textLines = [];

    this.init();

}
//初期化
TextBoardCanvas.prototype.init = function(){

    //canvas要素の生成
    this.canvas = document.createElement('canvas');
    //canvas要素のサイズ
    this.canvas.width = Math.pow( 2, Math.floor( Math.log2( this.boardWidth ) ) + this.resolution );  //横幅
    this.canvas.height = Math.pow( 2, Math.floor( Math.log2( this.boardHeight) ) + this.resolution ); //縦幅

    console.log( "canvas要素のサイズ：", this.canvas.width, "×", this.canvas.height  );

    //コンテキストの取得
    this.canvas.context = this.canvas.getContext('2d');

    this.setBackGroundColor( this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a );
    this.setTextColor( this.textColor.r, this.textColor.g, this.textColor.b, this.textColor.a);
    this.setFontSize( this.fontSize );
    this.setFontName( this.fontName );
    this.setLineHeight( this.lineHeight )

}
//背景色の設定
TextBoardCanvas.prototype.setBackGroundColor = function( r, g, b, a ){

    this.backgroundColor.r = r || 0;
    this.backgroundColor.g = g || 0;
    this.backgroundColor.b = b || 0;
    this.backgroundColor.a = a || 0;

    this.canvas.context.fillStyle = "rgba(" + 255 * this.backgroundColor.r + " ," + 255 * this.backgroundColor.g + " ," + 255 * this.backgroundColor.b + " ," +  this.backgroundColor.a + ")";
    this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

}
//全消し
TextBoardCanvas.prototype.clear = function( ){

    this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.context.fillStyle = "rgba(" + 255 * this.backgroundColor.r + " ," + 255 * this.backgroundColor.g + " ," + 255 * this.backgroundColor.b + " ," +  this.backgroundColor.a + ")";
    this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.context.fillStyle = "rgba(" + 255 * this.textColor.r + " ," + 255 * this.textColor.g + " ," + 255 * this.textColor.b + " ," +  this.textColor.a + ")";
    this._lineHeight = 0;

}
//文字色の設定
TextBoardCanvas.prototype.setTextColor = function( r, g, b, a ){

    this.textColor.r = r || 0;
    this.textColor.g = g || 0;
    this.textColor.b = b || 0;
    this.textColor.a = a || 0;

    this.canvas.context.fillStyle = "rgba(" + 255 * this.textColor.r + " ," + 255 * this.textColor.g + " ," + 255 * this.textColor.b + " ," +  this.textColor.a + ")";

}
//文字サイズの設定
TextBoardCanvas.prototype.setFontSize = function( size ){

    this.fontSize = size || 10;

    this.canvas.context.font = this.fontSize /100 * this.canvas.width + "px " + this.fontName;

}
//フォントの設定
TextBoardCanvas.prototype.setFontName = function( name ){

    this.fontName = name || "serif";

    this.canvas.context.font = this.fontSize /100 * this.canvas.width + "px " + this.fontName;

}
//行間の設定
TextBoardCanvas.prototype.setLineHeight = function( height ){

    this.lineHeight = height || 1.1;

}
//文字列の追加
TextBoardCanvas.prototype.addTextLine = function( text, indent, lineHeight ){
    text = text || "";
    indent = indent || 0;
    lineHeight = lineHeight || this.lineHeight;

    this.textLines.push( {text : text, indent : indent, lineHeight : lineHeight} );
    this._lineHeight += lineHeight * this.fontSize /100 * this.canvas.width;

    this.canvas.context.fillText(
        text,
        indent /100 * this.canvas.width,
        this._lineHeight
    );

}
//canvas要素を取得
TextBoardCanvas.prototype.getTextCanvas = function(){

    return this.canvas;
}


var TextBoardObject = function( parameter ){
     parameter = parameter || {};

    TextBoardCanvas.call( this,  parameter );

    this.plane = null;
    this.sprite = null;

}
TextBoardObject.prototype = Object.create( TextBoardCanvas.prototype );
TextBoardObject.constructor = TextBoardObject;

TextBoardObject.prototype.cleatePlaneObject = function(){

    //テクスチャ画像用のcanvas要素の取得
    var canvas = this.getTextCanvas();
    //テクスチャオブジェクトの生成
    this.texture = new THREE.Texture( canvas );
    //テクスチャ画像の更新
    this.texture.needsUpdate = true;

    //形状オブジェクトの宣言と生成
    var geometry = new THREE.PlaneGeometry( this.boardWidth, this.boardHeight );
    //材質オブジェクトの宣言と生成
    var material = new THREE.MeshBasicMaterial( { map : this.texture, transparent : true } );
    //平面オブジェクトの生成
    this.plane = new THREE.Mesh( geometry, material );

    return this.plane;
}
TextBoardObject.prototype.cleateSpriteObject = function(){

    //テクスチャ画像用のcanvas要素の取得
    var canvas = this.getTextCanvas();
    //テクスチャオブジェクトの生成
    this.texture = new THREE.Texture( canvas );
    //テクスチャ画像の更新
    this.texture.needsUpdate = true;

    //材質オブジェクトの宣言と生成
    var material = new THREE.SpriteMaterial({ map: this.texture });
    //スプライトオブジェクトの生成
    this.sprite = new THREE.Sprite( material );

    this.sprite.scale.set( this.boardWidth, this.boardHeight, 1);

    return this.sprite;
}
TextBoardObject.prototype.cleateTextScreen = function(){

    this.textScene = new THREE.Scene();
    if( this.sprite ){

        this.textScene.add( this.sprite );

    } else {

        this.textScene.add( this.cleateSpriteObject() );
    }

    this.textCamera = new THREE.OrthographicCamera(-this.boardWidth/2, this.boardWidth/2, this.boardHeight/2, -this.boardHeight/2, -10, 10);

}
TextBoardObject.prototype.update = function(){

    if( this.plane ) this.plane.material.map.needsUpdate = true;
    if( this.sprite ) this.sprite.material.map.needsUpdate = true;

}
TextBoardObject.prototype.getPlaneObject = function(){

    return this.plane;

}
TextBoardObject.prototype.getSpriteObject = function(){

    return this.sprite;

}
