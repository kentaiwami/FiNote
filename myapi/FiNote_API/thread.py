import threading
from django.core.exceptions import ObjectDoesNotExist
from FiNote_API.models import Movie, OnomatopoeiaCount


class GetMovieReactionThread(threading.Thread):
    def __init__(self, tmdb_id):
        super(GetMovieReactionThread, self).__init__()
        self.tmdb_id = tmdb_id
        self.result = {'init': 0}

    def run(self):
        print('start: ', self.tmdb_id)

        onomatopoeia_counts = []
        try:
            movie = Movie.objects.get(tmdb_id=self.tmdb_id)
            counts = OnomatopoeiaCount.objects.filter(movie=movie).order_by('-count')

            for count in counts:
                onomatopoeia_counts.append({"name": count.onomatopoeia.name,
                                            "count": count.count})

            self.result = {str(self.tmdb_id): onomatopoeia_counts}

        except ObjectDoesNotExist:
            self.result = None

        print('end: ', self.tmdb_id)

    def getResult(self):
        return self.result
