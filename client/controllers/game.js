angular.module('Music-Dictators').controller('gameCtrl', function ($scope, $modal, socket, $location, $auth, $window) {

    // canvas context
    var ctxBackground;
    var ctxSpecial;
    var ctxInfoBox;
    var ctxParticles;
    var ctxUnits;
    var ctxEnemies;
    var ctxImage;
    var auxCtx;

    // canvas vars
    var width = 1200;
    var height = 600;
    var height2 = 100;
    var shadowBlur = 20;
    var explosionParticles = 45;
    var mobile = false;
    var canvasReady = false;
    var songReady = false;

    // game vars
    var input;
    var interval;
    var oponentImg = new Image();
    var userImg = new Image();
    userImg.src = $scope.user.img;
    var units = {};
    var enemies = {};
    var special = null;
    var enemiesColor = '#FF0000';
    var color = '#00FF00';
    var specialColor = '#FFFF00';
    var textColor = ['#0080FF', '#00BFFF', '#2E64FE', '#0040FF'];
    var particles = [];
    var wordParticles = [];
    var specialParticles = [];
    var specialTarget;
    var player = {};
    var enemy = {};
    player.life = 100;
    player.score = 0;
    enemy.life = 100;
    enemy.score = 0;
    var myModal;
    var gameRuning = false;
    var timeLeft = 100;
    var nextWord = 7;
    var ball = {
        position: 0,
        speed: 0
    }

    $scope.word = '';


    $scope.$on('$viewContentLoaded', function (event) {
        input = document.getElementById('words');

        initCtx();

        window.onresize = function () {
            if ($location.path() === '/game') {
                resizeCanvas();
            }
        };

        $scope.words = '';

        refresh();
    });

    // canvas initialization
    var initCtx = function () {
        var canvas = document.getElementById('gameCanvas');
        canvas.height = height;
        canvas.width = width;
        ctxSpecial = canvas.getContext('2d');
        ctxSpecial.font = "20px Audiowide";
        ctxSpecial.textAlign = 'center';
        ctxSpecial.strokeStyle = specialColor;
        ctxSpecial.shadowColor = specialColor;
        ctxSpecial.fillStyle = specialColor;
        ctxSpecial.lineWidth = 1;

        canvas = document.getElementById('imgCanvas');
        canvas.height = height2;
        canvas.width = width;
        ctxImage = canvas.getContext('2d');

        canvas = document.getElementById('backgroundCanvas');
        canvas.height = height;
        canvas.width = width;
        ctxBackground = canvas.getContext('2d');
        drawScenario();

        canvas = document.getElementById('particlesCanvas');
        canvas.height = height;
        canvas.width = width;
        ctxParticles = canvas.getContext('2d');

        canvas = document.getElementById('panelCanvas');
        canvas.height = height2;
        canvas.width = width;
        ctxInfoBox = canvas.getContext('2d');
        drawInfoBox();

        canvas = document.getElementById('unitsCanvas');
        canvas.height = height;
        canvas.width = width;
        ctxUnits = canvas.getContext('2d');
        ctxUnits.strokeStyle = color;
        ctxUnits.fillStyle = "#000000";
        ctxUnits.lineWidth = 3;

        canvas = document.getElementById('enemiesCanvas');
        canvas.height = height;
        canvas.width = width;
        ctxEnemies = canvas.getContext('2d');
        ctxEnemies.strokeStyle = enemiesColor;

        ctxEnemies.lineWidth = 3;

        ctxEnemies.font = "20px Audiowide";
        ctxEnemies.textAlign = 'center';

        canvas = document.createElement("canvas");
        canvas.height = height;
        canvas.width = width;
        auxCtx = canvas.getContext('2d');
        auxCtx.font = "40px Audiowide";
        auxCtx.textAlign = 'center';

        resizeCanvas();
        canvasReady = true;
        socket.emit('loadSong', initMusic);
        //checkIfAllIsReady();
    };

    var initMusic = function (src) {
        var song = '/files/' + src;
        var audioTag = document.getElementById('audioTag');
        audioTag.src = song;
        audioTag.type = 'audio/mp3';
        audioTag.play().then(function () {
            audioTag.pause();
            socket.emit('ready');
        }).catch(function (e) {
            console.log(e);
            socket.emit('loadSong', initMusic);
        });
    };

    // canvas resize
    var resizeCanvas = function () {
        var newWidth = document.getElementById('canvasBox').clientWidth;
        document.getElementById('canvasBox').style.height = (newWidth * height / width) + 'px';
        document.getElementById('canvasInfo').style.height = (newWidth * height2 / width) + 'px';

        if (newWidth < 600) {
            mobile = true;
        } else {
            mobile = false;
        }
    };

    // canvas refresh loop
    var refresh = function () {
        input.focus();
        draw();
        interval = window.requestAnimationFrame(refresh);
    };

    $scope.$watch('words', function (newValue, oldValue) {
        refreshWord();
    });

    // send word to server
    $scope.sendWords = function () {
        socket.emit('new word', $scope.words, function (data) {
            for (var i = 0; i < wordParticles.length; i++) {
                var a = (2 * Math.PI) / 360 * Math.random() * 360;
                var particleData = wordParticles[i].getData();
                particles.push(new Particle(particleData.x, particleData.y, a, Math.random() * 5 + 1, (data.ok) ? particleData.color : "#FF0000", 2));
            }
            $scope.words = '';
            if (data.type === 's') {
                special = null;
                specialTarget = {
                    x: -50,
                    y: height / 2
                };
                specialExplosion();
            }
        });
    };

    // game over resolve
    $scope.gameOver = function () {
        gameRuning = false;
        $location.path('/profile');
    };

    // socket events
    socket.on('playSong', function () {
        var audioTag = document.getElementById('audioTag');
        audioTag.play();
    });

    socket.on('oponent data', function (oponent) {
        $scope.oponent = oponent;
        oponentImg.src = oponent.img;
        oponentImg.onload = function () {
            drawImage();
        };
    });

    socket.on('countdown', function (count) {
        ctxParticles.clearRect(0, 0, width, height);
        if (count > 0) {
            ctxParticles.fillStyle = specialColor;
            ctxParticles.font = "70px Audiowide";
            ctxParticles.textAlign = 'center';
            ctxParticles.fillText(count, width / 2, height / 2);
        } else if (count < 0) {
            gameRuning = true;
        } else {
            ctxParticles.fillStyle = specialColor;
            ctxParticles.font = "70px Audiowide";
            ctxParticles.textAlign = 'center';
            ctxParticles.fillText('Go!', width / 2, height / 2);
        }
    });

    socket.on('time left', function (t) {
        timeLeft = t;
    });

    socket.on('word time left', function (t) {
        nextWord = t;
    });

    socket.on('updateGame', function (data) {
        if (data) {
            ball = data.ball;
        }
    })

    socket.on('update units', function (data) {
        units = data.units;
        player.life = data.life;
        player.score = data.score;
    });

    socket.on('update enemies', function (data) {
        enemies = data.units;
        enemy.life = data.life;
        enemy.score = data.score;
    });

    socket.on('unit word', function (data) {
        $scope.word = data;
    });

    socket.on('unit explosion', function (pos) {
        newExplision(pos.x, pos.y, color);
    });

    socket.on('enemie explosion', function (pos) {
        newExplision(pos.x, pos.y, enemiesColor);
    });

    socket.on('special ready', function () {
        special = new Special();
    });

    socket.on('special word', function (word) {
        special.setWord(word);
    });

    socket.on('loose special', function () {
        special = null;
        specialTarget = {
            x: width + 50,
            y: height / 2
        };
        specialExplosion();
    });

    socket.on('game over', function (game) {
        gameRuning = false;
        audioTag.pause()
        myModal = $modal({
            title: 'Game Over',
            scope: $scope,
            template: 'partials/modals/modal.tpl.gameOver.html',
            show: true,
            keyboard: false,
            backdrop: 'static'
        });
        socket.removeAllListeners();
        window.cancelAnimationFrame(interval);
    });

    $scope.$on('$locationChangeStart', function (next, current) {
        socket.removeAllListeners();
        gameRuning = false;
        window.cancelAnimationFrame(interval);
        socket.emit('leave');
    });

    socket.on('loadSong', initMusic);

    // draw functions
    var draw = function () {
        if (gameRuning) {
            drawInfoBox();
            // drawSpecial();
            // drawUnits();
            // drawEnemies();
            drawParticles();
            drawBall();
        }
    };

    var drawBall = function () {
        ctxSpecial.clearRect(0, 0, width, height);
        ctxSpecial.beginPath();
        ctxSpecial.arc(width / 2 + ball.position, height / 2, 20, 0, 2 * Math.PI);
        ctxSpecial.fill();
        ctxSpecial.stroke();
    }

    var drawEnemies = function () {
        if (ctxEnemies) {
            ctxEnemies.clearRect(0, 0, width, height);
            for (var i = 0; i < enemies.length; i++) {
                ctxEnemies.fillStyle = "#000000";
                ctxEnemies.beginPath();
                ctxEnemies.arc(width - enemies[i].x, height - enemies[i].y, 10, 0, 2 * Math.PI);
                ctxEnemies.fill();
                ctxEnemies.stroke();

                ctxEnemies.fillStyle = enemiesColor;
                ctxEnemies.fillText(enemies[i].word, width - enemies[i].x, height - enemies[i].y - 20);
                meteroidParticleGenerator(enemies[i].x, height - enemies[i].y, enemiesColor, 'e');
            }
        }
    };

    var drawUnits = function () {
        if (ctxUnits) {
            ctxUnits.clearRect(0, 0, width, height);
            for (var i = 0; i < units.length; i++) {
                ctxUnits.beginPath();
                ctxUnits.arc(units[i].x, units[i].y, 10, 0, 2 * Math.PI);
                ctxUnits.fill();
                ctxUnits.stroke();
                meteroidParticleGenerator(units[i].x, units[i].y, color);
            }
        }
    };

    var drawParticles = function () {
        ctxParticles.clearRect(0, 0, width, height);
        var i = 0;
        for (i = 0; i < particles.length; i++) {
            if (particles[i].update() > Math.random() * 10 + 30) {
                particles.splice(i, 1);
                i--;
            }
        }

        for (i = 0; i < wordParticles.length; i++) {
            wordParticles[i].update();
        }

        for (i = 0; i < specialParticles.length; i++) {
            if (specialParticles[i] instanceof Particle) {
                if (specialParticles[i].update() > Math.random() * 10 + 30) {
                    var data = specialParticles[i].getData();
                    specialParticles.splice(i, 1);
                    i--;
                    specialParticles.push(new SpecialParticle(data.x, data.y, specialTarget.x, specialTarget.y, data.color));
                }
            } else {
                var x = specialParticles[i].update();
                if (x > width || x < 0) {
                    specialParticles.splice(i, 1);
                    i--;
                }
            }
        }

        if (mobile) {
            ctxParticles.fillStyle = '#0080FF';
            ctxParticles.font = "40px Audiowide";
            ctxParticles.textAlign = 'center';
            ctxParticles.fillText($scope.words, width / 2, 100);
        }
    };

    var drawSpecial = function () {
        if (ctxSpecial) {
            ctxSpecial.clearRect(0, 0, width, height);
            if (special) {
                special.update();
            }
        }
    };

    var drawImage = function () {
        ctxImage.drawImage(userImg, 320, 10, 80, 80);
        ctxImage.drawImage(oponentImg, 800, 10, 80, 80);
    };

    var drawScenario = function () {
        ctxBackground.fillStyle = "#000000";
        ctxBackground.strokeStyle = color;
        ctxBackground.shadowColor = color;
        ctxBackground.lineWidth = 3;
        ctxBackground.shadowBlur = shadowBlur;
        ctxBackground.beginPath();
        ctxBackground.arc(-Math.cos(Math.asin(height / (height * 4))) * height * 2, height / 2, height * 2, -Math.asin(height / (height * 4)), Math.asin(height / (height * 4)));
        ctxBackground.fill();
        ctxBackground.stroke();

        ctxBackground.strokeStyle = enemiesColor;
        ctxBackground.shadowColor = enemiesColor;
        ctxBackground.beginPath();
        ctxBackground.arc(width + Math.cos(Math.asin(height / (height * 4))) * height * 2, height / 2, height * 2, -Math.asin(height / (height * 4)) + Math.PI, Math.asin(height / (height * 4)) + Math.PI);
        ctxBackground.fill();
        ctxBackground.stroke();

        ctxBackground.strokeStyle = specialColor;
        ctxBackground.shadowColor = specialColor;
        ctxBackground.beginPath();
        ctxBackground.arc(width / 2, height + 690, 700, 3 * Math.PI / 2 - Math.atan(100 / 550), 3 * Math.PI / 2 + Math.atan(100 / 550));
        ctxBackground.fill();
        ctxBackground.stroke();

        ctxBackground.lineWidth = 0.1;
        ctxBackground.beginPath();
        ctxBackground.moveTo(width / 2, height - 10);
        ctxBackground.lineTo(width / 2, 0);
        ctxBackground.stroke();
    };

    var drawInfoBox = function () {

        if (ctxInfoBox) {
            ctxInfoBox.clearRect(0, 0, width, height2);

            ctxInfoBox.font = "40px Audiowide";
            ctxInfoBox.textAlign = 'center';
            ctxInfoBox.fillStyle = "#FFFFFF";
            ctxInfoBox.fillText($scope.word, width / 2, 70);
            ctxInfoBox.font = "20px Audiowide";
            if (timeLeft < 10) {
                ctxInfoBox.fillStyle = "#FF0000";
            } else {
                ctxInfoBox.fillStyle = "#FFFFFF";
            }
            ctxInfoBox.fillText(timeLeft, width / 2, 30);
            if (nextWord < 4) {
                ctxInfoBox.fillStyle = "#FF0000";
            } else {
                ctxInfoBox.fillStyle = "#FFFFFF";
            }
            ctxInfoBox.font = "10px Audiowide";
            ctxInfoBox.fillText(nextWord, width / 2, 90);

            ctxInfoBox.font = "30px Audiowide";
            ctxInfoBox.textAlign = 'left';
            ctxInfoBox.fillStyle = color;
            ctxInfoBox.strokeStyle = color;
            ctxInfoBox.fillText(player.score, 20, 80);
            ctxInfoBox.strokeRect(20, 20, 200, 15);
            ctxInfoBox.fillRect(20, 20, player.life * 2, 15);

            ctxInfoBox.fillStyle = enemiesColor;
            ctxInfoBox.strokeStyle = enemiesColor;
            ctxInfoBox.textAlign = 'right';
            ctxInfoBox.fillText(enemy.score, width - 20, 80);
            ctxInfoBox.strokeRect(width - 220, 20, 200, 15);
            ctxInfoBox.fillRect(width - 220 + (100 - enemy.life) * 2, 20, enemy.life * 2, 15);
        }

    };

    // refresh word particles
    var refreshWord = function () {
        if (auxCtx && !mobile) {
            auxCtx.fillStyle = '#FFFFFF';
            auxCtx.fillRect(0, 0, width, height);
            auxCtx.fillStyle = '#000000';
            auxCtx.fillText($scope.words, width / 2, 100);
            var image_data = auxCtx.getImageData(0, 0, width, height);
            var pixels = image_data.data;
            var positions = [];
            var i = 0;
            for (i = 0; i < width; i += 2) {
                for (var j = 0; j < height; j += 2) {
                    if (pixels[i * 4 + j * width * 4] !== 255) {
                        positions.push({
                            x: i,
                            y: j
                        });
                    }
                }
            }

            if (positions.length < wordParticles.length) {
                wordParticles.splice(positions.length, wordParticles.length);
            }
            for (i = 0; i < positions.length; i++) {
                if (i < wordParticles.length) {
                    wordParticles[i].setTarget(positions[i].x, positions[i].y);
                } else {
                    var a = Math.random() * Math.PI * 2;
                    wordParticles.push(new WordParticle(width / 2, 100, positions[i].x, positions[i].y, textColor[Math.floor(Math.random() * textColor.length)]));
                }
            }
        }
    };

    // particles generator
    var meteroidParticleGenerator = function (x, y, c, type) {
        var px;
        var a;
        if (type === 'e') {
            a = (Math.random() * (Math.PI / 2) - (Math.PI / 4));
            px = Math.cos(a) * 10 + width - x;
        } else {
            a = (Math.random() * (Math.PI / 2) - (Math.PI / 4)) + Math.PI;
            px = Math.cos(a) * 10 + x;
        }
        var py = Math.sin(a) * 10 + y;
        particles.push(new Particle(px, py, a, 1, c, 1));
    };

    // explosion generator
    var newExplision = function (x, y, c) {
        for (var i = 0; i < explosionParticles; i++) {
            var a = (2 * Math.PI) / explosionParticles * i;
            var px = Math.cos(a) * 10 + x;
            var py = Math.sin(a) * 10 + y;
            particles.push(new Particle(px, py, a, Math.random() * 5 + 1, c, 2));
        }
    };

    // special explosion generator
    var specialExplosion = function () {
        for (var i = 0; i < 90; i++) {
            var a = (2 * Math.PI) / explosionParticles * i;
            var px = Math.cos(a) * 10 + width / 2;
            var py = Math.sin(a) * 10 + height / 2;
            specialParticles.push(new Particle(px, py, a, Math.random() * 5 + 1, specialColor, 2));
        }
    };

    // special object manager
    function Special() {
        var x = width / 2;
        var y = height - 10;
        var rad = 0;
        var word = null;
        var increase = true;
        var ready = false;
        var readySent = false;

        this.setWord = function (w) {
            word = w;
        };

        this.update = function () {
            if (rad > 3 && y > height / 2) {
                y--;
            } else if (rad < 4) {
                rad += 0.05;
            } else if (y <= height / 2 && increase) {
                rad += 0.05;
            } else if (y <= height / 2 && !increase) {
                rad -= 0.05;
            }

            if (rad >= 15) {
                increase = false;
                ready = true;
            } else if (rad <= 14) {
                increase = true;
            }

            if (ready && !readySent) {
                readySent = true;
                socket.emit('special ready');
            }
            draw();
        };

        var draw = function () {
            ctxSpecial.beginPath();
            ctxSpecial.arc(x, y, rad, 0, 2 * Math.PI);
            ctxSpecial.fill();
            ctxSpecial.stroke();
            if (rad > 3 && rad < 5) {
                ctxSpecial.beginPath();
                ctxSpecial.moveTo(x, y - rad - 2);
                ctxSpecial.lineTo(x, y + rad + 2);
                ctxSpecial.stroke();

            }
            if (word) {
                ctxSpecial.fillText(word, x, y - 30);
            }
        };
    }

    // particles objects
    function Particle(x, y, a, s, c, sz) {
        var px = x;
        var py = y;
        var angle = a;
        var speed = s;
        var color = c;
        var alfa = 0;
        var size = sz;

        this.getData = function () {
            return {
                color: color,
                x: px,
                y: py
            };
        };

        this.update = function () {
            move();
            draw();
            alfa++;
            return alfa;
        };

        var move = function () {
            px += Math.cos(angle) * speed;
            py += Math.sin(angle) * speed;
        };

        var draw = function () {
            ctxParticles.fillStyle = color;
            ctxParticles.fillRect(px, py, size, size);
        };
    }

    function WordParticle(x, y, tx, ty, c) {
        var px = x;
        var py = y;
        var targetX = tx;
        var targetY = ty;
        var angle;
        var speed;
        var color = c;

        this.setTarget = function (x, y) {
            targetX = x;
            targetY = y;
        };

        this.getData = function () {
            return {
                color: color,
                x: px,
                y: py
            };
        };

        this.update = function () {
            if ((px < targetX - 1 || px > targetX + 1) && (py < targetY - 1 || py > targetY + 1)) {
                var mod = Math.sqrt(Math.pow(targetX - px, 2) + Math.pow(targetY - py, 2));
                var x = targetX - px;
                var y = targetY - py;
                angle = Math.acos(x / mod);
                if (y < 0) {
                    angle = -angle;
                }
                speed = mod / 2;
                if (speed < 1) {
                    speed = 1;
                }
                move();
            } else {
                px = targetX;
                py = targetY;
                speed = 0;
            }
            draw();
        };

        var move = function () {
            px += Math.cos(angle) * speed;
            py += Math.sin(angle) * speed;
        };

        var draw = function () {
            ctxParticles.fillStyle = color;
            ctxParticles.fillRect(px, py, 2, 2);
        };
    }

    function SpecialParticle(x, y, tx, ty, c) {
        var px = x;
        var py = y;
        var targetX = tx;
        var targetY = ty;
        var angle;
        var speed = 15;
        var color = c;

        this.update = function () {
            var mod = Math.sqrt(Math.pow(targetX - px, 2) + Math.pow(targetY - py, 2));
            var x = targetX - px;
            var y = targetY - py;
            angle = Math.acos(x / mod);
            if (y < 0) {
                angle = -angle;
            }
            move();
            draw();
            return px;
        };

        var move = function () {
            px += Math.cos(angle) * speed;
            py += Math.sin(angle) * speed;
        };

        var draw = function () {
            ctxParticles.fillStyle = color;
            ctxParticles.fillRect(px, py, 2, 2);
        };
    }

    var myRequestAnimationFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    window.requestAnimationFrame = myRequestAnimationFrame;

});
