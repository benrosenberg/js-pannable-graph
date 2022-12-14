// Adapted from https://codepen.io/chengarda/pen/wRxoyB (pannable/zoomable canvas part) 

// This is a very basic canvas example which allows for panning and zooming using a mouse (Click & drag & scrollwheel) or touchscreen (tap and drag to pan, pinch to zoom). 

import DATA from "./people.js";

// need to stringify and then parse because js is async and 
// otherwise doesn't load these quickly enough for them to be used
var PEOPLE = JSON.parse(JSON.stringify(DATA.PEOPLE));
var DOTTEDLINES = JSON.parse(JSON.stringify(DATA.LINES));

let canvas = document.getElementById("canvas")
let ctx = canvas.getContext('2d')

let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraZoom = 1
let MAX_ZOOM = 5
let MIN_ZOOM = 0.1
let SCROLL_SENSITIVITY = 0.0005

let circles = [];

function draw()
{
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
    ctx.scale(cameraZoom, cameraZoom)
    ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
    ctx.clearRect(0,0, window.innerWidth, window.innerHeight)

    // draw compass gridlines
    var max_span = 5000
    var thick = {
        "thinnest" : 0.125,
        "thinner" : 0.25,
        "thin" : 0.5, 
        "medium": 2, 
        "thick" : 4
    }

    var line_color = "gray";
    var already_covered = []

    function generate_lines(thickness, number_of_lines_per_side) {
        for (var i = -max_span; i <= max_span; i += max_span/number_of_lines_per_side) {
            if (already_covered.indexOf(i) == -1) {
                drawCHLine(i, thickness, max_span, line_color);
                drawCYLine(i, thickness, max_span, line_color);
                already_covered.push(i)
            }
        }
    }

    generate_lines(thick.thick, 10)
    generate_lines(thick.medium, 20)
    generate_lines(thick.thin, 40)
    generate_lines(thick.thinner, 80)
    generate_lines(thick.thinnest, 160)

    // axes
    drawCHLine(0, 4, max_span + 150, "black")
    drawCYLine(0, 4, max_span + 150, "black")  
    // arrows on X axis
    drawText(">", max_span + 100, 35, 100, "Arial")
    drawText("<", -max_span -160, 35, 100, "Arial")

    // draw each of the dotted horizontal/vertical lines in DOTTEDLINES
    DOTTEDLINES.forEach(
        (line) => {
            if (line.dir == "h") {
                drawCHLine(-line.loc, 4, max_span, line.color, true)
                ctx.fillStyle = line.color;
                for (var i = -max_span; i < max_span; i += max_span/10) {
                    drawText(line.comment, i + 10, -line.loc + 20, 12, "Arial")
                }
            } else if (line.dir == "v") {
                drawCYLine(line.loc, 4, max_span, line.color, true)
                // need to rotate entire context in order to draw rotated text
                ctx.save();
                ctx.fillStyle = line.color;
                ctx.rotate(-Math.PI/2);
                for (var i = -max_span; i < max_span; i += max_span/10) {
                    drawText(line.comment, i + 10, line.loc + 20, 12, "Arial")
                }
                ctx.restore();
            } else {
                console.log("invalid direction: " + line.loc)
            }
        }
    )

    // draw each person in PEOPLE 
    PEOPLE.forEach(
        (person) => plot_item(person)
    )

    // actually draw
    requestAnimationFrame( draw )
}

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e)
{
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }        
    }
}

function drawRect(x, y, width, height)
{
    ctx.fillRect( x, y, width, height )
}

function drawText(text, x, y, size, font)
{
    ctx.font = `${size}px ${font}`
    ctx.fillText(text, x, y)
}

function plot_item(item) {
    var x = item.x;
    var y = -item.y; // flip to make assumptions about graphs consistent
    var name = item.name;
    // optionally draw a dotted-line circle around the point as well
    if (item.dottedcolor == "none") {
        drawCircle(x, y, 10, item.color, item.color);
    } else {
        drawCircle(x, y, 10, item.color, item.color, true, item.dottedcolor);
    }
    drawText(name, x, y + 20, 12, "Arial");
}

// draw a colored, optionally dotted, horizontal line of some length and width
function drawCHLine(y, width, span, color, dotted=false) {
    ctx.beginPath();
    ctx.moveTo(-span, y);
    ctx.lineTo(span, y);
    var prev_linewidth = ctx.lineWidth;
    var prev_strokestyle = ctx.strokeStyle;
    ctx.strokeStyle = color;
    ctx.lineWidth = width; 
    if (dotted) {ctx.setLineDash([5, 10]);}
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = prev_linewidth;
    ctx.strokeStyle = prev_strokestyle;
}

// draw a colored, optionally dotted, vertical line of some length and width
function drawCYLine(x, width, span, color, dotted=false) {
    ctx.beginPath();
    ctx.moveTo(x, -span);
    ctx.lineTo(x, span);
    var prev_linewidth = ctx.lineWidth;
    var prev_strokestyle = ctx.strokeStyle;
    ctx.strokeStyle = color;
    ctx.lineWidth = width; 
    if (dotted) {ctx.setLineDash([5, 10]);}
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = prev_linewidth;
    ctx.strokeStyle = prev_strokestyle;
}

// draw a (filled?) circle with an optional radius+20 dotted circle containing it
function drawCircle(x, y, r, strokecolor, fillcolor, dotted=false, dottedcolor="red") {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    var prev_strokestyle = ctx.strokeStyle;
    var prev_fillstyle = ctx.fillStyle;
    ctx.strokeStyle = strokecolor;
    ctx.fillStyle = fillcolor;
    ctx.stroke();
    ctx.fill();
    ctx.strokeStyle = prev_strokestyle;
    circles.push({"center" : (x, y), "r" : r})

    if (dotted) {
        ctx.beginPath();
        ctx.arc(x, y, r + 20, 0, 2 * Math.PI);
        var prev_strokestyle = ctx.strokeStyle;
        var prev_fillstyle = ctx.fillStyle;
        ctx.strokeStyle = dottedcolor;
        ctx.setLineDash([5, 10]);
        var prev_linewidth = ctx.lineWidth;
        ctx.lineWidth = 3; 
        ctx.stroke();
        ctx.lineWidth = prev_linewidth;
        ctx.strokeStyle = prev_strokestyle;
        ctx.setLineDash([]);
    }
}

let isDragging = false
let dragStart = { x: 0, y: 0 }

function onPointerDown(e)
{
    isDragging = true
    dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
    dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
}

function onPointerUp(e)
{
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
}

function onPointerMove(e)
{
    if (isDragging)
    {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y 
    }
}

function handleTouch(e, singleTouchHandler)
{
    if ( e.touches.length == 1 )
    {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2)
    {
        isDragging = false
        handlePinch(e)
    }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e)
{
    e.preventDefault()
    
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if (initialPinchDistance == null)
    {
        initialPinchDistance = currentDistance
    }
    else
    {
        adjustZoom( null, currentDistance/initialPinchDistance )
    }
}

function adjustZoom(zoomAmount, zoomFactor)
{
    if (!isDragging)
    {
        if (zoomAmount)
        {
            cameraZoom -= zoomAmount
        }
        else if (zoomFactor)
        {
            console.log(zoomFactor)
            cameraZoom = zoomFactor*lastZoom
        }
        
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        
        console.log(zoomAmount)
    }
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

// Ready, set, go
draw()