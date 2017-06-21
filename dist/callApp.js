'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        root.CallApp = factory();
    }
})(window, function () {
    // 检测浏览器
    var UA = navigator.userAgent;
    var IOS_UA_ARR = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    var ANDROID_UA_ARR = navigator.userAgent.match(/Android (\d+)\.(\d+)?/i);
    var browser = {
        isAndroid: !!UA.match(/android/ig),
        isAndroidGte6: ANDROID_UA_ARR && parseInt(ANDROID_UA_ARR[1], 10) > 5 ? true : false, // 安卓版本大于等于6
        isIos: !!UA.match(/iphone|ipod/ig),
        isIosGte9: IOS_UA_ARR && parseInt(IOS_UA_ARR[1], 10) > 8 ? true : false, // IOS版本是否大于等于9
        isWeixin: !!UA.match(/MicroMessenger/ig),
        isChrome: !!UA.match(/chrome\/(\d+\.\d+)/ig)

        // 基础配置
    };var BASE_CONFIG = {
        scheme: '', // 应该必填，考虑低版本IOS和安卓
        androidScheme: null, // 安卓用Scheme，以防万一安卓与IOS定义的不一致的时候可用，:D
        iosScheme: null, // IOS 用scheme
        params: null, // 参数，url里的查询字符串
        applink: null, //安卓
        universalLink: null, // IOS
        // androidIntent: null, // Android Intent 方式唤起，尽量不用，该方式能用，scheme方式都能用
        timeout: 1600, // 超时时间
        autoCall: false, // 是否自动唤起
        success: function success() {},
        error: function error() {}
    };

    var CallApp = function () {
        function CallApp() {
            var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, CallApp);

            this._config = _extends({}, BASE_CONFIG, config);

            // scheme
            var scheme = '';
            if (typeof config === 'string') {
                this._url = config;
            } else if (config.androidScheme && browser.isAndroid) {
                this._url = config.androidScheme;
            } else if (config.iosScheme && browser.isIos) {
                this._url = config.iosScheme;
            } else {
                this._url = config.scheme;
            }

            // 如果采用deep link
            // 安卓针对6.0+
            // IOS针对9.0+
            if (browser.isAndroid && browser.isAndroidGte6 && this._config.applink) {
                this._url = this._config.applink;
            } else if (browser.isIos && browser.isIosGte9 && this._config.universalLink) {
                this._url = this._config.universalLink;
            }
            // 如果有查询参数
            if (this._config.params) {
                this._url += '?' + this._buildQueryString(this._config.params);
            }

            // 如果需要自动唤起
            if (this._config.autoCall) {
                this.call();
            }
        }

        /**检测是否唤起成功
         * 基于时间差来判断是否唤起成功，不太准确
         * 假定超时时间设为1600ms，判断基准为800ms
         * 如果没有唤起成功，停留在当前页，则当计数完毕后，时间差应该不会超过太多
         * 相反，如果唤起成功，则浏览器进入后台工作，setInterval会被延迟执行，时间差会被拉大,
         * 一些国产浏览器或者safari会在唤起的时候弹窗，导致此方法无效，考虑以下解决方案：
         * 1、对于Android国产浏览器，如果因为弹窗超时，则判定为失败，自动跳转下载页，但是由于弹窗还存在，如果用户点击唤起，依然可以唤起APP
         * 2、对于IOS,IOS7、8依旧采用scheme,IOS9+可以考虑使用universalLink！！
         */


        _createClass(CallApp, [{
            key: '_checkApp',
            value: function _checkApp(cb) {
                var timeout = this._config.timeout;
                var totalCount = Math.ceil(timeout / 20);
                var acceptTime = timeout + 800;

                var _callTime = +new Date(); // 开始调用时间
                var _count = 0,
                    // 计数，20ms记一次
                timer = null; //定时器
                timer = setInterval(function () {
                    _count++;
                    var elsTime = +new Date() - _callTime;
                    if (_count >= totalCount || elsTime > acceptTime) {
                        clearInterval(timer);
                        if (elsTime > acceptTime || document.hidden || document.webkitHidden) {
                            cb && cb(true);
                        } else {
                            cb && cb(false);
                        }
                    }
                }, 20);
            }

            // 唤起app

        }, {
            key: 'call',
            value: function call(cb) {
                var successfn = this._config.success;
                var errorfn = this._config.error;
                // 检测唤起状态
                this._checkApp(function (flag) {
                    cb && cb(flag);
                    if (flag) {
                        successfn && successfn();
                    } else {
                        errorfn && errorfn();
                    }
                }

                // 根据不同的浏览器来使用不同的唤起方式
                );if (browser.isAndroid) {
                    if (browser.isChrome) {
                        this._callAlink();
                        return;
                    }
                    this._callIframe();
                    return;
                } else if (browser.isIos) {
                    this._callAlink();
                }
            }

            // a.href方式

        }, {
            key: '_callAlink',
            value: function _callAlink() {
                var alink = document.createElement('a');
                alink.href = this._url;
                alink.click();
            }

            // iframe.src 方式

        }, {
            key: '_callIframe',
            value: function _callIframe() {
                var iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = this._url;
                document.body.appendChild(iframe);
            }

            // location 方式

        }, {
            key: '_callLocation',
            value: function _callLocation() {
                location.href = this._url;
            }

            // Android intent方式，仅限Android，暂时未启用
            // 一般可以用Android intent 方式唤起的都可以用scheme方式唤起

        }, {
            key: '_callIntent',
            value: function _callIntent() {
                var androidIndent = this._config.androidIntent;
                var indentURL = 'intent://\n        ' + androidIndent.host + '\n        ' + androidIndent.path + '\n        #Intent;\n            scheme=' + androidIndent.scheme + ';\n            package=' + androidIndent.package + ';\n            ' + (androidIndent.action && 'action=' + androidIndent.action + ';') + '\n            ' + (androidIndent.category && 'category=' + androidIndent.category + ';') + '\n            ' + (androidIndent.component && 'component=' + androidIndent.component + ';') + '\n            ' + (androidIndent.browser_fallback_url && 'S.browser_fallback_url=' + androidIndent.browser_fallback_url + ';') + '\n        end';
                location.href = indentURL;
            }

            // 构建查询字符串

        }, {
            key: '_buildQueryString',
            value: function _buildQueryString() {
                var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                var keys = Object.keys(obj);
                var queryArr = keys.map(function (k) {
                    var v = obj[k];
                    if (!Array.isArray(v) && (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object') {
                        v = JSON.stringify(v);
                    }
                    return k + '=' + v;
                });
                return queryArr.join('&');
            }
        }]);

        return CallApp;
    }();

    return CallApp;
});