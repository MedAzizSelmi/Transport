from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from trips.models import Trip


class Rating(models.Model):
    RATING_TYPES = (
        ('driver', 'Évaluation du conducteur'),
        ('passenger', 'Évaluation du passager'),
    )

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='ratings')
    rater = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_ratings')
    rated_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_ratings')

    rating_type = models.CharField(max_length=20, choices=RATING_TYPES)
    score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)

    # Rating criteria
    punctuality = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    communication = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    cleanliness = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    safety = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('trip', 'rater', 'rated_user')

    def __str__(self):
        return f"{self.rater.username} → {self.rated_user.username} ({self.score}/5)"


class UserRatingStats(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rating_stats')

    # Driver stats
    driver_average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    driver_total_ratings = models.IntegerField(default=0)

    # Passenger stats
    passenger_average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    passenger_total_ratings = models.IntegerField(default=0)

    # Overall stats
    overall_average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_ratings = models.IntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Rating Stats"

    def update_stats(self):
        from django.db.models import Avg, Count

        # Driver ratings
        driver_ratings = Rating.objects.filter(rated_user=self.user, rating_type='driver')
        driver_stats = driver_ratings.aggregate(
            avg_rating=Avg('score'),
            total_count=Count('id')
        )

        self.driver_average_rating = driver_stats['avg_rating'] or 0.00
        self.driver_total_ratings = driver_stats['total_count']

        # Passenger ratings
        passenger_ratings = Rating.objects.filter(rated_user=self.user, rating_type='passenger')
        passenger_stats = passenger_ratings.aggregate(
            avg_rating=Avg('score'),
            total_count=Count('id')
        )

        self.passenger_average_rating = passenger_stats['avg_rating'] or 0.00
        self.passenger_total_ratings = passenger_stats['total_count']

        # Overall stats
        all_ratings = Rating.objects.filter(rated_user=self.user)
        overall_stats = all_ratings.aggregate(
            avg_rating=Avg('score'),
            total_count=Count('id')
        )

        self.overall_average_rating = overall_stats['avg_rating'] or 0.00
        self.total_ratings = overall_stats['total_count']

        self.save()
