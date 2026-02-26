import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from .models import Employee, Attendance
from datetime import date, timedelta
from django.db.models import Q, OuterRef, Subquery

@csrf_exempt
def employee_list_create(request):
    today = date.today()
    if request.method == "GET":
        status_filter = request.GET.get('today_status')
        
        # Subquery to get today's status for each employee
        today_attendance = Attendance.objects.filter(
            employee=OuterRef('pk'),
            date=today
        ).values('status')[:1]

        employees_qs = Employee.objects.annotate(
            today_status=Subquery(today_attendance)
        ).order_by('-created_at')
        
        if status_filter:
            employees_qs = employees_qs.filter(today_status=status_filter)

        paginator = Paginator(employees_qs, 10)
        page = paginator.get_page(request.GET.get('page', 1))
        
        present_today = Attendance.objects.filter(date=today, status='Present').count()
        absent_today = Attendance.objects.filter(date=today, status='Absent').count()
        
        data = []
        for emp in page.object_list:
            data.append({
                "id": emp.id,
                "employee_id": emp.employee_id,
                "full_name": emp.full_name,
                "email": emp.email,
                "department": emp.department,
                "today_status": emp.today_status
            })

        return JsonResponse({
            "data": data,
            "total_pages": paginator.num_pages,
            "current_page": page.number,
            "total_count": Employee.objects.count(),
            "filtered_count": paginator.count,
            "today_stats": {
                "present": present_today,
                "absent": absent_today
            }
        })
    
    if request.method == "POST":
        data = json.loads(request.body)
        if Employee.objects.filter(employee_id=data['employee_id']).exists():
            return JsonResponse({"error": "ID already exists"}, status=400)
        emp = Employee.objects.create(**data)
        return JsonResponse({"id": emp.id}, status=201)

@csrf_exempt
def employee_detail(request, pk):
    try:
        emp = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return JsonResponse({"status": "not found"}, status=404)

    if request.method == "GET":
        month_filter = request.GET.get('month') 
        page_number = request.GET.get('page', 1)
        
        attendances_qs = emp.attendances.all().order_by('-date')
        
        if month_filter:
            year, month = map(int, month_filter.split('-'))
            attendances_qs = attendances_qs.filter(date__year=year, date__month=month)
        else:
            last_30_days = date.today() - timedelta(days=30)
            attendances_qs = attendances_qs.filter(date__gte=last_30_days)

        paginator = Paginator(attendances_qs, 10)
        page_obj = paginator.get_page(page_number)

        return JsonResponse({
            "id": emp.id,
            "employee_id": emp.employee_id,
            "full_name": emp.full_name,
            "email": emp.email,
            "department": emp.department,
            "attendances": list(page_obj.object_list.values('date', 'status')),
            "total_pages": paginator.num_pages,
            "current_page": page_obj.number,
            "total_count": paginator.count
        })

    if request.method == "DELETE":
        emp.delete()
        return JsonResponse({"status": "deleted"}, status=204)

@csrf_exempt
def mark_attendance(request):
    if request.method == "POST":
        data = json.loads(request.body)
        Attendance.objects.update_or_create(
            employee_id=data['employee'], date=data['date'],
            defaults={'status': data['status']}
        )
        return JsonResponse({"status": "marked"}, status=201)
