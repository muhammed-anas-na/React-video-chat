import React,{useCallback, useEffect , useState} from 'react';
import {useSocket} from '../Context/SocketProvider'
import ReactPlayer from 'react-player'
import peer from '../services/peer';


const Room = ()=>{
    const socket = useSocket();
    const [remoteSocketId , setRemoteSocketId ] = useState(null);
    const [myStrem,setMyStream] = useState()

    const handleUserJoin = useCallback(({email , id})=>{
        console.log("Email joined the room" , email)
        setRemoteSocketId(id)
    },[])
    const handleCallUser=useCallback(async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio:true , video:true })
        const offer = await peer.getOffer();
        socket.emit('user:call',{to:remoteSocketId , offer})
        setMyStream(stream); 
    } , [remoteSocketId , socket])

    const handleIncommingCall= useCallback(({from ,offer})=>{
        console.log("Incoming call " , from ,offer)
    } , [])
    useEffect(()=>{ 
        socket.on('user:joined' , handleUserJoin)
        socket.on('incomming:call' , handleIncommingCall)


        return()=>{
            socket.off('user:joined' , handleUserJoin)
            socket.off('incomming:call' , handleIncommingCall)
        } 
    },[socket , handleUserJoin , handleIncommingCall])
    return (
        <>
        Room
        {remoteSocketId ? 'Connected' : 'You are alone'}
        {remoteSocketId? <button onClick={handleCallUser}>Call</button> : ''  }
        {
            myStrem && <ReactPlayer muted playing height="200px" width="400px" url={myStrem}/>
        }
        </>
    )
}

export default Room;