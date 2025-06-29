from rest_framework import serializers
from .models import Community, Membership
from users.serializers import UserSerializer


class CommunitySerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    member_count = serializers.ReadOnlyField()
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = ('id', 'name', 'description', 'community_type', 'location',
                  'image', 'creator', 'member_count', 'is_private', 'max_members',
                  'is_member', 'user_role', 'created_at', 'updated_at')
        read_only_fields = ('id', 'creator', 'created_at', 'updated_at')

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = Membership.objects.filter(
                user=request.user,
                community=obj
            ).first()
            return membership.role if membership else None
        return None


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    community = CommunitySerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ('id', 'user', 'community', 'role', 'joined_at', 'is_active')
        read_only_fields = ('id', 'joined_at')


class CommunityStatsSerializer(serializers.Serializer):
    total_members = serializers.IntegerField()
    total_trips = serializers.IntegerField()
    active_members = serializers.IntegerField()
    recent_trips = serializers.IntegerField()
