const SpriteDepthComparisonCallback = (arrayItemA, arrayItemB) => {
    if (arrayItemA.depth < arrayItemB.depth) {
      return -1
    }
  
    if (arrayItemA.depth > arrayItemB.depth) {
      return 1
    }
  
    return 0
}
function test(){
    console.log('test');
}
function PauseGame(){
    renderTerrain();
    Paused=!Paused;
    setAll(camera.PauseMenu,'hidden',!Paused);     
    camera.PauseMenu[4].hidden=true;
}
function closeHelpMenu(){
    this.HelpMenu.style.visibility='hidden';
}
function StartFightPhase(){
    if(GamePhase!='plan')return
    for (const player of Players) {
        PlayersInAction++;
        player.setMovement();
        player.MovementPath.hidden=true;
        player.ActionCircle.hidden=true;
        camera.deHighLightArea(player.MovementArea);
    }
    GamePhase='action';
}
function setUpPlanPhase(){ 
    for (const player of Players) {
        player.MovementPath.hidden=false;
        player.ActionCircle.hidden=false;
        camera.highLightArea(player.MovementArea);
    }
    GamePhase='plan';
}
//De camera class regelt het perspectief aan de hand toesten die de gebruiker intoetst.
//Daarna wordt het scherm gerenderd met dat perspectief.
class Camera { 
    constructor(view={x:0,y:0,width:canvas.width,height:canvas.height}){
        this.view=view;
        this.renderingTiles=new Array();
        this.zoomIn=1.0;
        this.selectCursor = {x:0,y:0,z:0};
        this.selectedPos = null;
        this.selectebleTiles = {};
        this.UIItems=new Array();
        //<iframe src='help.html' title='test'></iframe>
        this.HelpMenu=createFrame(0,0,500,600);
        this.HelpMenu.style.visibility='hidden';
        this.selectedItem=null;
        this.UIItems.push(new Button({x:0,y:0,z:0},'Button','ButtonSelected','ButtonSelected',new Function("this.hidden=!Paused;PauseGame();"),90,64,'Pause','RIGHT-UP'));
        this.UIItems.push(new Button({x:0,y:0,z:0},'Button','ButtonSelected','ButtonSelected',StartFightPhase,90,64,'Start','RIGHT-DOWN'));

        this.HelpMenuCancelButton = new Button({x:-79*1.5,y:324,z:Infinity},'PFButton','PFButtonSelected','PFButtonSelected',new Function("camera.HelpMenu.style.visibility='hidden';camera.HelpMenuCancelButton.hidden=true;"),156*1.5,24*1.5,'Continue',"CENTER"),
        this.PauseMenu=[
            new UIBox({x:-96*1.5,y:-128*1.5,z:Infinity},'PauseFrame',192*1.5,254*1.5,new Array(),"CENTER"),
            new Button({x:-79*1.5,y:-112*1.5,z:Infinity},'PFButton','PFButtonSelected','PFButtonSelected',new Function("camera.UIItems[1].trigger();"),156*1.5,24*1.5,'Resume',"CENTER"),
            new Button({x:-79*1.5,y:-112*1.5+48,z:Infinity},'PFButton','PFButtonSelected','PFButtonSelected',new Function("camera.HelpMenu.style.visibility='visible';camera.HelpMenuCancelButton.hidden=false;"),156*1.5,24*1.5,'Help',"CENTER"),
            new Button({x:-79*1.5,y:-112*1.5+96,z:Infinity},'PFButton','PFButtonSelected','PFButtonSelected',new Function("window.location.href = 'index.html';"),156*1.5,24*1.5,'Quit',"CENTER"),
            this.HelpMenuCancelButton
        ];
        setAll(this.PauseMenu,'hidden',true);
        for (const item of this.PauseMenu) {
            this.UIItems.push(item);
        }
        

    }   
    setView(pos){
        this.view.x=pos.x-(this.view.width/2);
        this.view.y=pos.y-pos.z-(this.view.height/2);
    }
    inView(spr){
        return (spr!=null&&this.view.x-spr.width<spr.position.x
            &&this.view.y-spr.height<spr.position.y-spr.position.z+74
            &&this.view.y+this.view.height>spr.position.y-spr.position.z
            &&this.view.x+this.view.width>spr.position.x);
    }
    highLightArea(area){
        for (let tile of GridTile.GetAreaInRect(Terrain,GridTile.GetAreaBounds(this.selectebleTiles))) {
            for(let x = 0; x<area.length;x++)
            for(let y = 0; y<area[x].length; y++)
            for(let z = 0; z<area[x][y].length;z++){
                let currentTile = GetTile(x,y,z,area);
                if(!currentTile
                    ||tile.StackedOn?.S==tile
                    ||tile.Gridpos.z<=z)continue;
                if(tile.isColliding(currentTile)){
                    tile.MakeTransparent();
                } 
            }
        }
    }
    deHighLightArea(area){
        for (let tile of GridTile.GetAreaInRect(Terrain,GridTile.GetAreaBounds(this.selectebleTiles))) {
            for(let x = 0; x<area.length;x++)
            for(let y = 0; y<area[x].length; y++)
            for(let z = 0; z<area[x][y].length;z++){
                let currentTile = GetTile(x,y,z,area);
                if(!currentTile
                    ||tile.StackedOn?.S==tile
                    ||tile.Gridpos.z<=z)continue;
                if(tile.isColliding(currentTile)){
                    tile.RemoveTransparent();
                } 
            }
        }
    }
    tick(){
        let cursor={
            x:(-0.5+CursorPosition.x/(this.view.width))/this.zoomIn+0.5,
            y:(-0.5+CursorPosition.y/(this.view.height))/this.zoomIn+0.5,
            z:this.zoomIn
        };
        this.selectCursor={x:(this.view.width*cursor.x)+this.view.x,y:(this.view.height*cursor.y)+this.view.y,z:0};
        //let Zim ={x:CursorPosition.x+this.view.x,y:CursorPosition.y+this.view.y,z:0}
            this.renderingTiles = [];
            for (let x = Terrain.length-1; x >= 0; x--) {
                for (let y = 0; y < Terrain[x].length; y++) {
                    for (let z = 0; z < Terrain[x][y].length; z++) {
                        if(this.inView(Terrain[x][y][z])){
                            this.renderingTiles.push(Terrain[x][y][z]);
                        }
                    }
                }  
            }
            for (const item of TerrainUI) {
                this.renderingTiles.push(item);
            }
            for (const item of this.UIItems) {
                this.renderingTiles.push(item);
            }

            this.renderingTiles.sort(SpriteDepthComparisonCallback);
            this.tickUIElements();
        
    }
    tickUIElements(){
        this.selectedItem?.tick();
        if(this.selectedItem&&(this.selectedItem.ContainsPosition(this.selectCursor)||this.selectedItem.state=='triggerd'))return;
        this.selectedItem?.deSelect();
        this.selectedItem=null;
        for (const item of this.UIItems) {
            if((!item.relative&&item.ContainsPosition(this.selectCursor))
            ||((item.relative&&item.ContainsPosition(CursorPosition,-this.view.width/2,-this.view.height/2)))){
                if(Paused&&!this.PauseMenu.includes(item))continue;
                item.select();
                this.selectedItem=item;
            }
        }
    }
    CanvasUpdate(){
        for (const item of this.UIItems) {
            item.updatePosition();
        }
        this.HelpMenu.style.left = canvas.width/2-this.HelpMenu.width/2+'px';
        this.HelpMenu.style.top = canvas.height/2-this.HelpMenu.height/2+'px';
    }
    triggerClick(){
        this.selectedItem?.trigger();
    }
    triggerClickRelease(){
        this.selectedItem?.triggerRelease();
    }
    renderView(Terrain){
        let rel = {x:this.view.x+(this.view.width/2),y:this.view.y+(this.view.height/2),z:this.zoomIn};
        for(const render of this.renderingTiles){
            if(!Paused||this.PauseMenu.includes(render))
            render.draw(rel);
        }
    }
}
//De sprite class wordt gebruikt om alle images te renderen in het scherm
//Het is het parent object van alle object die zichtbaar zijn in het scherm
class Sprite {
    constructor(position, image,width=48,height=96){
        this.position=position;

        this.image = Images[image];
        this.width = width;
        this.height = height;
        this.depth = position.z+(1/(this.width*this.height));
        this.hidden=false;
        this.transparent=false;
    }
    
