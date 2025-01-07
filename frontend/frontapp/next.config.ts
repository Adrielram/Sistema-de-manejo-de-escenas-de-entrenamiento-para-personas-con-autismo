const nextConfig = {

    output: 'standalone',
    webpack: (config) => {
      config.watchOptions = {
        poll: 1000, // Verifica cambios cada 1 segundo
        aggregateTimeout: 300, // Espera 300 ms antes de recompilar
      };
      return config;
    },
  };
  
  export default nextConfig;
