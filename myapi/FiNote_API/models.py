from django.db import models


class User(models.Model):
    name = models.CharField(max_length=30, unique=True)
    password = models.CharField(max_length=300)


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)


class Onomatopoeia(models.Model):
    name = models.CharField(max_length=100, unique=True)


class Movie(models.Model):
    title = models.CharField(max_length=200, unique=True)
    tmdb_id = models.CharField(max_length=100, unique=True)
    genre = models.ManyToManyField(Genre)
    user = models.ManyToManyField(User)
    onomatopoeia = models.ManyToManyField(Onomatopoeia)


class OnomatopoeiaCount(models.Model):
    count = models.IntegerField(default=0)
    onomatopoeia = models.ForeignKey(Onomatopoeia)
    movie = models.ForeignKey(Movie)
