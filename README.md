# callApp
浏览器唤起APP的实现

效果如图：

<img src="./images/call.gif" width = "360"  alt="唤起App" align=center />

## Example
```html
<a href="javascript:;" id="callLInk">点我唤起APP</a>
<script src='./callApp.js'></script>
<script>
    var app = new CallApp({
        scheme: 'jdly://ztktct/details',
        timeout: 2000,
        autoCall: true,
        params: {
            id: 31552
        }
    })
    document.getElementById('callLInk').onclick = function () {
        app.call(function (flag) {
            if (flag) {
                // 成功
            } else {
                // 失败
            }
        })
    }
</script>
```

## API
### 配置API：
1. `scheme`: 约定好的`Scheme`协议，考虑低版本IOS和安卓，此项应该必填
2. `androidScheme`: 安卓用Scheme，以防万一安卓与IOS定义的不一致的时候可用，与1互斥，:D
3. `iosScheme`: IOS 用scheme，以防万一安卓与IOS定义的不一致的时候可用，与1互斥，:D
4. `params`: 参数，url里的查询字符串，?xx=xx&yy=zz
5. `applink`: 安卓app link,如果设置了，那么安卓6.0以上会采用，6.0以下依旧采用scheme
6. `universalLink`: IOS universal link，如果设置了，那么IOS9.0以上会采用，9.0以下依旧采用scheme
7. ~~`androidIntent`: 未启用， Android Intent 方式唤起，尽量不用，该方式能用，一般scheme方式都能用~~
8. `timeout`: 自定义超时时间，默认1600ms
9. `autoCall`: 是否自动唤起, 默认false
10. `success`: function, 唤起成功回调
11. `error`: function，唤起失败回调

### 方法
1. call: 手动唤起app,该方法可接受一个回调函数

## 用法
1. 普通用法
```javascript
var app = new CallApp('jdly://ztktct/details')
```
2. 自定义配置
```javascript
var app = new CallApp({
    scheme: 'jdly://ztktct/details',
    timeout: 2000,
    autoCall: true, // 自动唤起
    params: {
        id: 31552
    }
})
```
3. 手动唤起
```javascript
var app = new CallApp({
    scheme: 'jdly://ztktct/details',
    timeout: 2000,
    autoCall: true,
    params: {
        id: 31552
    }
})
document.getElementById('callLInk').onclick = function () {
    app.call(function (flag) {
        if (flag) {
            // 成功
        } else {
            // 失败
        }
    })
}
```