import copy
import csv
import json
import uuid
import os

from urllib import parse
import zipfile

from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db import models
from django.http import FileResponse, JsonResponse
from django.middleware.csrf import rotate_token
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from . import models

def view_login(request):
    rotate_token(request)  # 随机设置 csrf token
    return render(request, 'login.html')

# @login_required()
def view_index(request):
    project = models.Project.objects.exclude(if_show_bug=0)
    report = models.Report.objects.all().order_by('-id')
    content = {
        'project': project,
        'report': report,
    }
    return render(request, 'index.html', content)

@login_required()
def view_setting(request):
    project = models.Project.objects.all()
    content = {
        'project': project,
    }
    return render(request, 'setting.html', content)

@login_required()
def view_software_release(request):
    id = request.GET.get('id', '')
    if id == '':
        release_family = models.Release_Family.objects.filter(type=0).order_by('order')
        release_project = {}
        for each in release_family:
            project = models.Release_Project.objects.filter(father=each).order_by('order')
            release_project[each.name] = project
        return render(request, 'software-release-index.html', context={'release_family': release_family, 'release_project': release_project})
    release = models.Release_Project.objects.get(id=id)
    version = models.Release_Version.objects.filter(father=release).order_by('-update_time')
    content = {
        'release': release,
        'version': version,
    }
    return render(request, 'software-release.html', content)

@login_required()
def view_hardware_release(request):
    id = request.GET.get('id', '')
    if id == '':
        release_family = models.Release_Family.objects.filter(type=1).order_by('order')
        release_project = {}
        for each in release_family:
            project = models.Release_Project.objects.filter(father=each).order_by('order')
            release_project[each.name] = project
        return render(request, 'hardware-release-index.html', context={'release_family': release_family, 'release_project': release_project})
    release = models.Release_Project.objects.get(id=id)
    version = models.Release_Version.objects.filter(father=release).order_by('-update_time')
    content = {
        'release': release,
        'version': version,
    }
    return render(request, 'hardware-release.html', context=content)

@login_required()
def view_bug_workspace(request):
    id = request.GET.get('id', '')
    all = request.GET.get('all', '')
    if id == '':
        project_list = models.Project.objects.exclude(if_show_bug=0).order_by('order')
        return render(request, 'bug-workspace-index.html', context={'project_list': project_list})
    if all != '':
        all = 1
    project = models.Project.objects.get(id=id)
    h1 = models.Node_H1.objects.filter(father=project).order_by('order')
    node_tree = {}
    for h11 in h1:
        h2 = models.Node_H2.objects.filter(father=h11).order_by('order')
        h2h3 = {}
        for h22 in h2:
            h3 = models.Node_H3.objects.filter(father=h22).order_by('order')
            h3h4 = {}
            for h33 in h3:
                h4 = models.Node_H4.objects.filter(father=h33).order_by('order')
                h4h5 = {}
                for h44 in h4:
                    h5 = models.Node_H5.objects.filter(father=h44).order_by('order')
                    h4h5[h44] = h5
                h3h4[h33] = h4
            h2h3[h22] = h3h4
        node_tree[h11] = h2h3
    bug = models.Bug.objects.filter(project=project)
    h1_bug = bug.filter(h1!=None).order_by('-id')
    h2_bug = bug.filter(h2!=None).order_by('-id')
    h3_bug = bug.filter(h3!=None).order_by('-id')
    h4_bug = bug.filter(h4!=None).order_by('-id')
    h5_bug = bug.filter(h5!=None).order_by('-id')
    status = models.Bug_Status.objects.all()
    tag = models.Bug_Tag.objects.all()
    type = models.Bug_Type.objects.all()
    content = {
        'project': project,
        'node_tree': node_tree,
        'h1': h1,
        'h1_bug': h1_bug,
        'h2_bug': h2_bug,
        'h3_bug': h3_bug,
        'h4_bug': h4_bug,
        'h5_bug': h5_bug,
        'status': status,
        'type': type,
        'tag': tag,
        'all': all,
    }
    return render(request, 'bug-workspace.html', context=content)

@login_required()
def view_case(request):
    id = request.GET.get('id', '')
    page_id = request.GET.get('page', '1')
    user_id = request.GET.get('user', '')
    if id == '':
        project_list = models.Project.objects.exclude(if_show_case=0).order_by('order')
        return render(request, 'case-index.html', context={'project_list': project_list})
    project = models.Project.objects.get(id=id)
    if user_id != '':
        user = User.objects.get(id=user_id)
        case = models.Case.objects.filter(project=project).filter(author=user).order_by('-create_time')
        all = 0
    else:
        case = models.Case.objects.filter(project=project).order_by('-create_time')
        all = 1
    page = Paginator(case, 12)
    page_count = page.num_pages
    page_current = int(page_id)
    if page_current > page_count:
        page_current = 1
    content = {
        'project': project,
        'case': page.page(page_current),
        'page_count': range(page_count),
        'page_count_len': page_count,
        'page_current': page_current,
        'all': all,
    }
    return render(request, 'case.html', context=content)

@login_required()
def view_case_editing(request):
    case_id = request.GET.get('cid', '')
    case = models.Case.objects.get(id=case_id)
    content = {
        'case': case,
    }
    return render(request, 'case-editing.html', context=content)

@login_required()
def view_version(request):
    id = request.GET.get('id', '')
    if id == '':
        project_list = models.Project.objects.exclude(if_show_bug=0).order_by('order')
        return render(request, 'version-index.html', context={'project_list': project_list})
    version = models.Project_Version.objects.filter(father_id=id).order_by('-create_time')
    content = {}
    for each in version:
        note = each.note
        temp = []
        if note:
            temp = note.split('\n')
        content[each] = temp
    return render(request, 'version.html', context={'content': content})


#--------------接口---------------------------------------#

def my_response(data):
    """响应"""
    response = JsonResponse(data)
    response['Content-Type'] = 'application/json; charset=UTF-8'
    return response

