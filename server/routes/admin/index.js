const fs = require('fs')
const path = require('path')
const { dirExists, fileRename, readFile, rmFuc, writeFile } = require('../../plugins/file')
// 文件上传目录http地址
// const uploadUrl = 'http://localhost:3000/uploads/'
// 文件上传目录磁盘地址
const uploadDir = __dirname + '/../../uploads/'

module.exports = app => {

  // 引入上传中间件并定义上传地址
  const multer = require('multer')
  const toPdf = require('office-to-pdf')
  const upload = multer({ dest: uploadDir })
  const awaitWrap = (promise) => {
    return promise
      .then(data => [null, data])
      .catch(err => [err, null])
  }
  // word转pdf
  const transformPdf = async (wordBuffer, filePath) => {
    return new Promise((resolve, reject) => {
      toPdf(wordBuffer).then(
        async (pdfBuffer) => {
          if (await writeFile(filePath, pdfBuffer)) {
            resolve(true)
          } else {
            resolve(false)
          }
        }, (err) => {
          reject(err)
        }
      )
    })
  }
  const toPDF = async (req, file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(false)
      }
      fs.readFile(file.path, async (err) => {
        if (err) {
          reject(err)
        }
        const extName = path.extname(file.originalname)
        const fileName = Date.now()
        const fullName = fileName + extName
        const newPath = path.join(uploadDir + req.params.resource, fullName)
        const pdfName = fileName + '.pdf'
        const pdfDir = path.join(uploadDir + req.params.resource, pdfName)
        // const pdfUrl = uploadUrl + req.params.resource + '/' + pdfName
        // 路径不存在则创建对应路径
        let [err1] = await awaitWrap(dirExists(uploadDir + req.params.resource))
        // 移动文件
        let [err2] = await awaitWrap(fileRename(file.path, newPath))
        // 读取文件
        let [err3, wordBuffer] = await awaitWrap(readFile(newPath))
        // 转成pdf
        let [err4] = await awaitWrap(transformPdf(wordBuffer, pdfDir))
        // 删除原word文件
        let [err5] = await awaitWrap(rmFuc(newPath))
        let [err6, data] = await awaitWrap(readFile(pdfDir))
        // 删除原pdf文件
        let [err7] = await awaitWrap(rmFuc(pdfDir))
        // 报错处理
        if (err1 || err2 || err3 || err4 || err5 || err6 || err7) {
          resolve(false)
        }
        resolve(data)
      })
    })
  }
  app.post('/api/upload/:resource', upload.single('file'), async (req, res) => {
    const pdf = await toPDF(req, req.file)
    if (pdf) {
      res.send({ pdf })
    } else {
      res.send({
        type: 'fail',
        message: '出错了！'
      })
    }
  })
}