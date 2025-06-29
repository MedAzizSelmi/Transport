from rest_framework import serializers
from .models import Trip, Booking
from users.serializers import UserSerializer, VehicleSerializer
from communities.serializers import CommunitySerializer


class TripSerializer(serializers.ModelSerializer):
    driver = UserSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    community = CommunitySerializer(read_only=True)
    remaining_seats = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_driver = serializers.SerializerMethodField()
    user_booking = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ('id', 'driver', 'community', 'vehicle', 'departure_location',
                  'departure_latitude', 'departure_longitude', 'arrival_location',
                  'arrival_latitude', 'arrival_longitude', 'departure_time',
                  'estimated_arrival_time', 'available_seats', 'remaining_seats',
                  'price_per_seat', 'description', 'recurring', 'recurring_days',
                  'status', 'is_full', 'is_driver', 'user_booking', 'created_at')
        read_only_fields = ('id', 'driver', 'created_at')

    def get_is_driver(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.driver == request.user
        return False

    def get_user_booking(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            booking = obj.bookings.filter(passenger=request.user).first()
            return BookingSerializer(booking).data if booking else None
        return None


class TripCreateSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.IntegerField(write_only=True)
    community_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Trip
        fields = ('community_id', 'vehicle_id', 'departure_location',
                  'departure_latitude', 'departure_longitude', 'arrival_location',
                  'arrival_latitude', 'arrival_longitude', 'departure_time',
                  'estimated_arrival_time', 'available_seats', 'price_per_seat',
                  'description', 'recurring', 'recurring_days')

    def validate_vehicle_id(self, value):
        from users.models import Vehicle
        try:
            vehicle = Vehicle.objects.get(id=value, owner=self.context['request'].user)
            return value
        except Vehicle.DoesNotExist:
            raise serializers.ValidationError("Véhicule non trouvé ou non autorisé.")

    def validate_community_id(self, value):
        from communities.models import Community, Membership
        try:
            community = Community.objects.get(id=value)
            # Check if user is member of the community
            if not Membership.objects.filter(
                    user=self.context['request'].user,
                    community=community
            ).exists():
                raise serializers.ValidationError("Vous devez être membre de cette communauté.")
            return value
        except Community.DoesNotExist:
            raise serializers.ValidationError("Communauté non trouvée.")


class BookingSerializer(serializers.ModelSerializer):
    passenger = UserSerializer(read_only=True)
    trip = TripSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'trip', 'passenger', 'seats_booked', 'pickup_location',
                  'dropoff_location', 'status', 'message', 'created_at', 'updated_at')
        read_only_fields = ('id', 'passenger', 'created_at', 'updated_at')


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('seats_booked', 'pickup_location', 'dropoff_location', 'message')

    def validate_seats_booked(self, value):
        trip = self.context['trip']
        if value > trip.remaining_seats:
            raise serializers.ValidationError(f"Seulement {trip.remaining_seats} places disponibles.")
        return value
