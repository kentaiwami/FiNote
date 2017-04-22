from django.contrib import admin
from .models import *


class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'birthday', 'sex', 'password')


class GenreAdmin(admin.ModelAdmin):
    list_display = ('genre_id', 'name')


class OnomatopoeiaAdmin(admin.ModelAdmin):
    list_display = ('pk', 'name')


class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'tmdb_id', 'get_genres', 'get_users', 'get_onomatopoeias')

    def get_genres(self, obj):
        return "\n".join([g.genres for g in obj.genre.all()])

    def get_users(self, obj):
        return "\n".join([u.users for u in obj.user.all()])

    def get_onomatopoeias(self, obj):
        return "\n".join([o.onomatopoeias for o in obj.onomatopoeia.all()])


class OnomatopoeiaCountAdmin(admin.ModelAdmin):
    list_display = ('pk', 'count', 'onomatopoeia', 'movie')


admin.site.register(AuthUser, UserAdmin)
admin.site.register(Genre, GenreAdmin)
admin.site.register(Onomatopoeia, OnomatopoeiaAdmin)
admin.site.register(Movie, MovieAdmin)
admin.site.register(OnomatopoeiaCount, OnomatopoeiaCountAdmin)
