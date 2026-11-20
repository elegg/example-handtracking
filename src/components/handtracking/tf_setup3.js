import { Hub } from "../../scripts/messageHub"
import { atom, map, effect } from "nanostores"
let $worker_status = atom("init")
let $points = map({})
let $pixels = atom([])
export let $angle = atom(null)
let allowImage = false

let hub = new Hub("MAIN")


function draw_to_canvas(video){
    let canvas = document.getElementById("canvas") 
    if(!canvas){
        canvas = document.createElement("canvas")
        canvas.id = "canvas"
        document.body.appendChild(canvas)
        canvas.width = 192
        canvas.height = 192

    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    
    ctx.drawImage(video, 0, 0, 192, 192);
    return     ctx.getImageData(0,0,192,192)

}


function can2(){
  let canvas = document.getElementById("canvas2") 
    if(!canvas){
        canvas = document.createElement("canvas")
        canvas.id = "canvas2"
        document.body.appendChild(canvas)
        canvas.width = 192
        canvas.height = 192
    }

    return canvas
}



let draw_spots = ({points, canvas})=>{
   
const ctx = canvas.getContext("2d");
ctx.fillStyle="black"
ctx.rect(0, 0, 192, 192)
ctx.fill()


for(let i =0; i <points.length; i++){
        let x = points[i].x*192//(points[i+(2*i)]+offsetX)
        let y = points[i].y*192 //(points[i+(2*i)+1]+offsetY)


        
        ctx.beginPath();

        if(i <=1){
        ctx.fillStyle = "green";
        }
        else{
            ctx.fillStyle= "orange"
        }

        ctx.arc(x,y, 3, 3, 0, 2 * Math.PI);
        ctx.fill();


}
}


const workerO = new SharedWorker(
 '../../scripts/tf_worker3.js'

);
let worker = workerO.port



let updated = true
let c2 = can2()



    hub.addListener("hello", ()=>$worker_status.set("connected"))
    hub.addListener("ready", ()=>$worker_status.set("model-ready"))

    //hub.send_hello()

    hub.addMessageType({name:"start", worker:worker})
    hub.addMessageType({name:"image", worker:worker})



effect([$points], points=>{


     let p = document.querySelector("p")
        p.innerText = points.angle ? `Angle: ${Math.round(points.angle *100)/100}` :" "
       $angle.set(points.angle)

        draw_spots({points:points.points ||[], canvas:c2})

    }

)


   hub.addListener("angle", (points)=>{
    
    console.log("received angle", points)
    if(points){
        $points.set(points )

    }

}, worker)

effect([$worker_status], (status)=>{

    console.log(`Worker is: ${status}`)
   if( status==="connected" ){
            hub.send_start()
            $worker_status.set("waiting-model")
   }

   if(status==="model-ready"){
            allowImage = true
            let video = document.getElementsByTagName("video")[0]

            repeat(video)

   }
})



export async function runner(){

    worker.start()
   // await new Promise((resolve)=>setTimeout(()=>resolve(), 1000))
   // let video = document.getElementsByTagName("video")[0]

   let ready = false 

   if(!ready){
           // setTimeout(()=>{ready=true}, 3000)

            //let x = await hub.send_start()
           
            ready=true
    
        //ready = await hub.remote_call("start", "", worker)
        

    }
   // $worker_status.set("ready")

    
}

let i = 0
async function repeat(video){

  let pixels= draw_to_canvas(video)
   // $pixels.set(pixels)
   i+=1
   if(!(i%4)){
           hub.send_image(pixels)
   }


  requestAnimationFrame(async ()=>{repeat(video)})
    
 
}

