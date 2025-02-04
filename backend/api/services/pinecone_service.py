from pinecone import Pinecone
import numpy as np
from django.conf import settings
from ..models import Patologia
import unicodedata
import re

class PineconeService:
    def __init__(self):
        self.pc = Pinecone(
            api_key=settings.PINECONE_API_KEY,
            environment=settings.PINECONE_ENV
        )
        self.index_name = "ipathology"
        self.index = self.pc.Index(self.index_name)

    def _normalize_id(self, text):
        """
        Normaliza el texto para usarlo como ID en Pinecone:
        - Remueve acentos
        - Convierte a minúsculas
        - Reemplaza espacios y caracteres especiales por guiones
        """
        # Remover acentos
        text = unicodedata.normalize('NFKD', text)
        text = ''.join(c for c in text if not unicodedata.combining(c))
        # Convertir a minúsculas y reemplazar caracteres no alfanuméricos por guiones
        text = text.lower()
        text = re.sub(r'[^a-z0-9]+', '-', text)
        # Remover guiones del inicio y final
        text = text.strip('-')
        return text

    def crear_vectores_patologias(self, nlp):
        vectores = {}
        patologias = Patologia.objects.all()
        
        for patologia in patologias:
            doc = nlp(patologia.descripcion)
            word_vectors = [token.vector for token in doc if token.has_vector]
            vector_patologia = np.mean(word_vectors, axis=0) if word_vectors else None
            
            # Usar ID normalizado como clave y guardar nombre original en metadata
            id_normalizado = self._normalize_id(patologia.nombre)
            vectores[id_normalizado] = {
                'vector': vector_patologia,
                'nombre_original': patologia.nombre
            }
            
        return vectores

    def store_embeddings(self, vectores_patologias):
        vectors_to_upsert = []
        for id_normalizado, data in vectores_patologias.items():
            if data['vector'] is not None:
                vectors_to_upsert.append((
                    id_normalizado,
                    data['vector'].tolist(),
                    {
                        "nombre": data['nombre_original'],
                        "id": id_normalizado
                    }
                ))
        
        batch_size = 100
        for i in range(0, len(vectors_to_upsert), batch_size):
            batch = vectors_to_upsert[i:i + batch_size]
            try:
                self.index.upsert(vectors=batch)
            except Exception as e:
                print(f"Error al procesar lote {i//batch_size + 1}: {str(e)}")
                for vector in batch:
                    print(f"ID problemático: {vector[0]}")

    def query_similar(self, query_vector, umbral=0.7, top_k=5):
        # Verificar que el vector es válido
        if query_vector is None or np.isnan(query_vector).any():
            return []
            
        try:
            results = self.index.query(
                vector=query_vector.tolist(),
                top_k=top_k,
                include_metadata=True
            )
            
            patologias_similares = []
            for match in results.matches:
                if match.score > umbral:
                    patologias_similares.append({
                        'nombre': match.metadata['nombre'],
                        'similitud': float(match.score)
                    })
            
            return patologias_similares
        except Exception as e:
            print(f"Error en query_similar: {str(e)}")
            return []