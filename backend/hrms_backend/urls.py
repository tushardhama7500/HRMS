from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls), 

    path('api/employees/', views.employee_list_create),
    path('api/employees/<int:pk>/', views.employee_detail),
    path('api/attendance/', views.mark_attendance),
]