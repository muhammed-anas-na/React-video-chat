import React,{useCallback, useState,useEffect} from 'react';
import {useSocket} from '../Context/SocketProvider'
import {useNavigate} from 'react-router-dom';

const LobbyScreen = () =>{
    const [email , setEmail] = useState('');
    const [room , setRoom] = useState('')
    const socket = useSocket()
    const navigate = useNavigate();
    const handleSubmit = useCallback((e)=>{
        e.preventDefault()
        socket.emit('room:join' , {email,room})
    } , [email , room , socket])

    const handleJoinRoom = useCallback((data)=>{
        const {email , room} = data
        navigate(`/room/${room}`)
        
    },[])

    useEffect(()=>{
        socket.on('room:join', handleJoinRoom);
        return()=>{
            socket.off('room:join',handleJoinRoom )
        }
    },[socket])
    return(
        <div>
            <h1>Lobby</  h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor='email'>Email ID</label>
                <input type='email' id='email' value={email} onChange={(e)=>setEmail(e.target.value)}/>
                <label htmlFor='room'>Room Numebr</label>
                <input type='number' id='room ' value={room} onChange={(e)=>setRoom(e.target.value)}/>
                <button>Join</button>
            </form>
        </div>
    )
}

export default LobbyScreen;