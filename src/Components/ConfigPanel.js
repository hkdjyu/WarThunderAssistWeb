import React, { useState, useEffect } from 'react'

function ConfigPanel ({callback}) {
    return (
        <div>
            <h2>Host IP Address</h2>
            <input type="text" style={{color:"black"}} onChange={(e) => callback(e.target.value)} />
        </div>
    )
    }

export default ConfigPanel