def api_login(request):
    """登录"""
    if request.method == 'POST':
        name = request.POST.get('name', '')
        password = request.POST.get('password', '')
        user = auth.authenticate(username=name, password=password)
        if user:
            auth.login(request, user)
            return my_response({'status': 10000, 'message': 'Login Success'})
        else:
            return my_response({'status': 10001, 'message': 'Login Fail'})

def api_logout(request):
    """注销"""
    auth.logout(request)
    return my_response({'status': 10000, 'message': 'Logout Success'})

def api_create_software_release_project(request):
    """创建软件发行项目"""
    if request.method == "POST":
        name = request.POST.get('name', '')
        family_id = request.POST.get('family_id', '')
        if name != '' and family_id != '':
            family = models.Release_Family.objects.get(id=int(family_id))
            models.Release_Project.objects.create(name=name, father=family)
            return my_response({'status': 10000, 'message': f'Project {name}'})
        elif name != '' and family_id == '':
            models.Release_Project.objects.create(name=name)
            return my_response({'status': 10000, 'message': f'Project {name}'})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_download_file(request, file_name, uuid):
    """下载文件"""
    if request.method == "GET":
        response = FileResponse(open(f'main/media/{uuid}', 'rb'))
        response['Content-Disposition']="attachment; filename=" + parse.quote(file_name, encoding="utf-8")
        return response

def api_download_software_release(request):
    """获取软件下载链接"""
    if request.method == "GET":
        id = request.GET.get('id', '')
        name = request.GET.get('name', '')
        if id != '':
            version = models.Release_Version.objects.get(id=id)
            uuid = version.file.uuid
            if os.path.exists(f'main/media/{uuid}'):
                return my_response({'status': 10000, 'message': f'file/{name}&{uuid}'})
            else:
               return my_response({'status': 10002, 'message': f'File 404'}) 
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_download_hardware_release(request):
    """获取硬件下载链接"""
    if request.method == "GET":
        id = request.GET.get('id', '')
        name = request.GET.get('name', '')
        if id != '':
            version = models.Release_Version.objects.get(id=id)
            uuid = version.file.uuid
            if os.path.exists(f'main/media/{uuid}'):
                return my_response({'status': 10000, 'message': f'file/{name}&{uuid}'})
            else:
               return my_response({'status': 10002, 'message': f'File 404'}) 
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_upload_software_release(request):
    """上传软件"""
    if request.method == "POST":
        file_name = request.POST.get('file_name', '')
        file_notes = request.POST.get('file_notes', '')
        project_id = request.POST.get('project_id', '')
        file_data = request.FILES
        if project_id == '':
            return my_response({'status': 10001, 'message': 'Project Error'})
        if len(file_data) > 0:
            file = file_data.get('avatar')
            flag = handle_uploaded_file(file)
            if flag == 0:
                return my_response({'status': 10002, 'message': 'File Type Error'})
            project_models = models.Release_Project.objects.get(id=project_id)
            file_models = models.Release_File.objects.create(
                name = file.name,
                uuid = flag
            )
            models.Release_Version.objects.create(
                father = project_models,
                name = file_name if file_name != '' else file.name,
                notes = file_notes,
                file = file_models
            )
            return my_response({'status': 10000, 'message': 'Upload Success'})
        else:
            return my_response({'status': 10003, 'message': 'File Error'})

def handle_uploaded_file(file):
    """文件写入"""
    ext = file.name.split('.')[-1]
    if ext in ['html', 'htm', 'js', 'css', 'php']:
        return 0
    file_name = '{}.{}'.format(uuid.uuid4().hex[:10], ext)
 
    # file path relative to 'media' folder
    absolute_file_path = os.path.join('main/media', file_name)
 
    directory = os.path.dirname(absolute_file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

    with open(absolute_file_path, 'wb+') as destination:
        # Size, in bytes, The default is 64*2^10 bytes, or 64 KB
        for chunk in file.chunks():
            destination.write(chunk)

    return file_name

def api_get_node(request):
    """获取 BUG 节点"""
    if request.method == "GET":
        father_id = request.GET.get('father_id', '')
        query_node = request.GET.get('query_node', '')
        result = {}
        if father_id:
            if query_node == 'h1':
                h = models.Node_H1.objects.filter(fahter_id=father_id).order_by('order')
            elif query_node == 'h2':
                h = models.Node_H2.objects.filter(father_id=father_id).order_by('order')
            elif query_node == 'h3':
                h = models.Node_H3.objects.filter(father_id=father_id).order_by('order')
            elif query_node == 'h4':
                h = models.Node_H4.objects.filter(father_id=father_id).order_by('order')
            elif query_node == 'h5':
                h = models.Node_H5.objects.filter(father_id=father_id).order_by('order')
            else:
                return my_response({'status': 10001, 'message': 'Query Node Error'})
            for each in h:
                result[f'a{each.id}'] = each.name
            return my_response({'status': 10000, 'message': result})
        else:
            return my_response({'status': 10001, 'message': 'Father Node Error'})

def api_create_node(request):
    """添加节点"""
    if request.method == 'POST':
        node_tag = request.POST.get('node_tag', '')
        father_id = request.POST.get('father_id', '')
        name = request.POST.get('name', '')
        order = request.POST.get('order', '')
        if node_tag == 'h1':
            fa = models.Project.objects.get(id=father_id)
            models.Node_H1.objects.create(father=fa, name=name, order=order)
            return my_response({'status': 10000, 'message': 'Success'})
        elif node_tag == 'h2':
            fa = models.Node_H1.objects.get(id=father_id)
            models.Node_H2.objects.create(father=fa, name=name, order=order)
            return my_response({'status': 10000, 'message': 'Success'})
        elif node_tag == 'h3':
            fa = models.Node_H2.objects.get(id=father_id)
            models.Node_H3.objects.create(father=fa, name=name, order=order)
            return my_response({'status': 10000, 'message': 'Success'})
        elif node_tag == 'h4':
            fa = models.Node_H3.objects.get(id=father_id)
            models.Node_H4.objects.create(father=fa, name=name, order=order)
            return my_response({'status': 10000, 'message': 'Success'})
        elif node_tag == 'h5':
            fa = models.Node_H4.objects.get(id=father_id)
            models.Node_H5.objects.create(father=fa, name=name, order=order)
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'Node Error'})

