# Release Manager

> @2021-12-01 新建
> @2025-03-22 迁移，因为修改了后端接口，前端部分js请求接口未重新对接

## 初始化数据库

```shell
python manage.py makemigrations main # 记录改动
python manage.py migrate # 创建表
python manage.py createsuperuser # 创建超级管理员
```

## 运行

```shell
python manage.py runserver
```

## 配置

```python
# 数据库初始化，手动填入以下内容
Bug_status = ['建议', '警告', '严重', '已改', '不改', '已改并关闭', '不改并关闭']
Bug_type = ['业务逻辑'， '功能操作', '功能优化', '界面优化']
Feedback_rank = ['紧急', '一般', '处理中', '关闭']
```

## 部署

[ 如何部署 Django 项目 ](https://lmingjian.github.io/docs/django/%E5%A6%82%E4%BD%95%E9%83%A8%E7%BD%B2-django-%E9%A1%B9%E7%9B%AE/)

## 更新

```shell
docker stop release_manager_nginx
docker exec release_manager uwsgi --stop /ReleaseManager/deploy/logs/uwsgi.pid
docker exec release_manager python /ReleaseManager/manage.py makemigrations main
docker exec release_manager python /ReleaseManager/manage.py migrate
docker exec release_manager uwsgi --ini /ReleaseManager/deploy/uwsgi.ini
docker start release_manager_nginx
```

## 开源工具

Django，Echarts，Bootstrap，jQuery，jsMind, Python

## 维护

- `models.py`：数据存放，实例化数据库里面的数据用于使用
- `admin.py`：models 注册
- `url.py`：路由文件，平台所有路由都在此
- `views.py`：页面文件，平台主要内容都在此
- `templates`：HTML 模板文件文件夹，包含所有 HTML 界面主体
- `settings.py`：配置文件，一些 django 系统功能在此配置
