from django.urls import path
from . import views

urlpatterns = [
    path('', views.TripListCreateView.as_view(), name='trip-list'),
    path('<int:pk>/', views.TripDetailView.as_view(), name='trip-detail'),
    path('<int:pk>/book/', views.book_trip, name='book-trip'),
    path('bookings/<int:pk>/confirm/', views.confirm_booking, name='confirm-booking'),
    path('bookings/<int:pk>/cancel/', views.cancel_booking, name='cancel-booking'),
    path('my-trips/', views.MyTripsView.as_view(), name='my-trips'),
    path('<int:pk>/bookings/', views.TripBookingsView.as_view(), name='trip-bookings'),
]
