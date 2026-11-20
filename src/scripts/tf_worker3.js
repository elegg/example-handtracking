
class ClassificationTask{
    constructor(){
        this.model = null
        this.vision = null
        this.HandLandmarker = null

    }


    async create_model({vision, HandLandmarker}){

    const handLandmarker = await HandLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      },
      numHands: 1,
      running_mode:"VIDEO"
    });


    //this.model = handLandmarker


    return handLandmarker

    }


    async create_runner(){

    let {FilesetResolver, HandLandmarker} =await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3")//.then(i=>{

    this.FilesetResolver=FilesetResolver;
    //let HandLandmarker =HandLandmarker
  
    let vision = await this.FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    )



    return {vision:vision , HandLandmarker}

       
    }

    dot_product(arr1, arr2){

    let res = 0
    for(let i = 0; i<arr1.length;i++){
        res += arr1[i]*arr2[i]

    }

    return res
}


    vec_mag(vec){

    let sum_squares = 0
    for(let i =0;i<vec.length;i++){
        sum_squares +=vec[i]**2

    }

    return Math.sqrt(sum_squares)
}



    angle_vectors(v1, v2){


    return (Math.acos(this.dot_product(v1,v2) / (this.vec_mag(v1)*this.vec_mag(v2))))*(180/Math.PI)

}

    points_to_vec(p1, p2){

    return [p1.x-p2.x, p1.y-p2.y, p1.z-p2.z]
    }

    detect_angle = (image)=>{
  
        if(this.model){
        let res = this.model.detect(image)
        let points = res?.landmarks[0] ||[]
        let angle = points.length ? this.angle_vectors(this.points_to_vec(points[0], points[4]), this.points_to_vec(points[0], points[8]) ) : "MISSING"

        return {points, angle}

        } 

        return {points:[], angle:"MISSING"}

}




}

c = new ClassificationTask()



//let start = async () => await c.create_runner()

let detect_angle = (image)=>{
    let a =  c.detect_angle(image)
    return a
}


class Listened{
    constructor(initial){
        this.initial = initial
        this.subscribers = []
    }

    set(v){
        if(this.initial !=v){
            this.update(v)
        }
    }

    update(v){
        this.initial = v
        this.onupdate()
    }

    onupdate(){
        this.subscribers.forEach(sub=>sub.send(this.initial))
    }

    subscribe(x){
        
        this.subscribers.push({send:x})
        x(this.initial)
    }



}


let angle = new Listened("MISSING")


let isClosed = new Listened(false)

angle.subscribe(change=>isClosed.set((typeof change.angle==="number") && change.angle < 30))


async function init(connector){
    let {Hub} = await import("./messageHub.js")



    hub = new Hub("TF-WORKER")

    hub.addMessageType({name:"hello", worker:connector})
    hub.addMessageType({name:"ready", worker:connector})


    hub.send_hello()

    //hub.addListener("hello", console.log, connector)
    hub.addListener("add_port", (p)=>{

        console.log("port transfer is starting")
        hub.addMessageType({name:"angle", worker:p.port, alias:"angle2"})

        isClosed.subscribe(change=>hub.send_angle2(change))
        //isClosed.subscribe(change=>console.log(change))



    }, connector)

    hub.addMessageType({name:"angle", worker:connector})
    hub.addMessageType({name:"start", worker:connector})

    let start =async ()=>{
   return c.create_runner().then(c.create_model)
            .then(m=>{c.model=m; 
                hub.send_ready()

    
    return "STARTED"})
}
    hub.bindfn(start, connector)


    angle.subscribe(change=>hub.send_angle(change))


    hub.addListener("image", async (im)=>{
       // console.log("im updated")
    let a = detect_angle(im)
    angle.set(a)
    




} ,connector)




connector.start()
}
onconnect =async (e) => {
  const port = e.ports[0];
  console.log(port)

     init(port)

    console.log("INIT")


}