    draw(pos={x:0,y:0,z:1}){
        if(this.hidden)return;
        try {
            c.drawImage(this.image, 
                (this.position.x-pos.x)*pos.z, 
                (this.position.y-pos.y-(this.position.z))*pos.z,
                this.width*pos.z,this.height*pos.z);
        } catch (error) {
            console.log("(x:"+(this.position.x-pos.x)*pos.z+" y:"+(this.position.y-pos.y-(this.position.z))*pos.z+" z:"+(this.position.y-pos.y-(this.position.z))*pos.z+") "+error);   
        }    

    }

    ContainsPosition(pos,x=0,y=0){
        return (pos!=null
        && this.position.x < pos.x+x
        && this.position.x + this.width > pos.x+x
        && this.position.y-this.position.z < pos.y+y
        && this.position.y-this.position.z+this.height > pos.y+y);
    }

    isColliding(target){
        return (target!=null
        && this.position.x < target.position.x+target.width
        && this.position.x + this.width > target.position.x 
        && this.position.y-this.position.z < target.position.y+target.height-target.position.z
        && this.position.y-this.position.z+this.height > target.position.y-target.position.z)
    }

    RemoveTransparent(){
        switch(this.image){
            case Images['TileT']: this.image=Images['Tile'];
            case Images['WallLeftT']:this.image=Images['WallLeft'];break;
            case Images['WallRightT']:this.image=Images['WallRight'];
        }
    }

