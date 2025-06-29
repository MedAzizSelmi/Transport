from django.urls import path
from . import views

urlpatterns = [
    path('', views.CommunityListCreateView.as_view(), name='community-list'),
    path('<int:pk>/', views.CommunityDetailView.as_view(), name='community-detail'),
    path('<int:pk>/join/', views.join_community, name='join-community'),
    path('<int:pk>/leave/', views.leave_community, name='leave-community'),
    path('<int:pk>/members/', views.CommunityMembersView.as_view(), name='community-members'),
    path('<int:pk>/stats/', views.community_stats, name='community-stats'),
]
