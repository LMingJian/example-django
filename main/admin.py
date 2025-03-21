from django.contrib import admin
from .models import *
# Register your models here.

reg_list = [
    Release_Family, Release_Project, Release_File, Release_Version, 
    Project, Project_Version,
    Node_H1, Node_H2, Node_H3, Node_H4, Node_H5,
    Bug, Bug_Comments, Bug_Status, Bug_Tag, Bug_Type,
    Case, Report,
    ]

for each in reg_list:
    admin.site.register(each)
