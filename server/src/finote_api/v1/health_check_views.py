from rest_framework import viewsets
from django.http import HttpResponse
from django.db import connections
from django.db.utils import OperationalError

class HealthCheckViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        try:
            connections['default'].cursor()
        except OperationalError:
            return HttpResponse(status=500)

        return HttpResponse(status=200)
