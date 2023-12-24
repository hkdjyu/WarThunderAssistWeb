import React, { useState, useEffect } from 'react'
import useSound from 'use-sound';
import AirStrikeSound from '../Audio/air_strike.mp3';
import { AttitudeIndicator} from "react-typescript-flight-indicators";
import './Instrument.css';

function Instrument() {
    const [ipAddress, setIpAddress] = useState("localhost");
    const [ipValue, setIpValue] = useState("localhost");
    const [ipPort, setIpPort] = useState("8111");
    const [ipPortValue, setIpPortValue] = useState("8111");

    const [isRunning, setIsRunning] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const [stateData, setstateData] = useState({});
    const [indicatorsData, setIndicatorsData] = useState({});
    const [mapData, setMapData] = useState({});
    const [mapBasicData, setMapBasicData] = useState({});

    const [minEnemyDistanceSquare, setMinEnemyDistanceSquare] = useState(Infinity);
    const [airStrike, setAirStrike] = useState(false);

    const [playAirStrike] = useSound(AirStrikeSound);

    const [mapRefRate, setMapRefRate] = useState(500); // 500ms

    useEffect(() => {
        if (isRunning) {
            setIsConnected(true);
        }
        else {
            setIsConnected(false);
        }
    }, [isRunning]);

    const fetchData = useEffect(() => {
        if (isRunning === false){
            return;
        }
        const interval = setInterval(() => {
            try{
                fetch("https://" + ipAddress + ":" + ipPort + "/state")
                .then(response => response.json())
                .then(data => setstateData(data))
                .catch(err => {
                    const mute = err
                    setIsConnected(false);
                });
                fetch("https://" + ipAddress +":" + ipPort + "/indicators")
                .then(response => response.json())
                .then(data => setIndicatorsData(data))
                .catch(err => {
                    const mute = err
                    setIsConnected(false);
                });
            }
            catch(err){
                const mute = err;
            }
        }, 20); // 50ms
        return () => clearInterval(interval);
    }
    , [ipAddress, isRunning]);
    
    const fetchMapData = useEffect(() => {
        if (isRunning === false){
            return;
        }
        const interval = setInterval(() => {
            try{
                fetch("https://" + ipAddress +":" + ipPort + "/map_obj.json")
                .then(response => response.json())
                .then(data => {
                    setMapData(data)
                })
                .catch(err => {
                    const mute = err
                    setIsConnected(false);
                });
            }
            catch(err){
                const mute = err
            }
        }, Math.min(mapRefRate, 2000)); // minimum 2000ms refresh
        return () => clearInterval(interval);
    }
    , [ipAddress, isRunning]);

    // fetch map basic data once
    const fetchMapBasicData = useEffect(() => {
        if (isRunning === false){
            return;
        }
        try{
            fetch("https://" + ipAddress + ":" + ipPort + "/map_info.json")
            .then(response => response.json())
            .then(data => {
                setMapBasicData(data)
            })
            .catch(err => {
                const mute = err
                setIsConnected(false);
            });
        }
        catch(err){
            const mute = err
        }
    }
    , [ipAddress, isRunning]);

    function distanceSquare(a, b, mapWidth, mapHeight) {
        return (Math.pow((a[0] - b[0]) * mapWidth, 2) + Math.pow((a[1] - b[1]) * mapHeight, 2))
    }

    const findPlayerPos = useEffect(() => {
        // [{"type":"aircraft","color":"#39D921","color[]":[57,217,33],"blink":0,"icon":"Player","icon_bg":"none","x":0.468227,"y":0.373073,"dx":-0.459699,"dy":-0.888075},]
        let playerPos = [];
        let enemiesPos = [];
        for (let i=0; i<mapData.length; i++){
            if (mapData[i]["type"] === "aircraft" && mapData[i]["icon"] === "Player"){
                playerPos = [mapData[i]["x"], mapData[i]["y"], mapData[i]["dx"], mapData[i]["dy"]];
            }
            else if (mapData[i]["type"] === "aircraft" && mapData[i]["color[]"][0] > 200) {
                enemiesPos.push([mapData[i]["x"], mapData[i]["y"], mapData[i]["dx"], mapData[i]["dy"]]);
            }
            // ground target trigger
            // else if (mapData[i]["color[]"][0] > 200) {
            //     enemiesPos.push([mapData[i]["x"], mapData[i]["y"]]);
            // }
        }

        // calculate distance square (performance better) between player and enemy
        let minEnemyDist = Infinity;
        if (mapBasicData["map_max"] !== undefined || mapBasicData["map_min"] !== undefined){
            let mapWidth = mapBasicData["map_max"][0] - mapBasicData["map_min"][0];
            let mapHeight = mapBasicData["map_max"][1] - mapBasicData["map_min"][1];
            for (let i=0; i<enemiesPos.length; i++){
                let enemyDistance = distanceSquare(playerPos, enemiesPos[i], mapWidth, mapHeight);
                if (enemyDistance < minEnemyDist || minEnemyDist === 0){
                    minEnemyDist = enemyDistance;
                }
            }
            setMinEnemyDistanceSquare(minEnemyDist);
        }
        
        // Map refresh rate
        if (minEnemyDist < 1000000){
            setMapRefRate(250);
        }
        else if (minEnemyDist < 9000000){
            setMapRefRate(500);
        }
        else if (minEnemyDist < 25000000){
            setMapRefRate(1000);
        }
        else {
            setMapRefRate(2000);
        }

        // Air alert
        const alertDistance = 6250000; // 2500m

        if (minEnemyDist < alertDistance && airStrike === false){
            setAirStrike(true);
            playAirStrike();
            setTimeout(() => {
                if (minEnemyDist > alertDistance) {
                    setAirStrike(false);
                } 
            }, 10000);
        }
        if (airStrike === true && minEnemyDist > alertDistance){
            setAirStrike(false);
        }
    }
    , [mapData]);

  	return (
        <div style={{height: "90vh", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center",}}>

            <div style={{
                height: "10%", width:"100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", 
                backgroundColor:"#111111", border: "5px solid black", borderRadius: "10px"
            }}>
                {airStrike === true ? <h1 style={{color: "red"}}>Air Strike Warning</h1> : 
                <h1 style={{color: "#333333"}}>{Math.floor(Math.sqrt(minEnemyDistanceSquare))}</h1>}
            </div>             
            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", scale: "1.5", marginTop: "50px", marginBottom: "50px"}}>
                <AttitudeIndicator
                    roll={indicatorsData["aviahorizon_roll"] === undefined ? 60 : indicatorsData["aviahorizon_roll"]}
                    pitch={indicatorsData["aviahorizon_pitch"] === undefined ? 15 : indicatorsData["aviahorizon_pitch"]*-1}
                    showBox={false}
                />
            </div>

                        <div style={{width:"100%", height:"auto", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center",}}>
                <div style={{
                    width: "50%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", marginLeft:"10px", marginTop:"-60px",
                }}>
                    <p>
                        {
                            (indicatorsData["aviahorizon_pitch"] === undefined ? "--" : 
                            (indicatorsData["aviahorizon_pitch"] < 0 ? "+" : "-") + (Math.abs(indicatorsData["aviahorizon_pitch"]) < 10 ? "0" : "") + Math.max(Math.floor(Math.abs(indicatorsData["aviahorizon_pitch"]), 999))) +
                            " deg"
                        }
                    </p>
                </div>
                <div style={{
                    width: "50%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", marginRight:"10px", marginTop:"-60px",
                }}>
                    <p>
                        
                        {(stateData["Vy, m/s"] === undefined ? "---" :
                            (stateData["Vy, m/s"] > 0 ? "+" : "-") + (Math.abs(stateData["Vy, m/s"]) < 10 ? "" : "0") + (Math.abs(stateData["Vy, m/s"]) < 100 ? "" : "0") + Math.max(Math.floor(Math.abs(stateData["Vy, m/s"]), 999))) + 
                            " m/s"
                        }
                    </p>
                </div>
            </div>

            <div style={{
                width:"100%", height:"auto", border: "5px solid black", borderRadius: "10px", backgroundColor: "#111111"
            }}>
                <div style={{
                    width:"100%", height:"auto", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", 
                }}>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <h3 style={{margin: "5px", color:"#909090"}}> SPD </h3>
                    </div>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <h3 style={{margin: "5px", color:"#909090"}}> HDG </h3>
                    </div>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <h3 style={{margin: "5px", color:"#909090"}}> ALT </h3>
                    </div>
                </div>

                <div style={{
                    width:"100%", height:"auto", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", 
                }}>
                    <div 
                        style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", 
                    }}>
                        <h1 style={{margin: "5px"}}> 
                            {stateData["IAS, km/h"] === undefined ? "--" : stateData["IAS, km/h"]}
                        </h1>
                    </div>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <h1 style={{margin: "5px"}}> 
                            {indicatorsData["compass"] === undefined ? "--" : ((indicatorsData["compass"]) < 10 ? "00" + (Math.round(indicatorsData["compass"])) : 
                            (indicatorsData["compass"])<100 ? "0" + (Math.round(indicatorsData["compass"])) : (Math.round(indicatorsData["compass"])))} 
                        </h1>
                    </div>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <h1 style={{margin: "5px"}}>
                            {stateData["H, m"] === undefined ? "--" : stateData["H, m"]}
                        </h1>
                    </div>
                </div>
            </div>

            <div style={{
                width:"100%", height:"auto", border: "5px solid black", borderRadius: "10px", backgroundColor: "#111111", marginTop: "10px"
            }}>
                <div style={{
                    width:"100%", height:"auto", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", 
                }}>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <h3 style={{margin: "5px"}}> Brake </h3>
                    </div>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <h3 style={{margin: "5px"}}> FLAPS </h3>
                    </div>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <h3 style={{margin: "5px"}}> LG </h3>
                    </div>
                </div>

                <div style={{
                    width:"100%", height:"auto", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", 
                }}>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        {stateData["airbrake, %"] === undefined ? <h1 style={{margin: "5px", color:"grey"}}>--</h1> : stateData["airbrake, %"] > 0 ? <h1 style={{margin: "5px", color:"red"}}>{stateData["airbrake, %"]}</h1> : <h1 style={{margin: "5px", color:"grey"}}>OFF</h1>}
                    </div>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                            {stateData["flaps, %"] === undefined ? <h1 style={{margin: "5px", color:"grey"}}>--</h1> : <h1 style={{margin: "5px", color:"grey"}}>{stateData["flaps, %"]}</h1>}
                    </div>
                    <div style={{width: "33.3%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        {stateData["gear, %"] === undefined ? <h1 style={{margin: "5px", color:"grey"}}>--</h1> : stateData["gear, %"] == 100 ? <h1 style={{margin: "5px", color:"green"}}>DOWN</h1> : stateData["gear, %"] > 0 ? <h1 style={{margin: "5px", color:"red"}}>{stateData["gear, %"]}</h1> : <h1 style={{margin: "5px", color:"grey"}}>UP</h1>}
                    </div>
                </div>
            </div>
            <div style={{flexDirection:"column", display:"flex", justifyContent:"center", alignItems:"flex-start"}}>
                <h2>Host IP Address: </h2>
                <p style={{marginTop:"-10px", marginBottom:"-10px", marginLeft:"5px"}}>{ipAddress}</p>
                <div>
                    <input className="ipInput" type="text" style={{color:"black"}} onChange={(e) => setIpValue(e.target.value) } value={ipValue}></input>
                    <button className="setButton" style={{color:"black"}} onClick={() => setIpAddress(ipValue)}>
                        <p style={{color:"white", fontFamily:"digital-clock-font"}}>Set</p>
                    </button>       
                </div>    
            </div>
            <div style={{flexDirection:"column", display:"flex", justifyContent:"center", alignItems:"flex-start"}}>
                <h2>Host Port: </h2>
                <p style={{marginTop:"-10px", marginBottom:"-10px", marginLeft:"5px"}}>{ipPort}</p>
                <div>
                    <input className="ipInput" type="text" style={{color:"black"}} onChange={(e) => setIpPortValue(e.target.value) } value={ipPortValue}></input>
                    <button className="setButton" style={{color:"black"}} onClick={() => setIpPort(ipPortValue)}>
                        <p style={{color:"white", fontFamily:"digital-clock-font"}}>Set</p>
                    </button>       
                </div>    
            </div>
            <div style={{marginTop:"20px", paddingBottom:"20px"}}>
                <button className="startButton" style={{scale:"150%", color:"black", backgroundColor: {isRunning} ? "#red" : "#4CAF50"}} 
                onClick={() => setIsRunning(!isRunning)}>
                    <p style={{color:"black", fontFamily:"digital-clock-font", margin:"-10px", fontSize:"40px"}}>
                        {isRunning ? "Stop" : "Start"}
                    </p>
                </button>
            </div>
            <p style={{fontFamily:"Arial", color: isConnected ? "green" : "red", paddingBottom:"20px"}}>{(isConnected ? "Connected" : "No connection")}</p>
        </div> 
   
  	)
}

export default Instrument;


