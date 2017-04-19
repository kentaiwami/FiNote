from django.db import models


class User(models.Model):
    name = models.CharField(max_length=30, unique=True)
    password = models.CharField(max_length=300)

    def __str__(self):
        return self.name


class Genre(models.Model):
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
    genre = models.ManyToManyField(Genre)
    user = models.ManyToManyField(User)
    onomatopoeia = models.ManyToManyField(Onomatopoeia)

    def __str__(self):
        return self.title


class OnomatopoeiaCount(models.Model):
    count = models.IntegerField(default=0)
    onomatopoeia = models.ForeignKey(Onomatopoeia)
    movie = models.ForeignKey(Movie)

    def __str__(self):
        return self.onomatopoeia + '_' + self.count
