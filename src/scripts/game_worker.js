import { Hub } from "./messageHub";
import {Game} from '../scripts/dinogame2'
let h = new Hub()


let game =  null
  game = new Game()

let start  = ()=>{
 // game && game.stop()
  game.start()
  //game
}


let addCanvas = (canvas)=>game.addCanvas(canvas)
let handle_space = ()=> {console.log("SPACE"); game.handle_space()}
let handle_down = ()=> {console.log("SPACE"); game.handle_down()}

let run = ()=>{game.draw()}


onconnect = (e) => {
  const port = e.ports[0];

  

  h.addMessageType({name:"response", worker:port})
  h.bindfn(start, port)
  h.bindfn(addCanvas, port)
  h.bindfn(handle_space, port)
    h.bindfn(handle_down, port)

  h.bindfn(run, port)

  h.addListener("angle", (e)=>{
    if(e/*(typeof e.angle)==="number" && e.angle <20 */){
      game.handle_space()
    }
  })

    h.addListener("angle2", (e)=>{
    if(e/*(typeof e.angle)==="number" && e.angle <20 */){
      game.handle_space()
    }
  })


  h.addListener("hello", (e)=>{
   
    h.send_response("ok")


  }, port)

    port.start(); 


  
  // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
};