def api_create_bug(request):
    """添加 BUG"""
    if request.method == 'POST':
        project_id = request.POST.get('project_id', '')
        node_flag = request.POST.get('node_flag', '')
        node_id = request.POST.get('node_id', '')
        name = request.POST.get('name', '')
        author_id = request.POST.get('author_id', '')
        status_id = request.POST.get('status_id', '')
        type_id = request.POST.get('type_id', '')
        tag_id = request.POST.get('tag_id', '')
        notes = request.POST.get('notes', '')
        version_id = request.POST.get('version_id', '')
            
        version = models.Version.objects.get(id=version_id) if version_id != '' else ''
        project = models.Project.objects.get(id=project_id)
        status = models.Bug_Status.objects.get(id=status_id)
        type = models.Bug_Type.objects.get(id=type_id)
        User = models.AbstractBaseUser.objects.get(id=author_id)
        tag = []
        for each in tag_id.split(','):
            if each != '':
                tag.append(models.Bug_Tag.objects.get(id=each))
        if node_flag == 'h1':
            node = models.Node_H1.objects.get(id=node_id)
            bug = models.Bug.objects.create(project=project, h1=node, name=name, author=User, status=status, type=type)
            bug.tag.set(tag)
            if version != '':
                bug.version = version
            bug.save()
        elif node_flag == 'h2':
            node = models.Node_H2.objects.get(id=node_id)
            bug = models.Bug.objects.create(project=project, h2=node, name=name, author=User, status=status, type=type)
            bug.tag.set(tag)
            if version != '':
                bug.version = version
            bug.save()
        elif node_flag == 'h3':
            node = models.Node_H3.objects.get(id=node_id)
            bug = models.Bug.objects.create(project=project, h3=node, name=name, author=User, status=status, type=type)
            bug.tag.set(tag)
            if version != '':
                bug.version = version
            bug.save()
        elif node_flag == 'h4':
            node = models.Node_H4.objects.get(id=node_id)
            bug = models.Bug.objects.create(project=project, h4=node, name=name, author=User, status=status, type=type)
            bug.tag.set(tag)
            if version != '':
                bug.version = version
            bug.save()
        elif node_flag == 'h5':
            node = models.Node_H5.objects.get(id=node_id)
            bug = models.Bug.objects.create(project=project, h5=node, name=name, author=User, status=status, type=type)
            bug.tag.set(tag)
            if version != '':
                bug.version = version
            bug.save()
        else:
            return my_response({'status': 10001, 'message': 'Node Error'})
        models.Bug_Comments.objects.create(bug=bug, content=notes, author=User)
        return my_response({'status': 10000, 'message': 'Success'})


def api_modify_bugStatus(request):
    """变更 BUG 状态"""
    if request.method == 'GET':
        bug_id = request.GET.get('bug_id', '')
        status_id = request.GET.get('status_id', '')
        if bug_id != '' and status_id != '':
            bug = models.Bug.objects.get(id=bug_id)
            status = models.Bug_Status.objects.get(id=status_id)
            bug.status = status
            bug.save()
            return my_response({'status': 10000, 'message': status.status})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_modify_bugTag(request):
    """变更 BUG 标签"""
    if request.method == 'GET':
        bug_id = request.GET.get('bug_id', '')
        tag_id = request.GET.get('tag_id', '')
        if bug_id != '' and tag_id != '':
            bug = models.Bug.objects.get(id=bug_id)
            tag = models.Bug_Tag.objects.get(id=tag_id)
            bug.tag.add(tag)
            bug.save()
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_get_bugData(request):
    """获取 BUG 介绍内容"""
    if request.method == 'GET':
        bug_id = request.GET.get('bug_id', '')
        if bug_id != '':
            bug_comments = models.Bug_Comments.objects.get(bug_id=bug_id)
            bug = models.Bug.objects.get(id=bug_id)
            content = bug_comments.content
            name = bug.name
            return my_response({'status': 10000, 'message': 'Success', 'content': content, 'name': name})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_modify_bugData(request):
    """变更 BUG 介绍内容"""
    if request.method == 'POST':
        bug_id = request.POST.get('bug_id', '')
        name = request.POST.get('name', '')
        note = request.POST.get('note', '')
        # user_id = request.POST.get('user_id', '')
        if bug_id != '':
            bug_comments = models.Bug_Comments.objects.get(bug_id=bug_id)
            bug_comments.content = note
            bug_comments.save()
            bug = models.Bug.objects.get(id=bug_id)
            bug.name = name
            bug.save()
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_get_bugFather(request):
    """获取 BUG 的父节点"""
    if request.method == 'GET':
        bug_id = request.GET.get('bug_id', '')
        bug = models.Bug.objects.get(id=bug_id)
        if bug.h1:
            return my_response({'status': 10000, 'node': 'h1', 'id': bug.h1.id})
        elif bug.h2:
            return my_response({'status': 10000, 'node': 'h2', 'id': bug.h2.id})
        elif bug.h3:
            return my_response({'status': 10000, 'node': 'h3', 'id': bug.h3.id})
        elif bug.h4:
            return my_response({'status': 10000, 'node': 'h4', 'id': bug.h4.id})
        elif bug.h5:
            return my_response({'status': 10000, 'node': 'h5', 'id': bug.h5.id})
        else:
            return my_response({'status': 10001})

def api_create_project(request):
    """创建项目"""
    if request.method == 'POST':
        name = request.POST.get('name', '')
        flag = request.POST.get('flag', '')
        if name != '':
            if flag == '1':
                # models.Project.objects.create(name=name, if_show_bug=0)
                models.Project.objects.create(name=name)
            else:
                # models.Project.objects.create(name=name, if_show_case=0)
                models.Project.objects.create(name=name)
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'Fail'})

def api_create_user(request):
    """创建用户"""
    if request.method == 'POST':
        sid = request.POST.get('sid', '')
        name = request.POST.get('name', '')
        password = request.POST.get('password', '')
        if name != '' and sid == '1':
            User.objects.create_user(username=name, password=password)
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'Fail'})

