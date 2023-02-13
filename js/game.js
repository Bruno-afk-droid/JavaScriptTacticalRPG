let Objects;
let keys;
let Terrain;
let TerrainUI;
let TerrainStart;
let Characters;
let ControlebleCharacters;
//Grote van de tiles worden hier ingesteld
let TileWidth = 47;
let TileHeight = 23;
let st = {x:0,y:0,z:0};
try{
    //Het scherm opbouwen
    c.imageSmoothingEnabled = false;

    //Camera object aanmaken
    GameCamera = new Camera({x:-canvas.width,y:-canvas.height, width:canvas.width*2, height:canvas.height*2});

    c.fillRect(-canvas.width,-canvas.height, canvas.width*2, canvas.height*2);

    //anders objecten die gebruikt worden
     Objects = [];
     keys = {enter: false,right: false,down: false, left:false, up:false};
     Terrain = new Array();
     TerrainUI = new Array();
     TerrainStart ={x:0,y:0,z:0};
     Characters = new Array();
     ControlebleCharacters = new Array();
    

    //Het terrein opbouwen obv door speler ingevoerde configuratie
    Lx = gup('TerrainSize');
    st.x=Math.max(st.x,Lx);
    for (let x = 0; x < Lx; x++) {
        Terrain[x] = new Array();       
        Ly = gup('TerrainSize');
        st.y=Math.max(st.y,Ly-1);
        for (let y = 0; y < Ly; y++) {
            Terrain[x][y]=new Array();
            Lz = randomRange(1 ,10);
            if(Lz!=2)Lz=1;
            st.z=Math.max(st.z,Lz);
            for (let z = 0; z < Lz; z++) {
                setTile(x,y,z);
            }
        }
    }Terrain.push(new Array());
    TerrainStart={x:-((TileWidth*st.x)+(TileWidth*st.y))/2,y:-(-(TileHeight*st.x)+(TileHeight*st.y))/2,z:0};

    //spawn het player object op een random tile
    for(var i=0;i<2;i++)
    spawnPlayer(getRandomTile());
    spawnDummy(getRandomTile());

    //initialiseert plan fase van het spel
    setUpPlanPhase();
}catch(error){
    alert("Instalatie error: "+error);
}
//Terrain.forEach(function(x){x.forEach(function(y){y.forEach(function(z){connectTile(z.gridPos.x,z.gridPos.y,z.gridPos.z,z)})})});

