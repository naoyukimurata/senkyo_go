var camera, scene, render, mesh;

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


    camera.position.set(0, 15, 100);

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
        mesh.position.set(0, 0, 0);
        //傾き
        mesh.rotation.set(0, -5, 0);
        //大きさ(比率)
        mesh.scale.set(10, 10, 10);
        //追加
        scene.add(mesh);
    }, onProgress, onError );
});

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
    //まわる
    if(mesh != undefined){
            //まわる
            mesh.rotation.y += 0.01;
        }
    //今の画面を消す
    render.clear();
    //新しい画面を表示する
    render.render(scene,camera);
}