def api_create_tag(request):
    """创建标签"""
    if request.method == 'POST':
        sid = request.POST.get('sid', '')
        tag = request.POST.get('tag', '')
        if tag != '' and sid == '1':
            models.Bug_Tag.objects.create(tag=tag)
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'Fail'})

def api_create_version(request):
    """创建 BUG 项目版本"""
    if request.method == 'POST':
        fid = request.POST.get('fid', '')
        name = request.POST.get('name', '')
        note = request.POST.get('note', '')
        if name != '':
            project = models.Project.objects.get(id=fid)
            version = models.Project_Version.objects.create(father=project, name=name, note=note)
            """flag = version.id - 6
            if flag > 0:
                stop = models.Version.objects.get(id=flag)
                stop.status = '终止'
                stop.save()"""
            return my_response({'status': 10000, 'message': f'Success {version.name}'})
        else:
            return my_response({'status': 10001, 'message': 'Fail'})
        
def api_get_version(request):
    """获取 BUG 项目版本"""
    if request.method == 'GET':
        fid = request.GET.get('fid', '')
        project = models.Project.objects.get(id=fid)
        version = models.Project_Version.objects.filter(father=project).exclude(status=0).order_by('-id')
        data = {}
        end = 0
        for each in version:
            data[f'a{each.id}'] = each.name
            end += 1
            if end >= 10:
                break
        return my_response({'status': 10000, 'message': data})

def api_get_bugCount(request):
    """获取 BUG 计数"""
    if request.method == 'GET':
        flag = request.GET.get('flag', '')
        if flag == '0':
            project_id = request.GET.get('project_id', '')
            project = models.Project.objects.get(id=project_id)
            bug = models.Bug.objects.filter(project=project).exclude(status_name='已改并关闭').exclude(status_name='不改并关闭')
            temp = {}
            temp[f'{project.id}'] = len(bug)
            return my_response({'status': 10000, 'message': temp})            
        elif flag == '1':
            project_list = models.Project.objects.exclude(if_show_bug=0)
            temp = {}
            for each in project_list:
                bug = models.Bug.objects.filter(project=each).exclude(status__name='已改并关闭').exclude(status__name='不改并关闭')
                temp[f'{each.id}'] = len(bug)
            return my_response({'status': 10000, 'message': temp})
        else:
            return my_response({'status': 10001, 'message': 'Error'})

def api_modify_bugVersion(request):
    """变更 BUG 版本"""
    if request.method == 'GET':
        bug_id = request.GET.get('bug_id', '')
        version_id = request.GET.get('version_id', '')
        if bug_id != '' and version_id != '':
            bug = models.Bug.objects.get(id=bug_id)
            version = models.Project_Version.objects.get(id=version_id)
            bug.version = version
            bug.save()
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_modify_bugType(request):
    """变更 BUG 类型"""
    if request.method == 'GET':
        bug_id = request.GET.get('bug_id', '')
        type_id = request.GET.get('type_id', '')
        if bug_id != '' and type_id != '':
            bug = models.Bug.objects.get(id=bug_id)
            type = models.Bug_Type.objects.get(id=type_id)
            bug.type = type
            bug.save()
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_delete_software_release(request):
    """删除发行以及文件"""
    if request.method == "GET":
        id = request.GET.get('id', '')
        if id != '':
            version = models.Release_Version.objects.get(id=id)
            uuid = version.file.uuid
            absolute_file_path = os.path.join('main/media', uuid)  
            if os.path.exists(absolute_file_path):
                os.remove(absolute_file_path)
            else:
                return my_response({'status': 10001, 'message': 'File Null'})
            version.file.delete()
            version.delete()
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'File Null'})

def api_replace_software_release(request):
    """替换软件文件"""
    if request.method == "POST":
        id = request.POST.get('id', '')
        file_data = request.FILES
        version = models.Release_Version.objects.get(id=id)
        uuid = version.file.uuid
        if len(file_data) > 0:
            file = file_data.get('avatar')
            replace_uploaded_file(file, uuid)
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10003, 'message': 'File Null'})

def api_replace_hardware_release(request):
    """替换硬件文件"""
    if request.method == "POST":
        id = request.POST.get('id', '')
        file_data = request.FILES
        version = models.Release_Version.objects.get(id=id)
        uuid = version.file.uuid
        if len(file_data) > 0:
            file = file_data.get('avatar')
            replace_uploaded_file(file, uuid)
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10003, 'message': 'File Null'})

def replace_uploaded_file(file, uuid):
    """替换文件实例"""
    # file path relative to 'media' folder
    absolute_file_path = os.path.join('main/media', uuid)
 
    directory = os.path.dirname(absolute_file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

    with open(absolute_file_path, 'wb+') as destination:
        for chunk in file.chunks(10*1024*1024):
            destination.write(chunk)

    return 1

def api_create_hardware_release_project(request):
    """创建硬件发行项目"""
    if request.method == "POST":
        name = request.POST.get('name', '')
        family_id = request.POST.get('family_id', '')
        if name != '' and family_id != '':
            family = models.Release_Family.objects.get(id=int(family_id))
            models.Release_Project.objects.create(name=name, father=family)
            return my_response({'status': 10000, 'message': name})
        elif name != '' and family_id == '':
            models.Release_Project.objects.create(name=name)
            return my_response({'status': 10000, 'message': name})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_create_software_release_family(request):
    """创建软件发行系列"""
    if request.method == "POST":
        name = request.POST.get('family', '')
        if name != '':
            order = len(models.Release_Family.objects.all()) + 1
            series = models.Release_Family.objects.create(name=name, order=order, type=0)
            return my_response({'status': 10000, 'message': name, 'id': series.id})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_create_hardware_release_family(request):
    """创建硬件发行系列"""
    if request.method == "POST":
        name = request.POST.get('family', '')
        if name != '':
            order = len(models.Release_Family.objects.all()) + 1
            series = models.Release_Family.objects.create(name=name, order=order, type=1)
            return my_response({'status': 10000, 'message': name, 'id': series.id})
        else:
            return my_response({'status': 10001, 'message': 'Parameter Error'})

def api_delete_hardware_release(request):
    """删除硬件发行并移除文件"""
    if request.method == "GET":
        id = request.GET.get('id', '')
        if id != '':
            version = models.Release_Version.objects.get(id=id)
            uuid = version.file.uuid
            try:
                absolute_file_path = os.path.join('main/media', uuid)  
                if os.path.exists(absolute_file_path):
                    os.remove(absolute_file_path)
                    version.file.delete()
            except BaseException:
                pass
            version.delete()
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10001, 'message': 'Error'})

