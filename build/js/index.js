/* global jQuery:false*, requestAnimationFrame:false, THREE:false */
/**
 * @fileOverview egg
 *
 * @author y-minami
 * @version 1.1
 * @require jQuery
 */
(function (_window, _document, $, egg, _undefined) {
    "use strict";


    var Index = function Index() {

        var that = this;
        var index = 0;
        var easing = 'easeInOutQuart';

        this.init = function () {

            var $next = $('#next');

            $('.center').hide();
            $('.text').hide();
            $('.text:nth(0)').show();

            $('html').keyup(function (event) {
                if (event.which == 39) {
                    that.next();
                }
            });

            $next.hover(function(){
                $next.css('background', 'rgba(255,255,255,.8)');
                $next.find('line').attr('stroke', '#000000');
            },function(){

                $next.css('background', 'none');
                $next.find('line').attr('stroke', '#FFFFFF');
            }).on('click', this.next);
        };

        this.next = function () {

            if (index == 1) {
                setTimeout(egg.drawEggPoint, 1000);
            }
            if (index == 3) {
                setTimeout(egg.spinCurve, 1000);
            }
            if (index == 5) {
                setTimeout(egg.addEggPoints, 1000);
            }
            if (index == 7) {
                egg.fallOutPoints();
            }
            if (index == 8) {
                setTimeout(egg.animateEggWire, 1000);
            }
            if (index == 9) {
                setTimeout(egg.offWireframe, 1000);
            }
            if (index == 11) {
                setTimeout(egg.applyMap, 1500);
            }
            if (index == 12) {
                setTimeout(egg.appearGround, 1500);
            }
            if (index == 13) {
                setTimeout(egg.move, 1500);
            }
            if (index == 14) {
                setTimeout(egg.jump, 1500);
            }
            if (index == 15) {
                setTimeout(egg.startDancing, 1500);
            }
            if (index == 16) {
                setTimeout(egg.stopDancing, 1500);
            }
            if (index == 20) {

                $('#next').hide();
                $('.text').css('color', 'white');

                egg.startAutoPan();
                egg.explode();

                setTimeout(function () {
                    $('.center').css('left', '150%').show().animate({'left':'50%'}, 500, easing);
                    $('nav').animate({'marginTop':'-500px'}, 500, easing);
                }, 8000);
            } else {
                $('#next').hide();
                setTimeout(function () {
                    $('#next').show();
                }, 1000);
            }
            $('.text:nth(' + index + ')').animate({'left': '-=2000px'}, 500, easing, function () {
                
                if (index == 13) {
                    $('.text').css('color', 'black');
                }
                $('.text:nth(' + index + ')').hide();
                index++;
                $('.text:nth(' + index + ')').show().css('left', '2000px').animate({'left': '0px'}, 500, easing);
            });
        };
    };

    if (typeof _window.jp === 'undefined') {
        _window.jp = {};
    }

    if (typeof _window.jp.mi73 === 'undefined') {
        _window.jp.mi73 = {};
    }

    _window.jp.mi73.index = new Index();

})(window, document, jQuery, window.jp.mi73.egg);