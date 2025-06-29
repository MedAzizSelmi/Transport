from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from .models import Community, Membership
from .serializers import CommunitySerializer, MembershipSerializer, CommunityStatsSerializer


class CommunityListCreateView(generics.ListCreateAPIView):
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Community.objects.all()
        search = self.request.query_params.get('search', None)
        community_type = self.request.query_params.get('type', None)
        location = self.request.query_params.get('location', None)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )

        if community_type:
            queryset = queryset.filter(community_type=community_type)

        if location:
            queryset = queryset.filter(location__icontains=location)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        community = serializer.save(creator=self.request.user)
        # Automatically make creator an admin
        Membership.objects.create(
            user=self.request.user,
            community=community,
            role='admin'
        )


class CommunityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            # Only admins can modify/delete communities
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_community(request, pk):
    community = get_object_or_404(Community, pk=pk)
    user = request.user

    # Check if already a member
    if Membership.objects.filter(user=user, community=community).exists():
        return Response(
            {'error': 'Vous êtes déjà membre de cette communauté'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if community is full
    if community.member_count >= community.max_members:
        return Response(
            {'error': 'Cette communauté a atteint sa capacité maximale'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create membership
    membership = Membership.objects.create(
        user=user,
        community=community,
        role='member'
    )

    return Response(
        MembershipSerializer(membership).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_community(request, pk):
    community = get_object_or_404(Community, pk=pk)
    user = request.user

    try:
        membership = Membership.objects.get(user=user, community=community)

        # Prevent creator from leaving if they're the only admin
        if membership.role == 'admin':
            admin_count = Membership.objects.filter(
                community=community,
                role='admin'
            ).count()
            if admin_count == 1:
                return Response(
                    {'error': 'Vous ne pouvez pas quitter cette communauté car vous êtes le seul administrateur'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    except Membership.DoesNotExist:
        return Response(
            {'error': 'Vous n\'êtes pas membre de cette communauté'},
            status=status.HTTP_400_BAD_REQUEST
        )


class CommunityMembersView(generics.ListAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        community_id = self.kwargs['pk']
        return Membership.objects.filter(
            community_id=community_id,
            is_active=True
        ).select_related('user', 'community')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def community_stats(request, pk):
    community = get_object_or_404(Community, pk=pk)

    # Check if user is member
    if not Membership.objects.filter(user=request.user, community=community).exists():
        return Response(
            {'error': 'Vous devez être membre pour voir les statistiques'},
            status=status.HTTP_403_FORBIDDEN
        )

    stats = {
        'total_members': community.member_count,
        'total_trips': community.trips.count(),
        'active_members': Membership.objects.filter(
            community=community,
            is_active=True
        ).count(),
        'recent_trips': community.trips.filter(
            departure_time__gte=timezone.now() - timedelta(days=30)
        ).count()
    }

    serializer = CommunityStatsSerializer(stats)
    return Response(serializer.data)