def api_upload_hardware_release(request):
    """上传硬件发行项目文件"""
    if request.method == "POST":
        name = request.POST.get('name', '')
        describe = request.POST.get('describe', '')
        father_id = request.POST.get('father_id', '')
        if father_id == '':
            return my_response({'status': 10001, 'message': 'Parameter Error'})
        file_data = request.FILES
        if len(file_data) > 0:
            file = file_data.get('avatar')
            flag = handle_uploaded_file(file)
            if flag == 0:
                return my_response({'status': 10002, 'message': 'File Type Error'})
            father = models.Release_Project.objects.get(id=father_id)
            file_models = models.Release_File.objects.create(
                name = name if name != '' else file.name,
                uuid = flag
            )
            models.Release_Version.objects.create(
                father = father,
                name = name if name != '' else file.name,
                notes = describe,
                file = file_models
            )
            return my_response({'status': 10000, 'message': 'Success'})
        else:
            return my_response({'status': 10003, 'message': 'File Null'})

def statistics_count():
    """硬件统计"""
    projects = models.Project.objects.exclude(if_show_bug=0)
    project_list = []; total_list = []
    open_list = []; close_list = []; revoke_list = []
    for each in projects:
        project_list.append(each.name)
        bug = models.Bug.objects.filter(project=each)
        total = len(bug)
        total_list.append(total)
        bug_open = 0 ; bug_close = 0 ; bug_revoke = 0
        for data in bug:
            status = data.status.name
            if status in ['建议', '警告', '严重']:
                bug_open += 1
            elif status in ['已改', '已改并关闭']:
                bug_close += 1
            elif status in ['不改', '不改并关闭']:
                bug_revoke += 1
        open_list.append(bug_open)
        close_list.append(bug_close)
        revoke_list.append(bug_revoke)
    option = {
        'title': {
            'text': '硬件项目 BUG 总数'
        },
        'tooltip': {
            'trigger': 'axis',
            'axisPointer': {
                'type': 'shadow'
            }
        },
        'legend': {
            'data': [
                {'name': 'BUG 数', 'itemStyle': {'color': 'rgb(84, 112, 198)'}},
                {'name': '已处理', 'itemStyle': {'color': 'rgb(145, 204, 117)'}},
                {'name': '待处理', 'itemStyle': {'color': 'rgb(238, 102, 102)'}},
                {'name': '撤销', 'itemStyle': {'color': '#6c757d'}},
            ]
        },
        'xAxis': {
            'data': project_list
        },
        'yAxis': {
            'type': 'value'
        },
        'dataZoom': [
            {
                'show': 'true',
                'start': '0',
                'end': '100',
            },
            {
                'type': 'inside',
                'start': '0',
                'end': '100',
            },
        ],
        'series': [
            {
                'name': 'BUG 数',
                'type': 'bar',
                'label': {'show': 'true', 'position': 'top', 'fontSize': 20},
                'itemStyle': {'color': 'rgb(84, 112, 198)'},
                'data': total_list,
            },
            {
                'name': '撤销',
                'type': 'bar',
                'stack': 'Bug',
                'itemStyle': {'color': '#6c757d'},
                'data': revoke_list,
            },
            {
                'name': '已处理',
                'type': 'bar',
                'stack': 'Bug',
                'itemStyle': {'color': 'rgb(145, 204, 117)'},
                'data': close_list,
            },
            {
                'name': '待处理',
                'type': 'bar',
                'stack': 'Bug',
                'itemStyle': {'color': 'rgb(238, 102, 102)'},
                'data': open_list,
            },
        ],
    }
    return option

