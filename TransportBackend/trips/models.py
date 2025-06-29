from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from communities.models import Community


class Trip(models.Model):
    STATUS_CHOICES = (
        ('planned', 'Planifié'),
        ('active', 'En cours'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    )

    driver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driven_trips')
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='trips')
    vehicle = models.ForeignKey('users.Vehicle', on_delete=models.CASCADE)

    departure_location = models.CharField(max_length=200)
    departure_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    departure_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)

    arrival_location = models.CharField(max_length=200)
    arrival_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    arrival_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)

    departure_time = models.DateTimeField()
    estimated_arrival_time = models.DateTimeField()

    available_seats = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(8)])
    price_per_seat = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    description = models.TextField(blank=True)
    recurring = models.BooleanField(default=False)
    recurring_days = models.CharField(max_length=20, blank=True)  # JSON string for days

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.departure_location} → {self.arrival_location} ({self.departure_time})"

    @property
    def remaining_seats(self):
        booked_seats = self.bookings.filter(status='confirmed').count()
        return self.available_seats - booked_seats

    @property
    def is_full(self):
        return self.remaining_seats <= 0


class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('confirmed', 'Confirmé'),
        ('cancelled', 'Annulé'),
        ('completed', 'Terminé'),
    )

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    passenger = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    seats_booked = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    pickup_location = models.CharField(max_length=200, blank=True)
    dropoff_location = models.CharField(max_length=200, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('trip', 'passenger')

    def __str__(self):
        return f"{self.passenger.username} - {self.trip} ({self.status})"
