from django.urls import path
from . import views

urlpatterns = [
    path('trip/<int:trip_id>/user/<int:user_id>/', views.rate_user, name='rate-user'),
    path('user/<int:user_id>/', views.UserRatingsView.as_view(), name='user-ratings'),
    path('user/<int:user_id>/stats/', views.UserRatingStatsView.as_view(), name='user-rating-stats'),
    path('my-ratings/', views.MyRatingsView.as_view(), name='my-ratings'),
]
