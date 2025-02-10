import os
import numpy as np
import pandas as pd
import gymnasium as gym
from gymnasium import spaces
from ray.rllib.env.env_context import EnvContext
from .utils import safe_eval

class RecommenderEnv(gym.Env):
    def __init__(self, config: EnvContext):
        super(RecommenderEnv, self).__init__()
        
        self.epsilon = 0.5  # Probabilidad de exploración
        
        # Ruta donde se almacenan los CSVs
        self.data_folder = os.path.join(os.path.dirname(__file__), "data")
        self.dataset = self.load_latest_csv()
        
        self.num_escenas = self.dataset["Escena"].max()       
        self.unique_patologias = sorted({int(x) for sublist in self.dataset["Patologias"].apply(safe_eval) for x in sublist})
        self.num_patologias = len(self.unique_patologias)    
        self.observation_space = spaces.Box(low=0, high=1, shape=(2 + self.num_patologias,), dtype=np.float32)
        self.action_space = spaces.Discrete(self.num_escenas)
        
        # Definir el rango de escenas permitidas para cada objetivo
        self.escenas_permitidas = {
            1: [1, 2, 3],
            2: [4, 5, 6],
            3: [7, 8, 9]
        }
        
        self.reset()

    def load_latest_csv(self):
        """Carga el archivo CSV más reciente de la carpeta de datos."""
        files = [f for f in os.listdir(self.data_folder) if f.endswith(".csv")]
        if not files:
            raise FileNotFoundError("No se encontraron archivos CSV en la carpeta de datos.")

        latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(self.data_folder, f)))
        file_path = os.path.join(self.data_folder, latest_file)

        print(f"Cargando dataset desde: {file_path}")

        df = pd.read_csv(
            file_path,
            sep=";",  # Ajusta el separador según tu CSV
            skipinitialspace=True,
            quoting=3,
            engine="python"
        )

        # Ajustar índices para que comiencen en 0
        df["Objetivo ID"] -= 1    
        df["Patologias"] = df["Patologias"].apply(lambda x: [int(p)-1 for p in safe_eval(x)] if isinstance(x, str) and x else [])        
        return df

    def reset(self, seed=None, options=None):
        sample = self.dataset.sample(1).iloc[0]        
        self.objetivo_id_original = sample["Objetivo ID"]  # Sin normalizar
        self.objetivo_id_normalizado = float(self.objetivo_id_original / self.dataset["Objetivo ID"].max())  # Normalizado
    
        self.edad = float(sample["Edad"]) / 100.0
        patologias = safe_eval(sample["Patologias"])
        self.patologias_one_hot = np.zeros(self.num_patologias)
        
        for p in patologias:
            if 0 <= p < self.num_patologias:  # Verificar que está en rango
                self.patologias_one_hot[p] = 1
            else:
                print(f"Advertencia: Patología {p} fuera de rango.")          
        
        self.neg_recompensas = 0
        
        # Filtrar dataset para el objetivo actual
        self.dataset_filtrado = self.dataset[self.dataset["Objetivo ID"] == self.objetivo_id_original]
        self.escenas_validas = self.escenas_permitidas.get(self.objetivo_id_original+1, [])

        self.state = np.concatenate([[self.objetivo_id_normalizado, self.edad], self.patologias_one_hot])
        return self.state.astype(np.float32), {}

    def step(self, action):     
        action = int(action)
        
        # ε-greedy: con probabilidad ε, elegir una escena al azar dentro de las válidas
        if np.random.rand() < self.epsilon:
            action = np.random.choice(self.escenas_validas) - 1  # -1 porque las acciones comienzan en 0
            print(f"Exploración: seleccionando escena {action + 1}")

        if action + 1 not in self.escenas_validas:
            print(f"ERROR: Se intentó seleccionar una escena no válida ({action+1}) para el objetivo {self.objetivo_id_original}")
            return self.state.astype(np.float32), -0.5, True, False, {}
        
        # Filtrar solo las filas relevantes del subconjunto
        subset = self.dataset_filtrado[self.dataset_filtrado["Escena"] == action + 1]
        
        recompensa = -0.5  # Penalización por defecto

        if not subset.empty:
            eval = subset["Evaluacion"].max() / 100.0
            if eval >= 0.7:
                recompensa = 1.0
            elif 0.4 < eval < 0.7:
                recompensa = 0.5
            else:
                recompensa = 0.2
            
            # Agregar una pequeña variación aleatoria a la recompensa para evitar ciclos de explotación
            recompensa += np.random.uniform(-0.05, 0.05)

        # Manejo de recompensas negativas seguidas
        if recompensa <= 0.2:
            self.neg_recompensas += 1  
        else:
            self.neg_recompensas = 0          

        done = self.neg_recompensas >= 3
        
        print(f"Estado: {self.state}, Acción tomada: {action}, Recompensa: {recompensa}")
        
        self.state = np.concatenate([[self.objetivo_id_normalizado, self.edad], self.patologias_one_hot])
        return self.state.astype(np.float32), recompensa, done, False, {}
