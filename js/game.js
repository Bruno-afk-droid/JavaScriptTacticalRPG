//Het scherm opbouwen
c.imageSmoothingEnabled = false;

//Camera object aanmaken
camera = new Camera({x:-canvas.width,y:-canvas.height, width:canvas.width*2, height:canvas.height*2});

c.fillRect(-canvas.width,-canvas.height, canvas.width*2, canvas.height*2);

//anders objecten die gebruikt worden
let Objects = [];
let keys = {enter: false,right: false,down: false, left:false, up:false};
let Terrain = new Array();
let TerrainUI = new Array();
let TerrainStart ={x:0,y:0,z:0};
let Players = new Array();

//Grote van de tiles worden hier ingesteld
w = 47;
h = 23;
let st = {x:0,y:0,z:0};

//Het terrein opbouwen obv door speler ingevoerde configuratie
Lx = gup('TerrainSize');
st.x=Math.max(st.x,Lx);
for (let x = 0; x < Lx; x++) {
    Terrain[x] = new Array();       
    Ly = gup('TerrainSize');
    st.y=Math.max(st.y,Ly-1);
    for (let y = 0; y < Ly; y++) {
        Terrain[x][y]=new Array();
        Lz = randomRange(1 ,3);
        if(Lz!=3)Lz=1;
        st.z=Math.max(st.z,Lz);
        for (let z = 0; z < Lz; z++) {
            AddTile(x,y,z);
        }
    }
}Terrain.push(new Array());
TerrainStart={x:-((w*st.x)+(w*st.y))/2,y:-(-(h*st.x)+(h*st.y))/2,z:0};

//spawn het player object op een random tile
spawnPlayer(GetRandomTile());

//initialiseert plan fase van het spel
setUpPlanPhase();


//Terrain.forEach(function(x){x.forEach(function(y){y.forEach(function(z){ConnectTile(z.Gridpos.x,z.Gridpos.y,z.Gridpos.z,z)})})});

function AddTile(x,y,z,tile=new GridTile({x:x,y:y,z:z}),arr=Terrain){ 
    while(arr.length-1<x)arr.push(new Array());
    while(arr[x].length-1<y)arr[x].push(new Array());
    while(arr[x][y].length-1<z)arr[x][y].push(null);
    arr[x][y][z] = tile;


    //north
    if(GetTile(x,y-1,z,arr)!=null){
        arr[x][y][z].Adjacent.N=arr[x][y-1][z];
        arr[x][y-1][z].Adjacent.S=arr[x][y][z];
    }

    //east
    if(GetTile(x+1,y,z,arr)!=null){
        arr[x][y][z].Adjacent.E=arr[x+1][y][z];
        arr[x+1][y][z].Adjacent.W=arr[x][y][z];
    }

    //south
    if(GetTile(x,y+1,z,arr)!=null){
        arr[x][y][z].Adjacent.S=arr[x][y+1][z];
        arr[x][y+1][z].Adjacent.N=arr[x][y][z];
    }

    //west
    if(GetTile(x-1,y,z,arr)!=null){
        arr[x][y][z].Adjacent.W=arr[x-1][y][z];
        arr[x-1][y][z].Adjacent.E=arr[x][y][z];
    }

    //north-east
    if(GetTile(x+1,y-1,z,arr)!=null){
        arr[x][y][z].Adjacent.NE=arr[x+1][y-1][z];
        arr[x+1][y-1][z].Adjacent.SW=arr[x][y][z];
    }
    //south-east
    if(GetTile(x+1,y+1,z,arr)!=null){
        arr[x][y][z].Adjacent.SE=arr[x+1][y+1][z];
        arr[x+1][y+1][z].Adjacent.NW=arr[x][y][z];
    }    
    //norht-west
    if(GetTile(x-1,y-1,z,arr)!=null){
        arr[x][y][z].Adjacent.NW=arr[x-1][y-1][z];
        arr[x-1][y-1][z].Adjacent.SE=arr[x][y][z];
    }
    //south-west
    if(GetTile(x-1,y+1,z,arr)!=null){
       arr[x][y][z].Adjacent.SW=arr[x-1][y+1][z];
       arr[x-1][y+1][z].Adjacent.NE=arr[x][y][z];
    }

    //down
    if(GetTile(x,y,z-1,arr)!=null){
        arr[x][y][z].StackedOn=arr[x][y][z-1];
        arr[x][y][z-1].StackedUnder=arr[x][y][z];
        arr[x][y][z-1].hidden=true;
    }
    //up
    if(GetTile(x,y,z+1,arr)!=null){
        arr[x][y][z].StackedUnder=arr[x][y][z+1];
        arr[x][y][z+1].StackedOn=arr[x][y][z];
    }
}
function ConnectTile(x,y,z,tile,arr=Terrain){
    //north
    if(GetTile(x,y-1,z,arr)!=null){
        arr[x][y][z].Adjacent.N=arr[x][y-1][z];
        arr[x][y-1][z].Adjacent.S=arr[x][y][z];
    }

    //east
    if(GetTile(x+1,y,z,arr)!=null){
        arr[x][y][z].Adjacent.E=arr[x+1][y][z];
        arr[x+1][y][z].Adjacent.W=arr[x][y][z];
    }

    //south
    if(GetTile(x,y+1,z,arr)!=null){
        arr[x][y][z].Adjacent.S=arr[x][y+1][z];
        arr[x][y+1][z].Adjacent.N=arr[x][y][z];
    }

    //west
    if(GetTile(x-1,y,z,arr)!=null){
        arr[x][y][z].Adjacent.W=arr[x-1][y][z];
        arr[x-1][y][z].Adjacent.E=arr[x][y][z];
    }

    //north-east
    if(GetTile(x+1,y-1,z,arr)!=null){
        arr[x][y][z].Adjacent.NE=arr[x+1][y-1][z];
        arr[x+1][y-1][z].Adjacent.SW=arr[x][y][z];
    }
    //south-east
    if(GetTile(x+1,y+1,z,arr)!=null){
        arr[x][y][z].Adjacent.SE=arr[x+1][y+1][z];
        arr[x+1][y+1][z].Adjacent.NW=arr[x][y][z];
    }    
    //norht-west
    if(GetTile(x-1,y-1,z,arr)!=null){
        arr[x][y][z].Adjacent.NW=arr[x-1][y-1][z];
        arr[x-1][y-1][z].Adjacent.SE=arr[x][y][z];
    }
    //south-west
    if(GetTile(x-1,y+1,z,arr)!=null){
       arr[x][y][z].Adjacent.SW=arr[x-1][y+1][z];
       arr[x-1][y+1][z].Adjacent.NE=arr[x][y][z];
    }

    //down
    if(GetTile(x,y,z-1,arr)!=null){
        arr[x][y][z].StackedOn=arr[x][y][z-1];
        arr[x][y][z-1].StackedUnder=arr[x][y][z];
        arr[x][y][z-1].hidden=true;
    }
    //up
    if(GetTile(x,y,z+1,arr)!=null){
        arr[x][y][z].StackedUnder=arr[x][y][z+1];
        arr[x][y][z+1].StackedOn=arr[x][y][z];
    }
}
function GetTile(x=0,y=0,z=0,arr=Terrain){
    return arr[x]?arr[x][y]?arr[x][y][z]?arr[x][y][z]:null:null:null;
}
function LoopTileGrid(arr,f){
    arr.forEach(function(x){x.forEach(function(y){y.forEach(function(z){z?.resetSegment();})})});
}