    update() {
        this.draw();
    }
}
//UIItem geeft het sprite object extra UI  mogelijkheden
class UIItem extends Sprite { 
    constructor(pos={x:0,y:0,z:999},image,width,height,depth=0,relative=""){
        super(pos,image,width,height);
        this.depth=depth;
        this.position.z=0;
        this.relative=relative;
        this.relativePos={x:0,y:0,z:1};
        this.updatePosition();
        this.state="neutral";
        this.value=null;
    }
    select(){
        this.state="selected";
    }
    deSelect(){
        this.state="neutral";
    }
    trigger(){
        this.state="triggerd";
    }
    triggerRelease(){
        this.state="neutral";
    }
    tick(){
        
    }
    ContainsPosition(pos,x=0,y=0){
        return pos!=null&&!this.hidden&&((this.relative!=""
        && this.position.x-this.relativePos.x < pos.x+x
        && this.position.x-this.relativePos.x + this.width > pos.x+x
        && this.position.y-this.relativePos.y-this.position.z < pos.y+y
        && this.position.y-this.relativePos.y-this.position.z+this.height > pos.y+y)||(this.relative==""&&super.ContainsPosition(pos,x,y))) ? this : null;
    }
    updatePosition(){
        if(this.relative?.includes("CENTER"))return;
        if(this.relative?.includes("UP"))this.relativePos.y=canvas.height/2;
        if(this.relative?.includes("RIGHT"))this.relativePos.x=-canvas.width/2+this.width;
        if(this.relative?.includes("DOWN"))this.relativePos.y=-canvas.height/2+this.height;
        if(this.relative?.includes("LEFT"))this.relativePos.x=canvas.width/2;
    }
    draw(pos={x:0,y:0,z:1}){
        super.draw(this.relative!=""? this.relativePos : pos);
    }
}
//UIBox is een UIItem wat UI image kan laten zien zonder functionaliteit.
class UIBox extends UIItem {
    constructor(pos={x:0,y:0,z:999},image,width,height,depth=Infinity,relative=""){
        super(pos,image,width,height,depth);
        this.relative=relative;
    } 
    draw(pos={x:0,y:0,z:1}){
        super.draw(this.relative? this.relativePos : pos);
    }
}
//Button is een UIItem die een doorgegeven functie doorgeeft wanneer het getriggerd wordt.
class Button extends UIItem{
    constructor(pos={x:0,y:0,z:0},image,selectImage,triggerImage,triggerEvent,width,height,text="",relative=""){
        super(pos,image,width,height,Infinity,relative);
        this.neutralImage=this.image;
        this.selectImage=Images[selectImage];
        this.triggerImage=Images[triggerImage];
        this.triggerEvent=triggerEvent;
        this.depth=100;
        this.text=text;
    }
    select(){
        super.select();
        this.image=this.selectImage;
    }
    deSelect(){
        super.deSelect();
        this.image=this.neutralImage;
    }
    trigger(){
        super.trigger();
        this.image=this.triggerImage;
        this.triggerEvent();
    }
    triggerRelease(){
        super.select();
        this.image=this.neutralImage;
    }
    draw(pos={x:0,y:0,z:1}){
        if(this.hidden)return;
        let p = this.relative!=""? this.relativePos : pos;
        super.draw(pos);
        c.fillStyle = "black";
        c.font = this.height/2+"px Impact";
        c.fillText(this.text,this.position.x-p.x+this.width/2-(this.text.length*(this.height/8)),this.position.y-p.y+(this.height*0.65));
    }
} 
//MovementAction is een UIItem die de speler gebruikt om de acties van de speler in te stellen
class MovementAction extends UIItem{
    constructor(pos={x:0,y:0,z:0},image,selectImage,triggerImage,triggerEvent,width,height){
        super(pos,image,width,height);
        this.relative="";
        this.neutralImage=this.image;
        this.selectImage=Images[selectImage];
        this.triggerImage=Images[triggerImage];
        this.triggerEvent=triggerEvent;

        this.Gridpos={x:0,y:0,z:0};
        this.Cursor={x:0,y:0,z:0};
    }
    setPosition(pos={x:0,y:0,z:0}){
        this.position=GridTile.GetTileCoordinates(pos.x,pos.y,pos.z);
        this.Gridpos = structuredClone(pos);
    }
    select(){
        super.select();
        this.image=this.selectImage;
    }
    deSelect(){
        super.deSelect();
        this.image=this.neutralImage;
    }
    trigger(){
        super.trigger();
        this.image=this.triggerImage;
        if(this.triggerEvent)
        this.triggerEvent();
    }
    triggerRelease(){
        super.select();
        this.image=this.neutralImage;
    }
    tick(){
        switch(this.state){
            case "neutral": break;
            case "selected": break;
            case "triggerd": 
            let distance=500;
            for (const tile of camera.selectebleTiles) {
                let d = tile.ContainsPosition(camera.selectCursor);
                if(d&&d<distance) {
                    distance=d;
                    this.Cursor=tile.Gridpos;
                } 
            }
            //this.selectCursor.position=Zim;
            if(!samePosition(this.Cursor,this.previousPos)){
                //Players[0].MovementArea=Players[0].GenerateMovementArea(15);
                Players[0].MovementPath.GeneratePath(this.Gridpos,this.Cursor);
                //TerrainUI[0]=Players[0].MovementPath;
                //console.log("generate")
                this.previousPos=this.Cursor;
            }
            break;
        }
    }
}
//GridTile is een sprite object dat wordt gebruikt als een tegel in het terrein.
class GridTile extends Sprite{
    constructor(pos,image='Tile'){
        super(GridTile.GetTileCoordinates(pos.x,pos.y,pos.z),image);
        this.Gridpos=pos;
        this.width = 94;
        this.height = 48;
        this.depth=0;
        this.LeftWall=null;
        this.RightWall=null;
        this.Adjacent={N:null,E:null,S:null,W:null,NE:null,SE:null,SW:null,NW:null};
        this.StackedOn=null;
        this.StackedUnder=null;
        this.completelyHidden=false;
        this.selected=false;
        this.spread=0;
        this.LeftWall=new Sprite({x:this.position.x,y:this.position.y+23,z:this.position.z},this.transparent? 'WallLeftT':'WallLeft');
        this.RightWall=new Sprite({x:this.position.x+48,y:this.position.y+23,z:this.position.z},this.transparent? 'WallRightT':'WallRight');
    }

