from rest_framework import serializers
from .models import Rating, UserRatingStats
from users.serializers import UserSerializer
from trips.serializers import TripSerializer


class RatingSerializer(serializers.ModelSerializer):
    rater = UserSerializer(read_only=True)
    rated_user = UserSerializer(read_only=True)
    trip = TripSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ('id', 'trip', 'rater', 'rated_user', 'rating_type', 'score',
                  'comment', 'punctuality', 'communication', 'cleanliness',
                  'safety', 'created_at')
        read_only_fields = ('id', 'rater', 'created_at')


class RatingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ('score', 'comment', 'punctuality', 'communication',
                  'cleanliness', 'safety')

    def validate_score(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value


class UserRatingStatsSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserRatingStats
        fields = ('user', 'driver_average_rating', 'driver_total_ratings',
                  'passenger_average_rating', 'passenger_total_ratings',
                  'overall_average_rating', 'total_ratings', 'updated_at')
