# 护岗部署应用

用于管理上午班和傍晚班人员位置的部署应用。

## 功能特点

- 支持人员名单录入
- 支持拖拽定位
- 支持图片生成和下载
- 数据存储在本地浏览器，不互通

## 部署到 GitHub Pages

### 步骤 1：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 **+** → **New repository**
3. 仓库名填写：`hugang-deploy`
4. 选择 **Public**（公开）
5. **不要**勾选 "Add a README file"
6. 点击 **Create repository**

### 步骤 2：推送代码

创建仓库后，GitHub 会显示推送命令。在终端执行：

```bash
git remote add origin https://github.com/你的用户名/hugang-deploy.git
git push -u origin main
```

### 步骤 3：启用 GitHub Pages

1. 进入仓库页面
2. 点击 **Settings** → **Pages**
3. Source 选择 **GitHub Actions**
4. 等待部署完成（约1-2分钟）

### 步骤 4：访问应用

部署完成后，访问地址：
```
https://你的用户名.github.io/hugang-deploy/
```

## 本地开发

```bash
# 启动开发服务器
pnpm run dev

# 或直接使用
npx serve -l 5000
```

## 技术栈

- HTML5 + CSS3 + JavaScript
- html2canvas（图片生成）
- serve（静态服务）
