//initialiseer variabelen om scherm/game op te bouwen
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
var fps = new FPS("#container");
fps.start();
let CursorPosition = {x:0,y:0,z:0};
let renderfreeze =0;
let Images = {};
let Paused=false;
let GameCamera;
let GamePhase='generate';
let CharactersInAction=0;

function swapIndex(arr,i1,i2){
    let v = arr[i1];
    arr[i1]=arr[i2];
    arr[i2]=v;
}
function removeFromArray(arr,elt){
    for(var i = arr.length-1;i>=0;i--){
        if(arr[i] == elt){
            arr.splice(i,1);
        }
    }
}
function removeAllFromArray(arr,elt){
    for(var i = elt.length-1;i>=0;i--){
        removeFromArray(arr,elt[i]);
    }
}
function pickedFromObjects(arr,...dir){
    let result=new Array();
    for (let object of arr) {
        for (const a of dir){if(!object)continue;object=object[a];}
        if(!object)continue;
        result.push(object);
    }
    return result;
}
function gup (name) {
    name = RegExp ('[?&]' + name.replace (/([[\]])/, '\\$1') + '=([^&#]*)');
    return (window.location.href.match (name) || ['', ''])[1];
  }
function samePosition(p1,p2){
    return(p1?.x==p2?.x&&
        p1?.y==p2?.y&&
        p1?.z==p2?.z);
}
function heuristic(a,b){
    return Math.abs(a.x-b.x) + Math.abs(a.y-b.y);
}
function scroll(x1,x2,p){
    return (x2-x1*p+x1);
}
function numPos(n){
    return n < 0 ? -n : n;
}
function $(el){
    return document.getElementById(el);
}
function add(el,id="main",inner="empty",x=0,y=0){
    var c=document.createElement(el);
    c.setAttribute('id',id); 
    c.innerHTML = inner;
    c.style.position = "absolute";
    c.style.left = x+'px';
    c.style.top = y+'px';
    document.body.insertBefore(c,document.body.nextSibling);
    return document.getElementById(id);
}
function createFrame(x=0,y=0,width=0,height=0){
    var v=add('div',"helpScreen","<iframe src='help.html' width="+width+" height="+height+" title='Iframe Example'></iframe>",x,y);
    v.width=width;
    v.height=height;
    return v;
}
function remove(el){
    $(el)?.remove();
}
function setAll(arr,key,value){
    for (const item of arr) item[key]=value;
}
function isAnyEqual(arr,key,value){
    for (const item of arr) if(item[key]) return true;
    return false;
}
//functie om images toe te voegen aan Images dictionary
function addImage(key,img){
    Images[key]=new Image();
    Images[key].src=img;
    return Images[key];
}
addImage('Tile','./img/Tile.png');
addImage('WallLeft','./img/WallLeft.png');
addImage('WallRight','./img/WallRight.png');
addImage('Player','./img/TestPlayer.png');
addImage('Dummy','./img/TestDummy.png');
addImage('SelectedTile','./img/Selected/SelectedTile.png');
addImage('MovementTile','./img/Selected/MovementTile.png');
addImage('MovementAction','./img/Selected/MovementAction.png');
addImage('SelectedMovementAction','./img/Selected/SelectedMovementAction.png');

//UI
addImage('Button','./img/UI/Button.png');
addImage('ButtonSelected','./img/UI/ButtonSelected.png');
addImage('PauseFrame','./img/UI/PauseFrame.png');
addImage('PFButton','./img/UI/PauseFrameButton.png');
addImage('PFButtonSelected','./img/UI/PauseFrameButtonSelected.png');

//transparent
addImage('TileT','./img/TileT.png');
addImage('WallLeftT','./img/WallLeftT.png');
addImage('WallRightT','./img/WallRightT.png');

//MovementPath parts
addImage('MPSP','./img/Path/MPSP.png');
addImage('MPSPLU','./img/Path/MPSPLU.png');
addImage('MPSPU','./img/Path/MPSPU.png');
addImage('MPSPRU','./img/Path/MPSPRU.png');
addImage('MPSPR','./img/Path/MPSPR.png');
addImage('MPSPRD','./img/Path/MPSPRD.png');
addImage('MPSPD','./img/Path/MPSPD.png');
addImage('MPSPLD','./img/Path/MPSPLD.png');
addImage('MPSPL','./img/Path/MPSPL.png');

