from django.contrib import admin
from .models import Trip, Booking

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('departure_location', 'arrival_location', 'driver', 'departure_time',
                   'available_seats', 'remaining_seats', 'status')
    list_filter = ('status', 'departure_time', 'community')
    search_fields = ('departure_location', 'arrival_location', 'driver__email')
    ordering = ('-departure_time',)
    readonly_fields = ('remaining_seats',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('passenger', 'trip', 'seats_booked', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('passenger__email', 'trip__departure_location')
    ordering = ('-created_at',)
