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
    list_display = (
    'pk', 'title', 'created_at', 'updated_at', 'tmdb_id', 'genres', 'overview')
    search_fields = ('title',)
    inlines = (MovieUserInline, MovieOnomatopoeiaInline)

    @staticmethod
    def genres(obj):
        print(obj.genre.all())
        return "\n".join([g.name for g in obj.genre.all()])


class OnomatopoeiaAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    inlines = (MovieOnomatopoeiaInline,)


class UserAdmin(admin.ModelAdmin):
    list_display = ('pk', 'username', 'email', 'birthday', 'img', 'password')
    search_fields = ('username',)
    inlines = (MovieUserInline,)


class OnomatopoeiaCountAdmin(admin.ModelAdmin):
    list_display = ('pk', 'count', 'onomatopoeia', 'movie')


class DVDFAVAdmin(admin.ModelAdmin):
    list_display = ('user', 'movie', 'dvd', 'fav')


admin.site.register(Movie, MovieAdmin)
admin.site.register(AuthUser, UserAdmin)
admin.site.register(Genre, GenreAdmin)
admin.site.register(Onomatopoeia, OnomatopoeiaAdmin)
admin.site.register(OnomatopoeiaCount, OnomatopoeiaCountAdmin)
admin.site.register(DVDFAV, DVDFAVAdmin)
