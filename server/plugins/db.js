module.exports = () => {
  const mongoose = require('mongoose')
  const url = 'mongodb://127.0.0.1:27017/node-vue-moban'
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  mongoose.connection.on('open', () => {
    console.log('数据库连接成功')
  })
}