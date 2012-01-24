(function () {

    var centeredElem;

    emotely.AccelerometerPage = emotely.Page.extend({
        init: function (app, sammyApp) {

            this._super("Accelerometer", app, sammyApp, '#!/accelerometer', '/views/accelerometer.ejs');
        },
        onEnter: function (prevPage, app) {
            this._super(prevPage, app);
            this.showNewPage(prevPage, true, this.htmlCache);
        },
        onFirst: function (prevPage, app, html) {
            $html = $(html);
            var cvs = $html.find('#canvas').get(0),
                ctx = cvs.getContext('2d'),
                page = this
                cx = cvs.width / 2,
                cy = cvs.height / 2,

                // One of the HTML elements is the div#centered one
                $html.each(function () {
                    if (this.id == "centered") {
                        centeredElem = this;
                        return;
                    }
                });

            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(0, 0, cvs.width, cvs.height);

            var l, epsilon = 0.01;

            function unique(a, b) {
                return Math.abs(a - b) > epsilon;
            }

            function sendIfDifferent(n) {
                if (l !== undefined) {
                    if (!(unique(l.x, n.x) && unique(l.y, n.y) && unique(l.z, n.z))) return;
                }

                page.sendMessage({
                    accel: {
                        x: n.x,
                        y: n.y,
                        z: n.z
                    }
                });

                //drawAccel(n);
                l = {
                    x: n.x,
                    y: n.y,
                    z: n.z
                };
            }

            window.ondevicemotion = function (event) {
                var n = event.accelerationIncludingGravity;
                //  console.log('x=('+n.x+')');
                sendIfDifferent(n);
            }

            this.onAccelerometerMessage = function (msg) {
                if (msg.accel !== undefined) {
                    drawAccel(msg.accel);
                }
            }

            function drawLine(x0, y0, x1, y1, r, g, b) {
                // Make points are integers
                x0 = Math.floor(x0);
                y0 = Math.floor(y0);
                x1 = Math.floor(x1);
                y1 = Math.floor(y1);


                ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
                ctx.lineWidth = 3;
                ctx.lineCap = ctx.lineJoin = "round";
                ctx.beginPath();

                ctx.moveTo(x0, y0);

                ctx.lineTo(x1, y1);
                ctx.stroke();
            }

            function drawText(str, x, y, size) {
                ctx.save();
                ctx.fillStyle = 'rgba(255,255,255,1)';
                ctx.font = Math.floor(size) + "px sans-serif";
                ctx.fillText(str, x, y);
                ctx.restore();
            }

            function normalize(v1) {
                var m = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
                m = m ? m : 0.0001; // Prevent divide by zero
                return [v1[0] / m, v1[1] / m, v1[2] / m];
            }

            function cross(v1, v2) {
                return normalize([
                v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]]);
            }

            function scale(v1, s) {
                return [
                v1[0] * s, v1[1] * s, v1[2] * s];
            }


            var m = 10;

            function drawBox(a) {
                var w = 1000,
                    h = 500,
                    p = [
                        [-10, -10, 1],
                        [10, -10, 1],
                        [10, 10, 1],
                        [-10, 10, 1]
                    ]

                    // Do Projection    
                    for (var j = 0; j < 4; j++) {
                        var z = p[j][2] ? p[j][2] : 0.001;
                        p[j][0] = p[j][0] / z;
                        p[j][1] = p[j][1] / z;
                    }

                    for (var i = 0; i < 4; i++) {
                        drawLine(cx + p[i][0], cy + p[i][1], cx + p[(i + 1) % 4][0], cy + p[(i + 1) % 4][1], 255, 255, 255);
                    }
            }

            function drawAxes(n) {
                var m = 40,
                    c = [
                        [255, 0, 0],
                        [0, 255, 0],
                        [0, 0, 255]
                    ];

                for (var i = 0; i < 3; i++) {
                    drawLine(
                    cx, cy, cx + n[i][0] * m, ///(cx+n[i][2]+1)*m, 
                    cy + n[i][2] * m, ///(cx+n[i][2]+1)*m,
                    c[i][0], c[i][1], c[i][2]);
                }
            }

            function newDrawAxes(axes) {
                var s = 750,
                    depth = 0.3,
                    verts = [
                        [1 / 2, 0, -depth / 2],
                        [0, 1 / 2, -depth / 2],
                        [0, 0, -depth / 2 - 1 / 2]
                    ],
                    c = [
                        [255, 0, 0],
                        [0, 255, 0],
                        [0, 0, 255]
                    ];

                for (var i = 0; i < 3; i++) {
                    var start = project(transform([0, 0, -depth / 2], axes, s), s),
                        end = project(transform(verts[i], axes, s), s);
                    drawLine(
                    40 + start[0], cy * 2 - 40 + start[1], 40 + end[0], cy * 2 - 40 + end[1], c[i][0], c[i][1], c[i][2]);
                }
            }

            function draw2D(a) {
                drawLine(cx, cy, cx - a.y * m, cy, 255, 0, 0);
                drawLine(cx, cy, cx, cy - a.x * m, 0, 255, 0);
                drawLine(cx, cy, cx - a.y * m, cy - a.x * m, 0, 255, 255);
            }

            function clip(n) {
                if (n > 1.0) return 1.0;
                else if (n < -1.0) return -1.0;
                else
                return n;
            }

            function calculateAxes(accel) {
                var axes = [
                    [10, 0, 0],
                    [0, 10, 0],
                    [0, 0, 10]
                ],
                    n = [clip(accel.x / 10), clip(accel.y / 10), clip(accel.z / 10)];

                // Print out axis accelerations
                //drawText("x=("+short(n[0],6)+")y=("+short(n[1],6)+")z=("+short(n[2],6)+")",20,cy+cy-80,20);
                // 
                var xTemp = [Math.cos(n[1] * Math.PI / 2), 0, Math.sin(-n[1] * Math.PI / 2)],
                    yTemp = [0, Math.cos(n[0] * Math.PI / 2), Math.sin(n[0] * Math.PI / 2)];

                // Calculate Z Axis based on the X,Y Axeses calculated above     
                axes[2] = cross(xTemp, yTemp);


                // It is a total hack to calculate things this way, we try to make it a little more accurate
                // By picking the Axis that has moved most as the starting point for building the other one,
                // Then rebuild it from that one and the Z one
                // If X axis is has more accel
                if (Math.abs(n[0]) > Math.abs(n[1])) {
                    axes[1] = cross(axes[2], xTemp);
                    axes[0] = cross(axes[1], axes[2]);
                }
                // If Y axis is has more accel
                else {
                    axes[0] = cross(yTemp, axes[2]);
                    axes[1] = cross(axes[2], axes[0]);
                }

                // 

                return axes;
            }

            function add(v1, v2) {
                return [
                v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
            }

            function transform(p, axes, s) {
                var world = add(
                scale(axes[0], p[0]), add(
                scale(axes[1], p[1]), scale(axes[2], p[2]))),
                    invY = 1; //(world[1])?(1/world[1]):(1/0.0001);
                return world;
            }

            function project(p, s) {
                var adjusted = p[1] + 8.5,
                    invY = (adjusted) ? (1 / adjusted) : (1 / 0.0001);
                return [p[0] * invY * s, p[2] * invY * s];
            }

            var averages = [],
                averagesCount = 2;

            function smooth(accel) {

                // Add This accel to the averages
                averages.push([accel.x, accel.y, accel.z]);

                if (averages.length >= averagesCount) {
                    averages.shift();
                }

                var adder = [0, 0, 0],
                    len = averages.length;
                for (var i = 0; i < len; i++) {
                    adder[0] += averages[i][0];
                    adder[1] += averages[i][1];
                    adder[2] += averages[i][2];
                }
                return {
                    x: adder[0] / len,
                    y: adder[1] / len,
                    z: adder[2] / len
                };
            }

            function drawDevice(axes) {
                var w = 4.5,
                    h = 2.4,
                    s = 750,
                    depth = 0.3,
                    verts = [
                        [-w / 2, h / 2, -depth / 2],
                        [w / 2, h / 2, -depth / 2],
                        [w / 2, -h / 2, -depth / 2],
                        [-w / 2, -h / 2, -depth / 2]
                    ],
                    c = [
                        [255, 0, 0],
                        [0, 255, 0],
                        [0, 0, 255],
                        [255, 0, 255]
                    ];

                for (var i = 0; i < 4; i++) {
                    var p = transform(verts[i], axes, s),
                        top1 = project(p, s),
                        top2 = project(transform(verts[(i + 1) % 4], axes, s), s),
                        bottom1 = project(transform(add(verts[i], [0, 0, depth]), axes, s), s),
                        bottom2 = project(transform(add(verts[(i + 1) % 4], [0, 0, depth]), axes, s), s);

                    // Top
                    drawLine(
                    cx + top1[0], cy + top1[1], cx + top2[0], cy + top2[1], 255, 255, 255);
                    // Bottom
                    drawLine(
                    cx + bottom1[0], cy + bottom1[1], cx + bottom2[0], cy + bottom2[1], 255, 255, 255);
                    // Pillars
                    drawLine(
                    cx + top1[0], cy + top1[1], cx + bottom1[0], cy + bottom1[1], 255, 255, 255);

                    // Draw Points
                    //    drawText("("+short(p[0],6)+","+short(p[1],6)+","+short(p[2],6)+")",cx+v1[0]-50,cy+v1[1],20);
                }



            }

            function drawAccel(a) {
                var px, py, pz;


                // Clear first
                ctx.fillStyle = 'rgba(0,0,0,1)';
                ctx.fillRect(0, 0, cvs.width, cvs.height);

                var smoother = smooth(a);
                axes = calculateAxes(smoother);
                drawDevice(axes);
                newDrawAxes(axes);
            }
/*
            function shorter(str, c) {
                var s = str + "",
                    t = s.slice(0, c);
                // make sure it's at least c long
                if (t.length < c) {
                    var diff = c - t.length;

                    // Make sure there is a decimal
                    if (t.search(/\./) == -1) {
                        t += '.';
                        diff--;
                    }

                    for (var i = 0; i < diff; i++) {
                        t = t + "0";
                    }
                }
                return t;
            }*/


            // Prevent Defaults    
            if (document.body.ontouchmove !== undefined) {
                // Emulate Mouse Down/Up
                this.bindIPhone(document.body, 'touchstart', function (page, e) {
                    e.preventDefault();
                });
                this.bindIPhone(document.body, 'touchend', function (page, e) {
                    e.preventDefault();
                });

                this.bindIPhone(document.body, 'touchmove', function (page, e) {
                    e.preventDefault();
                });
            }



            return $html;
        },
        onMessage: function (msg) {
            this.onAccelerometerMessage(msg);
        }

    });

})();