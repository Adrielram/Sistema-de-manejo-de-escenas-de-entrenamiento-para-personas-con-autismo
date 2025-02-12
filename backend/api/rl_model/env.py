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

        # Ruta donde se almacenan los CSVs
        self.data_folder = os.path.join(os.path.dirname(__file__), "data")
        self.dataset = self.load_latest_csv()
        self.recompensa_actual = 0
        self.num_escenas = self.dataset["Escena"].max()       
        self.unique_patologias = sorted({int(x) for sublist in self.dataset["Patologias"].apply(safe_eval) for x in sublist})
        self.num_patologias = len(self.unique_patologias)    
        self.observation_space = spaces.Box(low=0, high=1, shape=(2 + self.num_patologias + self.num_escenas,), dtype=np.float32)
        self.action_space = spaces.Discrete(self.num_escenas)
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
        # Guardar el objetivo_id original
        self.objetivo_id_original = sample["Objetivo ID"]  # Sin normalizar
        self.objetivo_id_normalizado = float((self.objetivo_id_original) / self.dataset["Objetivo ID"].max())  # Normalizado

        self.edad = float(sample["Edad"]) / 100.0
        patologias = safe_eval(sample["Patologias"])
        self.patologias_one_hot = np.zeros(self.num_patologias)

        for p in patologias:
            if 0 <= p < self.num_patologias:  # Verificar que está en rango
                self.patologias_one_hot[p] = 1
            else:
                print(f"Advertencia: Patología {p} fuera de rango.")    
        self.escenas_vistas = np.zeros(self.num_escenas)
        self.neg_recompensas = 0
        self.state = np.concatenate([[self.objetivo_id_normalizado, self.edad], self.patologias_one_hot, self.escenas_vistas])
        return self.state.astype(np.float32), {}

    def step(self, action):     
        action = int(action)
        subset = self.dataset[
            (self.dataset["Objetivo ID"] == self.objetivo_id_original) &
            (self.dataset["Escena"] == action+1)
        ]         
        max_escenas_vistas = 3  
        if not subset.empty:
            self.recompensa_actual = subset["Evaluacion"].max() / 100.0       
            self.recompensa_actual = (np.sum(self.escenas_vistas) / max_escenas_vistas) * subset["Evaluacion"].max() / 100.0
        else:
            self.recompensa_actual -= 0.1
        if self.escenas_vistas[action] == 1:
            self.recompensa_actual -= 0.1  # Penalización adicional
        
        recompensa = self.recompensa_actual
        self.escenas_vistas[action] = 1
        #max_escenas_vistas = 3  
        #done = np.sum(self.escenas_vistas) >= max_escenas_vistas
        done = False  
        if self.recompensa_actual < -0.7 or self.recompensa_actual > 0.5:
            self.recompensa_actual = 0
            done = True

        print("DONE:", done)  # 🔥 Verifica que done sea True en algún momento
        self.state = np.concatenate([[self.objetivo_id_normalizado, self.edad], self.patologias_one_hot, self.escenas_vistas])
        print(f"Estado: {self.state}, Acción tomada: {action}, Recompensa: {recompensa}")
        return self.state.astype(np.float32), recompensa, done, False, {}