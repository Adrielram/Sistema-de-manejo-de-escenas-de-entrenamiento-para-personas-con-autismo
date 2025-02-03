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

        self.num_escenas = self.dataset["Escena"].nunique()
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

        return pd.read_csv(
            file_path,
            sep=";",  # Ajusta el separador según tu CSV
            skipinitialspace=True,
            quoting=3,
            engine="python"
        )

    def reset(self, seed=None, options=None):
        sample = self.dataset.sample(1).iloc[0]
        self.objetivo_id = float(sample["Objetivo ID"]) / self.dataset["Objetivo ID"].max()
        self.edad = float(sample["Edad"]) / 100.0
        patologias = safe_eval(sample["Patologias"])
        self.patologias_one_hot = np.zeros(self.num_patologias)
        for p in patologias:
            if p in self.unique_patologias:
                self.patologias_one_hot[self.unique_patologias.index(p)] = 1
        self.escenas_vistas = np.zeros(self.num_escenas)
        self.state = np.concatenate([[self.objetivo_id, self.edad], self.patologias_one_hot, self.escenas_vistas])
        return self.state.astype(np.float32), {}

    def step(self, action):
        subset = self.dataset[
            (self.dataset["Objetivo ID"] == int(self.objetivo_id * self.dataset["Objetivo ID"].max())) & 
            (self.dataset["Escena"] == action)
        ]
        recompensa = subset["Evaluacion"].values[0] / 100.0 if not subset.empty else -1
        self.escenas_vistas[action] = 1
        self.state = np.concatenate([[self.objetivo_id, self.edad], self.patologias_one_hot, self.escenas_vistas])
        return self.state.astype(np.float32), recompensa, False, False, {}
