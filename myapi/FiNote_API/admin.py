from django.contrib import admin
from .models import *


class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'birthday', 'img', 'password')
    search_fields = ('username',)


class GenreAdmin(admin.ModelAdmin):
    list_display = ('genre_id', 'name')


class OnomatopoeiaAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


class MovieAdmin(admin.ModelAdmin):
    list_display = ('pk', 'title', 'created_at', 'updated_at', 'tmdb_id', 'genres', 'users', 'onomatopoeias', 'overview')
    search_fields = ('title',)

    def genres(self, obj):
        return "\n".join([g.name for g in obj.genre.all()])

    def users(self, obj):
        return "\n".join([u.username for u in obj.user.all()])

    def onomatopoeias(self, obj):
        return "\n".join([o.name for o in obj.onomatopoeia.all()])


class OnomatopoeiaCountAdmin(admin.ModelAdmin):
    list_display = ('pk', 'count', 'onomatopoeia', 'movie')


class BackUpAdmin(admin.ModelAdmin):
    list_display = ('username', 'movie', 'onomatopoeias', 'add_date', 'dvd', 'fav')

    def onomatopoeias(self, obj):
        return "\n".join([o.name for o in obj.onomatopoeia.all()])


admin.site.register(AuthUser, UserAdmin)
admin.site.register(Genre, GenreAdmin)
admin.site.register(Onomatopoeia, OnomatopoeiaAdmin)
admin.site.register(Movie, MovieAdmin)
admin.site.register(OnomatopoeiaCount, OnomatopoeiaCountAdmin)
admin.site.register(BackUp, BackUpAdmin)
