# Generated by Django 4.2.7 on 2025-06-29 14:49

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('trips', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserRatingStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('driver_average_rating', models.DecimalField(decimal_places=2, default=0.0, max_digits=3)),
                ('driver_total_ratings', models.IntegerField(default=0)),
                ('passenger_average_rating', models.DecimalField(decimal_places=2, default=0.0, max_digits=3)),
                ('passenger_total_ratings', models.IntegerField(default=0)),
                ('overall_average_rating', models.DecimalField(decimal_places=2, default=0.0, max_digits=3)),
                ('total_ratings', models.IntegerField(default=0)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='rating_stats', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Rating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating_type', models.CharField(choices=[('driver', 'Évaluation du conducteur'), ('passenger', 'Évaluation du passager')], max_length=20)),
                ('score', models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('comment', models.TextField(blank=True)),
                ('punctuality', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('communication', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('cleanliness', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('safety', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('rated_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_ratings', to=settings.AUTH_USER_MODEL)),
                ('rater', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='given_ratings', to=settings.AUTH_USER_MODEL)),
                ('trip', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ratings', to='trips.trip')),
            ],
            options={
                'unique_together': {('trip', 'rater', 'rated_user')},
            },
        ),
    ]
