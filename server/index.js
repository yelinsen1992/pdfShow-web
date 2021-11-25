const express = require('express')
const app = express()
const port = 3000

// 引入跨域模块和json中间块
app.use(require('cors')())
app.use(express.json())
// 静态资源托管
app.use('/uploads', express.static(__dirname + '/uploads'))

// 引入数据库和路由
// require('./plugins/db')(app)
require('./routes/admin')(app)

app.listen(port, () => console.log(`http://localhost:${port}`))