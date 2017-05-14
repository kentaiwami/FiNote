from django.contrib import admin
from .models import *


class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'birthday', 'sex', 'img', 'password')


class GenreAdmin(admin.ModelAdmin):
    list_display = ('genre_id', 'name')


class OnomatopoeiaAdmin(admin.ModelAdmin):
    list_display = ('pk', 'name')


class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'tmdb_id', 'genres', 'users', 'onomatopoeias', 'overview', 'poster_path')

    def genres(self, obj):
        return "\n".join([g.name for g in obj.genre.all()])

    def users(self, obj):
        return "\n".join([u.username for u in obj.user.all()])

    def onomatopoeias(self, obj):
        return "\n".join([o.name for o in obj.onomatopoeia.all()])


class OnomatopoeiaCountAdmin(admin.ModelAdmin):
    list_display = ('pk', 'count', 'onomatopoeia', 'movie')


class BackUpAdmin(admin.ModelAdmin):
    list_display = ('username', 'movie', 'onomatopoeias', 'add_year', 'add_month', 'add_day', 'dvd', 'fav')

    def onomatopoeias(self, obj):
        return "\n".join([o.name for o in obj.onomatopoeia.all()])


admin.site.register(AuthUser, UserAdmin)
admin.site.register(Genre, GenreAdmin)
admin.site.register(Onomatopoeia, OnomatopoeiaAdmin)
admin.site.register(Movie, MovieAdmin)
admin.site.register(OnomatopoeiaCount, OnomatopoeiaCountAdmin)
admin.site.register(BackUp, BackUpAdmin)
