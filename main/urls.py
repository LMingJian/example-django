from django.urls import path, re_path
from django.views.static import serve
from ReleaseManager.settings import MEDIA_ROOT, STATIC_ROOT
from . import views

urlpatterns = [
    path('', views.view_index, name='index'),
    path('login', views.view_login, name='login'),
    path('software_release', views.view_software_release, name='software_release'),
    path('hardware_release', views.view_hardware_release, name='hardware_release'),
    path('bug_workspace', views.view_bug_workspace, name='bug_workspace'),
    path('setting', views.view_setting, name='setting'),
    path('case', views.view_case, name='case'),
    path('case_editing', views.view_case_editing, name='case_editing'),
    path('version', views.view_version, name='version'),

    path('api/login', views.api_login),
    path('api/logout', views.api_logout),

    path('api/replace_software_release', views.api_replace_software_release),
    path('api/replace_hardware_release', views.api_replace_hardware_release),
    
    path('api/upload_software_release', views.api_upload_software_release),
    path('api/upload_hardware_release', views.api_upload_hardware_release),
    path('api/upload_report', views.api_upload_report),

    path('api/download_software_release', views.api_download_software_release),
    path('api/download_hardware_release', views.api_download_hardware_release),

    path('api/create_software_release_family', views.api_create_software_release_family),
    path('api/create_software_release_project', views.api_create_software_release_project),
    path('api/create_hardware_release_family', views.api_create_hardware_release_family),
    path('api/create_hardware_release_project', views.api_create_hardware_release_project),
    path('api/create_project', views.api_create_project),
    path('api/create_user', views.api_create_user),
    path('api/create_tag', views.api_create_tag),
    path('api/create_version', views.api_create_version),
    path('api/create_node', views.api_create_node),
    path('api/create_bug', views.api_create_bug),
    path('api/create_case', views.api_create_caseData),

    path('api/get_node', views.api_get_node),
    path('api/get_bug_data', views.api_get_bugData),
    path('api/get_bug_father', views.api_get_bugFather),
    path('api/get_version', views.api_get_version),
    path('api/get_bug_count', views.api_get_bugCount),
    path('api/get_bug_statistics', views.api_get_bugStatistics),
    path('api/get_case_data', views.api_get_caseData),
    path('api/get_case_count', views.api_get_caseCount),
    path('api/get_next_case', views.api_get_nextCase),
    path('api/get_back_case', views.api_get_backCase),
    path('api/get_next_newCase', views.api_get_nextNewCase),
    path('api/get_project_status', views.api_get_projectStatus),
    path('api/get_version_count', views.api_get_versionCount),
    path('api/get_version_data', views.get_version_data),
    
    path('api/modify_bug_status', views.api_modify_bugStatus),
    path('api/modify_bug_tag', views.api_modify_bugTag),
    path('api/modify_bug_data', views.api_modify_bugData),
    path('api/modify_bug_version', views.api_modify_bugVersion),
    path('api/modify_bug_type', views.api_modify_bugType),
    path('api/modify_case_data', views.api_modify_caseData),
    path('api/modify_case_status', views.api_modify_caseStatus),
    path('api/modify_project_status', views.api_modify_projectStatus),
    path('api/modify_node', views.api_modify_node),
    path('api/modify_version_data', views.api_modify_versionData),
    path('api/modify_version_status', views.api_modify_versionStatus),

    path('api/delete_software_release', views.api_delete_software_release),
    path('api/delete_hardware_release', views.api_delete_hardware_release),
    path('api/delete_node', views.api_delete_node),
    path('api/delete_case', views.api_delete_case),
    path('api/delete_session', views.api_delete_session),

    path('api/export_bug', views.api_export_bug),
    path('api/export_case', views.api_export_case),
       
    re_path(r'file/(?P<file_name>.+)&(?P<uuid>.+)$', views.api_download_file),
    re_path(r'media/(?P<path>.*)$', serve, {'document_root': MEDIA_ROOT}),
    re_path(r'static/(?P<path>.*)$', serve, {'document_root': STATIC_ROOT}),
]