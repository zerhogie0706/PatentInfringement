from django.urls import path
from . import views


urlpatterns = [
    path('check-patent-infringement/', views.check_patent_infringement, name='check_patent_infringement'),
    path('save-data/', views.save_data, name='save_data'),
    path('saved-reports/', views.list_saved_reports, name='list_saved_reports'),
    path('display_data/<int:pk>/', views.display_data, name='display_data'),
]
