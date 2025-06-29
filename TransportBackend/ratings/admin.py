from django.contrib import admin
from .models import Rating, UserRatingStats

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('rater', 'rated_user', 'rating_type', 'score', 'trip', 'created_at')
    list_filter = ('rating_type', 'score', 'created_at')
    search_fields = ('rater__email', 'rated_user__email')
    ordering = ('-created_at',)

@admin.register(UserRatingStats)
class UserRatingStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'overall_average_rating', 'total_ratings',
                   'driver_average_rating', 'passenger_average_rating')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('driver_average_rating', 'driver_total_ratings',
                      'passenger_average_rating', 'passenger_total_ratings',
                      'overall_average_rating', 'total_ratings')