function setTile(x,y,z,tile=new GridTile({x:x,y:y,z:z}),arr=Terrain){ 
    while(arr.length-1<x)arr.push(new Array());
    while(arr[x].length-1<y)arr[x].push(new Array());
    while(arr[x][y].length-1<z)arr[x][y].push(null);
    arr[x][y][z] = tile;

    
    //north
    if(getTile(x,y-1,z,arr)!=null){
        if(tile)arr[x][y][z].adjacent.N=arr[x][y-1][z];
        arr[x][y-1][z].adjacent.S=arr[x][y][z];
    }

    //east
    if(getTile(x+1,y,z,arr)!=null){
        if(tile)arr[x][y][z].adjacent.E=arr[x+1][y][z];
        arr[x+1][y][z].adjacent.W=arr[x][y][z];
    }

    //south
    if(getTile(x,y+1,z,arr)!=null){
        if(tile)arr[x][y][z].adjacent.S=arr[x][y+1][z];
        arr[x][y+1][z].adjacent.N=arr[x][y][z];
    }

    //west
    if(getTile(x-1,y,z,arr)!=null){
        if(tile)arr[x][y][z].adjacent.W=arr[x-1][y][z];
        arr[x-1][y][z].adjacent.E=arr[x][y][z];
    }

    //north-east
    if(getTile(x+1,y-1,z,arr)!=null){
        if(tile)arr[x][y][z].adjacent.NE=arr[x+1][y-1][z];
        arr[x+1][y-1][z].adjacent.SW=arr[x][y][z];
    }
    //south-east
    if(getTile(x+1,y+1,z,arr)!=null){
        if(tile)arr[x][y][z].adjacent.SE=arr[x+1][y+1][z];
        arr[x+1][y+1][z].adjacent.NW=arr[x][y][z];
    }    
    //norht-west
    if(getTile(x-1,y-1,z,arr)!=null){
        if(tile)arr[x][y][z].adjacent.NW=arr[x-1][y-1][z];
        arr[x-1][y-1][z].adjacent.SE=arr[x][y][z];
    }
    //south-west
    if(getTile(x-1,y+1,z,arr)!=null){
        if(tile)arr[x][y][z].adjacent.SW=arr[x-1][y+1][z];
       arr[x-1][y+1][z].adjacent.NE=arr[x][y][z];
    }

    //down
    if(getTile(x,y,z-1,arr)!=null){
        if(tile)arr[x][y][z].stackedOn=arr[x][y][z-1];
        arr[x][y][z-1].stackedUnder=arr[x][y][z];
        arr[x][y][z-1].hidden=true;
    }
    //up
    if(getTile(x,y,z+1,arr)!=null){
        if(tile)arr[x][y][z].stackedUnder=arr[x][y][z+1];
        arr[x][y][z+1].stackedOn=arr[x][y][z];
    }
}
function connectTile(x,y,z,tile,arr=Terrain){
    //north
    if(getTile(x,y-1,z,arr)!=null){
        arr[x][y][z].adjacent.N=arr[x][y-1][z];
        arr[x][y-1][z].adjacent.S=arr[x][y][z];
    }

    //east
    if(getTile(x+1,y,z,arr)!=null){
        arr[x][y][z].adjacent.E=arr[x+1][y][z];
        arr[x+1][y][z].adjacent.W=arr[x][y][z];
    }

    //south
    if(getTile(x,y+1,z,arr)!=null){
        arr[x][y][z].adjacent.S=arr[x][y+1][z];
        arr[x][y+1][z].adjacent.N=arr[x][y][z];
    }

    //west
    if(getTile(x-1,y,z,arr)!=null){
        arr[x][y][z].adjacent.W=arr[x-1][y][z];
        arr[x-1][y][z].adjacent.E=arr[x][y][z];
    }

    //north-east
    if(getTile(x+1,y-1,z,arr)!=null){
        arr[x][y][z].adjacent.NE=arr[x+1][y-1][z];
        arr[x+1][y-1][z].adjacent.SW=arr[x][y][z];
    }
    //south-east
    if(getTile(x+1,y+1,z,arr)!=null){
        arr[x][y][z].adjacent.SE=arr[x+1][y+1][z];
        arr[x+1][y+1][z].adjacent.NW=arr[x][y][z];
    }    
    //norht-west
    if(getTile(x-1,y-1,z,arr)!=null){
        arr[x][y][z].adjacent.NW=arr[x-1][y-1][z];
        arr[x-1][y-1][z].adjacent.SE=arr[x][y][z];
    }
    //south-west
    if(getTile(x-1,y+1,z,arr)!=null){
       arr[x][y][z].adjacent.SW=arr[x-1][y+1][z];
       arr[x-1][y+1][z].adjacent.NE=arr[x][y][z];
    }

    //down
    if(getTile(x,y,z-1,arr)!=null){
        arr[x][y][z].stackedOn=arr[x][y][z-1];
        arr[x][y][z-1].stackedUnder=arr[x][y][z];
        arr[x][y][z-1].hidden=true;
    }
    //up
    if(getTile(x,y,z+1,arr)!=null){
        arr[x][y][z].stackedUnder=arr[x][y][z+1];
        arr[x][y][z+1].stackedOn=arr[x][y][z];
    }
}
function getTile(x=0,y=0,z=0,arr=Terrain){
    return arr[x]?arr[x][y]?arr[x][y][z]?arr[x][y][z]:null:null:null;
}
function movePlayerOnGrid(player,pos={x:0,y:0,z:0},grid=Terrain){

    if(grid[player.gridPos.x][player.gridPos.y][player.gridPos.z]){
        removeFromArray(grid[player.gridPos.x][player.gridPos.y][player.gridPos.z],player);
        if(grid[player.gridPos.x][player.gridPos.y][player.gridPos.z].length==0){
            grid[player.gridPos.x][player.gridPos.y][player.gridPos.z]=null;
        }
    }
    if(!Array.isArray(grid[pos.x][pos.y][pos.z]))grid[pos.x][pos.y][pos.z]=new Array();
    grid[pos.x][pos.y][pos.z].push(player);
    player.gridPos=pos;   
    /*
    if(grid[player.gridPos.x][player.gridPos.y][player.gridPos.z]==player){
        grid[player.gridPos.x][player.gridPos.y][player.gridPos.z]=null;
    }
    if(grid[pos.x][pos.y][pos.z]){
        player.gridPos=pos;
        return false;
    }
    grid[player.gridPos.x][player.gridPos.y][player.gridPos.z-1].stackedUnder=null;
    player.gridPos=pos;
    grid[pos.x][pos.y][pos.z]=player;
    */
    return true;
}
function loopTileGrid(arr,f){
    arr.forEach(function(x){x.forEach(function(y){y.forEach(function(z){z?.resetSegment();})})});
}

