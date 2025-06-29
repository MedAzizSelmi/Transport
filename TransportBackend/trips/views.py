from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import Trip, Booking
from .serializers import (
    TripSerializer,
    TripCreateSerializer,
    BookingSerializer,
    BookingCreateSerializer
)
from users.models import Vehicle
from communities.models import Community


class TripListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TripCreateSerializer
        return TripSerializer

    def get_queryset(self):
        queryset = Trip.objects.select_related('driver', 'vehicle', 'community').all()

        # Filters
        community_id = self.request.query_params.get('community', None)
        departure = self.request.query_params.get('departure', None)
        arrival = self.request.query_params.get('arrival', None)
        date = self.request.query_params.get('date', None)
        available_only = self.request.query_params.get('available_only', 'false')

        if community_id:
            queryset = queryset.filter(community_id=community_id)

        if departure:
            queryset = queryset.filter(departure_location__icontains=departure)

        if arrival:
            queryset = queryset.filter(arrival_location__icontains=arrival)

        if date:
            queryset = queryset.filter(departure_time__date=date)

        if available_only.lower() == 'true':
            queryset = queryset.filter(status='planned')
            # Filter trips with available seats
            available_trips = []
            for trip in queryset:
                if trip.remaining_seats > 0:
                    available_trips.append(trip.id)
            queryset = queryset.filter(id__in=available_trips)

        return queryset.order_by('departure_time')

    def perform_create(self, serializer):
        vehicle = Vehicle.objects.get(
            id=serializer.validated_data['vehicle_id'],
            owner=self.request.user
        )
        community = Community.objects.get(
            id=serializer.validated_data['community_id']
        )

        serializer.save(
            driver=self.request.user,
            vehicle=vehicle,
            community=community
        )


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            # Only trip driver can modify/delete
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def book_trip(request, pk):
    trip = get_object_or_404(Trip, pk=pk)
    user = request.user

    # Check if user is the driver
    if trip.driver == user:
        return Response(
            {'error': 'Vous ne pouvez pas réserver votre propre trajet'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if already booked
    if Booking.objects.filter(trip=trip, passenger=user).exists():
        return Response(
            {'error': 'Vous avez déjà réservé ce trajet'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if trip is available
    if trip.status != 'planned':
        return Response(
            {'error': 'Ce trajet n\'est plus disponible'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = BookingCreateSerializer(
        data=request.data,
        context={'trip': trip}
    )

    if serializer.is_valid():
        booking = serializer.save(trip=trip, passenger=user)
        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_booking(request, pk):
    booking = get_object_or_404(Booking, pk=pk)

    # Check if user is the trip driver
    if booking.trip.driver != request.user:
        return Response(
            {'error': 'Seul le conducteur peut confirmer les réservations'},
            status=status.HTTP_403_FORBIDDEN
        )

    if booking.status != 'pending':
        return Response(
            {'error': 'Cette réservation ne peut pas être confirmée'},
            status=status.HTTP_400_BAD_REQUEST
        )

    booking.status = 'confirmed'
    booking.save()

    return Response(BookingSerializer(booking).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, pk):
    booking = get_object_or_404(Booking, pk=pk)

    # Check if user is the passenger or driver
    if booking.passenger != request.user and booking.trip.driver != request.user:
        return Response(
            {'error': 'Non autorisé'},
            status=status.HTTP_403_FORBIDDEN
        )

    if booking.status in ['cancelled', 'completed']:
        return Response(
            {'error': 'Cette réservation ne peut pas être annulée'},
            status=status.HTTP_400_BAD_REQUEST
        )

    booking.status = 'cancelled'
    booking.save()

    return Response(BookingSerializer(booking).data)


class MyTripsView(generics.ListAPIView):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        trip_type = self.request.query_params.get('type', 'all')

        if trip_type == 'driver':
            return Trip.objects.filter(driver=user).order_by('-departure_time')
        elif trip_type == 'passenger':
            booked_trips = Booking.objects.filter(
                passenger=user,
                status__in=['confirmed', 'pending']
            ).values_list('trip_id', flat=True)
            return Trip.objects.filter(id__in=booked_trips).order_by('-departure_time')
        else:
            # All trips (as driver or passenger)
            booked_trips = Booking.objects.filter(
                passenger=user,
                status__in=['confirmed', 'pending']
            ).values_list('trip_id', flat=True)
            return Trip.objects.filter(
                Q(driver=user) | Q(id__in=booked_trips)
            ).order_by('-departure_time')


class TripBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        trip_id = self.kwargs['pk']
        trip = get_object_or_404(Trip, pk=trip_id)

        # Check if user is the driver
        if trip.driver != self.request.user:
            return Booking.objects.none()

        return Booking.objects.filter(trip=trip).order_by('-created_at')
