# tp5基础框架vue版本

#### pc 端采用`elementui`
#### m 端采用`vantui`
## 一、环境配置(Set up Enviroment)
请先熟悉 [git 命令行工具](https://github.com/felix-cao/Blog/issues/8)

### 1.1、配置 SSH KEY

#### 1.1.1、在本机生成 ssh key
在你本机上执行以下命令
```
$ ssh-keygen  -t  rsa -C "xxx@qq.com"
```
三次回车后，会在你的本机家目录下生成 `.ssh` 文件夹

```
$ cd ~/.ssh
$ cat id_rsa.pub
```

#### 1.1.2、到 gitlab 中设置 ssh key 

复制 `id_rsa.pub`, 打开 https://gitee.com/profile/sshkeys， 粘贴到共钥输入框后点击 `确定` 按钮


### 1.2、 克隆仓库到本地(Clone the repo)
* Run `git clone <mainline-url>`
```bash
git clone https://gitee.com/mgtx1/enterprise_car_dispatching.git
```
建议您先配置一下 `author name` 和 `email`
```bash
git config --global user.name "xxx"
git config --global user.email xxx@qq.com
```
### 1.3、 本地开发环境搭建
--- To be continued !

## 二、参与开发(Contribute your code)
### 2.1、关于分支
在 我们的远程 `git` 仓库中，会存在三个个分支：

- master, 用于自动化部署到产线(生产环境)
- dev， 用于自动化部署到开发环境 
- test  用于自动化部署到测试环境
  
在本地开发时，一定要保证 `master` 分支 和 `test` 分支的纯洁性。
### 2.2、 创建一个本地分支(Create your local branch)

任何开发都不要在 `master` 和 `test` 分支下进行，比如你接到一个开发任务，那么创建一个 `dev` 分支：
```bash
git checkout -b dev
```

### 2.2、码吧(Coding)
现在可以`coding`了, `coding` 完了后，先看一下自己动了哪些文件，把那些不是本次 `coding` 需要的还原恢复

```bash
git status
```
存到本地仓库 `storage` 中
```bash
git add *
```
提交到仓库
```bash
git commit -m 'Complete the feature: login'
```

### 2.3、 合并到 master
将 `test` 分支合并到 `dev` 分支, 分两步走：

- 切到 `test` 分支，并拉取(pull)远程服务器上最新的代码, 如果有冲突要先解决冲突问题
- 将 `dev` 分支合并到当前 `test`
```bash
git checkout test
git pull origin test
git merge dev
```
在这个过程中如果有冲突，一定要先解决掉。冲突解决完成后再按 2.2 步骤走一遍后再走 2.4

### 2.4、 推送到远程仓库

将本地 `dev` 分支推送到远程 `test` 分支
```bash
git push origin dev:test
```

## 三、部署代码到产线前的工作
在 `test` 或 `bug` 分支中的代码完成后，需要将这些代码推送到产线，每周定时推送一次：周一凌晨2点。为了确保无误，请严格按照下面的流程走

### 3.1、更新本地仓库 master 分支代码

将远程仓库最新的代码拉取下来。

```
git checkout master
git pull origin master
```

### 3.2、将 master 分支最新的代码合并到 test 分支

```
git checkout test
git pull origin test
git merge master
```
这个过程可能会有一些文件冲突，那先把冲突解决后按照 2.2 的步骤再走一遍

### 3.3、将合并后的代码推到 test 环境再次测试一把
确保万无一失

```
git push origin test
```

### 3.4、合并代码到 master 分支
将 `test` 分支合并到 `master`, 并推送到远程仓库

```
git checkout master
git merge test
```

推送到远程仓库

```
git push origin master
```
推送到 `master` 分支，这个动作，目前是设置了保护的，只有仓库的 `Maintainers` 可以执行。

按照上面的步骤执行，加上严格全面的测试，`每周定时推送一次：周一凌晨2点` 即可自动完成，无需加班！


## 四、开发约定(Coding conventions)

从代码的角度来讲，变量名要小写，函数名要用驼峰式，这都是有严格的视觉美学讲究的，让人阅读起来很舒服，甚至做过视觉对照研究的。

从代码的创造者来讲，每一个程序员都是一个工程师，每一段代码都是一个工程师 (Engineer) 的杰作，良好的开发约定是一个优秀工程师 (Engineer) 工匠精神的代表行为和职业精神的重要体现。

### 3.1、命名语义化(Naming semantics)

--- To be continued

### 3.x、常见的几个 JavaScript 代码规范

- [JavaScript Standard Style ](https://github.com/standard/standard)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
  <br/>The most popular JavaScript style guides on the internet. It covers nearly every aspect of JavaScript as well.
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)