# game

小游戏网站，目前有数独和扫雷

## 扫雷

可多人联机扫雷

## 数独

杀手数独玩法，只有一种难度，就是没有数字，关卡数据来自[sudoku.com](sudoku.com/zh)

## 目录结构

整体是个rust 项目，其中 static 是vue前端项目，同时在构建后也是静态文件目录，具体需要参见[Dockerfile](Dockerfile)

## 运行

```shell
docker run -it --rm -p 25895:25895 --name game ghcr.io/inkroom/game
```
