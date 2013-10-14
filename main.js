(function () {

    function webglStart() {
        var canvas = document.getElementById('world');
        var gl = initGL(canvas);
        initBuffers(gl);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        initShaders(gl).then(function(shaderProgram) {
            drawScene(gl, shaderProgram);
        });
    }

    function initGL(canvas) {
        var gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        return gl;
    }

    function initShaders(gl) {
        return $.get('shader.fs').then(function(fs) {
            return $.get('shader.vs').then(function(vs) {
                var vertexShader = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(vertexShader, vs);
                gl.compileShader(vertexShader);

                var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(fragmentShader, fs);
                gl.compileShader(fragmentShader);

                return [vertexShader, fragmentShader];
            });
        }).then(function(shaders) {
            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, shaders[0]);
            gl.attachShader(shaderProgram, shaders[1]);
            gl.linkProgram(shaderProgram);
            gl.useProgram(shaderProgram);
            return shaderProgram;
        });
    }

    function initBuffers(gl) {
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        var vertices = [
            0.0,  1.0,  0.0,
           -1.0, -1.0,  0.0,
            1.0, -1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        return buffer;
    }

    function drawScene(gl, shaderProgram) {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    window.onload = function() {
        webglStart();
    };
})();