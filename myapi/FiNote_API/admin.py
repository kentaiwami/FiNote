from django.contrib import admin
from .models import *


class GenreAdmin(admin.ModelAdmin):
    list_display = ('genre_id', 'name')


class MovieUserInline(admin.TabularInline):
    model = Movie_User
    extra = 1


class MovieOnomatopoeiaInline(admin.TabularInline):
    model = Movie_Onomatopoeia
    extra = 1


class MovieAdmin(admin.ModelAdmin):
    list_display = ('pk', 'title', 'created_at', 'updated_at', 'tmdb_id', 'genres', 'overview')
    search_fields = ('title',)
    inlines = (MovieUserInline, MovieOnomatopoeiaInline)

    @staticmethod
    def genres(obj):
        return "\n".join([g.name for g in obj.genre.all()])


class OnomatopoeiaAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    inlines = (MovieOnomatopoeiaInline,)


class UserAdmin(admin.ModelAdmin):
    list_display = ('pk', 'username', 'email', 'birthday', 'img', 'password')
    search_fields = ('username',)
    inlines = (MovieUserInline,)


class MovieUserAdmin(admin.ModelAdmin):
    list_display = ('pk', 'movie', 'user', 'dvd', 'fav', 'created_at', 'updated_at')


class MovieUserOnomatopoeiaAdmin(admin.ModelAdmin):
    list_display = ('pk', 'user', 'movie', 'onomatopoeia', 'created_at')

    @staticmethod
    def user(obj):
        return obj.movie_user.user

    @staticmethod
    def movie(obj):
        return obj.movie_user.movie


class MovieOnomatopoeiaAdmin(admin.ModelAdmin):
    list_display = ('pk', 'movie', 'onomatopoeia', 'count')


admin.site.register(Movie, MovieAdmin)
admin.site.register(AuthUser, UserAdmin)
admin.site.register(Genre, GenreAdmin)
admin.site.register(Onomatopoeia, OnomatopoeiaAdmin)
admin.site.register(Movie_User, MovieUserAdmin)
admin.site.register(Movie_User_Onomatopoeia, MovieUserOnomatopoeiaAdmin)
admin.site.register(Movie_Onomatopoeia, MovieOnomatopoeiaAdmin)
