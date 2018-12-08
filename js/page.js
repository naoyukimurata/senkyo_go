$(window).on('load',function(){
  var path = location.pathname;
  if(path == "/") {
    $('#search').attr('src', '../resources/icon/search.png');
  } else if(path == "/battle.html") {
    $('#battle').attr('src', '../resources/icon/battle.png');
  } else if(path == "/list.html") {
    $('#giin').attr('src', '../resources/icon/giin.png');
  }
});
