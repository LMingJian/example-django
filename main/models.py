from django.db import models
from django.utils import timezone

from django.contrib.auth.models import AbstractBaseUser
# Create your models here.

class Release_Family(models.Model):
    """发行系列"""
    object = models.manager
    name = models.CharField(max_length=100, default='')
    order = models.IntegerField(default=0)
    type = models.IntegerField(choices=((0, '软件'), (1, '硬件')), default='0')

    def __str__(self):
        return f'{self.name}'

class Release_Project(models.Model):
    """发行项目"""
    objects = models.manager
    name = models.CharField(max_length=100, default='')
    order = models.IntegerField(default=0)
    create_time = models.DateTimeField(default=timezone.now)
    update_time = models.DateTimeField(auto_now=True)
    father = models.ForeignKey(Release_Family, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return f'{self.name}'

class Release_File(models.Model):
    """发行文件"""
    object = models.manager
    name = models.CharField(max_length=100, default='')
    uuid = models.CharField(max_length=100, default='')
    create_time = models.DateTimeField(default=timezone.now)
    update_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.name}'

class Release_Version(models.Model):
    """发行版本"""
    object = models.manager
    name = models.CharField(max_length=100, default='')
    create_time = models.DateTimeField(default=timezone.now)
    update_time = models.DateTimeField(auto_now=True)
    notes = models.CharField(max_length=300, default='')
    file = models.ForeignKey(Release_File, on_delete=models.CASCADE)
    father = models.ForeignKey(Release_Project, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.father} / {self.name}'

class Project(models.Model):
    """项目"""
    object = models.manager
    name = models.CharField(max_length=100, default='')
    create_time = models.DateTimeField(default=timezone.now)
    if_show_case = models.IntegerField(choices=((0, '不展示'), (1, '展示')), default=1)
    if_show_bug = models.IntegerField(choices=((0, '不展示'), (1, '展示')), default=1)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.name}'

class Project_Version(models.Model):
    """项目版本"""
    object = models.manager
    name = models.CharField(max_length=100, default='')
    status = models.IntegerField(choices=((0, '终止'), (1, '启用')), default=1)
    create_time = models.DateTimeField(default=timezone.now)
    note = models.TextField(max_length=300, default='')
    father = models.ForeignKey(Project, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.name}'
        
class Node_H1(models.Model):
    """节点1"""
    object = models.manager
    father = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='')
    order = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.name}'

class Node_H2(models.Model):
    """节点2"""
    object = models.manager
    father = models.ForeignKey(Node_H1, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='')
    order = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.name}'

class Node_H3(models.Model):
    """节点3"""
    object = models.manager
    father = models.ForeignKey(Node_H2, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='')
    order = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.name}'

class Node_H4(models.Model):
    """节点4"""
    object = models.manager
    father = models.ForeignKey(Node_H3, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='')
    order = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.name}'

class Node_H5(models.Model):
    """节点5"""
    object = models.manager
    father = models.ForeignKey(Node_H4, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='')
    order = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.name}'

class Bug_Status(models.Model):
    """缺陷状态"""
    object = models.manager
    name = models.CharField(max_length=100, default='')

    def __str__(self):
        return f'{self.name}'

class Bug_Tag(models.Model):
    """缺陷标签"""
    object = models.manager
    name = models.CharField(max_length=100, default='')

    def __str__(self):
        return f'{self.name}'

class Bug_Type(models.Model):
    """缺陷类型"""
    object = models.manager
    name = models.CharField(max_length=100, default='')

    def __str__(self):
        return f'{self.name}'

class Bug(models.Model):
    """缺陷"""
    object = models.manager
    project = models.ForeignKey(Project, on_delete=models.CASCADE, blank=True, null=True)
    h1 = models.ForeignKey(Node_H1, on_delete=models.CASCADE, blank=True, null=True)
    h2 = models.ForeignKey(Node_H2, on_delete=models.CASCADE, blank=True, null=True)
    h3 = models.ForeignKey(Node_H3, on_delete=models.CASCADE, blank=True, null=True)
    h4 = models.ForeignKey(Node_H4, on_delete=models.CASCADE, blank=True, null=True)
    h5 = models.ForeignKey(Node_H5, on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(max_length=200)
    author = models.ForeignKey(AbstractBaseUser, on_delete=models.CASCADE, blank=True, null=True)
    status = models.ForeignKey(Bug_Status, on_delete=models.SET_NULL, blank=True, null=True)
    tag = models.ManyToManyField(Bug_Tag, blank=True)
    type = models.ForeignKey(Bug_Type, on_delete=models.SET_NULL, blank=True, null=True)
    create_time = models.DateTimeField(default=timezone.now)
    update_time = models.DateTimeField(auto_now=True)
    version = models.ForeignKey(Project_Version, on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return f'{self.name} / {self.h1} / {self.h2} / {self.h3} / {self.h4} / {self.h5}'

class Bug_Comments(models.Model):
    """缺陷注释"""
    object = models.manager
    bug = models.ForeignKey(Bug, on_delete=models.CASCADE)
    content = models.TextField(max_length=500)
    author = models.ForeignKey(AbstractBaseUser, on_delete=models.CASCADE, blank=True, null=True)
    create_time = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.content}'

class Case(models.Model):
    """用例"""
    object = models.manager
    order = models.IntegerField(default=0)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='')
    author = models.ForeignKey(AbstractBaseUser, on_delete=models.CASCADE, blank=True, null=True)
    create_time = models.DateTimeField(auto_now=True)
    status = models.IntegerField(choices=((0, '待测'), (1, '失败'), (2, '通过'), (3, '阻塞')), default=0)
    jsmind_data = models.CharField(default='', blank=True, null=True)

    def __str__(self):
        return f'{self.name}'

class Report(models.Model):
    """报告"""
    object = models.manager
    name = models.CharField(max_length=100, default='')
    uploader = models.ForeignKey(AbstractBaseUser, on_delete=models.CASCADE, blank=True, null=True)
    comments = models.CharField(max_length=500, default='', blank=True, null=True)

    def __str__(self):
        return f'{self.name}'