/*function GetTile(Pos={x:0,y:0,z:0},arr=Terrain){ 
    return arr[Pos.x]?arr[Pos.x][Pos.y]?arr[Pos.x][Pos.y][Pos.z]?arr[Pos.x][Pos.y][Pos.z]:null:null:null;
}*/
function GetRandomTile(arr=Terrain){
    let result=null;
    while(result==null){
        let rx = Math.floor(Math.random() * arr.length);
        let ry = Math.floor(Math.random() * arr[rx].length);if(ry>=arr[rx].length)continue;
        let rz = Math.floor(Math.random() * arr[rx][ry].length);
        result=GetTile(rx,ry,rz,arr);
    }
    return result;
}
function GetTileCoordinates(x,y,z=0){
    return {x:(w*x)+(w*y),y:(h*x)+(h*y),z:(71*z)};
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
    camera.view.width=w;
    camera.view.height=h;
    camera.CanvasUpdate();
}
function spawnPlayer(Tile){
    while(Tile.StackedUnder!=null)Tile=Tile.StackedUnder;
    player = new PlayerBase({x:Tile.Gridpos.x,y:Tile.Gridpos.y,z:Tile.Gridpos.z+1},Terrain)
    Players.push(player);
    //camera.selectedItem.setPosition(structuredClone(Tile.Gridpos));
    Terrain[Tile.Gridpos.x][Tile.Gridpos.y][Tile.Gridpos.z+1]=player;
}
function tick(){
    if(!Paused){
        if(keys.left)camera.view.x-=5;
        if(keys.right)camera.view.x+=5;
        if(keys.up)camera.view.y-=5;
        if(keys.down)camera.view.y+=5;
        if(keys.enter){
            if(camera.zoomIn<2.0)
            camera.zoomIn+=0.02;
        }else if(camera.zoomIn>1.0) camera.zoomIn-=0.02;
        
        for (let i = 0; i < Players.length; i++) {
            Players[i].tick();
        }
    }
    camera.tick();
    
    
    animate();
    //SelectedTile = GetTileByMousePosition(CursorPosition.x,CursorPosition.y,camera);
    //Players[0].setPossition(SelectedTile? SelectedTile : {x:0,y:0,z:0});
    //Players[0].MovementPath.end=Players[0].MovementPath.movementArea[randomRange(0,st.x-1)][randomRange(0,st.y)][0];
    //Players[0].MovementPath.GeneratePath(SelectedTile?SelectedTile.Gridpos:{x:0,y:0,z:0});
    setTimeout(() => {
        tick();
    }, 1000/60)
}
function renderTerrain(){
    camera.renderView(Terrain);
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
        console.log("RENDERING-ERROR");
    }
    
}
resizeCanvas();

setTimeout(() => {
    camera.setView(Players[0].position);
    //camera.view.x=Players[0].position.x;
    //camera.view.y=Players[0].position.y;
    //camera.view.x=-canvas.width/2;
    //camera.view.y=-canvas.height/2; 
    tick();
    animate();
}, 1000/60);

function getCursorPosition(event){
    CursorPosition.x=event.clientX;
    CursorPosition.y=event.clientY;
}
function ClickEvent(event){
    camera?.triggerClick();
}
function ClickReleaseEvent(event){
    camera?.triggerClickRelease();
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