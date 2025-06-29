from django.db import models
from django.conf import settings


class Community(models.Model):
    COMMUNITY_TYPES = (
        ('work', 'Domicile-Travail'),
        ('school', 'Trajets scolaires'),
        ('events', 'Événements'),
        ('shopping', 'Shopping'),
        ('other', 'Autre'),
    )

    name = models.CharField(max_length=100)
    description = models.TextField()
    community_type = models.CharField(max_length=20, choices=COMMUNITY_TYPES)
    location = models.CharField(max_length=200)
    image = models.ImageField(upload_to='communities/', blank=True, null=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_communities')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through='Membership', related_name='communities')
    is_private = models.BooleanField(default=False)
    max_members = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Communities"

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        return self.members.count()


class Membership(models.Model):
    ROLES = (
        ('admin', 'Administrateur'),
        ('moderator', 'Modérateur'),
        ('member', 'Membre'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'community')

    def __str__(self):
        return f"{self.user.username} - {self.community.name} ({self.role})"