    static GetTileCoordinates(x,y,z=0){
        return {x:(47*x)+(47*y),y:-(23*x)+(23*y),z:(71*z)};
    }
    static GetAreaInRect(area,Rect={x:0,y:0,width:0,height:0}){
        let result=new Array();
        for (let x=area.length-1;x>=0;x--) 
        for (let y=0;y<area[x].length;y++)
        for (let z=0;z<area[x][y].length;z++){
            let current=GetTile(x,y,z,area);
            if(current?.isColliding(Rect))result.push(current);
        }
        return result;
    }
    static GetAreaBounds(area){
        if(!area)return {x:0,y:0,width:0,height:0};
        let GB = this.GetAreaGridBounds(area);
        return {
            position:GB.start,
            width:GB.end.x-GB.start.x+94,
            height:(GB.end.y-GB.end.z)-(GB.start.y-GB.start.z)+48
        };
    }
    static GetAreaGridBounds(area){
        let result={start:{x:-1,y:-1,z:-1},end:{x:-1,y:-1,z:-1}};
        for (const c of area) {
            //BoundsStart
            if(result.start.x>c.position.x||result.start.x==-1)result.start.x=c.position.x;
            if(result.start.y-result.start.z>c.position.y-c.position.z||result.start.y==-1)result.start.y=c.position.y-c.position.z;
            //BoundsEnd
            if(result.end.x<c.position.x||result.end.x==-1)result.end.x=c.position.x;
            if(result.end.y-result.end.z<c.position.y-c.position.z||result.end.y==-1)result.end.y=c.position.y-c.position.z;
        }
        return result;
    }
    MovePosition(vel){
        this.position.x+=vel.x;
        this.position.y+=vel.y;
        this.position.z+=vel.z;
        this.depth=this.position.z+this.height;
    }
    setPossition(pos={x:0,y:0,z:0}){
        this.Gridpos.x=pos.x;
        this.Gridpos.y=pos.y;
        this.Gridpos.z=pos.z;

        this.position={x:(w*pos.x)+(w*pos.y),y:-(h*pos.x)+(h*pos.y),z:pos.z*71-23 };
        this.depth=this.position.z+this.height;
    }
    SelectTile(){
        this.image=Images['MovementTile'];
        this.selected=true;
        //this.Adjacent.S?.StackedUnder?.MakeTransparent();
        //this.Adjacent.W?.StackedUnder?.MakeTransparent();
    }
    DeselectTile(){
        this.image=Images['Tile'];
        this.selected=false;
        //this.Adjacent.S?.StackedUnder?.RemoveTransparent();
        //this.Adjacent.W?.StackedUnder?.RemoveTransparent();
    }
    ContainsPosition(pos,sca={x:0,y:0,z:0}){
        return (pos.x>this.position.x
            &&pos.y>this.position.y-this.position.z
            &&pos.y<this.position.y-this.position.z+this.height
            &&pos.x<this.position.x+this.width)? heuristic(pos,{x:this.position.x+(this.width/2),y:this.position.y-this.position.z+(this.height/2)}) : 500;
    }
    SpreadSelect(spread,select=new Array()){
        if(spread<=0||(spread<=this.spread&&select.includes(this))||this.StackedUnder)return select;
        if(!select.includes(this)){
            select.push(this);
        }
            this.SelectTile();
            this.spread=spread;
            //spread
            //this.Adjacent.forEach(element?.SpreadSelect(spread));
            for(let x=-1;x<=+1;x++)
            for(let y=-1;y<=+1;y++){
                let current = GetTile(this.Gridpos.x+x,this.Gridpos.y+y,this.Gridpos.z)
                if(!current)continue;
                if(x!=0&&y!=0){
                    let t1 = GetTile(this.Gridpos.x+x,this.Gridpos.y,this.Gridpos.z);
                    let t2 = GetTile(this.Gridpos.x,this.Gridpos.y+y,this.Gridpos.z);
                    if(
                    !t1||t1.StackedUnder||
                    !t2||t2.StackedUnder
                    )continue;
                    current.SpreadSelect(spread-1.5,select);
                }else 
                current.SpreadSelect(spread-1,select);
            }

            /*for (const dir in this.Adjacent) {
                if(dir.length>1&&!(this.Adjacent[dir[0]]||this.Adjacent[dir[1]]))continue;
                this.Adjacent[dir]?.SpreadSelect(spread-1,select);
                //console.log(dir);
            }//console.log("------------------");*/
        return select;
    }
    updateTile(area){
        for (const key in this.Adjacent) {
            let p = {x:0,y:0};
            switch(key){
                case "N": p ={x:0,y:-1}; break;
                case "NE": p ={x:1,y:-1}; break;
                case "E": p ={x:1,y:0}; break;
                case "SE": p ={x:1,y:1}; break;
                case "S": p ={x:0,y:1}; break;
                case "SW": p ={x:-1,y:1}; break;
                case "W": p ={x:-1,y:0}; break;
                case "NW": p ={x:-1,y:-1}; break;
            }
            this.Adjacent[key]=GetTile(this.Gridpos.x+p.x,this.Gridpos.y+p.y,this.Gridpos.z);
        }
    }
    /*
    MakeAdjecent(tile){
        if(this.Adjacent.includes(tile))return;
        for (let x = -1; x < 1; x++) 
        for (let y = -1; y < 1; y++) {
            if(tile?.Gridpos=={x:this.Gridpos.x+x,y:this.Gridpos.y+y,z:this.Gridpos.z}){
                let ans="";
                if(y!=0){
                    if(y<0)ans.push('N');
                    if(y>0)ans.push('S');
                }
                if(x>0)ans.push('E');
                if(x<0)ans.push('W');
                this.Adjacent[ans]=tile;
                tile.MakeAdjecent(this);
            }
        }
    }*/