/*function getTile(Pos={x:0,y:0,z:0},arr=Terrain){ 
    return arr[Pos.x]?arr[Pos.x][Pos.y]?arr[Pos.x][Pos.y][Pos.z]?arr[Pos.x][Pos.y][Pos.z]:null:null:null;
}*/
function getRandomTile(arr=Terrain){
    let result=null;
    while(result==null||result.objectType!='Tile'){
        let rx = Math.floor(Math.random() * arr.length);
        let ry = Math.floor(Math.random() * arr[rx].length);if(ry>=arr[rx].length)continue;
        let rz = Math.floor(Math.random() * arr[rx][ry].length);
        result=getTile(rx,ry,rz,arr);
    }
    return result;
}
function getTileCoordinates(x,y,z=0){
    return {x:(TileWidth*x)+(TileWidth*y),y:(TileHeight*x)+(TileHeight*y),z:(71*z)};
}
function distance(x,y,x1,y2){
    return Math.sqrt(Math.pow(x-x1,2)+Math.pow(y-y2,2))
}
function randomRange(min,max){
    return Math.round((max-min) * Math.random())+min;
}
function resizeCanvas(){
    var w = this.document.body.offsetWidth;
    var h = this.document.body.offsetHeight;
    canvas.width = w;
    canvas.height = h;
    c.translate(w/2,h/2);
    c.strokeStyle = 'red';
    c.fillStyle = 'black';
    GameCamera.view.width=w;
    GameCamera.view.height=h;
    GameCamera.CanvasUpdate();
}
function spawnPlayer(Tile){
    while(Tile.stackedUnder!=null)Tile=Tile.stackedUnder;
    player = new PlayerBase({x:Tile.gridPos.x,y:Tile.gridPos.y,z:Tile.gridPos.z+1})
    Characters.push(player);
    ControlebleCharacters.push(player);
    //GameCamera.selectedItem.setPosition(structuredClone(Tile.gridPos));
    Terrain[Tile.gridPos.x][Tile.gridPos.y][Tile.gridPos.z+1]=player;
}
function spawnDummy(Tile){
    while(Tile.stackedUnder!=null)Tile=Tile.stackedUnder;
    player = new DummyBase({x:Tile.gridPos.x,y:Tile.gridPos.y,z:Tile.gridPos.z+1});
    Characters.push(player);
    //GameCamera.selectedItem.setPosition(structuredClone(Tile.gridPos));
    Terrain[Tile.gridPos.x][Tile.gridPos.y][Tile.gridPos.z+1]=player;
}
function tick(){
    if(!Paused){
        try{
            if(keys.left&&GameCamera.view.x>=0)GameCamera.view.x-=5;
            if(keys.right&&GameCamera.view.x+GameCamera.view.width<=(st.x+st.y)*TileWidth+TileWidth)GameCamera.view.x+=5;
            if(keys.up&&GameCamera.view.y>=-st.x*TileHeight)GameCamera.view.y-=5;
            if(keys.down&&GameCamera.view.y+GameCamera.view.height<=st.y*TileHeight+102)GameCamera.view.y+=5;
            if(keys.enter){
                if(GameCamera.zoomIn<2.0)
                GameCamera.zoomIn+=0.02;
            }else if(GameCamera.zoomIn>1.0) GameCamera.zoomIn-=0.02;
            
            for (let i = 0; i < Characters.length; i++) {
                Characters[i].tick();
            }
        }catch(error){
            alert("run time Error: "+ error);
        }
    }
    GameCamera.tick();
    
    
    animate();
    //SelectedTile = getTileByMousePosition(CursorPosition.x,CursorPosition.y,GameCamera);
    //Characters[0].setPossition(SelectedTile? SelectedTile : {x:0,y:0,z:0});
    //Characters[0].MovementPath.end=Characters[0].MovementPath.movementArea[randomRange(0,st.x-1)][randomRange(0,st.y)][0];
    //Characters[0].MovementPath.GeneratePath(SelectedTile?SelectedTile.gridPos:{x:0,y:0,z:0});
    setTimeout(() => {
        tick();
    }, 1000/60)
}
function renderTerrain(){
    GameCamera.renderView(Terrain);
    //Terrain.reduceRight((_,x) => x.forEach(function(y){y.forEach(function(z){z?.draw()})}));
    //Terrain.forEach(function(x){x.forEach(function(y){y.forEach(function(z){z?.draw()})})});
}
function animate(){
    //window.requestAnimationFrame(animate);
    if(renderfreeze>0){renderfreeze--;return;}
    c.fillStyle = 'cyan';  
    c.fillRect(-canvas.width,-canvas.height, canvas.width*2, canvas.height*2);
    try {
        renderTerrain();
    } catch (error) {
        alert("RENDERING-ERROR:" + error);
    }
    
}
resizeCanvas();
GameCamera.updateDisabledTiles();
setTimeout(() => {
    GameCamera.setView(Characters[0].position);
    //GameCamera.view.x=Characters[0].position.x;
    //GameCamera.view.y=Characters[0].position.y;
    //GameCamera.view.x=-canvas.width/2;
    //GameCamera.view.y=-canvas.height/2; 
    tick();
    animate();
}, 1000/60);

function getCursorPosition(event){
    CursorPosition.x=event.clientX;
    CursorPosition.y=event.clientY;
}
function ClickEvent(event){
    GameCamera?.triggerClick();
}
function ClickReleaseEvent(event){
    GameCamera?.triggerClickRelease();
}

window.addEventListener('keydown', (event) => {
    switch(event.key){
        case ' ': keys.enter=true; break;
        case 'd': keys.right=true; break;
        case 's': keys.down=true; break;
        case 'a': keys.left=true; break;
        case 'w': keys.up=true; break;
    }
});

window.addEventListener('keyup', (event) => {
    switch(event.key){
        case ' ': keys.enter=false; break;
        case 'd': keys.right=false; break;
        case 's': keys.down=false; break;
        case 'a': keys.left=false; break;
        case 'w': keys.up=false; break;
    }
})

window.addEventListener('resize',resizeCanvas,false);