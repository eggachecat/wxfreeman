
var LIB_PATH = `${__dirname}/libs`
var ASSETS_PATH = `${__dirname}/assets`

module.exports = {
    "host": {
        "wx": "wx.qq.com",
        "login": "login.weixin.qq.com",
        "file": "file.wx.qq.com",
        "webpush": "webpush.weixin.qq.com"
    },
    "protocol": "https:",
    "lang": "zh_CN",
    "files": {
    	"wxConfig": `${ASSETS_PATH}/wxConfig.json`,
        "headers":  `${ASSETS_PATH}/wxHeaders.json`
    }
}