    MakeTransparent(){
        this.transparent=true;
        this.image=Images['TileT'];
        if(!this.Adjacent.W)
        this.LeftWall.image=Images['WallLeftT'];
        if(!this.Adjacent.S)
        this.RightWall.image=Images['WallRightT'];
    } 
    RemoveTransparent(){
        this.transparent=false;
        this.image=Images['Tile'];
        if(!this.Adjacent.W)
        this.LeftWall.image=Images['WallLeft'];
        if(!this.Adjacent.S)
        this.RightWall.image=Images['WallRight'];
    }
    HighLight(){
        GetTile(this.Gridpos.x,this.Gridpos.y+1,this.Gridpos.z+1)?.MakeTransparent();
        GetTile(this.Gridpos.x-1,this.Gridpos.y,this.Gridpos.z+1)?.MakeTransparent();
        GetTile(this.Gridpos.x-1,this.Gridpos.y+1,this.Gridpos.z+1)?.MakeTransparent();
    }
    draw(pos={x:0,y:0,z:0}){
        if(this.StackedOn?.transparent)return;
        super.draw(pos);
        if(!this.Adjacent.W)
        this.LeftWall.draw(pos);
        if(!this.Adjacent.S)
        this.RightWall.draw(pos);
    }
}
//PlayerBase is een sprite object dat wordt gebruikt door de speler om basis acties uit te voeren
class PlayerBase extends Sprite{
    constructor(Gridpos,Terrain){
        super({x:0,y:0,z:0},'Player',94,94);
        this.Gridpos=Gridpos;
        this.Terrain=Terrain;
        this.setPossition(Gridpos);
        console.log(this.Gridpos);
        this.selectedAction='positioning';
        this.ActionCircle=new MovementAction({x:0,y:0,z:0},'MovementAction','SelectedMovementAction','MPSP',null,94,48);
        this.ActionCircle.setPosition({x:this.Gridpos.x,y:this.Gridpos.y,z:this.Gridpos.z-1});
        camera.UIItems.push(this.ActionCircle);
        this.MovementDistance=6;
        this.MovementArea=this.GenerateMovementArea(this.MovementDistance);
        this.MovementPath=new MovementPath(GetTile(Gridpos.x,Gridpos.y,Gridpos.z-1,this.MovementArea),GetRandomTile(this.MovementArea),this.MovementArea);
        this.MovementQueue=Array();
        this.MovementSpeed=2;
        this.MovementProgression=60;
        this.depth=this.position.z;
        TerrainUI.push(this.MovementPath);
    }
    setPossition(pos={x:0,y:0,z:0}){
        this.Gridpos.x=pos.x;
        this.Gridpos.y=pos.y;
        this.Gridpos.z=pos.z;

        this.position={x:(w*pos.x)+(w*pos.y),y:-(h*pos.x)+(h*pos.y),z:pos.z*71-23};
        this.depth=this.position.z+this.height;
    }
    setMovement(route=this.MovementPath){
        route.current=route.Path[route.Path.length-1];
        for (let i = route.Path.length-2; i >= 0; i--) {
            const e = route.Path[i];
            this.MovementQueue.push({
                x:e.Gridpos.x-e.previous.Gridpos.x,
                y:e.Gridpos.y-e.previous.Gridpos.y,
                z:e.Gridpos.z-e.previous.Gridpos.z
            });
        }
    }
    MoveWithGridPos(pos={x:0,y:0,z:0}){
        this.Gridpos.x+=Math.sign(pos.x);
        this.Gridpos.y+=Math.sign(pos.y);
        this.Gridpos.z+=Math.sign(pos.z);
        this.position=GridTile.GetTileCoordinates(this.Gridpos.x,this.Gridpos.y,this.Gridpos.z);
        this.position.z-=23;
    }
    MovePosition(vel){
        this.position.x+=vel.x;
        this.position.y+=vel.y;
        this.position.z+=vel.z;
    }
    tick(){
        if(GamePhase=='action'&&this.MovementQueue.length>0){
            let mp=structuredClone(this.MovementQueue[0]); 
            let mv=this.MovementQueue[0];
            if(mv.x.toFixed(1)!=0)mv.x-=0.1*Math.sign(mv.x);else mv.x=0;
            if(mv.y.toFixed(1)!=0)mv.y-=0.1*Math.sign(mv.y);else mv.y=0;
            if(mv.z.toFixed(1)!=0)mv.z-=0.1*Math.sign(mv.z);else mv.z=0;
            if(mv.x==0&&mv.y==0&&mv.z==0){
                this.MovementQueue.shift();
                this.MoveWithGridPos(mp);
                if(this.MovementQueue.length==0)return;
            }
            this.MovePosition(GridTile.GetTileCoordinates(
                0.1*Math.sign(mv.x),
                0.1*Math.sign(mv.y),
                0.1*Math.sign(mv.z)
            ));
        }else{
            if(GamePhase!='action')return;
            //this.MovementPath.start=GetTile(this.Gridpos.x,this.Gridpos.y,this.Gridpos.z,this.movementArea);
            this.MovementArea=this.GenerateMovementArea(this.MovementDistance);
            this.MovementPath.Regenerate(
                GetTile(this.Gridpos.x,this.Gridpos.y,this.Gridpos.z-1,this.movementArea),
                GetRandomTile(this.MovementArea),
                this.MovementArea
            );
            this.ActionCircle.setPosition({x:this.Gridpos.x,y:this.Gridpos.y,z:this.Gridpos.z-1});
            if(GamePhase=='action'&&--PlayersInAction<=0)setUpPlanPhase();
        }
    }
    HighLightPlayer(){

    }
    GenerateMovementArea(movement){
        let movementArea = new Array();
        if(this.MovementArea)
        for (const x of this.MovementArea)
        for (const y of x)
        for (const tile of y) {
            let c=GetTile(tile.Gridpos.x,tile.Gridpos.y,tile.Gridpos.z);
            if(!c)continue;
            c.spread=0;
            c.DeselectTile();
        }
        let Area=GetTile(this.Gridpos.x,this.Gridpos.y,this.Gridpos.z-1).SpreadSelect(movement);
        
        camera.selectebleTiles=Area;
        //console.log(Area);


        for (const t of Area) {
            //t.HighLight();
            AddTile(t.Gridpos.x,t.Gridpos.y,t.Gridpos.z,new PathSegment(t.Gridpos),movementArea);
        }
 
        return movementArea;
        //console.log(GetTile(this.Gridpos.x,this.Gridpos.y,this.Gridpos.z-1).SpreadSelect(movement,movementArea));
    }
    draw(pos={x:0,y:0,z:1}){
        super.draw(pos);
    }
    ContainsPosition(pos){
        return 500;
        return (pos.x>this.position.x
            &&pos.y>this.position.y
            &&pos.y<this.position.y+this.height
            &&pos.x<this.position.x+this.width)? heuristic(pos,{x:this.position.x+(this.width/2),y:this.position.y+(this.height/2)}) : 500;
    }
    MakeTransparent(){

    }
}
//MovementPath is een object wordt gebruikt om een pad te genereren tussen twee tiles
class MovementPath{
    constructor(start,end,movementArea){
        this.movementArea=movementArea;
        this.Path=new Array();

        this.start=start;
        this.end=end;
        this.GeneratePath();
        this.current=this.Path[this.Path.length-1];
        this.hidden=false;
    }
    Regenerate(start,end,movementArea){
        this.movementArea=movementArea;
        this.Path=new Array();

        this.start=start;
        this.end=end;
        this.GeneratePath();
        this.current=this.Path[this.Path.length-1];
    }
    getNextPathSegment(){
        if(this.current)this.current=this.current.after;
        return this.current;
    }
    HighlightMoventArea(){
        this.movementArea.forEach(function(x){
            x.forEach(function(y){
            y.forEach(function(z){
                
            })})
        });
    }
    resetMovementArea(){
        LoopTileGrid(this.movementArea,'SpreadSelect');
    }
    GeneratePath(start,end,Area=this.movementArea){
        this.resetMovementArea();
        var openSet = [];
        var closedSet = [];
        if(start)this.start=GetTile(start.x,start.y,start.z,Area);
        if(end)this.end=GetTile(end.x,end.y,end.z,Area);
        //console.log(end);
        //console.log(this.start.Gridpos);

        openSet.push(this.start);
        while(openSet.length > 0){
            var winner =0;
            for (var i=0; i<openSet.length; i++){
                if(openSet[i].f < openSet[winner].f) {
                    winner = i;
                }
            }
            var current = openSet[winner];
            if(current === this.end){
                this.Path=[];
                var temp = current;
                this.Path.push(temp);
                temp.updateSegment();
                while(temp.previous){
                    this.Path.push(temp.previous);
                    temp = temp.previous;
                }
                //this.Path.image=Images['SelectedTile'];
                return this.Path;
            }
            removeFromArray(openSet,current);
            closedSet.push(current);

            var adjacent = current.Adjacent;
            //var a = {1:adjacent.E,3:adjacent.W,2:adjacent.S,0:adjacent.N/*3.5:adjacent.NW,0.5:adjacent.NE,2.5:adjacent.SW,1.5:adjacent.SE*/};

            //var d = this.createLookout(a,dir);
            for (const key in adjacent) {
                var neighbor = adjacent[key];
                if(key.length>1&&(!adjacent[key[0]]||!adjacent[key[1]]))continue;
                if(neighbor==null||neighbor.StackedUnder!=null)continue;
                if(!closedSet.includes(neighbor)){
                    var tempG = current.g+1;

                    var newPath = false;
                    if(openSet.includes(neighbor)){
                        if(tempG <neighbor.g){
                            neighbor.g = tempG;
                            newPath = true;
                        }
                    } else {
                        neighbor.g = tempG;
                        newPath = true;
                        openSet.push(neighbor);
                    }

                    if(newPath){
                        neighbor.h = heuristic(neighbor,this.end);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.previous = current;
                        current.after=neighbor;
                    }
                }
            };
            //let previouskey=d.F;
        }
        console.log("Failed");
    }
    draw(pos={x:0,y:0,z:0}){
        if(this.hidden)return;
        for (let i = 0; i < this.Path.length; i++) {
            this.Path[i].draw(pos);       
        }
    }
}
//PathSegment is object dat gebruikt door de MovementPath object. Dit is deel van het pad.
class PathSegment extends Sprite{
    constructor(pos,dir=''){
        super(GridTile.GetTileCoordinates(pos.x,pos.y,pos.z),'MPSP',94,46);
         this.Gridpos=pos;
         this.dir=dir;
         this.f=0;
         this.g=0;
         this.h=0;
         this.Adjacent={N:null,E:null,S:null,W:null,NE:null,SE:null,SW:null,NW:null};
         this.previous=null;
         this.after=null;
    } 
    MovePosition(vel){
        this.position.x+=vel.x;
        this.position.y+=vel.y;
        this.position.z+=vel.z;
        this.depth=this.position.z+this.height;
    }
    resetSegment(){
        //GetTile(this.Gridpos.x,this.Gridpos.y+1,this.Gridpos.z+1)?.RemoveTransparent();
        //GetTile(this.Gridpos.x-1,this.Gridpos.y,this.Gridpos.z+1)?.RemoveTransparent();
        //GetTile(this.Gridpos.x-1,this.Gridpos.y+1,this.Gridpos.z+1)?.RemoveTransparent();
        this.previous=null;
        this.dir='end';
        this.f=0;
        this.g=0;
        this.h=0;
    }
    highLightSelf(){
        GetTile(this.Gridpos.x,this.Gridpos.y+1,this.Gridpos.z+1)?.MakeTransparent();
        GetTile(this.Gridpos.x-1,this.Gridpos.y,this.Gridpos.z+1)?.MakeTransparent();
        GetTile(this.Gridpos.x-1,this.Gridpos.y+1,this.Gridpos.z+1)?.MakeTransparent();
    }
    updateSegment(){
        //console.log(this.Gridpos.x+","+this.Gridpos.y);
        //GetTile(this.Gridpos.x,this.Gridpos.y+1,this.Gridpos.z+1)?.MakeTransparent();
        //GetTile(this.Gridpos.x-1,this.Gridpos.y,this.Gridpos.z+1)?.MakeTransparent();
        //GetTile(this.Gridpos.x-1,this.Gridpos.y+1,this.Gridpos.z+1)?.MakeTransparent();


        //if(!this.image||this.dir=='start')this.image=Images['MPSP'];
        if(!this.previous)return;

        let p1=this.Gridpos;
        let p2=this.previous.Gridpos;

        let x=p1.x-p2.x;
        let y=p1.y-p2.y;

            if(y>0){
                this.previous.dir=0;
                if(x>0)this.previous.dir=7;
                if(x<0)this.previous.dir=1;
            }else
            if(y<0){
                this.previous.dir=4;
                if(x>0)this.previous.dir=5;
                if(x<0)this.previous.dir=3;
            }else
            if(x>0){
                this.previous.dir=6;
            }else
            if(x<0){
                this.previous.dir=2;
            }

            if(!this.previous.previous){
                this.previous.image=PathRails['start'][this.previous.dir];
            }
            /*
            if(p1.y>p2.y)this.previous.dir=0;else
            if(p1.y<p2.y)this.previous.dir=2;else
        
            if(p1.x>p2.x)this.previous.dir=3;else
            if(p1.x<p2.x)this.previous.dir=1;
            */

            

        this.image=PathRails[this.dir][this.previous.dir];
        
        
        
        if(!this.image||this.dir<0)this.image=Images['SelectedTile'];
        
    
        this.previous.updateSegment();
    }
    SpreadSelect(spread,select){
        if(spread==0||this.StackedUnder!=null)return select;
            if(select[this.Gridpos.x][this.Gridpos.y][this.Gridpos.z]<spread){
                select[this.Gridpos.x][this.Gridpos.y][this.Gridpos.z]=spread;
                this.image=Images['MovementTile'];
            }
            //spread
            this.Adjacent.N?.SpreadSelect(spread-1,select);
            this.Adjacent.E?.SpreadSelect(spread-1,select);
            this.Adjacent.S?.SpreadSelect(spread-1,select);
            this.Adjacent.W?.SpreadSelect(spread-1,select);
        return select;
    }
    draw(pos={x:0,y:0,z:1}){
        super.draw(pos);
    }
}