addImage('MPBL','./img/Path/MPBL.png');
addImage('MPBR','./img/Path/MPBR.png');
addImage('MPBU','./img/Path/MPBU.png');
addImage('MPBD','./img/Path/MPBD.png');
addImage('MPDL','./img/Path/MPDL.png');
addImage('MPDR','./img/Path/MPDR.png');

addImage('MPH','./img/Path/MPH.png');
addImage('MPHBLD','./img/Path/MPHBLD.png');
addImage('MPHBRD','./img/Path/MPHBRD.png');
addImage('MPHBLU','./img/Path/MPHBLU.png');
addImage('MPHBRU','./img/Path/MPHBRU.png');
addImage('MPV','./img/Path/MPV.png');
addImage('MPVBLD','./img/Path/MPVBLD.png');
addImage('MPVBRD','./img/Path/MPVBRD.png');
addImage('MPVBLU','./img/Path/MPVBLU.png');
addImage('MPVBRU','./img/Path/MPVBRU.png');

addImage('MPDERD','./img/Path/MPDERD.png');
addImage('MPVED','./img/Path/MPVED.png');
addImage('MPDELD','./img/Path/MPDELD.png');
addImage('MPHEL','./img/Path/MPHEL.png');
addImage('MPDELU','./img/Path/MPDELU.png');
addImage('MPVEU','./img/Path/MPVEU.png');
addImage('MPDERU','./img/Path/MPDERU.png');
addImage('MPHER','./img/Path/MPHER.png');

//gebruik dictionary om de image van het PathSegment Object te berekenen
let PathRails = {
'start':{
    0 : Images['MPSPRD'],
    1 : Images['MPSPD'],
    2 : Images['MPSPLD'],
    3 : Images['MPSPL'],
    4 : Images['MPSPLU'],
    5 : Images['MPSPU'],
    6 : Images['MPSPRU'],
    7 : Images['MPSPR'],
},
0:{
    7 : Images['MPHBLD'],
    0 : Images['MPDL'],
    1 : Images['MPVBRU'],
    2 : Images['MPBR'],
    4 : Images['MPDL'],
    6 : Images['MPBD'],
},1:{
    0 : Images['MPVBLD'],
    1 : Images['MPV'],
    2 : Images['MPVBRD'],
    5 : Images['MPV'],
},2:{
    0 : Images['MPBL'],
    1 : Images['MPVBLU'],
    2 : Images['MPDR'],
    3 : Images['MPHBRD'],
    4 : Images['MPBD'],
    6 : Images['MPDR'],
},3:{ 
    2 : Images['MPHBLU'],
    3 : Images['MPH'],
    4 : Images['MPHBLD'],
    7 : Images['MPH'],
},4:{
    0 : Images['MPDL'],
    2 : Images['MPBU'],
    3 : Images['MPHBRU'],
    4 : Images['MPDL'],
    5 : Images['MPVBLD'],
    6 : Images['MPBL'],
},5:{
    1 : Images['MPV'],
    4 : Images['MPVBRU'],
    5 : Images['MPV'],
    6 : Images['MPVBLU'],
},6:{
    0 : Images['MPBU'],
    2 : Images['MPDR'],
    4 : Images['MPBR'],
    5 : Images['MPVBRD'],
    6 : Images['MPDR'],
    7 : Images['MPHBLU'],
},7:{
    0 : Images['MPHBRU'],
    3 : Images['MPH'],
    6 : Images['MPHBRD'],
    7 : Images['MPH'],
},'end':{
    0 : Images['MPDERD'],
    1 : Images['MPVED'],
    2 : Images['MPDELD'],
    3 : Images['MPHEL'],
    4 : Images['MPDELU'],
    5 : Images['MPVEU'],
    6 : Images['MPDERU'],
    7 : Images['MPHER'],
}};





