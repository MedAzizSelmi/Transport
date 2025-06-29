from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Rating, UserRatingStats
from .serializers import RatingSerializer, RatingCreateSerializer, UserRatingStatsSerializer
from trips.models import Trip, Booking


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def rate_user(request, trip_id, user_id):
    trip = get_object_or_404(Trip, pk=trip_id)
    rated_user = get_object_or_404('users.User', pk=user_id)
    rater = request.user

    # Check if trip is completed
    if trip.status != 'completed':
        return Response(
            {'error': 'Vous ne pouvez évaluer qu\'après la fin du trajet'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user was part of this trip
    was_driver = trip.driver == rater
    was_passenger = Booking.objects.filter(
        trip=trip,
        passenger=rater,
        status='completed'
    ).exists()

    if not (was_driver or was_passenger):
        return Response(
            {'error': 'Vous ne pouvez évaluer que les personnes avec qui vous avez voyagé'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Determine rating type
    if trip.driver == rated_user:
        rating_type = 'driver'
    else:
        rating_type = 'passenger'

    # Check if already rated
    if Rating.objects.filter(trip=trip, rater=rater, rated_user=rated_user).exists():
        return Response(
            {'error': 'Vous avez déjà évalué cette personne pour ce trajet'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = RatingCreateSerializer(data=request.data)
    if serializer.is_valid():
        rating = serializer.save(
            trip=trip,
            rater=rater,
            rated_user=rated_user,
            rating_type=rating_type
        )

        # Update user rating stats
        stats, created = UserRatingStats.objects.get_or_create(user=rated_user)
        stats.update_stats()

        return Response(
            RatingSerializer(rating).data,
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRatingsView(generics.ListAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        rating_type = self.request.query_params.get('type', 'all')

        queryset = Rating.objects.filter(rated_user_id=user_id)

        if rating_type in ['driver', 'passenger']:
            queryset = queryset.filter(rating_type=rating_type)

        return queryset.order_by('-created_at')


class UserRatingStatsView(generics.RetrieveAPIView):
    serializer_class = UserRatingStatsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs['user_id']
        stats, created = UserRatingStats.objects.get_or_create(user_id=user_id)
        if created:
            stats.update_stats()
        return stats


class MyRatingsView(generics.ListAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        rating_type = self.request.query_params.get('type', 'received')

        if rating_type == 'given':
            return Rating.objects.filter(rater=user).order_by('-created_at')
        else:
            return Rating.objects.filter(rated_user=user).order_by('-created_at')
