(function () {

    function Degree(value) {
        this.value = 0;
        var last = null;

        this.next = function() {
            var now = Date.now();
            var elapsed = now - last;
            value += (90 * elapsed) / 1000.0;
            last = now;
            return value;
        };
    };

    function tick(gl, shaderProgram, buffers, mvMatrix, pMatrix, degree) {
        window.requestAnimationFrame(function() {
            tick(gl, shaderProgram, buffers, mvMatrix, pMatrix, degree);
        });
        drawScene(gl, shaderProgram, buffers, mvMatrix, pMatrix, degree.next());
    }

    function webglStart() {
        var canvas = document.getElementById('world');
        var gl = initGL(canvas);
        var buffers = initBuffers(gl);
        var mvMatrix = mat4.create();
        var pMatrix = mat4.create();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        initShaders(gl).then(function(shaderProgram) {
            tick(gl, shaderProgram, buffers, mvMatrix, pMatrix, new Degree(0));
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
        var bufferPosition = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition);
        var vertices = [
            0.0,  1.0,  0.0,
           -1.0, -1.0,  0.0,
            1.0, -1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var bufferColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
        var colors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0
        ];
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        return [bufferPosition, bufferColor];
    }

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    function drawScene(gl, shaderProgram, buffers, mvMatrix, pMatrix, degree) {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var positionLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        var pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        mat4.perspective(20, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);

        var mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, [0,0,-19]);
        mat4.rotate(mvMatrix, degToRad(degree), [0, 1, 0]);
        //mat4.translate(mvMatrix, [-2.5, 1.0, -19.0]);
        gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);

        var color = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(color);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[1]);
        gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    }

    window.onload = function() {
        webglStart();
    };
})();