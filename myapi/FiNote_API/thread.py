import threading
from django.core.exceptions import ObjectDoesNotExist
from FiNote_API.models import Movie


class GetMovieOnomatopoeiaThread(threading.Thread):
    def __init__(self, tmdb_id):
        super(GetMovieOnomatopoeiaThread, self).__init__()
        self.tmdb_id = tmdb_id
        self.result = {}

    def run(self):
        print('start: ', self.tmdb_id)

        onomatopoeia_names = []
        try:
            movie = Movie.objects.get(tmdb_id=self.tmdb_id)
            onomatopoeia_list = movie.onomatopoeia.all()

            for onomatopoeia in onomatopoeia_list:
                onomatopoeia_names.append({"name": onomatopoeia.name})

            self.result = {str(self.tmdb_id): onomatopoeia_names}

        except ObjectDoesNotExist:
            pass

        print('end: ', self.tmdb_id)

    def getResult(self):
        return self.result
