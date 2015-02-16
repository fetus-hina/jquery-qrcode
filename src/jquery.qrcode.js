(function( $ ){
    $.fn.qrcode = function(options) {
        // if options is string, 
        if( typeof options === 'string' ){
            options = { text: options };
        }

        // set default values
        // typeNumber < 1 for automatic calculation
        options = $.extend( {}, {
            render          : "canvas",
            width           : 256,
            height          : 256,
            typeNumber      : -1,
            correctLevel    : QRErrorCorrectLevel.H,
            background      : "#ffffff",
            foreground      : "#000000"
        }, options);

        var normalizeErrorCorrectLevel = function(correctLevel) {
            switch((correctLevel + "").toUpperCase()) {
                case "L":
                case QRErrorCorrectLevel.L + "":
                    return QRErrorCorrectLevel.L;

                case "M":
                case QRErrorCorrectLevel.M + "":
                    return QRErrorCorrectLevel.M;

                case "Q":
                case QRErrorCorrectLevel.Q + "":
                    return QRErrorCorrectLevel.Q;

                case "H":
                case QRErrorCorrectLevel.H + "":
                    return QRErrorCorrectLevel.H;

                default:
                    throw new Error("Invalid correct level " + correctLevel);
            }
        };

        var createCanvas = function(qrcode){
            // create canvas element
            var canvas = document.createElement('canvas');
            canvas.width = options.width;
            canvas.height = options.height;
            var ctx = canvas.getContext('2d');

            // compute tileW/tileH based on options.width/options.height
            var tileW = options.width  / qrcode.getModuleCount();
            var tileH = options.height / qrcode.getModuleCount();

            // draw in the canvas
            for( var row = 0; row < qrcode.getModuleCount(); row++ ){
                for( var col = 0; col < qrcode.getModuleCount(); col++ ){
                    ctx.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
                    var w = (Math.ceil((col+1)*tileW) - Math.floor(col*tileW));
                    var h = (Math.ceil((row+1)*tileW) - Math.floor(row*tileW));
                    ctx.fillRect(Math.round(col*tileW),Math.round(row*tileH), w, h);  
                }
            }
            // return just built canvas
            return canvas;
        };

        // from Jon-Carlos Rivera (https://github.com/imbcmdth)
        var createTable = function(qrcode){
            // create table element
            var $table = $('<table></table>')
                .css("width", options.width+"px")
                .css("height", options.height+"px")
                .css("border", "0px")
                .css("border-collapse", "collapse")
                .css('background-color', options.background)
                .css('table-layout', 'fixed');

            // compute tileS percentage
            var tileW = options.width / qrcode.getModuleCount();
            var tileH = options.height / qrcode.getModuleCount();
            var w = [];
            for(var col = 0; col < qrcode.getModuleCount(); col++ ){
                w.push(Math.round(tileW * (col + 1)) - Math.round(tileW * col));
            }

            // draw in the table
            for(var row = 0; row < qrcode.getModuleCount(); row++ ){
                var h = Math.round(tileH * (row + 1)) - Math.round(tileH * row);
                var $row = $('<tr></tr>').css('height', h+"px").appendTo($table);

                for(var col = 0; col < qrcode.getModuleCount(); col++ ){
                    $('<td></td>')
                        .css('width', w[col]+"px")
                        .css('background-color', qrcode.isDark(row, col) ? options.foreground : options.background)
                        .appendTo($row);
                }
            }
            // return just built canvas
            return $table;
        };

        var createDivs = function(qrcode){
            // create container div element
            var $container    = $('<div></div>')
                .css("display", "block")
                .css("float", "none")
                .css("width", options.width+"px")
                .css("height", options.height+"px")
                .css("border", "0px")
                .css('background-color', options.background)
                .css('position', 'relative');

            // compute tileS percentage
            var modCount = qrcode.getModuleCount();
            var tileW    = options.width / modCount;
            var tileH    = options.height / modCount;
            var w = [];
            for(var col = 0; col < modCount; col++ ){
                w.push(Math.round(tileW * (col + 1)) - Math.round(tileW * col));
            }

            // draw within the container div
            var first = true;
            var topOffset = 0;
            for(var row = 0; row < modCount; row++ ){
                var firstCol = true;
                var h = Math.round(tileH * (row + 1)) - Math.round(tileH * row);
                var leftOffset = 0;
                for(var col = 0; col < modCount; col++ ){
                    var $el = $('<div></div>')
                        .css("display", "block")
                        .css("float", "none")
                        .css('position', 'absolute')
                        .css('height', h+"px")
                        .css('width', w[col]+"px")
                        .css('top', topOffset+"px")
                        .css('left', leftOffset+"px")
                        .css('background-color', qrcode.isDark(row, col) ? options.foreground : options.background)
                        .appendTo($container);
                    first = false;
                    firstCol = false;
                    leftOffset += w[col];
                }
                topOffset += h;
            }
            // return just built div
            return $container
        }

        return this.each(function(){
            // create the qrcode itself
            var qrcode = new QRCode(options.typeNumber, normalizeErrorCorrectLevel(options.correctLevel));
            qrcode.addData(options.text);
            qrcode.make();

            switch(options.render) {
                case "canvas":
                    var element = createCanvas(qrcode);
                    break;
                case "divs":
                    var element = createDivs(qrcode);
                    break;
                default:
                    var element = createTable(qrcode);
                    break;
            }
            $(element).appendTo(this);
        });
    };
})( jQuery );
