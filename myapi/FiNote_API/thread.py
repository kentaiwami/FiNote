import threading
from django.core.exceptions import ObjectDoesNotExist
from FiNote_API.models import Movie


class GetMovieReactionThread(threading.Thread):
    def __init__(self, tmdb_id):
        super(GetMovieReactionThread, self).__init__()
        self.tmdb_id = tmdb_id
        self.result = {}

    def run(self):
        print('start: ', self.tmdb_id)

        onomatopoeia_counts = []
        try:
            movie = Movie.objects.get(tmdb_id=self.tmdb_id)
            some_onomatopoeia = movie.onomatopoeia.all()

            for onomatopoeia in some_onomatopoeia:
                onomatopoeia_counts.append({"name": onomatopoeia.name})

            self.result = {str(self.tmdb_id): onomatopoeia_counts}

        except ObjectDoesNotExist:
            pass

        print('end: ', self.tmdb_id)

    def getResult(self):
        return self.result
