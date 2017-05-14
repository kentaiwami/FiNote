from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from myapi import settings
import datetime

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class AuthUserManager(BaseUserManager):
    def create_user(self, username, email, password, birthday, sex):
        user = self.model(username=username, email=email, password=password, birthday=birthday, sex=sex)
        user.is_active = True
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password, birthday, sex):
        user = self.create_user(username=username, email=email, password=password, birthday=birthday, sex=sex)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)


class AuthUser(AbstractBaseUser, PermissionsMixin):
    def get_short_name(self):
        return self.username

    def get_full_name(self):
        return self.username

    username = models.CharField(unique=True, max_length=30, blank=False, default='username')
    email = models.EmailField(unique=True, max_length=30, blank=False, default='email')
    birthday = models.IntegerField(blank=False, default=1900)
    sex = models.CharField(max_length=1, blank=False, default='M')
    img = models.FileField(blank=True, null=False)

    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True, null=False)
    is_staff = models.BooleanField(default=False, null=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'birthday', 'sex']
    objects = AuthUserManager()


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
    title = models.CharField(max_length=200, unique=True)
    tmdb_id = models.CharField(max_length=100, unique=True)
    overview = models.CharField(max_length=1000, default='')
    poster_path = models.CharField(max_length=1000, default='')
    genre = models.ManyToManyField(Genre)
    user = models.ManyToManyField(AuthUser, blank=True)
    onomatopoeia = models.ManyToManyField(Onomatopoeia)

    def __str__(self):
        return self.title


class OnomatopoeiaCount(models.Model):
    count = models.IntegerField(default=0)
    onomatopoeia = models.ForeignKey(Onomatopoeia)
    movie = models.ForeignKey(Movie)

    def __str__(self):
        return self.onomatopoeia.name + '_' + str(self.count)


class BackUp(models.Model):
    today = datetime.date.today()

    username = models.ForeignKey(AuthUser)
    movie = models.ForeignKey(Movie)
    onomatopoeia = models.ManyToManyField(Onomatopoeia)
    add_year = models.IntegerField(default=int(today.year))
    add_month = models.IntegerField(default=int(today.month))
    add_day = models.IntegerField(default=int(today.day))
    dvd = models.IntegerField(default=0)
    fav = models.IntegerField(default=0)

    def __str__(self):
        return str(self.username)