def statistics_type(flag, pid):
    """类型统计"""
    bug_type = []; type_list = {}
    project_name = ''
    if flag == 0:
        # 本地项目
        for each in models.Bug_Type.objects.all():
            bug_type.append(each.name)
        # 统计
        project = models.Project.objects.get(id=pid)
        project_name = project.name
        bug = models.Bug.objects.filter(project=project)
        for each in bug:
            type = each.type.name
            if type not in type_list.keys():
                type_list[type] = 1
            else:
                type_list[type] += 1
        for k in bug_type:
            if k not in type_list.keys():
                type_list[k] = 0
        
    # option
    result = []
    for key, value in type_list.items():
        result.append({'name': key, 'value': value})
    option = {
        'title': {
            'text': project_name,
            'left': 'center'
        },
        'tooltip': {
            'trigger': 'item'
        },
        'legend': {
            'orient': 'horizontal',
            'bottom': 'bottom'
        },
        'series': [
            {
                'name': project_name,
                'type': 'pie',
                'radius': '60%',
                'data': result,
                'emphasis': {
                    'itemStyle': {
                        'shadowBlur': 10,
                        'shadowOffsetX': 0,
                        'shadowColor': 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    }
    return option

def statistics_time(flag, pid):
    """时间统计"""
    type_list = {}; bug_type = []
    project_name = ''
    if flag == 0:
        for each in models.Bug_Type.objects.all():
            bug_type.append(each.name)
        # 本地项目
        project = models.Project.objects.get(id=pid)
        project_name = project.name
        bug = models.Bug.objects.filter(project=project)
        for each in bug:
            type = each.type.name
            time = each.create_time.strftime('%Y')
            if time not in type_list.keys():
                temp = {'BUG 数': 1}
                type_list[time] = temp
            else:
                type_list[time]['BUG 数'] += 1
            #-------------------------
            if type not in type_list[time].keys():
                type_list[time][type] = 1
            else:
                type_list[time][type] += 1
        #----------------------------
        for k in bug_type:
            for e in type_list.values():
                if k not in e:
                    e[k] = 0

    # option
    key_result = []
    value_result = {}
    for key, value in type_list.items():
        key_result.append(key)
        for k, v in value.items():
            if k not in value_result.keys():
                value_result[k] = [v]
            else:
                value_result[k].append(v)
    key_result.reverse()
    for e in value_result.values():
        e.reverse()
    end = []
    for k, v in value_result.items():
        if k == 'BUG 数':
            end.append({
                'name': 'BUG 数',
                'type': 'bar',
                'label': {'show': 'true', 'position': 'top', 'fontSize': 20},
                'data': v,
            })
        else:
            end.append({
            'name': k,
            'type': 'bar',
            'stack': 'Bug',
            'data': v,
            })
    option = {
        'title': {
            'text': project_name
        },
        'tooltip': {
            'trigger': 'axis',
            'axisPointer': {
                'type': 'shadow'
            }
        },
        'legend': {
            'data': [
                {'name': 'BUG 数', 'itemStyle': {'color': 'rgb(84, 112, 198)'}}
            ]
        },
        'xAxis': {
            'data': key_result
        },
        'yAxis': {
            'type': 'value'
        },
        'dataZoom': [
            {
                'show': 'true',
                'start': '0',
                'end': '100',
            },
            {
                'type': 'inside',
                'start': '0',
                'end': '100',
            },
        ],
        'series': end,
    }
    return option

def api_get_bugStatistics(request):
    """获取统计项目以及数据"""
    if request.method == "GET":
        flag = request.GET.get('flag', '')
        if flag == '1':
            option = statistics_count()
            return my_response({'status': 10000, 'message': option})
        elif flag == '2':
            pass
        elif flag == '3':
            # 硬件 BUG 类型统计
            pid = request.GET.get('pid', '')
            option = statistics_type(0, pid)
            return my_response({'status': 10000, 'message': option})
        elif flag == '4':
            # 软件 BUG 类型统计
            pid = request.GET.get('pid', '')
            option = statistics_type(1, pid)
            return my_response({'status': 10000, 'message': option})
        elif flag == '5':
            # 硬件 BUG 时间统计
            pid = request.GET.get('pid', '')
            option = statistics_time(0, pid)
            return my_response({'status': 10000, 'message': option})
        elif flag == '6':
            # 软件 BUG 时间统计
            pid = request.GET.get('pid', '')
            option = statistics_time(1, pid)
            return my_response({'status': 10000, 'message': option})
        else:
            return my_response({'status': 10003, 'message': 'Unknow Flag'})

def api_get_caseData(request):
    """获取用例数据"""
    if request.method == "GET":
        case_id = request.GET.get('cid', '')
        if case_id != '':
            case = models.Case.objects.get(id=case_id)
            if case.jsmind_data:
                case_data = json.loads(case.jsmind_data)
                return my_response({'status': 10000, 'message': case_data})
            else:
                return my_response({'status': 10000, 'message': ''})
        else:
            return my_response({'status': 10002, 'message': 'Error'})

def api_modify_caseData(request):
    """变更用例数据"""
    if request.method == "POST":
        case_id = request.POST.get('cid', '')
        case_name = request.POST.get('case_name', '')
        case_data = request.POST.get('case_data', '')
        case = models.Case.objects.get(id=case_id)
        if case_name != '':
            case.name = case_name
        if case_data != '':
            case.jsmind_data = case_data
        case.save()
        return my_response({'status': 10000, 'data': case.jsmind_data, 'name': case.name})

def api_create_caseData(request):
    """创建用例"""
    if request.method == "POST":
        pid = request.POST.get('pid', '')
        creater = request.POST.get('creater', '')
        uid = request.POST.get('uid', '')
        project = models.Project.objects.get(id=pid)
        order = len(models.Case.objects.filter(project=project)) + 1
        if creater != '':
            case = models.Case.objects.create(project=project, creater=creater, name='双击以变更名称', order=order)
        else:
            case = models.Case.objects.create(project=project, creater=uid, name='双击以变更名称', order=order)
        return my_response({'status': 10000, 'message': case.id})

def api_get_nextCase(request):
    """获取下一个用例"""
    if request.method == "GET":
        cid = request.GET.get('cid', '')
        pid = request.GET.get('pid', '')
        uid = request.GET.get('uid', '')
        if uid != '':
            creater_name = User.objects.get(id=uid).first_name
            next = models.Case.objects.filter(project_id=pid).filter(creater=creater_name)
        else:
            next = models.Case.objects.filter(project_id=pid)
        length = len(next)
        next_id = 0
        for each in next:
            if str(each.id) == cid:
                if next_id + 1 < length:
                    next_id = next[next_id+1].id
                    return my_response({'status': 10000, 'message': next_id})
                break
            next_id += 1
        return my_response({'status': 10000, 'message': 'None'})           

def api_get_backCase(request):
    """获取上一个用例"""
    if request.method == "GET":
        cid = request.GET.get('cid', '')
        pid = request.GET.get('pid', '')
        uid = request.GET.get('uid', '')
        if uid != '':
            creater_name = User.objects.get(id=uid).first_name
            next = models.Case.objects.filter(project_id=pid).filter(creater=creater_name)
        else:
            next = models.Case.objects.filter(project_id=pid)
        next_id = 0
        for each in next:
            if str(each.id) == cid:
                if next_id != 0:
                    next_id = next[next_id-1].id
                    return my_response({'status': 10000, 'message': next_id})
                break
            next_id += 1
        return my_response({'status': 10000, 'message': 'None'})     

def api_get_nextNewCase(request):
    """创建下一个新用例"""
    if request.method == "POST":
        # 保存数据
        csae_id = request.POST.get('cid', '')
        case_name = request.POST.get('case_name', '')
        case_data = request.POST.get('case_data', '')
        case = models.Case.objects.get(id=csae_id)
        if case_name != '':
            case.name = case_name
        if case_data != '':
            case.jsmind_data = case_data
        case.save()
        # 新建
        creater = request.POST.get('creater', '')
        project = case.project
        order = len(models.Case.objects.filter(project=project)) + 1
        new_case = models.Case.objects.create(project=project, creater=creater, name='双击以变更名称', order=order)
        # 返回
        return my_response({'status': 10000, 'message': new_case.id})

def api_modify_caseStatus(request):
    """变更用例状态"""
    if request.method == 'POST':
        status_id = request.POST.get('status_id', '')
        case_id = request.POST.get('case_id', '')
        case = models.Case.objects.get(id=case_id)
        if status_id == '0':
            case.status = '通过'
            case.save()
        elif status_id == '1':
            case.status = '失败'
            case.save()
        elif status_id == '2':
            case.status = '阻塞'
            case.save()
        else:
            return my_response({'status': 10001, 'message': 'Unknow Flag'})
        order = case.order + 1
        project = case.project
        next = models.Case.objects.filter(project=project).filter(order=order)
        if next:
            return my_response({'status': 10000, 'message': next[0].id})
        else:
            return my_response({'status': 10000, 'message': 'None'})

def api_modify_node(request):
    """修改节点"""
    if request.method == 'POST':
        new_name = request.POST.get('name', '')
        new_number = request.POST.get('number', '')
        node_id = request.POST.get('node_id', '')
        node_type = request.POST.get('node_type', '')
        if node_type == '#h1':
            node = models.Node_H1.objects.get(id=node_id)
        elif node_type == '#h2':
            node = models.Node_H2.objects.get(id=node_id)
        elif node_type == '#h3':
            node = models.Node_H3.objects.get(id=node_id)
        elif node_type == '#h4':
            node = models.Node_H4.objects.get(id=node_id)
        elif node_type == '#h5':
            node = models.Node_H5.objects.get(id=node_id)
        else:
            return my_response({'status': 10001, 'message': 'Unknow Flag'})
        node.order = new_number
        node.name = new_name
        node.save()
        return my_response({'status': 10000, 'message': 'Success'})

def api_delete_node(request):
    """删除节点"""
    if request.method == 'POST':
        node_id = request.POST.get('node_id', '')
        node_type = request.POST.get('node_type', '')
        if node_type == '#h1':
            models.Node_H1.objects.get(id=node_id).delete()
        elif node_type == '#h2':
            models.Node_H2.objects.get(id=node_id).delete()
        elif node_type == '#h3':
            models.Node_H3.objects.get(id=node_id).delete()
        elif node_type == '#h4':
            models.Node_H4.objects.get(id=node_id).delete()
        elif node_type == '#h5':
            models.Node_H5.objects.get(id=node_id).delete()
        else:
            return my_response({'status': 10001, 'message': 'Unknow Flag'})
        return my_response({'status': 10000, 'message': 'Success'})
    
def api_delete_case(request):
    """删除用例"""
    if request.method == 'DELETE':
        case_id = request.body.decode().replace('cid=', '')
        models.Case.objects.get(id=case_id).delete()
        return my_response({'status': 10000, 'message': 'Success'})

def api_delete_session(request):
    """删除 Cookie"""
    if request.method == 'DELETE':
        request.session.flush()
        return my_response({'status': 10000, 'message': 'Success'})
    
def api_get_projectStatus(request):
    """获取项目数据收集状态"""
    if request.method == "GET":
        project_id = request.GET.get('pid', '')
        project = models.Project.objects.get(id=project_id)
        bug_status = project.if_show_bug
        case_status = project.if_show_case
        return my_response({'status': 10000, 'message': {'bug': bug_status, 'case': case_status}})
    
def api_modify_projectStatus(request):
    """变更项目数据收集状态"""
    if request.method == "POST":
        project_id = request.POST.get('pid', '')
        bug_status = request.POST.get('bug', '')
        case_status = request.POST.get('case', '')
        project = models.Project.objects.get(id=project_id)
        project.if_show_bug = bug_status
        project.if_show_case = case_status
        project.save()
        return my_response({'status': 10000, 'message': 'Success'})

@csrf_exempt  
def api_upload_report(request):
    """上传报告"""
    if request.method == "POST":
        report_name = request.POST.get('report_name', '')
        report_uploader = request.POST.get('report_uploader', '')
        if report_name == '' or report_uploader == '':
            return my_response({'status': 10001, 'message': 'Parameter Error'})
        file_data = request.FILES
        if len(file_data) > 0:
            file = file_data.get('avatar')
            flag = handle_uploaded_report(file, report_name)
            if flag == 0:
                return my_response({'status': 10002, 'message': 'File type Error'})
            # 写入数据库
            zip_path = os.path.join('main/media/allure', report_name)
            zip_org = zipfile.ZipFile(zip_path)
            zip_org.extractall(path=zip_path.replace('.zip', ''))
            zip_org.close()
            os.remove(zip_path)
            models.Report.objects.create(name=report_name.replace('.zip', ''), uploader=report_uploader)
            return my_response({'status': 10000, 'message': 'Upload Success'})
        else:
            return my_response({'status': 10003, 'message': 'File is Null'})
        
def handle_uploaded_report(file, report_name):
    """上传报告实例"""
    ext = file.name.split('.')[-1]
    if ext not in ['zip']:
        return 0
 
    # file path relative to 'media' folder
    absolute_file_path = os.path.join('main/media/allure', report_name)
 
    directory = os.path.dirname(absolute_file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

    with open(absolute_file_path, 'wb+') as destination:
        # Size, in bytes, The default is 64*2^10 bytes, or 64 KB
        for chunk in file.chunks():
            destination.write(chunk)

    return 1

def api_get_caseCount(request):
    """获取用例计数"""
    if request.method == 'GET':
        flag = request.GET.get('flag', '')
        if flag == '0':
            pid = request.GET.get('pid', '')
            project = models.Project.objects.get(id=pid)
            bug = models.Case.objects.filter(project=project)
            temp = {}
            temp[f'{project.id}'] = len(bug)
            return my_response({'status': 10000, 'message': temp})            
        elif flag == '1':
            project_list = models.Project.objects.exclude(if_show_case=0)
            temp = {}
            for each in project_list:
                case = models.Case.objects.filter(project=each)
                temp[f'{each.id}'] = len(case)
            return my_response({'status': 10000, 'message': temp})
        else:
            return my_response({'status': 10001, 'message': 'Error'})
        
def api_export_case(request):
    """导出用例"""
    if request.method == 'GET':
        uid = request.GET.get('uid', '')
        pid = request.GET.get('pid', '')
        if uid != '' and pid != '':
            user_name = User.objects.get(id=int(uid)).first_name
            case = models.Case.objects.filter(project_id=pid).filter(creater=user_name)
            export_filename = f'case_{pid}_{uid}.csv'
            case_path = os.path.join('main/media/case', export_filename)
            with open(case_path, 'w', newline='', encoding='UTF-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(['序号', '作者', '名称', '标题/前置条件', '步骤', '预期结果'])
                for each in case:
                    if not each.jsmind_data:
                        continue
                    case_data = json.loads(each.jsmind_data)['data']
                    case_title = case_data['topic']
                    case_children = case_data['children']
                    reader = case_reader(case_children)
                    clean_data = case_clean(reader)
                    final = []
                    for cx in clean_data:
                        temp = []
                        temp.append(each.order)
                        temp.append(each.author)
                        temp.append(each.name)
                        temp.append(case_title)
                        temp.append('->'.join(cx[:-1]))
                        temp.append(cx[-1])
                        final.append(temp)
                    for loop in final:
                        writer.writerow(loop)
            return my_response({'status': 10000, 'message': f'media/case/{export_filename}'})
        else:
            return my_response({'status': 10001, 'message': 'Error'})
        
def case_reader(data: list):
    if len(data) > 1:
        result = []
        for each in data:
            temp = []
            temp.append(each['topic'])
            try:
                temp = temp + case_reader(each['children'])
            except BaseException:
                pass
            result.append(temp)
        return result
    else:
        temp = []
        temp.append(data[0]['topic'])
        try:
            temp = temp + case_reader(data[0]['children'])
        except BaseException:
            pass
        return temp
    
def case_clean(data: list):
    step = []
    copy_data = copy.deepcopy(data)
    for ax in data:
        if type(ax) == list:
            break
        step.append(copy_data.pop(0))
    result = []
    if copy_data:
        for bx in copy_data:
            result.append(step + bx)
    else:
        result.append(step)
    temp = []
    end = []
    for cx in result:
        if check_list(cx):
            temp = temp + case_clean(cx)
        else:
            end.append(cx)
    return end + temp

def check_list(data: list):
    """判断列表里面是否还包含列表元素"""
    for each in data:
        if type(each) == list:
            return 1
    return 0

def api_get_versionCount(request):
    """获取版本计数"""
    if request.method == 'GET':
        flag = request.GET.get('flag', '')
        if flag == '0':
            pid = request.GET.get('pid', '')
            project = models.Project.objects.get(id=pid)
            version = models.Project_Version.objects.filter(father=project)
            temp = {}
            temp[f'{project.id}'] = len(version)
            return my_response({'status': 10000, 'message': temp})            
        elif flag == '1':
            project_list = models.Project.objects.exclude(if_show_bug=0)
            temp = {}
            for each in project_list:
                version = models.Project_Version.objects.filter(father=each)
                temp[f'{each.id}'] = len(version)
            return my_response({'status': 10000, 'message': temp})
        else:
            return my_response({'status': 10001, 'message': 'Error'})
        
def api_modify_versionData(request):
    if request.method == "POST":
        vid = request.POST.get('vid', '')
        title = request.POST.get('title', '')
        note = request.POST.get('note', '')
        version = models.Project_Version.objects.get(id=vid)
        version.name = title
        version.note = note
        version.save()
        return my_response({'status': 10000, 'message': 'Success'})

def api_modify_versionStatus(request):
    if request.method == "GET":
        vid = request.GET.get('vid', '')
        version = models.Project_Version.objects.get(id=vid)
        status = version.status
        if status == '启用':
            version.status = '终止'
            version.save()
        else:
            version.status = '启用'
            version.save()
        return my_response({'status': 10000, 'message': 'Success'})
    
def get_version_data(request):
    if request.method == "GET":
        vid = request.GET.get('vid', '')
        version = models.Project_Version.objects.get(id=vid)
        return my_response({'status': 10000, 'title': version.name, 'note': version.note})
    

def api_export_bug(request):
    if request.method == 'GET':
        pid = request.GET.get('pid', '')
        if pid != '':
            bug = models.Bug.objects.filter(project_id=pid)
            export_filename = f'bug_{pid}.csv'
            case_path = os.path.join('main/media/case', export_filename)
            with open(case_path, 'w', newline='', encoding='UTF-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(['序号','测试需求', '缺陷类型', '缺陷描述', '缺陷状态', '发现版本', '发现时间'])
                for each in bug:
                    requirement = ''
                    if each.h1:
                        requirement = check_node(each.h1, 1)
                    elif each.h2:
                        requirement = check_node(each.h2, 2)
                    elif each.h3:
                        requirement = check_node(each.h3, 3)
                    elif each.h4:
                        requirement = check_node(each.h4, 4)
                    elif each.h5:
                        requirement = check_node(each.h5, 5)
                    create_time = timezone.localtime(each.create_time).strftime(f"%Y-%m-%d %H:%M:%S")
                    writer.writerow([each.id, requirement, each.type, each.name, each.status, each.version, create_time])
            return my_response({'status': 10000, 'message': f'media/case/{export_filename}'})
        else:
            return my_response({'status': 10001, 'message': 'Error'})

def check_node(node, level):
    if level == 1:
        return node.name
    elif level == 2:
        node_1 = node.father
        return f'{node_1.name}/{node.name}'
    elif level == 3:
        node_2 = node.father
        node_1 = node_2.father
        return f'{node_1.name}/{node_2.name}/{node.name}'
    elif level == 4:
        node_3 = node.father
        node_2 = node_3.father
        node_1 = node_2.father
        return f'{node_1.name}/{node_2.name}/{node_3.name}/{node.name}'
    elif level == 5:
        node_4 = node.father
        node_3 = node_4.father
        node_2 = node_3.father
        node_1 = node_2.father
        return f'{node_1.name}/{node_2.name}/{node_3.name}/{node_4.name}/{node.name}'
