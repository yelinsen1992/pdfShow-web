# toJPG
word文档转pdf，前端canvas显示，并自定义盖章功能，本地缓存最近10个印章列表

linux服务器程序（server文件夹）
安装libreoffice:
1、官网下载3个软件包
LibreOffice_7.2.2_Linux_x86-64_rpm.tar.gz
LibreOffice_7.2.2_Linux_x86-64_rpm_langpack_zh-CN.tar.gz
LibreOffice_7.2.2_Linux_x86-64_rpm_sdk.tar.gz
2、tar -xvf + 包名解压
tar -xvf LibreOffice_7.2.2_Linux_x86-64_rpm.tar.gz
tar -xvf LibreOffice_7.2.2_Linux_x86-64_rpm_langpack_zh-CN.tar.gz
tar -xvf LibreOffice_7.2.2_Linux_x86-64_rpm_sdk.tar.gz
3、进入到文件目录RPMS安装所有
yum install *.rmp
4、/etc/profile 目录修改启动脚本
最后加2行，注意安装的版本目录对上
export LibreOffice_PATH=/opt/libreoffice7.2/program
export PATH=$LibreOffice_PATH:$PATH
5、如果没安装java要安装java
yum install java
6、如果转成的pdf中文显示乱码，把电脑的FONTS文件夹拷贝到/etc/fonts目录

项目用pm2管理启动服务

web静态页面（web文件夹）
本地打开index.html直接使用，pdf转换接口返回为pdf的二进制数据
