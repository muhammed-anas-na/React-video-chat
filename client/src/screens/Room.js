import React,{useCallback, useEffect , useState} from 'react';
import {useSocket} from '../Context/SocketProvider'
import ReactPlayer from 'react-player'
import peer from '../services/peer';


const Room = ()=>{
    const socket = useSocket();
    const [remoteSocketId , setRemoteSocketId ] = useState(null);
    const [myStrem,setMyStream] = useState()
    const [remoteStream,setRemoteStream] = useState();

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

    const handleIncommingCall= useCallback(async({from ,offer})=>{
        console.log("Incoming call " , from ,offer)
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({audio:true , video:true })
        setMyStream(stream);
        const ans = await peer.getAnswer(offer); 
        socket.emit('call:accepted' , {to:from , ans})
    } , [socket])

    const sendStreams = useCallback(()=>{
        for(const track of myStrem.getTracks()){
            peer.peer.addTrack(track , myStrem)
        }
    } , [myStrem])
    const handleCallAccepted = useCallback(({from,ans})=>{
        peer.setLocalDescription(ans);
        console.log('Call accepted');
        sendStreams();

    } , [sendStreams])

    const handleNegoNeeded = useCallback(async()=>{
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed' , {offer , to:remoteSocketId});
    } , [remoteSocketId, socket])

    const handleNegoNeedIncoming = useCallback(async ({from ,offer})=>{
         const ans = await peer.getAnswer(offer);
         socket.emit('peer:nego:done' , {to:from , ans}) 
    } , [socket])

    const handleNegoNeedFinal = useCallback(async({ans})=>{
        await peer.setLocalDescription(ans);
    },[])
    useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded',handleNegoNeeded)
 
        return ()=>{
            peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded)
        }
    },[handleNegoNeeded])

    useEffect(()=>{
        peer.peer.addEventListener('track' , async ev=>{
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream[0]);
        })
    },[])

    useEffect(()=>{ 
        socket.on('user:joined' , handleUserJoin)
        socket.on('incomming:call' , handleIncommingCall)
        socket.on('call:accepted' , handleCallAccepted)
        socket.on('peer:nego:needed',handleNegoNeedIncoming)
        socket.on('peer:nego:final',handleNegoNeedFinal)
        
        return()=>{
            socket.off('user:joined' , handleUserJoin)
            socket.off('incomming:call' , handleIncommingCall)
            socket.off('call:accepted' , handleCallAccepted)
            socket.off('peer:nego:needed',handleNegoNeedIncoming)
            socket.off('peer:nego:final',handleNegoNeedFinal)
        
        } 
    },[socket, handleUserJoin, handleIncommingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal])
    return (
        <>
        Room
        {remoteSocketId ? 'Connected' : 'You are alone'}
        {remoteSocketId? <button onClick={handleCallUser}>Call</button> : ''  }
        {
            myStrem && <ReactPlayer muted playing height="200px" width="400px" url={myStrem}/>
        }
        {
            remoteStream && <button onClick={sendStreams}>Send streams</button>
        }
        {
            remoteStream && <ReactPlayer muted playing height="200px" width="400px" url={remoteStream}/>
        }
        </>
    )
}

export default Room;