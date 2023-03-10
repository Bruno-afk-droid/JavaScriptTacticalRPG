const spriteDepthComparisonCallback = (a, b) => {
    return Math.sign(a.depth)-(b.depth);
}
function test(){
    console.log('test');
}
function pauseGame(){
    renderTerrain();
    Paused=!Paused;
    setAll(GameCamera.pauseMenu,'hidden',!Paused);     
    GameCamera.pauseMenu[4].hidden=true;
}
function closehelpMenu(){
    this.helpMenu.style.visibility='hidden';
}
function startFightPhase(){
    if(GamePhase!='plan')return
    for (const player of Characters) {
        player.setStateToFightPhase();
    }
    GamePhase='action';
}
function setUpPlanPhase(){ 
    for (const player of Characters) {
        player.setStateToPlanPhase();
        //GameCamera.highLightArea(player.movementArea);
    }
    GameCamera.updateDisabledTiles()
    GamePhase='plan';
}
//De Camera class regelt het perspectief aan de hand toesten die de gebruiker intoetst.
//Daarna wordt het scherm gerenderd met dat perspectief.
class Camera { 
    constructor(view={x:0,y:0,width:canvas.width,height:canvas.height}){
        this.view=view;
        this.renderingTiles=new Array();
        this.zoomIn=1.0;
        this.selectCursor = {x:0,y:0,z:0};
        this.selectebleTiles=new Array();
        this.disabledTiles=new Array();
        this.UIItems=new Array();
        this.UIPullItems=new Array();
        //<iframe src='help.html' title='test'></iframe>
        this.helpMenu=createFrame(0,0,500,600);
        this.helpMenu.style.visibility='hidden';
        this.selectedItem=null;
        this.UIItems.push(new Button({x:0,y:0,z:0},'Button','ButtonSelected','ButtonSelected',new Function("this.hidden=!Paused;pauseGame();"),90,64,'Pause','RIGHT-UP'));
        this.UIItems.push(new Button({x:0,y:0,z:0},'Button','ButtonSelected','ButtonSelected',startFightPhase,90,64,'Start','RIGHT-DOWN'));

        this.helpMenuCancelButton = new Button({x:-79*1.5,y:324,z:99999},'PFButton','PFButtonSelected','PFButtonSelected',new Function("GameCamera.helpMenu.style.visibility='hidden';GameCamera.helpMenuCancelButton.hidden=true;"),156*1.5,24*1.5,'Continue',"CENTER"),
        this.pauseMenu=[
            new UIBox({x:-96*1.5,y:-128*1.5,z:99999},'PauseFrame',192*1.5,254*1.5,9999,new Array(),"CENTER"),
            new Button({x:-79*1.5,y:-112*1.5,z:99999},'PFButton','PFButtonSelected','PFButtonSelected',new Function("GameCamera.UIItems[0].trigger();"),156*1.5,24*1.5,'Resume',"CENTER"),
            new Button({x:-79*1.5,y:-112*1.5+48,z:99999},'PFButton','PFButtonSelected','PFButtonSelected',new Function("GameCamera.helpMenu.style.visibility='visible';GameCamera.helpMenuCancelButton.hidden=false;"),156*1.5,24*1.5,'Help',"CENTER"),
            new Button({x:-79*1.5,y:-112*1.5+96,z:99999},'PFButton','PFButtonSelected','PFButtonSelected',new Function("window.location.href = 'index.html';"),156*1.5,24*1.5,'Quit',"CENTER"),
            this.helpMenuCancelButton
        ];
        setAll(this.pauseMenu,'hidden',true);
        for (const item of this.pauseMenu) {
            this.UIItems.push(item);
        }
        //this.renderingTiles=this.renderingTiles.sort(spriteDepthComparisonCallback);

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
    getHighlightableArea(area,grid=Terrain){
        return GridTile.getAreaInRect(grid,GridTile.getAreaBounds(area));
    }
    highLightArea(area,grid){
        //let a = this.getHighlightableArea(area,grid);
        for (let tile of this.getHighlightableArea(area,grid)) {
            if(tile.objectType!='Tile')continue;
            for(let x = 0; x<area.length;x++)
            for(let y = 0; y<area[x].length; y++)
            for(let z = 0; z<area[x][y].length;z++){
                let currentTile = getTile(x,y,z,area);
                if(!currentTile
                    ||tile.stackedOn?.S==tile
                    ||tile.gridPos.z<=z)continue;

                if(tile.isColliding(currentTile)){
                    tile.makeTransparent();
                } 
            }
        }
    }
    deHighLightArea(area,grid){
        for (let tile of this.getHighlightableArea(area,grid)) {
            if(tile.objectType!='Tile')continue;
            for(let x = 0; x<area.length;x++)
            for(let y = 0; y<area[x].length; y++)
            for(let z = 0; z<area[x][y].length;z++){
                let currentTile = getTile(x,y,z,area);
                if(!currentTile
                    ||tile.stackedOn?.S==tile
                    ||tile.gridPos.z<=z)continue;
                if(tile.isColliding(currentTile)){
                    tile.removeTransparent();
                } 
            }
        }
    }
    highLightPlayer(player,grid){
        for (let tile of this.getHighlightableArea(player.movementArea,grid)) {
            if(tile.objectType!='Tile')continue;
            if(!player||tile.gridPos.z<=player.gridPos.z)continue;
            if(tile.isColliding(player)){
                tile.makeTransparent();
            } 
        }
    }
    deHighLightPlayer(player,grid){
        for (let tile of this.getHighlightableArea(player.movementArea,grid)) {
            if(!player||tile.gridPos.z<=player.gridPos.z)continue;
            if(tile.isColliding(currentTile)){
                tile.removeTransparent();
            } 
        }
    }
    tick(){
        let Cursor={
            x:(-0.5+CursorPosition.x/(this.view.width))/this.zoomIn+0.5,
            y:(-0.5+CursorPosition.y/(this.view.height))/this.zoomIn+0.5,
            z:this.zoomIn
        };
        this.selectCursor={x:(this.view.width*Cursor.x)+this.view.x,y:(this.view.height*Cursor.y)+this.view.y,z:0};
        //let Zim ={x:CursorPosition.x+this.view.x,y:CursorPosition.y+this.view.y,z:0}
            this.renderingTiles = [];
            for (let x = Terrain.length-1; x >= 0; x--) {
                for (let y = 0; y < Terrain[x].length; y++) {
                    for (let z = 0; z < Terrain[x][y].length; z++) {
                        if(!Array.isArray(Terrain[x][y][z])){
                            if(this.inView(Terrain[x][y][z])){
                                this.addToRenderFrame(Terrain[x][y][z]);
                            }
                        }else{
                            for (const l of Terrain[x][y][z]) if(this.inView(l)){
                                this.addToRenderFrame(l);
                            }
                        }
                    }
                }  
            }
            for (const item of TerrainUI) {
                if(item.hidden)continue;
                for (const s of item.path) this.addToRenderFrame(s);
                for (const d of item.details) this.addToRenderFrame(d);
            }
            for (const item of this.UIItems) {
                this.addToRenderFrame(item);
            }

            //this.renderingTiles=this.renderingTiles.sort(spriteDepthComparisonCallback);
            this.tickUIElements();
    }
    addToRenderFrame(sprite){
        let i=0;
        while(i<this.renderingTiles.length&&this.renderingTiles[i].depth<=sprite.depth)i++;
        this.renderingTiles.splice(i,0,sprite);
    }
    tickUIElements(){
        this.selectedItem?.tick();
        if(this.selectedItem&&(this.selectedItem.containsPosition(this.selectCursor)||this.selectedItem.state=='triggerd'))return;
        this.selectedItem?.deSelect();
        this.selectedItem=null;
        for (const item of this.UIItems) {
            if(this.selectedItem)return;
            if((!item.relative&&item.containsPosition(this.selectCursor))
            ||((item.relative&&item.containsPosition(CursorPosition,-this.view.width/2,-this.view.height/2)))){
                if(Paused&&!this.pauseMenu.includes(item)||item.objectType=='UIBox')continue;
                item.select();
                this.selectedItem=item;
            }
        }
    }
    CanvasUpdate(){
        for (const item of this.UIItems) {
            item.updatePosition();
        }
        this.helpMenu.style.left = canvas.width/2-this.helpMenu.width/2+'px';
        this.helpMenu.style.top = canvas.height/2-this.helpMenu.height/2+'px';
    }
    triggerClick(){
        this.selectedItem?.trigger();
    }
    triggerClickRelease(){
        this.selectedItem?.triggerRelease();
        this.updateDisabledTiles();
    }
    renderView(Terrain){
        let rel = {x:this.view.x+(this.view.width/2),y:this.view.y+(this.view.height/2),z:this.zoomIn};
        for(const render of this.renderingTiles){
            if(!Paused||this.pauseMenu.includes(render))
            render.draw(rel);
        }
    }
    updateDisabledTiles(){
        this.disabledTiles=pickedFromObjects(ControlebleCharacters,'actionCircle','cursor');
        this.disabledTiles=this.disabledTiles.concat(pickedFromObjects(Characters,'actionCircle','gridPos'));
    }
}
//De sprite class wordt gebruikt om alle images te renderen in het scherm
//Het is het parent object van alle objecten die zichtbaar zijn in het scherm
class Sprite {
    constructor(position, image,width=48,height=96){
        this.position=position;
        this.objectType='sprite';
        this.image = Images[image];
        this.width = width;
        this.height = height;
        this.depth = -1;
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
    setSprite(image,width=image.width*2,height=image.height*2){
        if(width==0||height==0)return;
        let dif={x:this.width-width,y:this.height-height};
        this.image=image;
        this.width=width;
        this.height=height;
        this.position.x+=dif.x/2;
        this.position.y+=dif.y/2;
    }
    setPosition(pos){
        this.position.x=pos.x;
        this.position.y=pos.y;
        this.position.z=pos.z;
    }
    containsPosition(pos,x=0,y=0){
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
    update() {
        this.draw();
    }
    getCenterPosition(){
        return {x:this.position.x+(this.width/2),y:this.position.y+(this.height/2)-(this.position.z)}
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
    containsPosition(pos,x=0,y=0){
        return pos!=null&&!this.hidden&&((this.relative!=""
        && this.position.x-this.relativePos.x < pos.x+x
        && this.position.x-this.relativePos.x + this.width > pos.x+x
        && this.position.y-this.relativePos.y-this.position.z < pos.y+y
        && this.position.y-this.relativePos.y-this.position.z+this.height > pos.y+y)||(this.relative==""&&super.containsPosition(pos,x,y))) ? this : null;
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
//UIItem geeft het sprite object extra UI mogelijkheden
class UIItemPull extends Sprite { 
    constructor(pos={x:0,y:0,z:999},image,width,height,depth=0,relative=""){
        super(pos,image,width,height);
        this.pullableItems=new Array();
        this.pulledItems=new Array();
        this.depth=depth;
        this.position.z=0;
        this.relative=relative;
        this.relativePos={x:0,y:0,z:1};
        this.updatePosition();
        this.state="neutral";
        this.value=null;
    }
    select(item){
        if(!this.pullableItems.includes(item.objectType)||!this.containsPosition(GameCamera.selectCursor))return false;
        this.state="selected"; return true;
    }
    deSelect(){
        if(this.pulledItems.length==0)this.state="neutral";
    }
    pull(item){
        if(this.state=="neutral")return false;
        this.pulledItems.push(item);
        this.state="pulled"; 
        return true;
    }
    dePull(item){
        if(!this.pulledItems.includes(item))return false;
        if(this.pulledItems.length<=0)return false;
        removeFromArray(this.pulledItems,item);

        if(this.pulledItems.length==0)this.state='neutral';
        else this.state='pulled';
        return true;   
    }
    dePullAll(){
        while(this.pulledItems.length>0){ let item=this.pulledItems[0];
            this.pulledItems.splice(0,1);
            if(this.pulledItems.length==0)this.state='neutral';
            else this.state='pulled';
            return true;   
        }
    }
    tick(){
        
    }
    containsPosition(pos,x=0,y=0){
        return pos!=null&&!this.hidden&&((this.relative!=""
        && this.position.x-this.relativePos.x < pos.x+x
        && this.position.x-this.relativePos.x + this.width > pos.x+x
        && this.position.y-this.relativePos.y-this.position.z < pos.y+y
        && this.position.y-this.relativePos.y-this.position.z+this.height > pos.y+y)||(this.relative==""&&super.containsPosition(pos,x,y))) ? this : null;
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
    constructor(pos={x:0,y:0,z:999},image,width,height,depth=99999,relative=""){
        super(pos,image,width,height,depth);
        this.relative=relative;
        this.objectType='UIBox';
    } 
    draw(pos={x:0,y:0,z:1}){
        super.draw(this.relative? this.relativePos : pos);
    }
}
//Button is een UIItem die een doorgegeven functie doorgeeft wanneer het getriggerd wordt.
class Button extends UIItem{
    constructor(pos={x:0,y:0,z:0},image,selectImage,triggerImage,triggerEvent,width,height,text="",relative=""){
        super(pos,image,width,height,99999,relative);
        this.neutralImage=this.image;
        this.selectImage=Images[selectImage];
        this.triggerImage=Images[triggerImage];
        this.triggerEvent=triggerEvent;
        this.text=text;
    }
    select(){
        super.select();
        this.setSprite(this.selectImage);
    }
    deSelect(){
        super.deSelect();
        this.setSprite(this.neutralImage);
    }
    trigger(){
        super.trigger();
        this.setSprite(this.triggerImage);
        this.triggerEvent();
    }
    triggerRelease(){
        super.select();
        this.setSprite(this.neutralImage);
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
    constructor(pos={x:0,y:0,z:0},image,owner,selectImage,triggerImage,triggerEvent,width,height){
        super(pos,image,width,height);
        this.relative="";
        this.neutralImage=this.image;
        this.selectImage=Images[selectImage];
        this.triggerImage=Images[triggerImage];
        this.triggerEvent=triggerEvent;
        this.owner=owner;
        this.gridPos={x:0,y:0,z:0};
        this.cursor={x:owner.gridPos.x,y:owner.gridPos.y,z:owner.gridPos.z-1};
        this.depth=this.gridPos.z;
        this.objectType='SupportAction';
        }
    setPosition(pos={x:0,y:0,z:0}){
        this.position=GridTile.getTileCoordinates(pos.x,pos.y,pos.z);
        this.gridPos = pos;
        this.depth=this.gridPos.z;
    }
    select(){
        super.select();
        this.setSprite(this.selectImage);
        setAll(this.owner.selectebleTiles,'image',Images['MovementTile']);
        GameCamera.highLightArea(this.owner.movementArea,GameCamera.renderingTiles);
        for (const target of this.owner.selectebleTargets) target.hidden=false;
    }   
    deSelect(){
        super.deSelect();
        this.setSprite(this.neutralImage);
        setAll(this.owner.selectebleTiles,'image',Images['Tile']);
        GameCamera.deHighLightArea(this.owner.movementArea,GameCamera.renderingTiles);
        for (const target of this.owner.selectebleTargets) target.hidden=true;
    }
    trigger(){
        super.trigger();
        this.setSprite(this.triggerImage);
        this.hidden=true;
        if(this.triggerEvent)
        this.triggerEvent();
        if(this.targeting)this.targeting.dePull(this);
    }
    triggerRelease(){
        super.select();
        this.setSprite(this.neutralImage);
        this.hidden=false;
        if(this.targeting)this.targeting.pull(this);
    }
    tick(){
        switch(this.state){
            case "neutral": break;
            case "selected": break;
            case "triggerd": 
            let distance=500;
            this.objectType="AttackAction";
            for (const item of GameCamera.UIPullItems) {
                if(item.select(this)){
                    if(this.targeting!=item)this.targeting?.deSelect(this);
                    this.targeting=item;
                    this.cursor=item.gridPos;
                    this.owner.movementPath.updateColor('Yellow');
                }else if(this.targeting==item){
                    item.deSelect(this);
                    this.owner.movementPath.updateColor('Blue');
                    this.targeting=null;
                }
            }
            this.objectType="SupportAction";
            removeFromArray(GameCamera.disabledTiles,this.cursor);
            removeFromArray(GameCamera.disabledTiles,this.gridPos);
            //movement select
            if(this.targeting==null)
            for (const tile of this.owner.selectebleTiles) {
                let d = tile.containsPosition(GameCamera.selectCursor);
                if(d&&d<distance) {
                    if(inArray(GameCamera.disabledTiles,tile.gridPos)){ 
                        continue;
                    }
                    distance=d;
                    this.cursor=tile.gridPos;
                }
            }
            //this.selectCursor.position=Zim;
            if(!samePosition(this.cursor,this.previousPos)){
                try{
                //Characters[0].movementArea=Characters[0].generateMovementArea(15);
                this.owner.movementPath.generatePath(this.gridPos,this.cursor);
                //TerrainUI[0]=Characters[0].movementPath;
                //console.log("generate");
                this.previousPos=this.cursor;
                }catch(error){
                    alert("PathFinding Error: "+error);
                    console.log(this.owner);
                    console.log(this.gridPos,this.cursor);
                }
            }
            break;
        }
    }
}
class TargetAction extends UIItemPull{
    constructor(pos={x:0,y:0,z:0},image,owner,selectImage,selectedImage,triggerEvent,width,height){
        super(pos,image,width,height);
        this.relative="";
        this.neutralImage=this.image;
        this.selectImage=Images[selectImage];
        this.selectedImage=Images[selectedImage];
        this.triggerEvent=triggerEvent;
        this.owner=owner;
        this.gridPos={x:0,y:0,z:0};
        this.cursor={x:owner.gridPos.x,y:owner.gridPos.y,z:owner.gridPos.z-1};
        this.depth=this.gridPos.z;
        this.objectType='TargetAction';
        this.pullableItems=new Array("AttackAction");
        }
    setPosition(pos={x:0,y:0,z:0}){
        this.position=GridTile.getTileCoordinates(pos.x,pos.y,pos.z);
        this.gridPos = pos;
        this.depth=this.gridPos.z;
    }
    select(item){
        if(!super.select(item))return false;
        this.setSprite(this.selectImage);
        return true;
    }
    deSelect(){
        super.deSelect();
        if(this.pulledItems.length==0){
            this.setSprite(this.neutralImage);
        }else{
            this.setSprite(this.selectedImage);
            this.state='pulled';
        }
    }
    pull(item){
        if(!super.pull(item))return false;
        this.setSprite(this.selectedImage);
    }
    dePull(item){
        if(super.dePull(item))return false;
        if(this.pulledItems.length==0)this.setSprite(this.neutralImage);
    }
    dePullAll(){
        super.dePullAll();
        this.setSprite(this.neutralImage);
    }
    draw(pos={x:0,y:0,z:1}){
        if(this.hidden&&this.state=='pulled'){
            this.hidden=false;
            super.draw(pos);
            this.hidden=true;
        }else super.draw(pos);
    }

    /*
    select(){
        super.select();
        this.setSprite(this.selectImage;
        //setAll(this.owner.selectebleTiles,'image',Images['MovementTile']);
        //GameCamera.highLightArea(this.owner.movementArea,GameCamera.renderingTiles);
    }
    deSelect(){
        super.deSelect();
        this.setSprite(this.neutralImage;
        //setAll(this.owner.selectebleTiles,'image',Images['Tile']);
        //GameCamera.deHighLightArea(this.owner.movementArea,GameCamera.renderingTiles);
    }
    trigger(){
        super.trigger();
        this.setSprite(this.triggerImage;
        if(this.triggerEvent)
        this.triggerEvent();
    }
    triggerRelease(){
        super.select();
        this.setSprite(this.neutralImage;
    }
    tick(){
        switch(this.state){
            case "neutral": break;
            case "selected": break;
            case "triggerd": break;
        }
    }*/
}
//GridTile is een sprite object dat wordt gebruikt als een tegel in het terrein.
class GridTile extends Sprite{ 
    constructor(pos,image='Tile'){
        super(GridTile.getTileCoordinates(pos.x,pos.y,pos.z),image);
        this.objectType='Tile';
        this.gridPos=pos;
        this.width = 94;
        this.height = 48;
        this.depth=this.gridPos.z;
        this.leftWall=null;
        this.rightWall=null;
        this.adjacent={N:null,E:null,S:null,W:null,NE:null,SE:null,SW:null,NW:null};
        this.stackedOn=null;
        this.stackedUnder=null;
        this.completelyHidden=false;
        this.selected=false;
        this.spread={};
        this.leftWall=new Sprite({x:this.position.x,y:this.position.y+23,z:this.position.z},this.transparent? 'WallLeftT':'WallLeft');
        this.rightWall=new Sprite({x:this.position.x+48,y:this.position.y+23,z:this.position.z},this.transparent? 'WallRightT':'WallRight');
    }
    static getTileCoordinates(x,y,z=0){
        return {x:(47*x)+(47*y),y:-(23*x)+(23*y),z:(71*z)};
    }
    static getAreaInRect(area,Rect={x:0,y:0,width:0,height:0}){
        let result=new Array();
        for (const current of area) {
            if(current?.isColliding(Rect))result.push(current);
        }
        return result;
    }
    static getAreaBounds(area){
        if(!area)return {x:0,y:0,width:0,height:0};
        let GB = this.getAreaGridBounds(area);
        return {
            position:GB.start,
            width:GB.end.x-GB.start.x+94,
            height:(GB.end.y-GB.end.z)-(GB.start.y-GB.start.z)+48
        };
    }
    static getAreaGridBounds(area){
        let result={start:{x:-1,y:-1,z:-1},end:{x:-1,y:-1,z:-1}};
        for(let x = 0; x<area.length;x++)
        for(let y = 0; y<area[x].length; y++)
        for(let z = 0; z<area[x][y].length;z++){
            let c=getTile(x,y,z,area);
            if(!c)continue;
            //BoundsStart
            if(result.start.x>c.position.x||result.start.x==-1)result.start.x=c.position.x;
            if(result.start.y-result.start.z>c.position.y-c.position.z||result.start.y==-1)result.start.y=c.position.y-c.position.z;
            //BoundsEnd
            if(result.end.x<c.position.x||result.end.x==-1)result.end.x=c.position.x;
            if(result.end.y-result.end.z<c.position.y-c.position.z||result.end.y==-1)result.end.y=c.position.y-c.position.z;
        }
        return result;
    }
    getStackedUnder(){
        return getTile(this.gridPos.x,this.gridPos.y,this.gridPos.z+1);
    }
    movePosition(vel){
        this.position.x+=vel.x;
        this.position.y+=vel.y;
        this.position.z+=vel.z;
        this.depth=this.gridPos.z;
    }
    setGridPosition(pos={x:0,y:0,z:0}){
        this.gridPos.x=pos.x;
        this.gridPos.y=pos.y;
        this.gridPos.z=pos.z;

        this.position={x:(TileWidth*pos.x)+(TileWidth*pos.y),y:-(TileHeight*pos.x)+(TileHeight*pos.y),z:pos.z*71-23 };
        this.depth=this.gridPos.z;
    }
    selectTile(){
        this.setSprite(Images['MovementTile']);
        this.selected=true;
        //this.adjacent.S?.stackedUnder?.makeTransparent();
        //this.adjacent.W?.stackedUnder?.makeTransparent();
    }
    deSelectTile(){
        for (const s in this.spread) {
            if(this.spread[s]>0)return;
        }
        this.setSprite(Images['Tile']);
        this.selected=false;
        //this.adjacent.S?.stackedUnder?.removeTransparent();
        //this.adjacent.W?.stackedUnder?.removeTransparent();
    }
    containsPosition(pos,sca={x:0,y:0,z:0}){
        return (pos.x>this.position.x
            &&pos.y>this.position.y-this.position.z
            &&pos.y<this.position.y-this.position.z+this.height
            &&pos.x<this.position.x+this.width)? heuristic(pos,{x:this.position.x+(this.width/2),y:this.position.y-this.position.z+(this.height/2)}) : 500;
    }
    spreadSelect(spread,spreader='main',select=new Array()){
        if(spread<=0||(!(spreader in this.spread)&&spread<=this.spread[spreader]&&select.includes(this))||(this.stackedUnder))return select;
        if(!select.includes(this)){
            select.push(this);
            let sp=getTile(this.gridPos.x,this.gridPos.y,this.gridPos.z+1);
            if(sp) for (const item of sp) {
                if(item.actionCircle)select.push(item.actionCircle);
            }
        } 
            //this.selectTile();
            this.spread[spreader]=spread;
            //spread
            //this.adjacent.forEach(element?.spreadSelect(spread));
            for(let x=-1;x<=+1;x++)
            for(let y=-1;y<=+1;y++){
                let current = getTile(this.gridPos.x+x,this.gridPos.y+y,this.gridPos.z)
                if(!current)continue;
                if(current.objectType!='Tile')continue;
                if(x!=0&&y!=0){
                    let t1 = getTile(this.gridPos.x+x,this.gridPos.y,this.gridPos.z);
                    let t2 = getTile(this.gridPos.x,this.gridPos.y+y,this.gridPos.z);
                    if(
                    !t1||t1.stackedUnder||
                    !t2||t2.stackedUnder
                    )continue;
                    current.spreadSelect(spread-1.5,spreader,select);
                }else 
                current.spreadSelect(spread-1,spreader,select);
            }

            /*for (const dir in this.adjacent) {
                if(dir.length>1&&!(this.adjacent[dir[0]]||this.adjacent[dir[1]]))continue;
                this.adjacent[dir]?.spreadSelect(spread-1,select);
                //console.log(dir);
            }//console.log("------------------");*/
        return select;
    }
    updateTile(area){
        for (const key in this.adjacent) {
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
            this.adjacent[key]=getTile(this.gridPos.x+p.x,this.gridPos.y+p.y,this.gridPos.z);
        }
    }
    makeTransparent(){
        this.transparent=true;
        this.setSprite(Images['TileT']);
        if(!this.adjacent.W)
        this.leftWall.setSprite(Images['WallLeftT']);
        if(!this.adjacent.S)
        this.rightWall.setSprite(Images['WallRightT']);
    } 
    removeTransparent(){
        this.transparent=false;
        this.setSprite(Images['Tile']);
        if(!this.adjacent.W)
        this.leftWall.setSprite(Images['WallLeft']);
        if(!this.adjacent.S)
        this.rightWall.setSprite(Images['WallRight']);
    }
    highLight(){
        getTile(this.gridPos.x,this.gridPos.y+1,this.gridPos.z+1)?.makeTransparent();
        getTile(this.gridPos.x-1,this.gridPos.y,this.gridPos.z+1)?.makeTransparent();
        getTile(this.gridPos.x-1,this.gridPos.y+1,this.gridPos.z+1)?.makeTransparent();
    }
    draw(pos={x:0,y:0,z:0}){
        if(this.stackedOn?.transparent)return;
        super.draw(pos);
        if(!this.adjacent.W)
        this.leftWall.draw(pos);
        if(!this.adjacent.S)
        this.rightWall.draw(pos);
    }
}
//CharacterBase is de main parrent object van ieder character in het spel.
class CharacterBase extends Sprite{
    constructor(gridPos,sprite,id){
        super(gridPos,sprite,94,94);
        this.objectType=sprite;
        this.id=id;
        this.gridPos=gridPos;
        this.depth=this.gridPos.z;
        this.setGridPosition(gridPos);
        console.log(this.gridPos);
        this.selectedAction='positioning';
        this.movementDistance=6;
        this.selectebleTiles=new Array();
        this.selectebleTargets=new Array();
        this.selectableSupportTargets=new Array();
        this.movementArea=this.generateMovementArea();
        this.movementPath=new MovementPath(getTile(gridPos.x,gridPos.y,gridPos.z-1,this.movementArea),getTile(gridPos.x,gridPos.y,gridPos.z-1,this.movementArea),this.movementArea);
        this.actionQueue=Array();
        this.movementSpeed=8;
        
        TerrainUI.push(this.movementPath);
    }
    setGridPosition(pos={x:0,y:0,z:0},area=Terrain){
        movePlayerOnGrid(this,pos);

        this.gridPos.x=pos.x;
        this.gridPos.y=pos.y;
        this.gridPos.z=pos.z;

        this.position={x:(TileWidth*pos.x)+(TileWidth*pos.y),y:-(TileHeight*pos.x)+(TileHeight*pos.y),z:pos.z*71-23};
        this.depth=this.gridPos.z;
    }
    setMovement(route=this.movementPath){
        route.current=route.path[route.path.length-1];
        for (let i = route.path.length-2; i >= 0; i--) {
            const e = route.path[i];
            if(!e.previous)continue;
            if(!e.after&&e.color=='Yellow'){
                GameCamera.disabledTiles.push(e.previous.gridPos);
                this.actionQueue.push(new ActionStatus(20,null,new Array(),new Array(),new Array(),null,120,10));
                continue;
            }
            this.actionQueue.push({
                x:e.gridPos.x-e.previous.gridPos.x,
                y:e.gridPos.y-e.previous.gridPos.y,
                z:e.gridPos.z-e.previous.gridPos.z
            });
        }
    }
    moveWithGridPos(pos={x:0,y:0,z:0}){
        let st = structuredClone(this.gridPos);
        st.x+=Math.sign(pos.x);
        st.y+=Math.sign(pos.y);
        st.z+=Math.sign(pos.z);

        let r=movePlayerOnGrid(this,st);
        if(r){
            this.position=GridTile.getTileCoordinates(this.gridPos.x,this.gridPos.y,this.gridPos.z);
            this.position.z-=23;
        }else{

        }
        return r;
    }
    movePosition(vel){
        this.position.x+=vel.x;
        this.position.y+=vel.y;
        this.position.z+=vel.z;
    }
    tick(){
        if(GamePhase=='action'&&this.actionQueue.length>0){
            if(this.actionQueue[0].duration){
                if(this.actionQueue[0].tick()){
                    this.actionQueue[0].applyToCharacter(this);
                }else{
                    this.actionQueue.shift();
                }
                return;
            }
            let mp=structuredClone(this.actionQueue[0]); 
            let mv=this.actionQueue[0];
            let M = Math.sign(mv.x)!=Math.sign(mv.y) ? 1/60*this.movementSpeed: 1/60*this.movementSpeed/2;
            if(numPos(mv.x.toFixed(2))>M)mv.x-=M*Math.sign(mv.x);else mv.x=0;
            if(numPos(mv.y.toFixed(2))>M)mv.y-=M*Math.sign(mv.y);else mv.y=0;
            if(numPos(mv.z.toFixed(2))>M)mv.z-=M*Math.sign(mv.z);else mv.z=0;
            if(numPos(mv.x)<=0&&numPos(mv.y)<=0&&numPos(mv.z)<=0){
                this.moveWithGridPos(mp);
                this.actionQueue.shift();
                
                /*let c=getTile(this.gridPos.x,this.gridPos.y,this.gridPos.z);
                if(c!==this){
                    this.moveWithGridPos({x:-mp.x,y:-mp.y,z:-mp.z});
                    //if(c.actionQueue.length==1)return;
                }*/
                //if(reDo)return;
                /*
                    this.actionQueue.splice(0,this.actionQueue.length);
                    this.movementPath.generatePath({x:this.gridPos.x,y:this.gridPos.y,z:this.gridPos.z-1},this.movementPath.end.gridPos);
                    this.setMovement();
                */
                if(this.actionQueue.length==0){
                    movePlayerOnGrid(this,this.gridPos);
                    return;
                }
            }
            
            this.movePosition(GridTile.getTileCoordinates(
                M*Math.sign(mv.x),
                M*Math.sign(mv.y),
                M*Math.sign(mv.z)
            ));
        }else{
            if(this.selectedAction=='positioning')return;
            //this.updateCharacterPosition();
            //this.movementPath.start=getTile(this.gridPos.x,this.gridPos.y,this.gridPos.z,this.movementArea);
               if(this.selectedAction=='action'&&--CharactersInAction<=0)setUpPlanPhase();
            this.selectedAction='positioning';
        }
    }
    dealDamageTo(character,damage){
        console.log(this+"dealt "+damage+" damage to: "+character);
    }
    updateCharacterPosition(){
        this.movementArea=this.generateMovementArea();
        this.movementPath.regeneratePath(
            getTile(this.gridPos.x,this.gridPos.y,this.gridPos.z-1,this.movementArea),
            getTile(this.gridPos.x,this.gridPos.y,this.gridPos.z-1,this.movementArea),
            this.movementArea
        );
    }
    generateMovementArea(gridPos=this.gridPos,movement=this.movementDistance){
        let movementArea = new Array();
        let rel = {x:GameCamera.view.x+(GameCamera.view.width/2),y:GameCamera.view.y+(GameCamera.view.height/2),z:GameCamera.zoomIn};
        if(this.selectebleTiles){
            for (const tile of this.selectebleTiles) {
                tile.spread[this.id]=0;
                tile.deSelectTile();
            }
        }
        /*
            if(this.movementArea){
            for (const x of this.movementArea)
            for (const y of x)
            for (const tile of y) {
                if(!tile)continue;
                let c=getTile(tile.gridPos.x,tile.gridPos.y,tile.gridPos.z);
                if(!c)continue;
                c.spread[this.id]=0;
                c.deSelectTile();
            }}
        */
        let t = getTile(gridPos.x,gridPos.y,gridPos.z-1);
        let Area=t.spreadSelect(movement,this.id);
        
        this.selectebleTiles=getAllEquals(Area,'Tile','objectType');
        this.selectebleTargets=getAllEquals(Area,'TargetAction','objectType');
        this.selectableSupportTargets=getAllEquals(Area,'SupportAction','objectType');
        removeFromArray(this.selectebleTargets,this.actionCircle);
        GameCamera.selectebleTiles=this.selectebleTiles;
        //console.log(Area);

        for (const t of Area) {
            //t.highLight();
            setTile(t.gridPos.x,t.gridPos.y,t.gridPos.z,new PathSegment(t.gridPos),movementArea);
        }
 
        return movementArea;
        //console.log(getTile(this.gridPos.x,this.gridPos.y,this.gridPos.z-1).spreadSelect(movement,movementArea));
    }
    draw(pos={x:0,y:0,z:1}){
        super.draw(pos);
    }
    containsPosition(pos){
        return 500;
        return (pos.x>this.position.x
            &&pos.y>this.position.y
            &&pos.y<this.position.y+this.height
            &&pos.x<this.position.x+this.width)? heuristic(pos,{x:this.position.x+(this.width/2),y:this.position.y+(this.height/2)}) : 500;
    }
    setStateToPlanPhase(){
        this.updateCharacterPosition();
        GameCamera.highLightPlayer(this,GameCamera.renderingTiles);
        movePlayerOnGrid(this,this.gridPos);
        setAll(this.movementPath.path,'hidden',false);
    }
    setStateToFightPhase(){
        CharactersInAction++;
        this.setMovement();
        setAll(this.selectebleTiles,'image',Images['Tile']);
        setAll(this.movementPath.path,'hidden',true);
        this.selectedAction='action';
        GameCamera.deHighLightArea(this.movementArea,GameCamera.renderingTiles);
    }
}
//PlayerBase is een sprite object dat wordt gebruikt door de speler om basis acties uit te voeren
class PlayerBase extends CharacterBase{
    constructor(gridPos,id=Characters.length){
        super(gridPos,'Player',id);
        this.actionCircle=new MovementAction({x:0,y:0,z:0},'MovementAction',this,'SelectedMovementAction','MPSP',null,94,48);
        this.actionCircle.setPosition({x:this.gridPos.x,y:this.gridPos.y,z:this.gridPos.z-1});
        GameCamera.UIItems.push(this.actionCircle);
    }
    updateCharacterPosition(){
        super.updateCharacterPosition();
        this.actionCircle.setPosition({x:this.gridPos.x,y:this.gridPos.y,z:this.gridPos.z-1});      
    }
    setStateToPlanPhase(){
        this.movementPath.hidden=false;
        this.actionCircle.hidden=false;
        super.setStateToPlanPhase();
    }
    setStateToFightPhase(){
        this.movementPath.hidden=true;
        this.actionCircle.hidden=true;
        super.setStateToFightPhase();
    }
}
class DummyBase extends CharacterBase{
    constructor(gridPos,id=Characters.length){
        super(gridPos,'Dummy',id);
        this.actionCircle=new TargetAction({x:0,y:0,z:0},'TargetAction',this,'SelectTarged','SetTarged',null,94,48);
        this.actionCircle.setPosition({x:this.gridPos.x,y:this.gridPos.y,z:this.gridPos.z-1});
        GameCamera.UIItems.push(this.actionCircle);
        GameCamera.UIPullItems.push(this.actionCircle);
        this.actionCircle.hidden=true;
        this.movementPath.hidden=true;
    }
    updateCharacterPosition(){
        super.updateCharacterPosition();
        this.actionCircle.setPosition({x:this.gridPos.x,y:this.gridPos.y,z:this.gridPos.z-1});      
    }
    setStateToFightPhase(){
        this.actionCircle.dePullAll();
        super.setStateToFightPhase();
    }
}
//MovementPath is een object wordt gebruikt om een pad te genereren tussen twee tiles
class MovementPath{
    constructor(start,end,movementArea){
        this.movementArea=movementArea;
        this.path=new Array();
        this.details=new Array();
        this.start=start;
        this.end=end;
        this.generatePath();
        this.hidden=false;
        this.depth=1;
        this.details.push(new Sprite({x:0,y:0,z:0},'AMPSP',48*2,25*2));

    }
    regeneratePath(start,end,movementArea){
        this.movementArea=movementArea;
        this.path=new Array();

        this.start=start;
        this.end=end;
        this.generatePath();
        this.current=this.path[this.path.length-1];
    }
    resetMovementArea(){
        loopTileGrid(this.movementArea,'spreadSelect');
    }
    generatePath(start,end,Area=this.movementArea){
        this.resetMovementArea();
        var openSet = [];
        var closedSet = [];
        if(start)this.start=getTile(start.x,start.y,start.z,Area);
        if(end)this.end=getTile(end.x,end.y,end.z,Area);
        //console.log(end);
        //console.log(this.start.gridPos);

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
                this.path=[];
                var temp = current;
                this.path.push(temp);
                temp.updateSegment();
                while(temp.previous){
                    this.path.push(temp.previous);
                    temp = temp.previous;
                }
                //this.path.setSprite(Images['SelectedTile'];
                return this.path;
            }
            removeFromArray(openSet,current);
            closedSet.push(current);

            var adjacent = current.adjacent;
            //var a = {1:adjacent.E,3:adjacent.W,2:adjacent.S,0:adjacent.N/*3.5:adjacent.NW,0.5:adjacent.NE,2.5:adjacent.SW,1.5:adjacent.SE*/};

            //var d = this.createLookout(a,dir);
            for (const key in adjacent) {
                var neighbor = adjacent[key];
                if(key.length>1&&(!adjacent[key[0]]||!adjacent[key[1]]))continue;
                if(neighbor==null)continue;
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
    updateColor(color){
        for (const seg of this.path)seg.updateColor(color);
        for (const detail of this.details) {
            detail.hidden=color!='Yellow';
            let p = this.path[0].previous ? this.path[0].previous.position : {x:0,y:0,z:0};
            this.details[0].position=p;
            this.details[0].depth=this.path[0].depth;
        }
    }
    draw(pos={x:0,y:0,z:0}){
        if(this.hidden)return;
        for (let i = 0; i < this.path.length; i++) {
            this.path[i].draw(pos);       
        }
        for (const detail of this.details) {
            detail.draw(pos);
        }
    }
}
//PathSegment is object dat gebruikt door de MovementPath object. Dit is deel van het pad.
class PathSegment extends Sprite{
    constructor(pos,dir=''){
        super(GridTile.getTileCoordinates(pos.x,pos.y,pos.z),'MPSP',94,46);
         this.nr=0;
         this.gridPos=pos;
         this.dir=dir;
         this.f=0;
         this.g=0;
         this.h=0;
         this.adjacent={N:null,E:null,S:null,W:null,NE:null,SE:null,SW:null,NW:null};
         this.previous=null;
         this.after=null;
         this.depth=this.gridPos.z;
         this.color='Blue';
    } 
    movePosition(vel){
        this.position.x+=vel.x;
        this.position.y+=vel.y;
        this.position.z+=vel.z;
        this.depth=this.gridPos.z;
    }
    resetSegment(){
        //getTile(this.gridPos.x,this.gridPos.y+1,this.gridPos.z+1)?.removeTransparent();
        //getTile(this.gridPos.x-1,this.gridPos.y,this.gridPos.z+1)?.removeTransparent();
        //getTile(this.gridPos.x-1,this.gridPos.y+1,this.gridPos.z+1)?.removeTransparent();
        this.nr=0;
        this.previous=null;
        this.after=null;
        this.dir='end';
        this.f=0;
        this.g=0;
        this.h=0;
    }
    highLightSelf(){
        getTile(this.gridPos.x,this.gridPos.y+1,this.gridPos.z+1)?.makeTransparent();
        getTile(this.gridPos.x-1,this.gridPos.y,this.gridPos.z+1)?.makeTransparent();
        getTile(this.gridPos.x-1,this.gridPos.y+1,this.gridPos.z+1)?.makeTransparent();
    }
    updateSegment(){
        //console.log(this.gridPos.x+","+this.gridPos.y);
        //getTile(this.gridPos.x,this.gridPos.y+1,this.gridPos.z+1)?.makeTransparent();
        //getTile(this.gridPos.x-1,this.gridPos.y,this.gridPos.z+1)?.makeTransparent();
        //getTile(this.gridPos.x-1,this.gridPos.y+1,this.gridPos.z+1)?.makeTransparent();

        //if(!this.image||this.dir=='start')this.setSprite(Images['MPSP'];
        if(!this.previous)return;

        let p1=this.gridPos;
        let p2=this.previous.gridPos;

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
                this.previous.setSprite(PathRails['start'][this.previous.dir]);
            }
            /*
            if(p1.y>p2.y)this.previous.dir=0;else
            if(p1.y<p2.y)this.previous.dir=2;else
        
            if(p1.x>p2.x)this.previous.dir=3;else
            if(p1.x<p2.x)this.previous.dir=1;
            */

            

        this.setSprite(PathRails[this.dir][this.previous.dir]);
        
        //you are replace this.setSprite(
        
        if(!this.image||this.dir<0)this.setSprite(Images['SelectedTile']);
        
    
        this.previous.updateSegment();
    }
    updateColor(color){
        let cn = getKeyByValue(Images,this.image);
        switch(color){
            case 'Blue': 
                if(cn[0]!='M') this.setSprite(Images[cn.substring(1,cn.length)]);
            break;
            case 'Yellow': 
                if(cn[0]!='A') this.setSprite(Images['A'+cn]);
            break;
        }
        this.color=color;
    }
    draw(pos={x:0,y:0,z:1}){
        super.draw(pos);
    }
}
//ActionStatus is een object wat wordt gebruikt om acties uit te voeren voor een CharacterBase
class ActionStatus{
    constructor(duration,spriteAnimation,movementQueue,animationAtributes,animationAtributesEnd,target,damage,damageTiming){
        this.duration=duration;
        this.spriteAnimation=spriteAnimation;
        this.movementQueue=movementQueue;
        this.animationAtributes=animationAtributes;
        this.animationAtributesEnd=animationAtributesEnd;
        this.damage=damage;
        this.damageTiming=damageTiming;
        this.target=target;
        this.queueTimer=duration;
    }
    tick(){
        if(this.queueTimer>0)this.queueTimer--;else return false;
        if(this.movementQueue.length>0){
            let mv=this.movementQueue[i];
            let M = Math.sign(mv.x)!=Math.sign(mv.y) ? 1/60*character.movementSpeed: 1/60*character.movementSpeed/2;
            if(numPos(mv.x.toFixed(2))>M)mv.x-=M*Math.sign(mv.x);else mv.x=0;
            if(numPos(mv.y.toFixed(2))>M)mv.y-=M*Math.sign(mv.y);else mv.y=0;
            if(numPos(mv.z.toFixed(2))>M)mv.z-=M*Math.sign(mv.z);else mv.z=0;
        }
        return true;
    }
    applyToCharacter(character){
        if(!character)return;
        let i=this.duration-this.queueTimer;

        if(this.movementQueue.length>0){
            let mp=structuredClone(this.movementQueue[0]); 
            let mv=this.movementQueue[0];
            let M = Math.sign(mv.x)!=Math.sign(mv.y) ? 1/60*character.movementSpeed: 1/60*character.movementSpeed/2;
            
            if(numPos(mv.x)<=0&&numPos(mv.y)<=0&&numPos(mv.z)<=0){                
                character.moveWithGridPos(mp);
                this.movementQueue.shift();
                if(this.movementQueue.length==0){
                    movePlayerOnGrid(character,character.gridPos);
                }
            }
            character.movePosition(GridTile.getTileCoordinates(
                M*Math.sign(mv.x),
                M*Math.sign(mv.y),
                M*Math.sign(mv.z)
            ));
        }
        if(i==this.damageTiming){
            character.dealDamageTo(this.target,this.damage);
        }
    }
    
}
