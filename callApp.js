(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        root.CallApp = factory();
    }
}(window, function () {
    // 检测浏览器
    const UA = navigator.userAgent;
    const IOS_UA_ARR = (navigator.userAgent).match(/OS (\d+)_(\d+)_?(\d+)?/);
    const ANDROID_UA_ARR = (navigator.userAgent).match(/Android (\d+)\.(\d+)?/i);
    const browser = {
        isAndroid: !!UA.match(/android/ig),
        isAndroidGte6: ANDROID_UA_ARR && parseInt(ANDROID_UA_ARR[1], 10) > 5 ? true : false, // 安卓版本大于等于6
        isIos: !!UA.match(/iphone|ipod/ig),
        isIosGte9: IOS_UA_ARR && parseInt(IOS_UA_ARR[1], 10) > 8 ? true : false, // IOS版本是否大于等于9
        isWeixin: !!UA.match(/MicroMessenger/ig),
        isChrome: !!UA.match(/chrome\/(\d+\.\d+)/ig)
    }

    // 基础配置
    const BASE_CONFIG = {
        scheme: '', // 应该必填，考虑低版本IOS和安卓
        androidScheme: null, // 安卓用Scheme，以防万一安卓与IOS定义的不一致的时候可用，:D
        iosScheme: null, // IOS 用scheme
        params: null, // 参数，url里的查询字符串
        applink: null, //安卓
        universalLink: null, // IOS
        // androidIntent: null, // Android Intent 方式唤起，尽量不用，该方式能用，scheme方式都能用
        timeout: 1600, // 超时时间
        autoCall: false, // 是否自动唤起
        success: function () {},
        error: function () {}
    }
    class CallApp {
        constructor(config = {}) {
            // 考虑改用深拷贝？
            this._config = Object.assign(BASE_CONFIG, config);

            // scheme
            let scheme = ''
            if (typeof config === 'string') {
                this._url = config
            } else if (config.androidScheme && browser.isAndroid) {
                this._url = config.androidScheme
            } else if (config.iosScheme && browser.isIos) {
                this._url = config.iosScheme
            } else {
                this._url = config.scheme
            }

            // 如果采用deep link
            // 安卓针对6.0+
            // IOS针对9.0+
            if (browser.isAndroid && browser.isAndroidGte6 && this._config.applink) {
                this._url = this._config.applink
            } else if (browser.isIos && browser.isIosGte9 && this._config.universalLink) {
                this._url = this._config.universalLink
            }
            // 如果有查询参数
            if (this._config.params) {
                this._url += '?' + this._buildQueryString(this._config.params);
            }

            // 如果需要自动唤起
            if (this._config.autoCall) {
                this.call()
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
        _checkApp(cb) {
            const timeout = this._config.timeout;
            const totalCount = Math.ceil(timeout / 20);
            const acceptTime = timeout + 800;

            const _callTime = +new Date(); // 开始调用时间
            let _count = 0, // 计数，20ms记一次
                timer = null; //定时器
            timer = setInterval(function () {
                _count++;
                const elsTime = +(new Date()) - _callTime
                if (_count >= totalCount || elsTime > acceptTime) {
                    clearInterval(timer);
                    if (elsTime > acceptTime || document.hidden || document.webkitHidden) {
                        cb && cb(true);
                    } else {
                        cb && cb(false);
                    }
                }
            }, 20)
        }

        // 唤起app
        call(cb) {
            const successfn = this._config.success
            const errorfn = this._config.error
            // 检测唤起状态
            this._checkApp(flag => {
                cb && cb(flag);
                if (flag) {
                    successfn && successfn();
                } else {
                    errorfn && errorfn();
                }
            })

            // 根据不同的浏览器来使用不同的唤起方式
            if (browser.isAndroid) {
                if (browser.isChrome) {
                    this._callAlink();
                    return;
                }
                this._callIframe();
                return;
            } else if (browser.isIos) {
                this._callAlink()
            }
        }

        // a.href方式
        _callAlink() {
            const alink = document.createElement('a');
            alink.href = this._url;
            alink.click();
        }

        // iframe.src 方式
        _callIframe() {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = this._url;
            document.body.appendChild(iframe);
        }

        // location 方式
        _callLocation() {
            location.href = this._url;
        }

        // Android intent方式，仅限Android，暂时未启用
        // 一般可以用Android intent 方式唤起的都可以用scheme方式唤起
        _callIntent() {
            const androidIndent = this._config.androidIntent
            const indentURL = `intent://
        ${androidIndent.host}
        ${androidIndent.path}
        #Intent;
            scheme=${androidIndent.scheme};
            package=${androidIndent.package};
            ${androidIndent.action && 'action=' + androidIndent.action + ';'}
            ${androidIndent.category && 'category=' + androidIndent.category + ';'}
            ${androidIndent.component && 'component=' + androidIndent.component + ';'}
            ${androidIndent.browser_fallback_url && 'S.browser_fallback_url=' + androidIndent.browser_fallback_url + ';'}
        end`;
            location.href = indentURL
        }

        // 构建查询字符串
        _buildQueryString(obj = {}) {
            const keys = Object.keys(obj);
            let queryArr = keys.map(k => {
                let v = obj[k];
                if (!Array.isArray(v) && typeof v === 'object') {
                    v = JSON.stringify(v);
                }
                return k + '=' + v;
            })
            return queryArr.join('&');
        }

    }
    return CallApp
}))