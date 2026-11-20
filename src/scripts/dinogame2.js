import image from '../assets/image.png'

class blockGenerator{

    constructor(min_spacing=120, probability = 0.01){
        this.ticks_since_previous = 0
        this.min_spacing = min_spacing
        this.probability = probability
    }

    tick(){

        this.ticks_since_previous +=1

        if(this.ticks_since_previous > this.min_spacing){

            console.log("ticks", this.ticks_since_previous)
            let item = Math.random()

            if(item <this.probability){
                this.ticks_since_previous = 0
                return true
            }
        }

        return false



    }



}


class Conveyor{
    constructor(speed){
        this.assets = []
        this.generator = new blockGenerator()
        this.speed = speed
        this.last_move = 0
    }

    move_assets(){

        for(let i =0; i <this.assets.length;i++){
            let asset = this.assets[i]

            asset.pos.x+=0.01
        }

        this.last_move = 0
    }

    clear_up(){
       this.assets = this.assets.filter(a=>a.pos.x <1.05)
        

    }


    tick(){
        this.last_move+=1

        if(this.last_move > this.speed){
            this.move_assets()
        }

        this.clear_up()



        let block = this.generator.tick()
        if(block){
            this.assets.push({type:"block", pos:{x:0, y:0}})
        }

        return [...this.assets]
    }

    
}



const collision_detection=(blocks, character)=>{

    let collided = false
    blocks.forEach(block=>{

        let blockX = 1-block?.pos?.x

       if( character.y ===0.45 &&character.x < blockX &&  character.x > blockX-0.05){
        collided = true
       }




    })
    return collided
}


class Score{
    constructor(){
        this.points = 0
    }

    tick(){
       return this.points+=1
    }
}

class Character{
    constructor(){
        this.is_jumped = false
        this.jump_frames = 0
        this.position = {x:0.33, y:0.45}
        this.jump_duration = 40
        this.image1 = new Path2D("M0.864258 0.129883H0.944336V0.254883H1V0.423828H0.831055V0.416016H0.691406V0.459961H0.779297V0.488281H0.918945V0.657227H0.75V0.629883H0.666016V0.662109H0.775391V0.798828H0.782227V0.96875H0.779297L0.77832 1.01855L0.608398 1.01465L0.612305 0.844727V0.831055H0.606445V0.84668H0.555664V1.0166H0.386719V0.84668H0.436523V0.818359H0.336914V0.90332H0.168945V0.951172H0V0.78125H0.166992V0.734375H0.301758V0.649414H0.47168V0.677734H0.496094V0.507812H0.521484V0.168945H0.581055V0.0458984H0.694336V0H0.864258V0.129883ZM0.75 0.214844H0.691406V0.24707H0.775391V0.168945H0.75V0.214844Z")
        this.image2 = new Path2D("M0.847656 0.140625H0.935547V0.275391H0.995117V0.458984H0.811523V0.451172H0.661133V0.533203H0.755859V0.716797H0.751953V0.789062H0.871094V0.885742H1V1.06934H0.816406V0.972656H0.6875V0.899414H0.568359V0.916992H0.632812V1.10059H0.450195V0.916992H0.385742V0.885742H0.276367V0.916992H0.0927734V0.80957L0.00292969 0.811523L0 0.62793L0.183594 0.625L0.185547 0.733398H0.240234V0.703125H0.422852V0.733398H0.450195V0.549805H0.477539V0.416016H0.449219V0.232422H0.503906V0.183594H0.541016V0.0488281H0.665039V0H0.847656V0.140625ZM0.94043 0.681641H0.756836V0.498047H0.94043V0.681641ZM0.724609 0.232422H0.6875V0.267578H0.751953V0.183594H0.724609V0.232422Z")


        this.images = [this.image1, this.image2]
        this.image = this.images[0]
        this.frame = 0


    }


    

    handle_jump(){
        console.log("jump")
        if(this.jump_frames > this.jump_duration){
        this.position.y = 0.3


        this.jump_frames = 0
        }

    }

    handle_down(){
        console.log("jump")
        if(this.jump_frames > this.jump_duration){
        this.position.y = 0.5


        this.jump_frames = 0
        }

    }


    tick(){
        this.frame +=0.04
        this.image = this.images[Math.floor(this.frame%2)]

        this.jump_frames+=1

        if(this.jump_frames > this.jump_duration){
            this.position.y = 0.45
        }
        return this.position
    }
}


 // can also be a remote URL e.g. http://
            



export class Game{
    constructor(){
        this.char =new Character()
        this.is_end = false
        this.is_pause = false
        this.do_tick = true

        this.bg = new blockGenerator()
        this.canvas = null
        this.ctx=null
        this.is_character_jumped = false
        this.restart = false
    }

    handle_space(){
        console.log("pressed", this.char)
        this.char.handle_jump()
    }

    handle_down(){
        this.char.handle_down()
    }
    stop(){
        this.is_end=true
    }
    pause(){
        this.is_pause = true
    }

    start(){
        this.char =new Character()

        this.score = new Score()
        this.conveyor= new Conveyor(2)
        this.char= new Character()
        this.bg = new blockGenerator()
        
        this.do_tick = true


    }

    addCanvas(canvas){
        this.canvas = canvas
        this.ctx = canvas.getContext("2d");
    }

    draw() {

    let [WIDTH, HEIGHT] = [500,500]


    if(this.do_tick){
 
    this.ctx.fillStyle = "green"
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

    this.ctx.fillStyle = "blue"

    this.ctx.fillRect(0, 0, WIDTH, HEIGHT/2);


     let items = this.conveyor.tick()
     let character = this.char.tick()
    
    this.ctx.fillStyle="white"
    
    let char = new Path2D(this.char.image)
    this.ctx.translate(character.x*WIDTH, (character.y*HEIGHT)-10);
    this.ctx.scale(40,40)
    this.ctx.fill(char)
    
        this.ctx.scale(1/40, 1/40)
         

    this.ctx.translate(-(character.x*WIDTH), -(character.y*HEIGHT)+10)

    

    this.ctx.fillStyle="orange"
    items.forEach(i=>{
        this.ctx.fillRect(WIDTH-(i.pos.x*WIDTH), 0.45*HEIGHT, 0.05*WIDTH, 0.05*HEIGHT);

     })
    
    this.ctx.fillStyle="white"
    this.ctx?.fillRect(0, HEIGHT/2, WIDTH, 1)

    let s = this.score.tick()

    this.ctx.fillStyle = "white"
    this.ctx.font = "10px serif";
    this.ctx.fillText(`Points: ${s}`, 440, 30);

   
    

    let collision = collision_detection(items, character)
     

     if(collision && !this.restart){
            this.ctx.fillStyle="black"
            this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
            this.do_tick = false
            


            this.ctx.fillStyle = "white"
            this.ctx.font = "24px arial";
            this.ctx.fillText(`Ooops`, (WIDTH/2) - 80, HEIGHT/2);
            this.ctx.fillStyle = "white"
           this.ctx.font = "24px  arial";
            this.ctx.fillText(`Points: ${this.score.points}`, (WIDTH/2) - 80, (HEIGHT/2) +50);


     }
    }

  

 

      setTimeout(()=>this.draw(), 10)
     // this.restart = false



}




}






