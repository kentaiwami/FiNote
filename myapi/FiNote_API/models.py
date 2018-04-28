from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from myapi import settings
from model_utils import FieldTracker


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class AuthUserManager(BaseUserManager):
    def create_user(self, username, email, password, birthyear):
        user = self.model(username=username, email=email, password=password, birthyear=birthyear)
        user.is_active = True
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password, birthyear):
        user = self.create_user(username=username, email=email, password=password, birthyear=birthyear)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)


class AuthUser(AbstractBaseUser, PermissionsMixin):
    def get_short_name(self):
        return self.username

    def get_full_name(self):
        return self.username

    username = models.CharField(unique=True, max_length=100, blank=False, default='username')
    email = models.EmailField(unique=True, max_length=100, blank=False, default='email')
    birthyear = models.IntegerField(null=True, default=0)
    is_dummy = models.BooleanField(default=False, null=False)

    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True, null=False)
    is_staff = models.BooleanField(default=False, null=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'birthyear']
    objects = AuthUserManager()

    tracker = FieldTracker()


class Genre(models.Model):
    genre_id = models.IntegerField(unique=True, default=0)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Onomatopoeia(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=200)
    tmdb_id = models.IntegerField(unique=True)
    overview = models.TextField(max_length=1000, default='')
    poster = models.CharField(max_length=1000, default='')
    release_date = models.DateField(null=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    genre = models.ManyToManyField(Genre)
    user = models.ManyToManyField(AuthUser, blank=True, through='Movie_User')
    onomatopoeia = models.ManyToManyField(Onomatopoeia, through='Movie_Onomatopoeia')

    def __str__(self):
        return self.title


class Movie_User(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    dvd = models.BooleanField(default=False)
    fav = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Movie_User_Onomatopoeia(models.Model):
    movie_user = models.ForeignKey(Movie_User, on_delete=models.CASCADE)
    onomatopoeia = models.ForeignKey(Onomatopoeia, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class Movie_Onomatopoeia(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    onomatopoeia = models.ForeignKey(Onomatopoeia, on_delete=models.CASCADE)
    count = models.IntegerField(default=1)
