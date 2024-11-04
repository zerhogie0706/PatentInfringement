from django.urls import path
from . import views


urlpatterns = [
    path('check-patent-infringement/', views.check_patent_infringement, name='check_patent_infringement'),
]
