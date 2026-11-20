

export class Hub{
    constructor(id){
        this.id = id
        this.events = {}
        this.listeners = {

        }

        this.current_message = null


        this.listening =[]


    }

// should add a remove option using a generated id for each listener type
    addListener(key, callback, worker="main"){

        console.log("AADDING listener")
        if(key in this.listeners){
            this.listeners[key].push(callback)
        } else{
            this.listeners[key] = [callback]
        }


        if(!this.listening.includes(worker)){

            this.setuplistener(worker)
            this.listening.push(worker)
        }

    }


    bind({key, worker="main", fn} ){
        this.addListener.bind(this)(key, fn, worker)
    }

    bindfn(fn, worker="main"){
        this.addListener.bind(this)(fn.name, fn, worker)
    }

    setuplistener(worker){
            console.log("setting up listener")

        if(worker==="main"){
            addEventListener("message", this.onmessage.bind(this))
        }

        else{
            worker.addEventListener("message", this.onmessage.bind(this))
        }

    }



    onmessage(message){

        console.log({message:message})

       if( message?.data?.key && message?.data?.key in this.listeners ){

        this.current_message = message.data



        
        if(message.data.response){
            this.handle_remote_call()
        }
        else{
            this.handle_listeners(message.data.key)


        }
        return

       }

       

       console.log(`Message of key: ${message?.data?.key} is not currently handled by worker ${this.id}.`)

       
    }


    handle_listeners(key){

        for(let i=0; i<this.listeners[key].length;i++){

            return this.listeners[key][i](this.current_message?.payload)
        }
    }
    addMessageType({name, worker =null, alias=null}){

        let f_name = alias || name

        
         this.events[f_name] = [{worker, name}]

        this.construct_sender(f_name)

/*
        if(worker){
            this["send_"+f_name] = (payload, info={}, transfer=null ) =>worker.postMessage({key:name,payload, ...info}, transfer)
        }
        else{
        this["send_"+f_name] = (payload, info={}, transfer=null) =>self.postMessage({key:name, payload, ...info}, transfer)
        }
*/
    }

    send_individual({name, worker}){

         if(worker || worker!=="main"){
            return (payload, info={}, transfer=null ) =>worker.postMessage({key:name,payload, ...info}, transfer)
        }
        else{
       return (payload, info={}, transfer=null) =>self.postMessage({key:name, payload, ...info}, transfer)
        }

    }

    construct_sender(f_name){
            let listeners = this.events[f_name] || []

        

       
        this["send_"+f_name] = (payload, info, transfer) =>{
             if(listeners){

            listeners.forEach(l=>{this.send_individual(l)(payload, info, transfer)})
            
        }
        }



        }


    remote_call(key, payload, worker="main"){

        console.log("remote call")
        let id = Math.random()

       //this.addListener(id, (e)=>console.log(e), worker ) 
        this.addMessageType({name:id, worker})

        //this["send_"+key](payload, {response:true, id})

        let p = new Promise((resolve, reject)=>{

            console.log("promising")

            this.addListener(id, (res)=>{
                resolve(res)}, worker )

            this["send_"+key](payload, {response:true, id})



        })

        return p

        

    }

    async handle_remote_call(){

        try{
        console.log("remote call handling")
        let msg = this.current_message

        let res = await this.handle_listeners(msg.key)


         self.postMessage({key:msg.id, payload:res})
        
        }catch{
            console.log("COULDNT MAKE REMOTE CALL")
        }




    }

    subscribe(key, cb){
        let id = Math.random()

       //this.addListener(id, (e)=>console.log(e), worker ) 
        this.addMessageType({name:id, worker})
        worker.postMessage({key, subscribe:true, id})
        this.addListener(id, cb )

            /*this["send_"+key](payload, {response:true, id})*/



        }


        handle_subscription(){
           let msg =  this.current_message


        }


        

    




    
}






export class SendHub{
    constructor(self){
        this.self=self
    }


    addMessageType({name, worker =null}){
        if(worker){
        this[name] = (payload) =>worker.postMessage({key:name,payload})
        }
        else{
        this[name] = (payload) =>self.postMessage({key:name, payload})
        }

    }
}

/*
remoteCall(){
    // sendMessage
    //-- 
    // waitForReturn
}


*/



/*

class TestClass{
    constructor(){

        this.item = 1

    }
    method1(){
        console.log("method1")
    }
}





async function runner(){
    console.log("running")
}

// for function 
console.log(runner.name)
//for js object
let o = {a:()=>console.log("a")}

// for class

console.log(Object.keys(o).filter(k=>(typeof o[k] ==='function')))
//let t = new TestClass.prototype[Object.getOwnPropertyNames(o)[0]]()


//t.method1()

*/