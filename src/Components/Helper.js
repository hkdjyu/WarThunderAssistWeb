import React, { useState, useEffect } from 'react'

export function distance(a, b, mapWidth, mapHeight) {
    return Math.sqrt(Math.pow((a.x - b.x) * mapWidth, 2) + Math.pow((a.y - b.y) * mapHeight, 2))
}