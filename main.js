/* jshint esnext: true */

Date.epoch = (() => Date.now() / 1000);

// from https://gist.github.com/wteuber/6241786
Math.fmod = ((a,b) => Number((a - (Math.floor(a / b) * b)).toPrecision(8)));

//Math.square = ((a) => (a * a));

FPS = 25;

$(document).ready(start);
$(document).resize(onResize);

function start() {
    onResize();
    draw();
    window.setInterval(draw, 1000 / FPS);
}

function onResize() {
    var canvas = document.getElementById("canvas");
    var boundingRect = canvas.getBoundingClientRect();
    canvas.width  = boundingRect.width;
    canvas.height = boundingRect.height;
    setupRelativeDrawing();
}

function setupRelativeDrawing() {
    var canvas = getCanvas();
    var ctx = getCanvasCtx();
    ctx.relMoveTo =
        function (rel_x, rel_y) {
            this.moveTo(rel_x * canvas.width, rel_y * canvas.height);
        };
    ctx.relLineTo =
        function (rel_x, rel_y) {
            this.lineTo(rel_x * canvas.width, rel_y * canvas.height);
        };
    ctx.relDrawSine =
        function (rel_amplitude, rel_freq, rel_phase, rel_height, color1, color2) {
            var rel_period = 1.0 / rel_freq;
            var period = rel_period * canvas.width;
            var half_period = period / 2;
            var colors_phase = 0; // rel_colors_phase * canvas.width; TODO
            var amplitude = rel_amplitude * canvas.height / 2.0;
            var height = rel_height * canvas.height;
            var y0 = (amplitude * Math.sin(2 * Math.PI * rel_phase)) + height;
            ctx.beginPath();
            ctx.moveTo(0, y0);
            var prev_xfmod = Math.fmod(0 + colors_phase, period);
            var xfmod;
            ctx.strokeStyle = color1;
            for (var x = 1; x < canvas.width; x++) {
                var rel_x = x / (1.0 * canvas.width);
                var angle = 2 * Math.PI * Math.fmod((rel_freq * rel_x) + rel_phase, 1.0);
                var y = (amplitude * Math.sin(angle)) + height;
                ctx.lineTo(x, y);
                xfmod = Math.fmod(x + colors_phase, period);
                if (xfmod > half_period && prev_xfmod <= half_period) {
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.strokeStyle = color2;
                }
                else if (prev_xfmod > half_period && xfmod <= half_period) {
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.strokeStyle = color1;
                }
                prev_xfmod = xfmod;
            }
            ctx.stroke();
        };
    ctx.setRelLineWidth =
        function (rel_line_width) {
            ctx.lineWidth = Math.max(1, rel_line_width * Math.max(canvas.width, canvas.height));
        };
}

function draw() {
    var ctx = getCanvasCtx();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //ctx.fillStyle = "#FF0000";
    //ctx.fillRect(0,0,150,75);

    //ctx.beginPath();
    //ctx.relMoveTo(0.1, 0.1);
    //ctx.relLineTo(0.5, 0.7);
    //ctx.stroke();

    // fill gry background
    ctx.fillStyle = "#6c6c6c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // fill white triangle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width / 2, 0);
    ctx.lineTo(0, canvas.height / 2);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // fill black triangle
    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.closePath();
    ctx.fillStyle = "#000000";
    ctx.fill();

    ctx.setRelLineWidth(0.002);
    var is_even = true;
    for (var rel_y = 0.05; rel_y < 1; rel_y += 0.06) {
        var rel_phase = Math.fmod(Date.epoch() / 10 + (is_even ? 0.25 : 0), 1.0);
        ctx.relDrawSine(0.01, 10, rel_phase, rel_y, "#484848", "#a6a6a6");
        ctx.relDrawSine(0.01, 10, rel_phase, rel_y + 0.01, "#484848", "#a6a6a6");
        is_even = !is_even;
    }
}

function getCanvas() {
    return $("canvas")[0];
}

function getCanvasCtx() {
    return getCanvas().getContext("2d");
}
