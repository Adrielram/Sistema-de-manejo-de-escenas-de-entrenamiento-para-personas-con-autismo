# tu_app/management/commands/store_embeddings.py
from django.core.management.base import BaseCommand
import spacy
from ...services.pinecone_service import PineconeService

class Command(BaseCommand):
    help = 'Store embeddings in Pinecone'

    def handle(self, *args, **options):
        self.stdout.write('Cargando modelo SpaCy...')
        nlp = spacy.load('es_core_news_lg')
        
        self.stdout.write('Inicializando Pinecone...')
        pinecone_service = PineconeService()
        
        self.stdout.write('Creando y guardando embeddings...')
        vectores = pinecone_service.crear_vectores_patologias(nlp)
        pinecone_service.store_embeddings(vectores)
        
        self.stdout.write(self.style.SUCCESS('Embeddings guardados exitosamente'))