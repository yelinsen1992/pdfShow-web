const fs = require('fs')
const path = require('path')

// 创建文件
const writeFile = async (pathName, data) => {
  return new Promise((resolve) => {
    fs.writeFile(pathName, data, err => {
      if (err) { resolve(false) }
      resolve(true)
    })
  })
}
// 读取文件
const readFile = async (pathName) => {
  return new Promise((resolve) => {
    fs.readFile(pathName, (err, data)=> {
      if (err) { resolve(false) }
      resolve(data)
    })
  })
}
// 创建路径
const mkdir = (dir) => {
  return new Promise((resolve) => {
    fs.mkdir(dir, err => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}
// 彻底删除文件或文件夹
const rmFuc = async (pathName) => {
  const flag = await getStat(pathName)
  return new Promise((resolve) => {
    if (!flag) {
      resolve(false)
    }
    if (flag.isFile()) {
      fs.unlink(pathName, (err) => {
        err ? resolve(false) : resolve(true)
      })
    } else if (flag.isDirectory()) {
      fs.rmdir(pathName, { recursive: true }, (err) => {
        err ? resolve(false) : resolve(true)
      })
    }
  })
}
// 读取路径信息
const getStat = (path) => {
  return new Promise((resolve) => {
    fs.stat(path, (err, stats) => {
      if (err) { resolve(false) }
      resolve(stats)
    })
  })
}
// 路径是否存在，不存在则创建
const dirExists = async (dir) => {
  const isExists = await getStat(dir)
  // 如果该路径存在且不是文件，返回true
  if (isExists && isExists.isDirectory()) {
    return true
  } else if (isExists) { // 如果该路径存在但是文件，返回false
    return false
  }
  // 如果该路径不存在
  const tempDir = path.parse(dir).dir // 拿到上级路径
  // 递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
  const status = await dirExists(tempDir)
  let mkdirStatus
  if (status) {
    mkdirStatus = await mkdir(dir)
  }
  return mkdirStatus
}
// 剪切文件
const fileRename = async (oldPath, newPath) => {
  return new Promise((resolve) => {
    fs.rename(oldPath, newPath, err => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports = { getStat, rmFuc, dirExists, writeFile, fileRename, readFile }